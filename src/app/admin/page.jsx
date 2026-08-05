'use client';

import { useState, useEffect } from 'react';
import { dataStore } from '@/lib/dataStore';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  RefreshCw, 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  Calendar,
  Layers,
  BarChart3
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'stock', 'prices', 'images', 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchFilter, setSearchFilter] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  
  // Mercado Pago Transfers State
  const [mpTransfers, setMpTransfers] = useState([]);
  const [mpConfigured, setMpConfigured] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);

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
    const updateState = () => {
      setProducts(dataStore.getProducts());
      setOrders(dataStore.orders);
      setMetrics(dataStore.getMetrics());
    };

    updateState();
    fetchMpTransfers();
    const unsubscribe = dataStore.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const handleStockUpdate = (id, newStock) => {
    dataStore.updateStock(id, newStock);
    showNotification('Stock actualizado correctamente');
  };

  const handlePriceUpdate = (id, price, wholesalePrice) => {
    dataStore.updatePrice(id, price, wholesalePrice);
    showNotification('Precios actualizados correctamente');
  };

  const handleImageUpdate = (id, newImageUrl) => {
    dataStore.updateProduct(id, { image_url: newImageUrl });
    showNotification('Imagen de producto actualizada');
  };

  const showNotification = (msg) => {
    setEditSuccessMsg(msg);
    setTimeout(() => setEditSuccessMsg(''), 3000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Header Admin */}
      <div className="admin-header-row">
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Volver a la Tienda
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Panel de Administración — El Paquetero</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem' }}>
            Admin Conectado
          </span>
        </div>
      </div>

      {editSuccessMsg && (
        <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: 700 }}>
          ✓ {editSuccessMsg}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('metrics')} 
          className={`admin-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
        >
          <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Métricas & Arqueo de Caja
        </button>
        <button 
          onClick={() => setActiveTab('stock')} 
          className={`admin-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
        >
          <Package size={16} style={{ display: 'inline', marginRight: '6px' }} /> Control de Stock
        </button>
        <button 
          onClick={() => setActiveTab('prices')} 
          className={`admin-tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
        >
          <DollarSign size={16} style={{ display: 'inline', marginRight: '6px' }} /> Cambio de Precios
        </button>
        <button 
          onClick={() => setActiveTab('images')} 
          className={`admin-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
        >
          <ImageIcon size={16} style={{ display: 'inline', marginRight: '6px' }} /> Gestión de Imágenes
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <Layers size={16} style={{ display: 'inline', marginRight: '6px' }} /> Órdenes & Comprobantes
        </button>
      </div>

      {/* TAB 1: METRICS & ARQUEO DE CAJA */}
      {activeTab === 'metrics' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Arqueo de Caja (Ingresos Mayoristas)</h2>
          
          <div className="metrics-cards-grid">
            <div className="metric-card">
              <div className="metric-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo Hoy (Diario)
              </div>
              <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
                ${metrics.dailyCash?.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo de la Semana
              </div>
              <div className="metric-value">
                ${metrics.weeklyCash?.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo del Mes
              </div>
              <div className="metric-value" style={{ color: 'var(--accent-gold-hover)' }}>
                ${metrics.monthlyCash?.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Stock Total Físico</div>
              <div className="metric-value">
                {metrics.totalStockCount} prendas
              </div>
            </div>
          </div>

          {/* Product Rotation Ranking */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '32px 0 16px 0' }}>
            <TrendingUp size={20} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-gold)' }} />
            Productos con Mayor Rotación (Más Vendidos)
          </h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Prenda / Producto</th>
                <th>Categoría</th>
                <th>Ventas Acumuladas</th>
                <th>Stock Actual</th>
                <th>Precio Mayorista</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topRotationProducts?.map((prod, idx) => (
                <tr key={prod.id}>
                  <td style={{ fontWeight: 800 }}>#{idx + 1}</td>
                  <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={prod.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    {prod.name}
                  </td>
                  <td>{prod.category}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    🔥 {prod.sales_count} un.
                  </td>
                  <td>{prod.stock} un.</td>
                  <td style={{ fontWeight: 700 }}>${prod.wholesale_price?.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: STOCK CONTROL */}
      {activeTab === 'stock' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Control e Inventario de Stock</h2>
            <input 
              type="text" 
              placeholder="Buscar prenda..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ maxWidth: '300px' }}
            />
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Prenda</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Modificar Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={p.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 800 }}>{p.stock} unidades</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        defaultValue={p.stock} 
                        id={`stock-${p.id}`}
                        className="form-input" 
                        style={{ width: '90px', padding: '6px 10px' }} 
                      />
                      <button 
                        onClick={() => {
                          const val = document.getElementById(`stock-${p.id}`).value;
                          handleStockUpdate(p.id, val);
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Save size={14} /> Guardar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PRICE CHANGE */}
      {activeTab === 'prices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Gestión y Cambio de Precios</h2>
            <input 
              type="text" 
              placeholder="Buscar prenda..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ maxWidth: '300px' }}
            />
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Prenda</th>
                <th>Precio de Lista ($)</th>
                <th>Precio Mayorista ($)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={p.price} 
                      id={`price-${p.id}`}
                      className="form-input" 
                      style={{ width: '120px', padding: '6px 10px' }} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={p.wholesale_price} 
                      id={`wprice-${p.id}`}
                      className="form-input" 
                      style={{ width: '120px', padding: '6px 10px', fontWeight: 700 }} 
                    />
                  </td>
                  <td>
                    <button 
                      onClick={() => {
                        const priceVal = document.getElementById(`price-${p.id}`).value;
                        const wpriceVal = document.getElementById(`wprice-${p.id}`).value;
                        handlePriceUpdate(p.id, priceVal, wpriceVal);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      <Save size={14} /> Actualizar Precios
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: IMAGE MANAGEMENT */}
      {activeTab === 'images' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Cambio de Imágenes de Productos</h2>

          <div className="products-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card" style={{ padding: '16px' }}>
                <img src={p.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>{p.name}</h4>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Ruta / URL de la Imagen:</label>
                  <input 
                    type="text" 
                    defaultValue={p.image_url} 
                    id={`img-${p.id}`}
                    className="form-input" 
                    style={{ fontSize: '0.8rem', padding: '6px 8px' }} 
                  />
                </div>

                <button 
                  onClick={() => {
                    const newUrl = document.getElementById(`img-${p.id}`).value;
                    handleImageUpdate(p.id, newUrl);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                >
                  <Save size={14} /> Cambiar Imagen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS & RECEIPT VERIFICATION */}
      {activeTab === 'orders' && (
        <div>
          {/* Mercado Pago Transfer Sync Widget */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--accent-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚡ Sincronización de Transferencias por Alias (Mercado Pago API)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {mpConfigured 
                    ? '🟢 Conectado con Mercado Pago API — Acreditaciones en tiempo real' 
                    : '🟡 Modo Demostración — Agregá la variable MERCADOPAGO_ACCESS_TOKEN en Vercel para conectar tu cuenta real'}
                </p>
              </div>

              <button 
                onClick={fetchMpTransfers} 
                className="btn-secondary" 
                disabled={mpLoading}
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={mpLoading ? 'animate-spin' : ''} />
                {mpLoading ? 'Consultando...' : 'Sincronizar Acreditaciones'}
              </button>
            </div>

            {mpTransfers.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold-hover)', marginBottom: '10px' }}>
                  Últimas Transferencias / Pagos Recibidos en Mercado Pago:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {mpTransfers.map((tx) => (
                    <div key={tx.id} style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                        <span>{tx.payer_name}</span>
                        <span style={{ color: 'var(--accent-emerald)' }}>+${tx.amount?.toLocaleString('es-AR')}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>DNI/CUIT: {tx.payer_dni}</span>
                        <span>{new Date(tx.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
            Registro de Órdenes Mayoristas & Comprobantes de Pago
          </h2>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No hay órdenes registradas aún.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Las compras realizadas por los clientes aparecerán aquí con sus datos y comprobantes adjuntos.
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Cliente</th>
                  <th>DNI / CUIT</th>
                  <th>Teléfono</th>
                  <th>Localidad</th>
                  <th>Entrega</th>
                  <th>Monto Total</th>
                  <th>Comprobante de Pago</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: 800 }}>{ord.id}</td>
                    <td style={{ fontWeight: 700 }}>{ord.client_name}</td>
                    <td>{ord.client_dni || 'No provisto'}</td>
                    <td>{ord.client_phone}</td>
                    <td>{ord.client_locality || 'No provista'}</td>
                    <td>
                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 700, 
                        padding: '4px 8px', 
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: ord.delivery_method === 'retiro' ? 'var(--accent-gold-light)' : 'var(--bg-surface-elevated)',
                        color: ord.delivery_method === 'retiro' ? 'var(--accent-gold-hover)' : 'var(--text-main)'
                      }}>
                        {ord.delivery_method || 'Envío a Domicilio'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      ${ord.total_amount?.toLocaleString('es-AR')}
                    </td>
                    <td>
                      {ord.receipt_url ? (
                        <a href={ord.receipt_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ImageIcon size={14} /> Ver Comprobante
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Sin comprobante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
