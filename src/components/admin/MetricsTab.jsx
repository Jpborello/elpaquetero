'use client';

import { Calendar, TrendingUp, Eye } from 'lucide-react';

export default function MetricsTab({ metrics }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Arqueo de Caja (Ingresos Mayoristas)</h2>
      
      <div className="metrics-cards-grid">
        <div className="metric-card">
          <div className="metric-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo Hoy (Diario)
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            ${metrics.dailyCash?.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo de la Semana
          </div>
          <div className="metric-value">
            ${metrics.weeklyCash?.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Arqueo del Mes
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-gold-hover)' }}>
            ${metrics.monthlyCash?.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Stock Total Físico</div>
          <div className="metric-value">
            {metrics.totalStockCount} prendas
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #2563EB' }}>
          <div className="metric-label">
            <Eye size={14} style={{ display: 'inline', marginRight: '4px', color: '#2563EB' }} /> Visitas a la Web
          </div>
          <div className="metric-value" style={{ color: '#2563EB' }}>
            👁️ {metrics.visitCount?.toLocaleString('es-AR') || 0}
          </div>
        </div>
      </div>

      {/* Product Rotation Ranking */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '32px 0 16px 0' }}>
        <TrendingUp size={20} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-gold)' }} />
        Productos con Mayor Rotación (Más Vendidos)
      </h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Prenda / Producto</th>
            <th>Categoría</th>
            <th>Ventas Acumuladas</th>
            <th>Stock Actual</th>
            <th>Precio Mayorista</th>
          </tr>
        </thead>
        <tbody>
          {metrics.topRotationProducts?.map((prod, idx) => (
            <tr key={prod.id}>
              <td style={{ fontWeight: 800 }}>#{idx + 1}</td>
              <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={prod.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                {prod.name}
              </td>
              <td>{prod.category}</td>
              <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
                🔥 {prod.sales_count} un.
              </td>
              <td>{prod.stock} un.</td>
              <td style={{ fontWeight: 700 }}>${prod.wholesale_price?.toLocaleString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
