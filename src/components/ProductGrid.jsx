'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Sparkles, Palette, Share2, Check } from 'lucide-react';
import { getProductColors } from '@/lib/catalogData';
import { shareProduct } from '@/lib/shareProduct';

export default function ProductGrid({ products, onAddToCart, isWholesaleQualified = false, onOpenDetail, topSellingIds }) {
  // Store selected size/color per product id: { [productId]: string }
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [copiedShareId, setCopiedShareId] = useState(null);

  const handleShare = async (e, product) => {
    e.stopPropagation();
    const result = await shareProduct(product);
    if (result === 'copied') {
      setCopiedShareId(product.id);
      setTimeout(() => setCopiedShareId((cur) => (cur === product.id ? null : cur)), 2000);
    }
  };

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

  const handleSelectColor = (productId, color) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="products-grid">
      {products.map((product) => {
        const isStockOk = product.stock > 10;
        const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
        const currentSelectedSize = selectedSizes[product.id] || (hasSizes ? product.sizes[0] : null);
        const availableColors = getProductColors(product);
        const hasColors = Array.isArray(availableColors) && availableColors.length > 0;
        const currentSelectedColor = selectedColors[product.id] || (hasColors ? availableColors[0] : null);

        return (
          <div key={product.id} className="product-card">
            <div
              className="product-img-wrapper"
              onClick={() => onOpenDetail && onOpenDetail(product)}
              title="Ver detalle del producto"
            >
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
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
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '2px solid var(--border-color)',
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

              <div className="card-badges-topleft">
                {product.is_offer && <span className="card-badge-offer">Oferta</span>}
                {topSellingIds?.has(product.id) && <span className="card-badge-bestseller">🔥 Más Vendido</span>}
              </div>
              <span className="card-badge-wholesale">
                Precio Mayorista
              </span>

              <button
                type="button"
                onClick={(e) => handleShare(e, product)}
                title={copiedShareId === product.id ? 'Link copiado' : 'Compartir producto'}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3,
                  backdropFilter: 'blur(2px)'
                }}
              >
                {copiedShareId === product.id ? <Check size={15} /> : <Share2 size={15} />}
              </button>
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

              {/* Color selector */}
              {hasColors && (
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Palette size={12} style={{ color: 'var(--accent-gold)' }} />
                    Color: {currentSelectedColor ? <strong>{currentSelectedColor}</strong> : 'Seleccionar'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleSelectColor(product.id, color)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          border: currentSelectedColor === color ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                          backgroundColor: currentSelectedColor === color ? 'var(--text-main)' : 'var(--bg-surface-elevated)',
                          color: currentSelectedColor === color ? 'var(--bg-page)' : 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {color}
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
                onClick={() => onAddToCart({ ...product, selectedSize: currentSelectedSize, selectedColor: currentSelectedColor })}
                className="btn-add-cart"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={16} />
                {product.stock > 0
                  ? (currentSelectedSize || currentSelectedColor
                      ? `Agregar (${[currentSelectedSize ? `Talle ${currentSelectedSize}` : null, currentSelectedColor ? `Color ${currentSelectedColor}` : null].filter(Boolean).join(' • ')})`
                      : 'Agregar al Carrito')
                  : 'Sin Stock'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
