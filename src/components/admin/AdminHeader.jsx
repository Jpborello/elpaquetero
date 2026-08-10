'use client';

import Link from 'next/link';
import { ArrowLeft, LogOut, ShieldCheck, Eye } from 'lucide-react';

export default function AdminHeader({ onLogout, visitCount }) {
  return (
    <div className="admin-header-row">
      <div>
        <Link 
          href="/" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}
        >
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>
        <h1 className="admin-header-title">Panel de Administración — El Paquetero</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {visitCount !== undefined && (
          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={15} /> Visitas Web: {visitCount?.toLocaleString('es-AR')}
          </span>
        )}
        <span style={{ background: '#ECFDF5', color: '#047857', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} /> Admin Autenticado
        </span>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        )}
      </div>
    </div>
  );
}
