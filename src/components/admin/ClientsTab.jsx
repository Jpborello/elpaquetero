'use client';

import { useState } from 'react';
import { Search, Crown, Ticket, MapPin, Phone, FileText } from 'lucide-react';

export default function ClientsTab({ clients }) {
  const [searchFilter, setSearchFilter] = useState('');

  const normalizeSearch = (str) => (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  const filteredClients = clients.filter(c =>
    normalizeSearch(c.name).includes(normalizeSearch(searchFilter)) ||
    (c.dni && c.dni.includes(searchFilter)) ||
    (c.phone && c.phone.includes(searchFilter)) ||
    (c.locality && normalizeSearch(c.locality).includes(normalizeSearch(searchFilter)))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Base de Clientes Mayoristas & Ranking VIP</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Listado ordenado por mayor consumo acumulado para fidelización y sorteos.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por DNI, Nombre o Localidad..." 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No se encontraron clientes registrados.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Cliente / Razón Social</th>
              <th>DNI / CUIT</th>
              <th>Teléfono</th>
              <th>Localidad</th>
              <th>Pedidos</th>
              <th>Total Gastado ($)</th>
              <th>Cupones Sorteo</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, idx) => {
              const isTop1 = idx === 0;
              const isTop3 = idx < 3;

              return (
                <tr key={client.phone || idx} style={{ backgroundColor: isTop1 ? 'rgba(200, 157, 84, 0.08)' : 'transparent' }}>
                  <td style={{ fontWeight: 800 }}>
                    {isTop1 && <Crown size={16} style={{ color: 'var(--accent-gold)', marginRight: '4px', display: 'inline' }} />}
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {client.name}
                    {isTop3 && (
                      <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 800 }}>
                        VIP
                      </span>
                    )}
                  </td>
                  <td>
                    <FileText size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)' }} />
                    {client.dni || 'Sin DNI'}
                  </td>
                  <td>
                    <Phone size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)' }} />
                    {client.phone}
                  </td>
                  <td>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--text-muted)' }} />
                    {client.locality || 'Sin localidad'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{client.orders_count} compras</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                    ${client.total_spent?.toLocaleString('es-AR')}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--accent-gold-hover)', background: 'var(--accent-gold-light)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                      <Ticket size={14} /> {client.tickets_count} cupones
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
