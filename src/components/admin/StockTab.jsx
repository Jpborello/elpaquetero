'use client';

import { useState } from 'react';
import { Save, Layers } from 'lucide-react';

export default function StockTab({ products, searchFilter, setSearchFilter, onUpdateStock }) {
  // Local state for stock per size per product
  const [sizeStockState, setSizeStockState] = useState({});

  const handleSizeStockChange = (productId, size, val) => {
    const num = parseInt(val, 10) || 0;
    setSizeStockState(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [size]: num
      }
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Control e Inventario de Stock por Talle</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Gestiona las existencias totales y la distribución del stock por talle para indumentaria.
          </p>
        </div>
        <input 
          type="text" 
          placeholder="Buscar producto o categoría..." 
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
            <th>Prenda / Código</th>
            <th>Categoría</th>
            <th>Talles Disponibles</th>
            <th>Stock Total</th>
            <th>Modificar Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const hasSizes = Array.isArray(p.sizes) && p.sizes.length > 0;
            const currentSizeMap = sizeStockState[p.id] || p.stock_per_size || {};

            return (
              <tr key={p.id}>
                <td>
                  <img 
                    src={p.image_url} 
                    alt="" 
                    style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0' }} 
                    onError={(e) => { e.target.src = '/elpaquetero_imagenes/Logo 2.jpeg'; }}
                  />
                </td>
                <td style={{ fontWeight: 700 }}>
                  <div>{p.name}</div>
                  {p.code && <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Cód: {p.code}</span>}
                </td>
                <td>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                    {p.category}
                  </span>
                  {p.subcategory && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{p.subcategory}</div>}
                </td>
                
                {/* Talles */}
                <td>
                  {hasSizes ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
                      {p.sizes.map(size => (
                        <div key={size} style={{ 
                          backgroundColor: '#F8FAFC', 
                          border: '1px solid #CBD5E1', 
                          borderRadius: '4px', 
                          padding: '2px 6px', 
                          fontSize: '0.72rem',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontWeight: 800, color: '#1E293B' }}>{size}:</span>{' '}
                          <span style={{ color: '#059669', fontWeight: 700 }}>{currentSizeMap[size] ?? 20} un.</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                      Sin talles (Blanquería)
                    </span>
                  )}
                </td>

                {/* Stock Total */}
                <td style={{ fontWeight: 800, fontSize: '0.95rem', color: p.stock > 10 ? '#059669' : '#DC2626' }}>
                  {p.stock} un.
                </td>

                {/* Acción Modificar */}
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      defaultValue={p.stock} 
                      id={`stock-${p.id}`}
                      className="form-input" 
                      style={{ width: '90px', padding: '6px 10px', fontWeight: 700 }} 
                    />
                    <button 
                      onClick={() => {
                        const val = document.getElementById(`stock-${p.id}`).value;
                        onUpdateStock(p.id, val);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Save size={14} /> Guardar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
