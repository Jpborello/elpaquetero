'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CarouselSection from '@/components/CarouselSection';
import CategoryNav from '@/components/CategoryNav';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { dataStore, CATEGORIES } from '@/lib/dataStore';
import { Store, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Auth state
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const updateStoreData = () => {
      setProducts(dataStore.getProducts());
      setCurrentUser(dataStore.currentUser);
    };

    updateStoreData();
    const unsubscribe = dataStore.subscribe(updateStoreData);
    return () => unsubscribe();
  }, []);

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) => 
      prev.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = (cart, clientDetails) => {
    const order = dataStore.createOrder(cart, {
      name: clientDetails?.name || currentUser?.name || 'Cliente Mayorista',
      phone: clientDetails?.phone || currentUser?.phone || 'Sin especificar',
      dni: clientDetails?.dni || currentUser?.dni || 'Sin especificar',
      locality: clientDetails?.locality || currentUser?.locality || 'Sin especificar',
      deliveryMethod: clientDetails?.deliveryMethod || 'Envío a Domicilio',
      receiptUrl: clientDetails?.receiptUrl || null
    });
    setCartItems([]);
    return order;
  };

  // Auth operations
  const handleLogin = (phone, password) => {
    dataStore.loginUser(phone, password);
  };

  const handleRegister = (userData) => {
    dataStore.registerUser(userData);
  };

  const handleLogout = () => {
    dataStore.logout();
  };

  // Filter products by category, subcategory and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const offers = dataStore.getOffers();
  const topSeller = dataStore.getTopSellingProduct();

  const totalCartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Navigation */}
      <Header 
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Section */}
      <HeroSection 
        onExploreCatalog={() => {
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Carousel Section (Offers & Top Seller) */}
      <CarouselSection 
        offers={offers}
        topSeller={topSeller}
        onAddToCart={handleAddToCart}
      />

      {/* Main Catalog Area */}
      <main className="main-catalog-layout">
        <CategoryNav 
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
        />

        <ProductGrid 
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-surface-dark)', color: 'var(--text-on-dark)', marginTop: 'auto', padding: '50px 24px 24px 24px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/elpaquetero_imagenes/Logo 2.jpeg" alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--accent-gold)' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>El Paquetero</span>
            </div>
            <p style={{ color: '#A09890', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Distribuidora mayorista líder en indumentaria masculina, femenina e infantil. Venta directa de fábrica con despacho rápido a todo el país.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-gold-light)' }}>Contacto Directo</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#D6C8B5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> 341 609-5021</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Camilo Aldao 2715 esq. ex Godoy (Rosario - Santa Fe)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={16} /> Atención Lunes a Sábado de 8:00 a 16:30 hs</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-gold-light)' }}>Redes & Consultas</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" className="btn-icon" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}><Instagram size={20} /></a>
              <a href="#" className="btn-icon" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}><Facebook size={20} /></a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#857D75' }}>
          © {new Date().getFullYear()} El Paquetero - Todos los derechos reservados. Plataforma E-commerce Mayorista.
        </div>
      </footer>
    </div>
  );
}
