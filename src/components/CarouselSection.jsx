'use client';

import { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, ShoppingCart, Tag } from 'lucide-react';

export default function CarouselSection({ offers, topSeller, onAddToCart }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine offers into slides
  const slides = offers.length > 0 ? offers : [
    {
      id: 'slide-1',
      name: 'Novedades de la Semana — Camperas & Buzos Frizados',
      description: 'Aprovechá la nueva temporada con un 15% de descuento adicional llevando curva completa de talles.',
      image_url: '/elpaquetero_imagenes/Logo 2.jpeg',
      wholesale_price: 34000
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section id="ofertas" className="carousel-section-container">
      <div className="carousel-card-grid">
        
        {/* Left Side: Offers & News Auto-Carousel */}
        <div className="carousel-box">
          <div className="carousel-slide-content" style={{ position: 'relative' }}>
            <img 
              src={currentSlide.image_url} 
              alt={currentSlide.name} 
              className="carousel-img"
            />
            <span style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: 'rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
              padding: '4px 8px',
              borderRadius: '4px',
              pointerEvents: 'none',
              textTransform: 'uppercase',
              userSelect: 'none',
              zIndex: 2
            }}>
              El Paquetero
            </span>
            <div className="carousel-info">
              <span className="carousel-tag">
                <Tag size={12} style={{ marginRight: '4px' }} /> Novedad & Oferta Especial
              </span>
              <h3 className="carousel-title">{currentSlide.name}</h3>
              <p className="carousel-desc">{currentSlide.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="price-wholesale-label">
                  ${currentSlide.wholesale_price?.toLocaleString('es-AR')}
                </span>
                <button 
                  onClick={() => onAddToCart(currentSlide)} 
                  className="btn-primary"
                >
                  <ShoppingCart size={16} /> Pedir en Oferta
                </button>
              </div>
            </div>
          </div>

          <div className="carousel-controls">
            <div className="carousel-dots">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)} 
                className="qty-btn"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)} 
                className="qty-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Automatically Featured Top Seller */}
        {topSeller && (
          <div id="destacados" className="top-seller-box">
            <div className="top-seller-badge">
              <Flame size={12} style={{ display: 'inline', marginRight: '3px' }} /> Más Vendido
            </div>

            <div>
              <img 
                src={topSeller.image_url} 
                alt={topSeller.name} 
                className="top-seller-img"
              />
              <h4 className="top-seller-title">{topSeller.name}</h4>
              <p style={{ fontSize: '0.8rem', color: '#B3AAA2', marginBottom: '12px' }}>
                ⭐ Mayor rotación en la tienda ({topSeller.sales_count} un. vendidas)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#B3AAA2' }}>Precio Mayorista:</div>
                <div className="price-wholesale-label">${topSeller.wholesale_price?.toLocaleString('es-AR')}</div>
              </div>
              <button onClick={() => onAddToCart(topSeller)} className="btn-hero-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <ShoppingCart size={16} /> Agregar
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
