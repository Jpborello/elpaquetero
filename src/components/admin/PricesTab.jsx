'use client';

import { Save } from 'lucide-react';

export default function PricesTab({ products, searchFilter, setSearchFilter, onUpdatePrice }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
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
          {products.map((p) => (
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
                    onUpdatePrice(p.id, priceVal, wpriceVal);
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
  );
}
