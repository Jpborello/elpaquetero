'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CarouselSection from '@/components/CarouselSection';
import CategoryNav from '@/components/CategoryNav';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import WhatsAppButton from '@/components/WhatsAppButton';
import WholesaleBanner from '@/components/WholesaleBanner';
import TrustBar from '@/components/TrustBar';
import ProductDetailModal from '@/components/ProductDetailModal';
import { dataStore, CATEGORIES } from '@/lib/dataStore';
import { Store, Phone, MapPin, Instagram } from 'lucide-react';

const CART_STORAGE_KEY = 'elpaquetero_cart';
const PRODUCTS_PER_PAGE = 24;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Cart & Auth state
  const [cartItems, setCartItems] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  useEffect(() => {
    const updateStoreData = () => {
      setProducts(dataStore.getProducts());
      setCategories(dataStore.getCategories());
      setCurrentUser(dataStore.currentUser);
    };

    updateStoreData();
    const unsubscribe = dataStore.subscribe(updateStoreData);
    return () => unsubscribe();
  }, []);

  // Restaurar el carrito guardado (una vez que ya tenemos productos para
  // validar contra precio/stock actual) para que no se pierda al refrescar.
  useEffect(() => {
    if (cartHydrated || products.length === 0) return;
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const savedTuples = JSON.parse(raw);
        const restored = (Array.isArray(savedTuples) ? savedTuples : [])
          .map((t) => {
            const product = products.find((p) => p.id === t.id);
            if (!product) return null;
            return { product: { ...product, selectedSize: t.selectedSize || null }, quantity: t.quantity || 1 };
          })
          .filter(Boolean);
        if (restored.length > 0) setCartItems(restored);
      }
    } catch (e) {
      console.warn('No se pudo restaurar el carrito guardado:', e);
    }
    setCartHydrated(true);
  }, [products, cartHydrated]);

  // Volver a mostrar solo el primer lote cada vez que cambian los filtros,
  // para no arrancar una nueva búsqueda con la paginación ya "gastada".
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  // Persistir el carrito en cada cambio (recien despues de hidratar, para
  // no pisar lo guardado con el estado inicial vacio)
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      const tuples = cartItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        selectedSize: item.product.selectedSize || null
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(tuples));
    } catch (e) {
      console.warn('No se pudo guardar el carrito:', e);
    }
  }, [cartItems, cartHydrated]);

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
    let matchesCategory = selectedCategory === 'all';
    
    if (!matchesCategory) {
      const selCatLower = selectedCategory.toLowerCase().trim();
      const prodCatLower = (product.category || '').toLowerCase().trim();
      const prodSubLower = (product.subcategory || '').toLowerCase().trim();

      matchesCategory = (
        prodCatLower === selCatLower ||
        prodSubLower === selCatLower ||
        prodCatLower.includes(selCatLower) ||
        prodSubLower.includes(selCatLower) ||
        selCatLower.includes(prodSubLower) ||
        selCatLower.includes(prodCatLower)
      );
    }

    let matchesSubcategory = !selectedSubcategory;
    if (!matchesSubcategory && selectedSubcategory) {
      const selSubLower = selectedSubcategory.toLowerCase().trim();
      const prodSubLower = (product.subcategory || '').toLowerCase().trim();
      matchesSubcategory = prodSubLower === selSubLower || prodSubLower.includes(selSubLower);
    }

    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const offers = dataStore.getOffers();
  const topSeller = dataStore.getTopSellingProduct();

  const totalCartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalRetail = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isWholesaleQualified = cartSubtotalRetail >= 50000;

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

      {/* Wholesale Threshold Banner */}
      <WholesaleBanner />

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

      {/* Trust Bar */}
      <TrustBar />

      {/* Main Catalog Area */}
      <main className="main-catalog-layout">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
        />

        <ProductGrid
          products={filteredProducts.slice(0, visibleCount)}
          onAddToCart={handleAddToCart}
          isWholesaleQualified={isWholesaleQualified}
          onOpenDetail={setDetailProduct}
        />

        {filteredProducts.length > 0 && (
          <div className="catalog-footer-controls">
            <span className="catalog-count-label">
              Mostrando {Math.min(visibleCount, filteredProducts.length)} de {filteredProducts.length} productos
            </span>
            {visibleCount < filteredProducts.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                className="btn-load-more"
              >
                Ver más productos
              </button>
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        isWholesaleQualified={isWholesaleQualified}
      />

      {/* Floating WhatsApp Contact Button */}
      <WhatsAppButton />

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
              <img src="/elpaquetero_imagenes/Logo 2.jpeg" alt="Logo El Paquetero" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--accent-gold)' }} />
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
              <a
                href="https://www.instagram.com/el_paquetero_godoy/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de El Paquetero"
                className="btn-icon"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#857D75' }}>
          © {new Date().getFullYear()} El Paquetero - Todos los derechos reservados. Plataforma E-commerce Mayorista.
          <br />
          Desarrollado por{' '}
          <a
            href="https://www.neo-core-sys.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-gold-light)', fontWeight: 700 }}
          >
            Neo Core Sys
          </a>
        </div>
      </footer>
    </div>
  );
}
