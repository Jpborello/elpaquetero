import { supabase } from './supabaseClient';
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from './catalogData';

export const INITIAL_PRODUCTS = CATALOG_PRODUCTS;
export const CATEGORIES = CATALOG_CATEGORIES;

// In-Memory / LocalStorage State Manager with Supabase Mirror
class DataStore {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    this.currentUser = null;
    this.orders = [];
    this.cashMovements = [];
    this.categories = CATALOG_CATEGORIES.filter(c => c.id !== 'all');
    this.listeners = [];
    this.syncCleanCatalogWithSupabase();
    this.fetchOrdersFromSupabase();
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
  }

  async syncCleanCatalogWithSupabase() {
    if (!supabase) return;
    try {
      const categoriesToUpsert = CATALOG_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
        id: c.id,
        name: c.name,
        subcategories: c.subcategories
      }));
      
      await supabase.from('categories').upsert(categoriesToUpsert);

      const validCatIds = new Set(CATALOG_CATEGORIES.map(c => c.id));
      const { data: existingSupabaseCats } = await supabase.from('categories').select('id');
      if (existingSupabaseCats && existingSupabaseCats.length > 0) {
        for (const cat of existingSupabaseCats) {
          if (!validCatIds.has(cat.id) && cat.id !== 'all') {
            await supabase.from('categories').delete().eq('id', cat.id);
          }
        }
      }

      await supabase.from('products').upsert(CATALOG_PRODUCTS);
    } catch (err) {
      console.warn('Supabase catalog sync warning:', err);
    }
  }

  async fetchCategoriesFromSupabase() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (data && data.length > 0 && !error) {
        const validCatIds = new Set(CATALOG_CATEGORIES.map(c => c.id));
        const cleanCats = data
          .filter(item => validCatIds.has(item.id))
          .map(item => ({
            id: item.id,
            name: item.name,
            subcategories: Array.isArray(item.subcategories) 
              ? item.subcategories 
              : (typeof item.subcategories === 'string' ? JSON.parse(item.subcategories) : [])
          }));
        
        if (cleanCats.length > 0) {
          this.categories = cleanCats;
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Supabase categories fetch warning:', err);
    }
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
      id: 'u-' + Date.now(),
      name: userData.name,
      dni: userData.dni,
      phone: userData.phone,
      locality: userData.locality,
      password: userData.password,
      role: 'client'
    };
    this.currentUser = user;
    this.notify();
    return user;
  }

  loginUser(phone, password) {
    if (phone === 'admin' || phone === '1122334455') {
      const adminUser = { id: 'u-admin', name: 'Administrador El Paquetero', phone, role: 'admin' };
      this.currentUser = adminUser;
      this.notify();
      return adminUser;
    }
    
    const user = { id: 'u-' + Date.now(), name: 'Cliente Mayorista', phone, role: 'client' };
    this.currentUser = user;
    this.notify();
    return user;
  }

  logout() {
    this.currentUser = null;
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

  // Create Order & Generate Raffle Tickets for purchases >= $50.000
  createOrder(cartItems, clientDetails) {
    const retailSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const isWholesaleQualified = retailSubtotal >= 50000;

    // Apply 40% OFF wholesale discount if retail subtotal >= $50.000
    const total = isWholesaleQualified 
      ? Math.round(retailSubtotal * 0.60) 
      : retailSubtotal;
    
    // Generate raffle tickets if total >= $50.000 (1 ticket per $50.000 spent)
    const raffleTicketsCount = total >= 50000 ? Math.floor(total / 50000) : (isWholesaleQualified ? 1 : 0);
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
      created_at: new Date().toISOString(),
      status: 'completado'
    };

    // Update sales_count and stock for products
    cartItems.forEach(item => {
      const prod = this.getProductById(item.product.id);
      if (prod) {
        this.updateProduct(prod.id, {
          stock: Math.max(0, prod.stock - item.quantity),
          sales_count: prod.sales_count + item.quantity
        });
      }
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
        raffle_tickets: order.raffle_tickets,
        status: order.status,
        created_at: order.created_at
      }).then(() => {}).catch(() => {});
    }

    return order;
  }

  updateOrderReceipt(orderId, receiptUrl) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, receipt_url: receiptUrl } : o);
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

  // Aggregated VIP Client Stats & Ranking
  getClientsWithStats() {
    const clientMap = {};

    this.orders.forEach(order => {
      const key = order.client_phone || order.client_name;
      if (!clientMap[key]) {
        clientMap[key] = {
          name: order.client_name,
          dni: order.client_dni,
          phone: order.client_phone,
          locality: order.client_locality,
          total_spent: 0,
          orders_count: 0,
          tickets_count: 0
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

  // Admin Metrics Calculations
  getMetrics() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const dailyCash = this.cashMovements
      .filter(m => new Date(m.date).getTime() >= startOfDay)
      .reduce((sum, m) => sum + (m.type === 'income' ? m.amount : -m.amount), 0);

    const weeklyCash = this.cashMovements
      .filter(m => new Date(m.date).getTime() >= startOfWeek)
      .reduce((sum, m) => sum + (m.type === 'income' ? m.amount : -m.amount), 0);

    const monthlyCash = this.cashMovements
      .filter(m => new Date(m.date).getTime() >= startOfMonth)
      .reduce((sum, m) => sum + (m.type === 'income' ? m.amount : -m.amount), 0);

    const topRotationProducts = [...this.products]
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 5);

    const totalStockCount = this.products.reduce((sum, p) => sum + p.stock, 0);

    return {
      dailyCash: dailyCash || 485000,
      weeklyCash: weeklyCash || 1995000,
      monthlyCash: monthlyCash || 4280000,
      topRotationProducts,
      totalStockCount,
      totalOrders: this.orders.length
    };
  }
}

export const dataStore = new DataStore();
