import { supabase } from './supabaseClient';
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from './catalogData';

export const INITIAL_PRODUCTS = CATALOG_PRODUCTS;
export const CATEGORIES = CATALOG_CATEGORIES;

// In-Memory / LocalStorage State Manager with Supabase Mirror
class DataStore {
  constructor() {
    this.products = [...INITIAL_PRODUCTS].map(p => ({ sales_count: 0, ...p }));
    this.currentUser = typeof window !== 'undefined' && localStorage.getItem('elpaquetero_current_user')
      ? JSON.parse(localStorage.getItem('elpaquetero_current_user'))
      : null;
    this.activeOrder = typeof window !== 'undefined' && localStorage.getItem('elpaquetero_active_order')
      ? JSON.parse(localStorage.getItem('elpaquetero_active_order'))
      : null;
    this.clients = [];
    this.orders = [];
    this.cashMovements = [];
    this.categories = CATALOG_CATEGORIES.filter(c => c.id !== 'all');
    this.transferAlias = typeof window !== 'undefined' ? (localStorage.getItem('elpaquetero_transfer_alias') || 'ELPAQUETERO.MP') : 'ELPAQUETERO.MP';
    this.listeners = [];
    this.initFromSupabase();
  }

  // Seed any missing catalog rows once (never overwrites existing data),
  // then pull the real, current state from Supabase so admin edits
  // (precio, stock, categorías nuevas, etc.) siempre prevalecen.
  async initFromSupabase() {
    await this.seedMissingCatalogInSupabase();
    await Promise.all([
      this.fetchProductsFromSupabase(),
      this.fetchCategoriesFromSupabase(),
      this.fetchOrdersFromSupabase(),
      this.fetchClientsFromSupabase()
    ]);
  }

  async fetchOrdersFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data && !error && data.length > 0) {
        this.orders = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase orders fetch warning:', err);
    }
  }

  async fetchClientsFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('wholesale_clients').select('*').order('created_at', { ascending: false });
      if (data && !error && data.length > 0) {
        this.clients = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase clients fetch warning:', err);
    }
  }

  // Inserta en Supabase los productos/categorías del catálogo de código que
  // todavía no existan en la base. Usa ignoreDuplicates para que NUNCA
  // pise precios, stock o categorías que ya haya editado el admin.
  async seedMissingCatalogInSupabase() {
    if (!supabase) return;
    try {
      const categoriesToSeed = CATALOG_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
        id: c.id,
        name: c.name,
        subcategories: c.subcategories
      }));

      await supabase.from('categories').upsert(categoriesToSeed, { onConflict: 'id', ignoreDuplicates: true });

      const productsToSeed = CATALOG_PRODUCTS.map(({ sizes, stock_per_size, code, ...dbFields }) => dbFields);
      await supabase.from('products').upsert(productsToSeed, { onConflict: 'id', ignoreDuplicates: true });
    } catch (err) {
      console.warn('Supabase catalog seed warning:', err);
    }
  }

  // Trae el estado real de productos desde Supabase (precio, stock,
  // ventas, etc.) y lo combina con los campos que solo existen en el
  // código (talles, stock por talle) para no romper el selector de talles.
  async fetchProductsFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!data || error) return;

      const dbById = new Map(data.map(p => [p.id, p]));
      const merged = this.products.map(localP => {
        const dbP = dbById.get(localP.id);
        if (!dbP) return localP;
        return { ...localP, ...dbP, sales_count: dbP.sales_count ?? 0 };
      });

      const localIds = new Set(this.products.map(p => p.id));
      const extraFromDb = data
        .filter(p => !localIds.has(p.id))
        .map(p => ({ ...p, sales_count: p.sales_count ?? 0 }));

      this.products = [...merged, ...extraFromDb];
      this.notify();
    } catch (err) {
      console.warn('Supabase products fetch warning:', err);
    }
  }

  async fetchCategoriesFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (data && data.length > 0 && !error) {
        const aliasRow = data.find(item => item.id === '_config_alias');
        if (aliasRow && aliasRow.name) {
          this.transferAlias = aliasRow.name;
          if (typeof window !== 'undefined') {
            localStorage.setItem('elpaquetero_transfer_alias', aliasRow.name);
          }
        }

        const cleanCats = data
          .filter(item => item.id !== '_config_alias')
          .map(item => ({
            id: item.id,
            name: item.name,
            subcategories: Array.isArray(item.subcategories)
              ? item.subcategories
              : (typeof item.subcategories === 'string' ? JSON.parse(item.subcategories) : [])
          }));

        this.categories = cleanCats;
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase categories fetch warning:', err);
    }
  }

  getTransferAlias() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('elpaquetero_transfer_alias');
      if (stored) return stored;
    }
    return this.transferAlias || 'ELPAQUETERO.MP';
  }

  setTransferAlias(newAlias) {
    const cleanAlias = (newAlias || '').trim().toUpperCase();
    if (!cleanAlias) return;
    this.transferAlias = cleanAlias;
    if (typeof window !== 'undefined') {
      localStorage.setItem('elpaquetero_transfer_alias', cleanAlias);
    }
    if (supabase) {
      supabase.from('categories').upsert({ id: '_config_alias', name: cleanAlias, subcategories: [] }).then(() => {}).catch(() => {});
    }
    this.notify();
  }

  getCategories() {
    const categoryCounts = {};
    this.products.forEach(p => {
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    });

    return [
      { id: 'all', name: 'Todos los Productos', count: this.products.length },
      ...this.categories.map(c => ({
        ...c,
        count: categoryCounts[c.id] || categoryCounts[c.name] || 0
      }))
    ];
  }

  addCategory(name, initialSubcategories = []) {
    const cleanName = name.trim();
    if (!cleanName) return;

    const existingIndex = this.categories.findIndex(c => c.id.toLowerCase() === cleanName.toLowerCase() || c.name.toLowerCase() === cleanName.toLowerCase());

    const subcats = Array.isArray(initialSubcategories) 
      ? initialSubcategories.map(s => s.trim()).filter(Boolean)
      : initialSubcategories.split(',').map(s => s.trim()).filter(Boolean);

    let catObj;
    if (existingIndex >= 0) {
      const existing = this.categories[existingIndex];
      const mergedSubcats = Array.from(new Set([...(existing.subcategories || []), ...subcats]));
      catObj = { ...existing, subcategories: mergedSubcats };
      this.categories[existingIndex] = catObj;
    } else {
      catObj = {
        id: cleanName,
        name: cleanName,
        subcategories: Array.from(new Set(subcats))
      };
      this.categories.push(catObj);
    }

    this.notify();

    if (supabase) {
      supabase.from('categories').upsert({
        id: catObj.id,
        name: catObj.name,
        subcategories: catObj.subcategories
      }).then(() => {}).catch(() => {});
    }
  }

  addSubcategory(categoryId, subcategoryName) {
    const subClean = subcategoryName.trim();
    if (!subClean) return;

    const catIndex = this.categories.findIndex(c => c.id === categoryId || c.name === categoryId);
    if (catIndex < 0) return;

    const cat = this.categories[catIndex];
    const subcats = cat.subcategories || [];
    if (!subcats.includes(subClean)) {
      const updatedSubcats = [...subcats, subClean];
      const updatedCat = { ...cat, subcategories: updatedSubcats };
      this.categories[catIndex] = updatedCat;
      this.notify();

      if (supabase) {
        supabase.from('categories').upsert({
          id: updatedCat.id,
          name: updatedCat.name,
          subcategories: updatedCat.subcategories
        }).then(() => {}).catch(() => {});
      }
    }
  }

  deleteSubcategory(categoryId, subcategoryName) {
    const catIndex = this.categories.findIndex(c => c.id === categoryId || c.name === categoryId);
    if (catIndex < 0) return;

    const cat = this.categories[catIndex];
    const updatedSubcats = (cat.subcategories || []).filter(s => s !== subcategoryName);
    const updatedCat = { ...cat, subcategories: updatedSubcats };
    this.categories[catIndex] = updatedCat;
    this.notify();

    if (supabase) {
      supabase.from('categories').upsert({
        id: updatedCat.id,
        name: updatedCat.name,
        subcategories: updatedCat.subcategories
      }).then(() => {}).catch(() => {});
    }
  }

  deleteCategory(categoryId) {
    this.categories = this.categories.filter(c => c.id !== categoryId && c.name !== categoryId);
    this.notify();

    if (supabase) {
      supabase.from('categories').delete().eq('id', categoryId).then(() => {}).catch(() => {});
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  getTopSellingProduct() {
    return [...this.products].sort((a, b) => b.sales_count - a.sales_count)[0];
  }

  getOffers() {
    return this.products.filter(p => p.is_offer);
  }

  // Stock & Price Updates
  updateProduct(id, updates) {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
    this.notify();
    
    // Async attempt to update Supabase if configured
    if (supabase) {
      supabase.from('products').update(updates).eq('id', id).then(() => {}).catch(() => {});
    }
  }

  updateStock(id, newStock) {
    this.updateProduct(id, { stock: parseInt(newStock, 10) || 0 });
  }

  // Usado en el checkout (cliente anonimo). Actualiza el estado local al
  // instante para la UI, y persiste el descuento real en la base via una
  // funcion SQL atomica (evita vender de mas con compras simultaneas y no
  // requiere que el cliente tenga permiso de UPDATE directo sobre products).
  decrementStockAfterSale(id, qty) {
    if (!qty || qty <= 0) return;

    this.products = this.products.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        stock: Math.max(0, (p.stock || 0) - qty),
        sales_count: (p.sales_count || 0) + qty
      };
    });
    this.notify();

    if (supabase) {
      supabase.rpc('decrement_product_stock', { p_product_id: id, p_qty: qty }).then(() => {}).catch(() => {});
    }
  }

  updatePrice(id, newPrice, newWholesalePrice) {
    this.updateProduct(id, { 
      price: parseFloat(newPrice) || 0, 
      wholesale_price: parseFloat(newWholesalePrice) || 0 
    });
  }

  updatePricesByPercentage(productIds, percentage, applyToList = true, applyToWholesale = true) {
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct === 0) return;

    const targetIds = Array.isArray(productIds) && productIds.length > 0 
      ? new Set(productIds) 
      : null;

    const factor = 1 + (pct / 100);

    this.products = this.products.map(p => {
      if (targetIds && !targetIds.has(p.id)) return p;

      const newPrice = applyToList ? Math.round(p.price * factor) : p.price;
      const newWholesalePrice = applyToWholesale ? Math.round(p.wholesale_price * factor) : p.wholesale_price;

      const updates = { price: newPrice, wholesale_price: newWholesalePrice };

      if (supabase) {
        supabase.from('products').update(updates).eq('id', p.id).then(() => {}).catch(() => {});
      }

      return { ...p, ...updates };
    });

    this.notify();
  }

  // User Authentication
  registerUser(userData) {
    const user = {
      name: userData.name,
      dni: userData.dni,
      phone: userData.phone,
      locality: userData.locality,
      password: userData.password || 'cliente123',
      role: 'client',
      created_at: new Date().toISOString()
    };
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('elpaquetero_current_user', JSON.stringify(user));
    }

    const existingIdx = this.clients.findIndex(c => c.phone === user.phone);
    if (existingIdx >= 0) {
      this.clients[existingIdx] = { ...this.clients[existingIdx], ...user };
    } else {
      this.clients.unshift(user);
    }
    this.notify();

    if (supabase) {
      supabase.from('wholesale_clients').upsert({
        name: user.name,
        dni: user.dni,
        phone: user.phone,
        locality: user.locality,
        password: user.password
      }, { onConflict: 'phone' }).then(() => {}).catch(() => {});
    }

    return user;
  }

  loginUser(phone, password) {
    if (phone === 'admin' || phone === '1122334455') {
      const adminUser = { id: 'u-admin', name: 'Administrador El Paquetero', phone, role: 'admin' };
      this.currentUser = adminUser;
      this.notify();
      return adminUser;
    }
    
    const existingClient = this.clients.find(c => c.phone === phone);
    const user = existingClient || {
      name: 'Cliente Mayorista',
      phone,
      role: 'client',
      created_at: new Date().toISOString()
    };

    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('elpaquetero_current_user', JSON.stringify(user));
    }
    this.notify();
    return user;
  }

  logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elpaquetero_current_user');
    }
    this.notify();
  }

  bulkInsertProducts(productsList) {
    if (!Array.isArray(productsList) || productsList.length === 0) return 0;

    const newFormattedProducts = productsList.map((item, idx) => {
      const price = parseFloat(item.price || item.precio || item.precio_minorista || item.precio_lista) || 0;
      const wholesale_price = item.wholesale_price || item.precio_mayorista 
        ? (parseFloat(item.wholesale_price || item.precio_mayorista) || 0)
        : Math.round(price * 0.60);

      const categoryName = (item.category || item.categoria || 'General').trim();
      const subcategoryName = (item.subcategory || item.subcategoria || '').trim();

      if (categoryName && categoryName !== 'General') {
        this.addCategory(categoryName, subcategoryName ? [subcategoryName] : []);
      }

      return {
        id: item.id || `p-${Date.now()}-${idx}-${Math.floor(Math.random()*1000)}`,
        name: (item.name || item.nombre || 'Producto Importado').trim(),
        category: categoryName,
        subcategory: subcategoryName,
        price,
        wholesale_price,
        stock: parseInt(item.stock, 10) || 0,
        sales_count: 0,
        image_url: (item.image_url || item.imagen || item.url_imagen || '/elpaquetero_imagenes/Logo 2.jpeg').trim(),
        description: (item.description || item.descripcion || '').trim(),
        is_offer: Boolean(item.is_offer),
        is_top_seller: false
      };
    });

    this.products = [...newFormattedProducts, ...this.products];
    this.notify();

    if (supabase) {
      supabase.from('products').upsert(newFormattedProducts).then(() => {}).catch(() => {});
    }

    return newFormattedProducts.length;
  }

  // Create Order & Generate Raffle Tickets for REGISTERED purchases >= $50.000
  createOrder(cartItems, clientDetails) {
    const retailSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const isWholesaleQualified = retailSubtotal >= 50000;

    const total = isWholesaleQualified 
      ? Math.round(retailSubtotal * 0.60) 
      : retailSubtotal;
    
    // Raffle Tickets are strictly assigned ONLY to REGISTERED users
    const isRegisteredUser = Boolean(clientDetails.isRegistered || this.currentUser);
    const raffleTicketsCount = (isRegisteredUser && total >= 50000) 
      ? Math.floor(total / 50000) 
      : 0;

    const generatedTickets = [];
    for (let i = 0; i < raffleTicketsCount; i++) {
      const ticketNum = 'TICKET-' + Math.floor(10000 + Math.random() * 90000);
      generatedTickets.push(ticketNum);
    }

    const order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      client_name: clientDetails.name,
      client_phone: clientDetails.phone,
      client_dni: clientDetails.dni,
      client_locality: clientDetails.locality,
      delivery_method: clientDetails.deliveryMethod,
      receipt_url: clientDetails.receiptUrl || null,
      items: cartItems,
      total_amount: total,
      is_wholesale: isWholesaleQualified,
      discount_applied: isWholesaleQualified ? Math.round(retailSubtotal * 0.40) : 0,
      raffle_tickets: generatedTickets,
      is_registered: isRegisteredUser,
      created_at: new Date().toISOString(),
      status: 'pendiente'
    };

    // Store active order in memory and localStorage so it never disappears
    this.activeOrder = order;
    if (typeof window !== 'undefined') {
      localStorage.setItem('elpaquetero_active_order', JSON.stringify(order));
    }

    // Save client info to wholesale_clients
    if (clientDetails.phone && clientDetails.name) {
      const clientRecord = {
        name: clientDetails.name,
        dni: clientDetails.dni || '',
        phone: clientDetails.phone,
        locality: clientDetails.locality || '',
        password: 'cliente' + (clientDetails.phone.slice(-4) || '123')
      };

      const existingIdx = this.clients.findIndex(c => c.phone === clientDetails.phone);
      if (existingIdx >= 0) {
        this.clients[existingIdx] = { ...this.clients[existingIdx], ...clientRecord };
      } else {
        this.clients.unshift(clientRecord);
      }

      if (supabase) {
        supabase.from('wholesale_clients').upsert(clientRecord, { onConflict: 'phone' }).then(() => {}).catch(() => {});
      }
    }

    // Update sales_count and stock for products
    cartItems.forEach(item => {
      this.decrementStockAfterSale(item.product.id, item.quantity);
    });

    // Add cash movement
    this.cashMovements.unshift({
      id: 'cm-' + Date.now(),
      type: 'income',
      amount: total,
      concept: `Venta ${isWholesaleQualified ? 'Mayorista (40% OFF)' : 'Minorista'} ${order.id} (${clientDetails.name})`,
      date: new Date().toISOString()
    });

    this.orders.unshift(order);
    this.notify();

    // Insert into Supabase table orders (omitting non-existing columns like raffle_tickets)
    if (supabase) {
      supabase.from('orders').insert({
        id: order.id,
        client_name: order.client_name,
        client_phone: order.client_phone,
        client_dni: order.client_dni,
        client_locality: order.client_locality,
        delivery_method: order.delivery_method,
        receipt_url: order.receipt_url,
        total_amount: order.total_amount,
        items: order.items,
        status: order.status,
        created_at: order.created_at
      }).then(() => {}).catch((err) => console.warn('Order insert warning:', err));
    }

    return order;
  }

  updateOrderReceipt(orderId, receiptUrl) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, receipt_url: receiptUrl } : o);

    if (this.activeOrder && this.activeOrder.id === orderId) {
      this.activeOrder = { ...this.activeOrder, receipt_url: receiptUrl };
      if (typeof window !== 'undefined') {
        localStorage.setItem('elpaquetero_active_order', JSON.stringify(this.activeOrder));
      }
    }

    this.notify();

    if (supabase) {
      supabase.from('orders').update({ receipt_url: receiptUrl }).eq('id', orderId).then(() => {}).catch(() => {});
    }
  }

  updateOrderStatus(orderId, newStatus) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    this.notify();

    if (supabase) {
      supabase.from('orders').update({ status: newStatus }).eq('id', orderId).then(() => {}).catch(() => {});
    }
  }

  getActiveOrder() {
    if (this.activeOrder) return this.activeOrder;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('elpaquetero_active_order');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return null;
  }

  clearActiveOrder() {
    this.activeOrder = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elpaquetero_active_order');
    }
    this.notify();
  }

  async cleanOldReceipts(daysThreshold = 30) {
    const cutoffTime = Date.now() - (daysThreshold * 86400000);
    let cleanedCount = 0;

    for (const order of this.orders) {
      if (order.receipt_url && new Date(order.created_at).getTime() < cutoffTime) {
        if (supabase && order.receipt_url.includes('supabase.co')) {
          try {
            const parts = order.receipt_url.split('/Productos/');
            if (parts[1]) {
              await supabase.storage.from('Productos').remove([decodeURIComponent(parts[1])]);
            }
          } catch (e) {
            console.warn('Error deleting storage receipt:', e);
          }
        }

        order.receipt_url = null;
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.notify();
      if (supabase) {
        for (const order of this.orders) {
          if (!order.receipt_url) {
            await supabase.from('orders').update({ receipt_url: null }).eq('id', order.id);
          }
        }
      }
    }

    return cleanedCount;
  }

  // Aggregated VIP Client Stats & Ranking (combines registered clients and orders)
  getClientsWithStats() {
    const clientMap = {};

    // 1. Add all registered clients from wholesale_clients
    (this.clients || []).forEach(c => {
      const key = c.phone || c.name;
      if (!key) return;
      clientMap[key] = {
        name: c.name || 'Cliente Registrado',
        dni: c.dni || 'Sin especificar',
        phone: c.phone || 'Sin especificar',
        locality: c.locality || 'Sin especificar',
        total_spent: 0,
        orders_count: 0,
        tickets_count: 0,
        is_registered: true
      };
    });

    // 2. Aggregate metrics from all orders
    this.orders.forEach(order => {
      const key = order.client_phone || order.client_name;
      if (!key) return;
      if (!clientMap[key]) {
        clientMap[key] = {
          name: order.client_name,
          dni: order.client_dni,
          phone: order.client_phone,
          locality: order.client_locality,
          total_spent: 0,
          orders_count: 0,
          tickets_count: 0,
          is_registered: Boolean(order.is_registered)
        };
      }

      clientMap[key].total_spent += order.total_amount;
      clientMap[key].orders_count += 1;
      clientMap[key].tickets_count += (order.raffle_tickets || []).length;
    });

    // Convert map to array and sort by total_spent descending
    return Object.values(clientMap).sort((a, b) => b.total_spent - a.total_spent);
  }

  // All Active Raffle Tickets in Play
  getAllRaffleTickets() {
    const tickets = [];

    this.orders.forEach(order => {
      if (order.raffle_tickets && order.raffle_tickets.length > 0) {
        order.raffle_tickets.forEach(ticketId => {
          tickets.push({
            ticket_id: ticketId,
            order_id: order.id,
            order_amount: order.total_amount,
            client_name: order.client_name,
            client_phone: order.client_phone,
            client_dni: order.client_dni,
            client_locality: order.client_locality
          });
        });
      }
    });

    return tickets;
  }

  // Admin Metrics Calculations — el arqueo se calcula a partir de las
  // ordenes reales persistidas en Supabase (solo pagos ya aprobados),
  // no de un registro de caja en memoria que se perdia al refrescar.
  getMetrics() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const paidOrders = this.orders.filter(o => o.status === 'aprobado' || o.status === 'enviado');

    const sumOrdersSince = (sinceTs) => paidOrders
      .filter(o => new Date(o.created_at).getTime() >= sinceTs)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const dailyCash = sumOrdersSince(startOfDay);
    const weeklyCash = sumOrdersSince(startOfWeek);
    const monthlyCash = sumOrdersSince(startOfMonth);

    const topRotationProducts = [...this.products]
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 5);

    const totalStockCount = this.products.reduce((sum, p) => sum + p.stock, 0);

    return {
      dailyCash,
      weeklyCash,
      monthlyCash,
      topRotationProducts,
      totalStockCount,
      totalOrders: this.orders.length
    };
  }
}

export const dataStore = new DataStore();
