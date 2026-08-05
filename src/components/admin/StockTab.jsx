'use client';

import { Save } from 'lucide-react';

export default function StockTab({ products, searchFilter, setSearchFilter, onUpdateStock }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
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
          {products.map((p) => (
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
                      onUpdateStock(p.id, val);
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
  );
}
