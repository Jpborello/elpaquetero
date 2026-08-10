'use client';

import { Save } from 'lucide-react';

export default function ImagesTab({ products, onUpdateImage }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Cambio de Imágenes de Productos</h2>

      <div className="products-grid">
        {products.map((p) => (
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
                onUpdateImage(p.id, newUrl);
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
  );
}
