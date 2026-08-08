'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowLeft, KeyRound, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { dataStore } from '@/lib/dataStore';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabsNav from '@/components/admin/AdminTabsNav';
import MetricsTab from '@/components/admin/MetricsTab';
import StockTab from '@/components/admin/StockTab';
import PricesTab from '@/components/admin/PricesTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import BulkImportTab from '@/components/admin/BulkImportTab';
import ImagesTab from '@/components/admin/ImagesTab';
import OrdersTab from '@/components/admin/OrdersTab';
import ClientsTab from '@/components/admin/ClientsTab';
import RaffleTab from '@/components/admin/RaffleTab';

export default function AdminPage() {
  // Admin Authentication State with Supabase Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [activeTab, setActiveTab] = useState('metrics');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchFilter, setSearchFilter] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  
  // Mercado Pago Transfers State
  const [mpTransfers, setMpTransfers] = useState([]);
  const [mpConfigured, setMpConfigured] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);

  // Check active Supabase Auth session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user && isMounted) {
            setIsAuthenticated(true);
            setAdminUser(session.user);
          }
        } catch (e) {
          console.warn('Session check warning:', e);
        }
      }

      if (isMounted) setCheckingSession(false);
    }

    checkAuthSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          setIsAuthenticated(true);
          setAdminUser(session.user);
        } else {
          setIsAuthenticated(false);
          setAdminUser(null);
        }
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    try {
      if (!supabase) {
        setLoginError('Supabase no está configurado. Contactá al desarrollador.');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data?.session) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
      } else {
        setLoginError('Credenciales incorrectas.');
      }
    } catch (err) {
      setLoginError('Error de autenticación: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const fetchMpTransfers = async () => {
    setMpLoading(true);
    try {
      const res = await fetch('/api/mercadopago/transfers');
      const data = await res.json();
      if (data.success) {
        setMpTransfers(data.transfers || []);
        setMpConfigured(data.configured || false);
      }
    } catch (e) {
      console.error('Error fetching MP transfers:', e);
    } finally {
      setMpLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateState = () => {
      setProducts(dataStore.getProducts());
      setCategories(dataStore.getCategories());
      setOrders(dataStore.orders);
      setClients(dataStore.getClientsWithStats());
      setTickets(dataStore.getAllRaffleTickets());
      setMetrics(dataStore.getMetrics());
      setAliasInput(dataStore.getTransferAlias());
    };

    updateState();
    fetchMpTransfers();

    const unsubscribe = dataStore.subscribe(updateState);
    return () => unsubscribe();
  }, [isAuthenticated]);

  const showSuccessNotice = (msg) => {
    setEditSuccessMsg(msg);
    setTimeout(() => setEditSuccessMsg(''), 4000);
  };

  const handleSaveAlias = (e) => {
    e.preventDefault();
    const clean = (aliasInput || '').trim().toUpperCase();
    if (!clean) return;
    dataStore.setTransferAlias(clean);
    showSuccessNotice(`¡Alias de transferencia actualizado a "${clean}"!`);
  };

  const handleStockUpdate = (id, newStock) => {
    dataStore.updateStock(id, newStock);
    showSuccessNotice('Stock actualizado correctamente.');
  };

  const handlePriceUpdate = (id, newPrice, newWholesalePrice) => {
    dataStore.updatePrice(id, newPrice, newWholesalePrice);
    showSuccessNotice('Precio actualizado correctamente.');
  };

  const handlePricePercentageUpdate = (productIds, percentage, applyToList, applyToWholesale) => {
    dataStore.updatePricesByPercentage(productIds, percentage, applyToList, applyToWholesale);
    showSuccessNotice(`Precios incrementados un ${percentage}% correctamente.`);
  };

  const handleAddCategory = (name, subcategories) => {
    dataStore.addCategory(name, subcategories);
    showSuccessNotice(`Categoría "${name}" agregada con éxito.`);
  };

  const handleAddSubcategory = (categoryId, subcategoryName) => {
    dataStore.addSubcategory(categoryId, subcategoryName);
    showSuccessNotice(`Subcategoría "${subcategoryName}" agregada.`);
  };

  const handleDeleteCategory = (categoryId) => {
    dataStore.deleteCategory(categoryId);
    showSuccessNotice('Categoría eliminada.');
  };

  const handleDeleteSubcategory = (categoryId, subcategoryName) => {
    dataStore.deleteSubcategory(categoryId, subcategoryName);
    showSuccessNotice('Subcategoría eliminada.');
  };

  const handleBulkImport = (newProducts) => {
    dataStore.addBulkProducts(newProducts);
    showSuccessNotice(`${newProducts.length} productos importados masivamente.`);
  };

  const handleImageUpdate = (id, newImageUrl) => {
    dataStore.updateProduct(id, { image_url: newImageUrl });
    showSuccessNotice('Imagen del producto actualizada.');
  };

  const filteredProducts = products.filter(p => 
    searchFilter === '' || 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.code && p.code.includes(searchFilter))
  );

  if (checkingSession) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
      </div>
    );
  }

  // RENDER ADMIN LOGIN FORM WITH SUPABASE AUTH IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px 20px',
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '440px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          padding: '36px 30px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              backgroundColor: '#EFF6FF', 
              color: '#1D4ED8', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Panel de Administración</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              Autenticación oficial con Supabase Auth
            </p>
          </div>

          {loginError && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              color: '#991B1B', 
              padding: '10px 14px', 
              borderRadius: '6px', 
              fontSize: '0.82rem', 
              marginBottom: '16px',
              border: '1px solid #FCA5A5',
              fontWeight: 600
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Correo Electrónico de Administrador
              </label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="form-input"
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Contraseña de Administrador
              </label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="form-input"
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.92rem', fontWeight: 700 }}
            >
              {isLoggingIn ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={18} className="animate-spin" /> Conectando con Supabase Auth...
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={18} /> Iniciar Sesión en Administración
                </span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <Link href="/" style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Volver a la Tienda Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FULL ADMIN DASHBOARD IF AUTHENTICATED WITH SUPABASE AUTH
  return (
    <div style={{ paddingBottom: '60px' }}>
      <AdminHeader onLogout={handleAdminLogout} />

      {editSuccessMsg && (
        <div style={{ 
          backgroundColor: '#ECFDF5', 
          color: '#047857', 
          padding: '12px 18px', 
          borderRadius: 'var(--radius-sm)', 
          fontWeight: 700, 
          marginBottom: '20px',
          border: '1px solid #A7F3D0' 
        }}>
          ✓ {editSuccessMsg}
        </div>
      )}

      <AdminTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'metrics' && (
        <MetricsTab metrics={metrics} products={products} />
      )}

      {activeTab === 'settings' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          maxWidth: '720px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE'
            }}>
              <CreditCard size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Alias para Transferencias Bancarias
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Configurá el Alias CBU / CVU que verán automáticamente tus clientes al momento de pagar en el carrito.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAlias} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Nuevo Alias CBU / CVU / Mercado Pago:
              </label>
              <input 
                type="text" 
                value={aliasInput} 
                onChange={(e) => setAliasInput(e.target.value.toUpperCase())}
                placeholder="Ej: ELPAQUETERO.MP" 
                className="form-input"
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  border: '2px solid #BFDBFE',
                  backgroundColor: '#F8FAFC'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="btn-hero-primary" style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 800 }}>
                ✓ Guardar y Publicar Alias
              </button>

              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Se actualizará automáticamente para todos los clientes.
              </span>
            </div>
          </form>

          {/* Customer Preview Card */}
          <div style={{
            marginTop: '28px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
              📌 Vista Previa en la Pantalla del Cliente:
            </div>
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '2px dashed #3B82F6',
              borderRadius: '10px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💳 Alias para Transferencia Bancaria
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BFDBFE',
                padding: '8px 16px',
                borderRadius: '8px',
                margin: '10px 0'
              }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1D4ED8', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {aliasInput || 'ELPAQUETERO.MP'}
                </span>
                <span style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Copiar
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#1E40AF', margin: 0, fontWeight: 600 }}>
                Podés adjuntar tu comprobante de pago subiendo la foto desde esta pantalla o enviárnoslo por WhatsApp junto con tu pedido.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <StockTab 
          products={filteredProducts}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onUpdateStock={handleStockUpdate}
        />
      )}

      {activeTab === 'prices' && (
        <PricesTab 
          products={filteredProducts}
          allProductsCount={products.length}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onUpdatePrice={handlePriceUpdate}
          onUpdatePricePercentage={handlePricePercentageUpdate}
        />
      )}

      {activeTab === 'bulk' && (
        <BulkImportTab 
          onBulkImport={handleBulkImport}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab 
          categories={categories}
          onAddCategory={handleAddCategory}
          onAddSubcategory={handleAddSubcategory}
          onDeleteCategory={handleDeleteCategory}
          onDeleteSubcategory={handleDeleteSubcategory}
        />
      )}

      {activeTab === 'images' && (
        <ImagesTab 
          products={filteredProducts}
          onUpdateImage={handleImageUpdate}
        />
      )}

      {activeTab === 'orders' && (
        <OrdersTab 
          orders={orders}
          mpTransfers={mpTransfers}
          mpConfigured={mpConfigured}
          mpLoading={mpLoading}
          onFetchMpTransfers={fetchMpTransfers}
        />
      )}

      {activeTab === 'clients' && (
        <ClientsTab clients={clients} />
      )}

      {activeTab === 'raffle' && (
        <RaffleTab tickets={tickets} />
      )}
    </div>
  );
}
