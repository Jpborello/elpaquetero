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
              {/* Watermark Overlay "El Paquetero" */}
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                color: 'rgba(255, 255, 255, 0.75)',
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(2px)',
                padding: '3px 7px',
                borderRadius: '4px',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                userSelect: 'none',
                zIndex: 2
              }}>
                El Paquetero
              </span>

              {product.is_offer && <span className="card-badge-offer">Oferta</span>}
              
              {isWholesaleQualified ? (
                <span className="card-badge-wholesale" style={{ backgroundColor: '#059669', color: '#FFFFFF', fontWeight: 800 }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> ¡-40% Mayorista!
                </span>
              ) : (
                <span className="card-badge-wholesale">
                  -$50.000: -40%
                </span>
              )}
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
                {isWholesaleQualified ? (
                  // WHOLESALE QUALIFIED (Cart >= $50.000)
                  <>
                    <span style={{ fontSize: '0.73rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase' }}>
                      ¡Precio Mayorista Aplicado! (-40%)
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669' }}>
                        ${product.wholesale_price?.toLocaleString('es-AR')}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ${product.price?.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </>
                ) : (
                  // NORMAL RETAIL PRICE (Cart < $50.000)
                  <>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Precio de Lista (Minorista):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ${product.price?.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                      En compras +$50.000: <strong style={{ color: '#059669' }}>${product.wholesale_price?.toLocaleString('es-AR')}</strong> (-40%)
                    </div>
                  </>
                )}
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
