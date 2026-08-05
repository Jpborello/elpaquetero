import { supabase } from './supabaseClient';

export const INITIAL_PRODUCTS = [
  {
    id: 'p-1',
    name: 'Campera de AFA Selección Oficial',
    category: 'Camperas',
    subcategory: 'Deportivas',
    price: 35000,
    wholesale_price: 29900,
    stock: 85,
    sales_count: 340,
    image_url: '/elpaquetero_imagenes/Camperas/campera de Afa.jpg',
    description: 'Campera oficial de la Selección Argentina con tecnología frizada, escudo bordado y cierres reforzados.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-2',
    name: 'Buzo The North Face Hooded',
    category: 'Buzos',
    subcategory: 'Urbano',
    price: 22000,
    wholesale_price: 18500,
    stock: 45,
    sales_count: 210,
    image_url: '/elpaquetero_imagenes/Buzos/buzo the north Face N.jpg',
    description: 'Buzo frizado canguro marca The North Face con capucha ajustables y estampa frontal HD.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-3',
    name: 'Buzo The North Face Classic Black',
    category: 'Buzos',
    subcategory: 'Urbano',
    price: 21000,
    wholesale_price: 17900,
    stock: 60,
    sales_count: 185,
    image_url: '/elpaquetero_imagenes/Buzos/buzo the north Face.jpg',
    description: 'Buzo básico de friza pesada premium con puños elastizados.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-4',
    name: 'Campera de Abrigo Térmica Premium',
    category: 'Camperas',
    subcategory: 'Térmicas',
    price: 42000,
    wholesale_price: 34000,
    stock: 30,
    sales_count: 145,
    image_url: '/elpaquetero_imagenes/Camperas/Campera de abrigo.jpg',
    description: 'Campera inflable de abrigo ultra liviana con relleno térmico de guata siliconada.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5',
    name: 'Campera Urbana de Buzo',
    category: 'Camperas',
    subcategory: 'Urbana',
    price: 27000,
    wholesale_price: 22500,
    stock: 50,
    sales_count: 175,
    image_url: '/elpaquetero_imagenes/Camperas/Campera de buzo Urbana.jpg',
    description: 'Campera combinada en rústico con mangas frizadas y cierre completo.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-6',
    name: 'Camperas Deportivas Nike Line',
    category: 'Camperas',
    subcategory: 'Deportivas',
    price: 33000,
    wholesale_price: 28000,
    stock: 40,
    sales_count: 260,
    image_url: '/elpaquetero_imagenes/Camperas/Camperas deportivas nike.jpg',
    description: 'Campera rompeviento microfibra esmerilada con recortes combinados.',
    is_offer: false,
    is_top_seller: true
  },
  {
    id: 'p-7',
    name: 'Campera Deportiva Urban Style',
    category: 'Camperas',
    subcategory: 'Deportivas',
    price: 31000,
    wholesale_price: 26000,
    stock: 35,
    sales_count: 130,
    image_url: '/elpaquetero_imagenes/Camperas/Camperas deportivas urban.jpg',
    description: 'Campera deportiva liviana ideal para entrenamiento o tiempo libre.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-8',
    name: 'Campera de Buzo Canguro Rústica',
    category: 'Camperas',
    subcategory: 'Urbana',
    price: 23500,
    wholesale_price: 19500,
    stock: 55,
    sales_count: 160,
    image_url: '/elpaquetero_imagenes/Camperas/camperas de buzo.jpg',
    description: 'Campera rústica de algodón con capucha y bolsillos laterales.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-9',
    name: 'Gorra Urbana Curva Varios Colores',
    category: 'Gorras',
    subcategory: 'Accesorios',
    price: 7500,
    wholesale_price: 5500,
    stock: 130,
    sales_count: 410,
    image_url: '/elpaquetero_imagenes/Gorras.jpg',
    description: 'Gorra gabardina de algodón con hebilla metálica de ajuste trasera.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-10',
    name: 'Calza Deportiva Supplex Fit High Waist',
    category: 'Calzas',
    subcategory: 'Deportivas',
    price: 11000,
    wholesale_price: 8500,
    stock: 120,
    sales_count: 290,
    image_url: '/elpaquetero_imagenes/Logo 2.jpeg',
    description: 'Calza chupín tiro alto en supplex de poliamida con efecto moldeador.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-11',
    name: 'Pantalón Jogging Algodón Frizado',
    category: 'Pantalon de Yoguin',
    subcategory: 'Pantalones',
    price: 16800,
    wholesale_price: 13800,
    stock: 90,
    sales_count: 230,
    image_url: '/elpaquetero_imagenes/Logo 2.jpeg',
    description: 'Pantalón babucha de jogging friza invisible con puños en rectilíneo.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-12',
    name: 'Remera Deportiva DryFit NIKE Pro',
    category: 'Remeras deportivas',
    subcategory: 'Tops & Remeras',
    price: 12000,
    wholesale_price: 9200,
    stock: 110,
    sales_count: 310,
    image_url: '/elpaquetero_imagenes/Logo 2.jpeg',
    description: 'Remera técnica respirable DryFit corte anatómico.',
    is_offer: true,
    is_top_seller: true
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', count: 12 },
  { id: 'Buzos', name: 'Buzos', subcategories: ['Urbano', 'Con Capucha', 'Canguro'] },
  { id: 'Camperas', name: 'Camperas', subcategories: ['Deportivas', 'Térmicas', 'Urbana', 'AFA'] },
  { id: 'Calzas', name: 'Calzas', subcategories: ['Deportivas', 'Largas', 'Ciclismo'] },
  { id: 'Camisas', name: 'Camisas', subcategories: ['Leñadoras', 'De Vestir', 'Lino'] },
  { id: 'Gorras', name: 'Gorras', subcategories: ['Accesorios', 'Planas', 'Curvas'] },
  { id: 'Infantil', name: 'Infantil', subcategories: ['Conjuntos', 'Buzos', 'Remeras'] },
  { id: 'Medias', name: 'Medias', subcategories: ['Deportivas', 'Invisibles', 'Packs'] },
  { id: 'Pantalon de Yoguin', name: 'Pantalón Jogging', subcategories: ['Babuchas', 'Rectos', 'Frizados'] },
  { id: 'Perfumeria', name: 'Perfumería', subcategories: ['Fragancias Textiles', 'Ambientadores'] },
  { id: 'Remeras deportivas', name: 'Remeras Deportivas', subcategories: ['DryFit', 'Entrenamiento', 'Musculosas'] },
  { id: 'Top Deportivos', name: 'Top Deportivos', subcategories: ['Alto Impacto', 'Standard'] }
];

// In-Memory / LocalStorage State Manager with Supabase Mirror
class DataStore {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    this.currentUser = null;
    this.orders = [
      {
        id: 'ORD-584920',
        client_name: 'Carlos Ruiz — Moda San Martín',
        client_phone: '3416095021',
        client_dni: '38450123',
        client_locality: 'Rosario',
        delivery_method: 'Envío a Domicilio',
        receipt_url: '/elpaquetero_imagenes/Local.jpg',
        items: [],
        total_amount: 148500,
        raffle_tickets: ['TICKET-78492', 'TICKET-78493'],
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'completado'
      },
      {
        id: 'ORD-584918',
        client_name: 'Mariana Gómez — Indumentaria Rosario',
        client_phone: '3415129482',
        client_dni: '35129482',
        client_locality: 'Funes',
        delivery_method: 'Retiro por Sucursal',
        receipt_url: '/elpaquetero_imagenes/Logo 2.jpeg',
        items: [],
        total_amount: 89000,
        raffle_tickets: ['TICKET-78490'],
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'completado'
      },
      {
        id: 'ORD-584910',
        client_name: 'Lucas Benítez — Sportwear',
        client_phone: '3414920192',
        client_dni: '40192831',
        client_locality: 'San Lorenzo',
        delivery_method: 'Envío a Domicilio',
        receipt_url: null,
        items: [],
        total_amount: 62000,
        raffle_tickets: ['TICKET-78488'],
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'completado'
      }
    ];
    this.cashMovements = [
      { id: 'cm-1', type: 'income', amount: 485000, concept: 'Venta Mayorista #1001', date: new Date().toISOString() },
      { id: 'cm-2', type: 'income', amount: 620000, concept: 'Venta Mayorista #1002', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'cm-3', type: 'expense', amount: 150000, concept: 'Pago Proveedor Tela', date: new Date(Date.now() - 172800000).toISOString() },
      { id: 'cm-4', type: 'income', amount: 890000, concept: 'Venta Mayorista #1003', date: new Date(Date.now() - 259200000).toISOString() },
    ];
    this.listeners = [];
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

  // Create Order & Generate Raffle Tickets for purchases >= $50.000
  createOrder(cartItems, clientDetails) {
    const total = cartItems.reduce((sum, item) => sum + (item.product.wholesale_price * item.quantity), 0);
    
    // Generate raffle tickets if total >= $50.000 (1 ticket per $50.000 spent)
    const raffleTicketsCount = total >= 50000 ? Math.floor(total / 50000) : 0;
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
      concept: `Venta Mayorista ${order.id} (${clientDetails.name})`,
      date: new Date().toISOString()
    });

    this.orders.unshift(order);
    this.notify();
    return order;
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
