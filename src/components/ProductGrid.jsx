'use client';

import { ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProductGrid({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          No se encontraron prendas para los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => {
        const isStockOk = product.stock > 10;

        return (
          <div key={product.id} className="product-card">
            <div className="product-img-wrapper">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="product-img"
              />
              {product.is_offer && <span className="card-badge-offer">Oferta</span>}
              <span className="card-badge-wholesale">Mayorista</span>
            </div>

            <div>
              <div className="product-category-name">
                {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
              </div>
              <h3 className="product-title">{product.name}</h3>

              <div className="product-stock-status">
                <span className={`stock-dot ${isStockOk ? 'stock-in' : 'stock-low'}`}></span>
                <span>{isStockOk ? `Stock disponible (${product.stock} un.)` : `Últimas ${product.stock} unidades`}</span>
              </div>
            </div>

            <div>
              <div className="price-container">
                <span className="price-retail">${product.price?.toLocaleString('es-AR')}</span>
                <span className="price-wholesale">${product.wholesale_price?.toLocaleString('es-AR')}</span>
              </div>

              <button 
                onClick={() => onAddToCart(product)} 
                className="btn-add-cart"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={16} /> 
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
