'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminHeader() {
  return (
    <div className="admin-header-row">
      <div>
        <Link 
          href="/" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-gold-hover)', marginBottom: '8px' }}
        >
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Panel de Administración — El Paquetero</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem' }}>
          Admin Conectado
        </span>
      </div>
    </div>
  );
}
