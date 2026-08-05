'use client';

import { RefreshCw, Image as ImageIcon } from 'lucide-react';

export default function OrdersTab({ orders, mpTransfers, mpConfigured, mpLoading, onFetchMpTransfers }) {
  return (
    <div>
      {/* Mercado Pago Transfer Sync Widget */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--accent-gold)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚡ Sincronización de Transferencias por Alias (Mercado Pago API)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mpConfigured 
                ? '🟢 Conectado con Mercado Pago API — Acreditaciones en tiempo real' 
                : '🟡 Modo Demostración — Agregá la variable MERCADOPAGO_ACCESS_TOKEN en Vercel para conectar tu cuenta real'}
            </p>
          </div>

          <button 
            onClick={onFetchMpTransfers} 
            className="btn-secondary" 
            disabled={mpLoading}
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={mpLoading ? 'animate-spin' : ''} />
            {mpLoading ? 'Consultando...' : 'Sincronizar Acreditaciones'}
          </button>
        </div>

        {mpTransfers.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold-hover)', marginBottom: '10px' }}>
              Últimas Transferencias / Pagos Recibidos en Mercado Pago:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {mpTransfers.map((tx) => (
                <div key={tx.id} style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                    <span>{tx.payer_name}</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>+${tx.amount?.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>DNI/CUIT: {tx.payer_dni}</span>
                    <span>{new Date(tx.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
        Registro de Órdenes Mayoristas & Comprobantes de Pago
      </h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No hay órdenes registradas aún.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Las compras realizadas por los clientes aparecerán aquí con sus datos y comprobantes adjuntos.
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Cliente</th>
              <th>DNI / CUIT</th>
              <th>Teléfono</th>
              <th>Localidad</th>
              <th>Entrega</th>
              <th>Monto Total</th>
              <th>Comprobante de Pago</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td style={{ fontWeight: 800 }}>{ord.id}</td>
                <td style={{ fontWeight: 700 }}>{ord.client_name}</td>
                <td>{ord.client_dni || 'No provisto'}</td>
                <td>{ord.client_phone}</td>
                <td>{ord.client_locality || 'No provista'}</td>
                <td>
                  <span style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    padding: '4px 8px', 
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: ord.delivery_method === 'retiro' ? 'var(--accent-gold-light)' : 'var(--bg-surface-elevated)',
                    color: ord.delivery_method === 'retiro' ? 'var(--accent-gold-hover)' : 'var(--text-main)'
                  }}>
                    {ord.delivery_method || 'Envío a Domicilio'}
                  </span>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  ${ord.total_amount?.toLocaleString('es-AR')}
                </td>
                <td>
                  {ord.receipt_url ? (
                    <a href={ord.receipt_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ImageIcon size={14} /> Ver Comprobante
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Sin comprobante</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
