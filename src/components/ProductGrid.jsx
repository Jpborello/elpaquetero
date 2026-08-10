'use client';

import { useState } from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';

export default function ProductGrid({ products, onAddToCart, isWholesaleQualified = false, onOpenDetail }) {
  // Store selected size per product id: { [productId]: string }
  const [selectedSizes, setSelectedSizes] = useState({});

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          No se encontraron prendas para los filtros seleccionados.
        </p>
      </div>
    );
  }

  const handleSelectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="products-grid">
      {products.map((product) => {
        const isStockOk = product.stock > 10;
        const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
        const currentSelectedSize = selectedSizes[product.id] || (hasSizes ? product.sizes[0] : null);

        return (
          <div key={product.id} className="product-card">
            <div
              className="product-img-wrapper"
              onClick={() => onOpenDetail && onOpenDetail(product)}
              title="Ver detalle del producto"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="product-img"
                onError={(e) => {
                  e.target.src = '/elpaquetero_imagenes/Logo 2.jpeg';
                }}
              />
              {/* Bottom-Right Price Patch Overlay (covers stamped $XX.XXX prices at bottom right without covering top title) */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                minWidth: '120px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '2px solid #CBD5E1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                fontWeight: 900,
                fontSize: '0.78rem',
                letterSpacing: '0.5px',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 3
              }}>
                ⭐ EL PAQUETERO
              </div>

              {product.is_offer && <span className="card-badge-offer">Oferta</span>}
              <span className="card-badge-wholesale">
                Precio Mayorista
              </span>
            </div>

            <div>
              <div className="product-category-name">
                {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
              </div>
              <h3
                className="product-title"
                onClick={() => onOpenDetail && onOpenDetail(product)}
                title="Ver detalle del producto"
              >
                {product.name}
              </h3>

              <div className="product-stock-status">
                <span className={`stock-dot ${isStockOk ? 'stock-in' : 'stock-low'}`}></span>
                <span>{isStockOk ? `Stock disponible (${product.stock} un.)` : `Últimas ${product.stock} unidades`}</span>
              </div>

              {/* Sizes selector for indumentaria */}
              {hasSizes && (
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Talle: {currentSelectedSize ? <strong>{currentSelectedSize}</strong> : 'Seleccionar'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSelectSize(product.id, size)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: currentSelectedSize === size ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                          backgroundColor: currentSelectedSize === size ? 'var(--accent-gold-light)' : 'var(--bg-surface-elevated)',
                          color: currentSelectedSize === size ? 'var(--accent-gold-hover)' : 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* PRICE CONTAINER */}
              <div className="price-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginTop: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.73rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                  Precio Mayorista
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${(product.wholesale_price || product.price)?.toLocaleString('es-AR')}
                </span>
              </div>

              <button 
                onClick={() => onAddToCart({ ...product, selectedSize: currentSelectedSize })} 
                className="btn-add-cart"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={16} /> 
                {product.stock > 0 ? (currentSelectedSize ? `Agregar (Talle ${currentSelectedSize})` : 'Agregar al Carrito') : 'Sin Stock'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
