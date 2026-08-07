'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Tag } from 'lucide-react';
import useCloseOnBack from '@/lib/useCloseOnBack';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, isWholesaleQualified = false }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const handleClose = useCloseOnBack(isOpen, onClose);

  useEffect(() => {
    if (product) {
      const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
      setSelectedSize(hasSizes ? product.sizes[0] : null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const isStockOk = product.stock > 10;

  const handleAdd = () => {
    onAddToCart({ ...product, selectedSize });
    handleClose();
  };

  return (
    <div className="modal-backdrop active" onClick={handleClose}>
      <div className="modal-box product-detail-box" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="qty-btn"
          style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}
        >
          <X size={18} />
        </button>

        <div className="product-detail-scroll">
        <div className="product-detail-grid">
          <div className="product-detail-img-wrapper">
            <img
              src={product.image_url}
              alt={product.name}
              onError={(e) => { e.target.src = '/elpaquetero_imagenes/Logo 2.jpeg'; }}
            />
          </div>

          <div className="product-detail-info">
            <div className="product-category-name">
              {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
            </div>
            <h2 className="product-detail-title">{product.name}</h2>

            {product.code && <div className="product-detail-code">Código: {product.code}</div>}

            {product.description && (
              <p className="product-detail-desc">{product.description}</p>
            )}

            <div className="product-stock-status" style={{ marginTop: '6px' }}>
              <span className={`stock-dot ${isStockOk ? 'stock-in' : 'stock-low'}`}></span>
              <span>
                {product.stock > 0
                  ? (isStockOk ? `Stock disponible (${product.stock} un.)` : `Últimas ${product.stock} unidades`)
                  : 'Sin stock por el momento'}
              </span>
            </div>

            {hasSizes && (
              <div style={{ marginTop: '14px' }}>
                <span className="product-detail-size-label">
                  Talle: {selectedSize ? <strong>{selectedSize}</strong> : 'Seleccionar'}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`size-pill ${selectedSize === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-price-box">
              {isWholesaleQualified ? (
                <>
                  <span className="wholesale-tag"><Tag size={13} /> Precio Mayorista Aplicado (-40%)</span>
                  <div className="price-row">
                    <span className="price-big">${product.wholesale_price?.toLocaleString('es-AR')}</span>
                    <span className="price-strike">${product.price?.toLocaleString('es-AR')}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="price-label">Precio de Lista (Minorista)</span>
                  <div className="price-row">
                    <span className="price-big">${product.price?.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="price-hint">
                    En compras +$50.000: <strong>${product.wholesale_price?.toLocaleString('es-AR')}</strong> (-40%)
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleAdd}
              className="btn-add-cart"
              disabled={product.stock <= 0}
              style={{ marginTop: '16px' }}
            >
              <ShoppingCart size={16} />
              {product.stock > 0 ? (selectedSize ? `Agregar (Talle ${selectedSize})` : 'Agregar al Carrito') : 'Sin Stock'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
