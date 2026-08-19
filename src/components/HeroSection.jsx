'use client';

import { Sparkles, ArrowRight, Store } from 'lucide-react';

export default function HeroSection({ onExploreCatalog }) {
  return (
    <section className="hero-wrapper">
      <video
        className="hero-video-bg"
        src="/videos/hero-video.mp4"
        poster="/elpaquetero_imagenes/Local.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-overlay-backdrop"></div>

      <div className="hero-container">
        <div className="hero-badge">
          <Store size={16} /> Distribuidora Directa de Fábrica
        </div>

        <h1 className="hero-title">
          Moda e Indumentaria <span>Mayorista</span>
        </h1>

        <p className="hero-subtitle">
          Surtido completo en Buzos, Camperas, Calzas, Camisas y Gorras.
          Los mejores precios por bulto y curva con despacho inmediato a todo el país.
        </p>

        <div className="hero-actions-row">
          <button onClick={onExploreCatalog} className="btn-hero-primary">
            Explorar Catálogo Mayorista <ArrowRight size={18} style={{ display: 'inline', marginLeft: '6px' }} />
          </button>
          
          <a href="#destacados" className="btn-hero-glass">
            <Sparkles size={18} style={{ display: 'inline', marginRight: '6px' }} /> Ver Productos de Alta Rotación
          </a>
        </div>
      </div>
    </section>
  );
}
