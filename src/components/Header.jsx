'use client';

import { useState } from 'react';
import { ShoppingBag, User, Menu, X, Shield, Search } from 'lucide-react';
import Link from 'next/link';

export default function Header({ 
  cartCount, 
  onOpenCart, 
  onOpenAuth, 
  currentUser, 
  onLogout,
  searchQuery,
  setSearchQuery 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header-container">
      {/* Top Notification Bar */}
      <div className="header-top">
        📍 ROSARIO (SANTA FE) — CAMILO ALDAO 2715 ESQ. EX GODOY — WHATSAPP: 341 783-8723
      </div>

      <div className="header-content">
        {/* Brand Logo & Name */}
        <Link href="/" className="brand-logo-wrapper">
          <img 
            src="/elpaquetero_imagenes/logo.webp" 
            alt="Logo El Paquetero" 
            className="brand-logo-img"
          />
          <div>
            <div className="brand-title">El Paquetero</div>
            <div className="brand-subtitle">Indumentaria Mayorista</div>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="header-search" style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por prenda, modelo o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="header-nav">
          <a href="#catalogo" className="nav-link">Catálogo</a>
          <a href="#ofertas" className="nav-link">Ofertas</a>
          <a href="#destacados" className="nav-link">Más Vendidos</a>
        </nav>

        {/* Actions (Auth & Cart) */}
        <div className="header-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                Hola, <strong>{currentUser.name}</strong>
              </span>
              <button onClick={onLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                Salir
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary">
              <User size={18} /> Iniciar Sesión / Registro
            </button>
          )}

          <button onClick={onOpenCart} className="btn-icon" title="Ver Carrito Mayorista">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="badge-counter">{cartCount}</span>}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="btn-icon mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderTop: '1px solid var(--border-color)', 
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <a href="#catalogo" onClick={() => setMobileMenuOpen(false)} className="nav-link">Catálogo Completo</a>
          <a href="#ofertas" onClick={() => setMobileMenuOpen(false)} className="nav-link">Ofertas Especiales</a>
          <a href="#destacados" onClick={() => setMobileMenuOpen(false)} className="nav-link">Productos de Alta Rotación</a>
        </div>
      )}
    </header>
  );
}
