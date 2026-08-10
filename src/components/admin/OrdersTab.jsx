'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Image as ImageIcon, ExternalLink, X, Eye, Download, Trash2, Printer, Bell, BellOff, CheckCircle2, Sparkles } from 'lucide-react';
import { dataStore } from '@/lib/dataStore';

export default function OrdersTab({ orders, mpTransfers, mpConfigured, mpLoading, onFetchMpTransfers }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);
  const [cleanNotice, setCleanNotice] = useState('');
  
  // Real-time Sound & Visual Alert State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderToast, setNewOrderToast] = useState(null);
  const [prevOrdersCount, setPrevOrdersCount] = useState(orders.length);

  // Web Audio API Chime Generator for zero external file dependencies
  const playNewOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual-tone chime (A5 880Hz -> E6 1318Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime);
        gain2.gain.setValueAtTime(0.5, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 150);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Monitor incoming new orders in real-time
  useEffect(() => {
    if (orders.length > prevOrdersCount) {
      const latestOrder = orders[0];
      if (latestOrder) {
        playNewOrderChime();
        setNewOrderToast(latestOrder);
      }
    }
    setPrevOrdersCount(orders.length);
  }, [orders, prevOrdersCount]);

  const handleStatusChange = (orderId, newStatus) => {
    dataStore.updateOrderStatus(orderId, newStatus);
    setCleanNotice(`✓ Estado de la orden #${orderId} actualizado a "${newStatus.toUpperCase()}".`);
    setTimeout(() => setCleanNotice(''), 4000);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No hay órdenes para exportar.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID Orden,Fecha,Cliente,DNI/CUIT,Telefono,Localidad,Direccion,Metodo Entrega,Monto Total,Mayorista,Estado,Comprobante URL\n';

    orders.forEach(ord => {
      const row = [
        `"${ord.id}"`,
        `"${new Date(ord.created_at || Date.now()).toLocaleString('es-AR')}"`,
        `"${(ord.client_name || '').replace(/"/g, '""')}"`,
        `"${ord.client_dni || ''}"`,
        `"${ord.client_phone || ''}"`,
        `"${(ord.client_locality || '').replace(/"/g, '""')}"`,
        `"${(ord.client_address || '').replace(/"/g, '""')}"`,
        `"${ord.delivery_method || ''}"`,
        `"${ord.total_amount || 0}"`,
        `"${ord.is_wholesale ? 'SI (40% OFF)' : 'NO'}"`,
        `"${ord.status || 'pendiente'}"`,
        `"${ord.receipt_url || 'Sin comprobante'}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ordenes_elpaquetero_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCleanOldReceipts = async () => {
    if (confirm('¿Desea eliminar las fotos de comprobantes con más de 30 días de antigüedad en Supabase Storage? (Los datos del pedido y montos se mantendrán guardados).')) {
      const count = await dataStore.cleanOldReceipts(30);
      if (count > 0) {
        setCleanNotice(`✓ Se eliminaron ${count} comprobante(s) antiguo(s) de más de 30 días.`);
      } else {
        setCleanNotice('ℹ️ No se encontraron comprobantes con más de 30 días de antigüedad para eliminar.');
      }
      setTimeout(() => setCleanNotice(''), 5000);
    }
  };

  const triggerPrintWindow = () => {
    window.print();
  };

  return (
    <div>
      {/* REAL-TIME NEW ORDER FLOATING TOAST BANNER */}
      {newOrderToast && (
        <div className="no-print" style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '2px solid #10B981',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔔</span>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34D399' }}>
                ¡NUEVO PEDIDO RECIBIDO! Orden #{newOrderToast.id}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#E2E8F0', marginTop: '2px' }}>
                Cliente: <strong>{newOrderToast.client_name}</strong> | Monto: <strong style={{ color: '#10B981' }}>${newOrderToast.total_amount?.toLocaleString('es-AR')}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {newOrderToast.receipt_url && (
              <button
                onClick={() => {
                  setSelectedReceipt({ url: newOrderToast.receipt_url, clientName: newOrderToast.client_name, orderId: newOrderToast.id });
                  setNewOrderToast(null);
                }}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '6px 14px', backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <Eye size={14} /> Ver Comprobante
              </button>
            )}
            <button
              onClick={() => setNewOrderToast(null)}
              style={{ background: 'transparent', border: '1px solid #475569', color: '#94A3B8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Descartar (revisar en la tabla)
            </button>
          </div>
        </div>
      )}

      {/* Mercado Pago Transfer Sync & Alert Control Widget */}
      <div className="no-print" style={{
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
              ⚡ Sincronización Mercado Pago & Alertas Sonora de Pedidos
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mpConfigured
                ? '🟢 Conectado con Mercado Pago API — Acreditaciones en tiempo real'
                : '⚪ Mercado Pago no está conectado todavía — este panel no muestra transferencias hasta que se configure'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Sound Alert Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-secondary"
              style={{
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: soundEnabled ? '#ECFDF5' : '#F1F5F9',
                borderColor: soundEnabled ? '#A7F3D0' : '#CBD5E1',
                color: soundEnabled ? '#047857' : '#64748B'
              }}
            >
              {soundEnabled ? <Bell size={15} /> : <BellOff size={15} />}
              {soundEnabled ? 'Alerta Sonora Activada' : 'Alerta Sonora Silenciada'}
            </button>

            <button 
              onClick={onFetchMpTransfers} 
              className="btn-secondary" 
              disabled={mpLoading}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={mpLoading ? 'animate-spin' : ''} />
              {mpLoading ? 'Consultando...' : 'Sincronizar Mercado Pago'}
            </button>
          </div>
        </div>

        {mpTransfers.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold-hover)', marginBottom: '10px' }}>
              Últimas Transferencias Recibidas en Mercado Pago:
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

      {cleanNotice && (
        <div className="no-print" style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
          {cleanNotice}
        </div>
      )}

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
            Registro de Órdenes, Comprobantes e Impresión
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Verifica pagos, aprueba pedidos e imprime la comanda de armado para el depósito.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Exportar Excel / CSV
          </button>
          
          <button 
            onClick={handleCleanOldReceipts}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#DC2626', borderColor: '#FCA5A5' }}
          >
            <Trash2 size={14} /> Limpiar Fotos (+30 días)
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-print" style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed #CBD5E1' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>No hay órdenes registradas aún.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Las nuevas compras realizadas por los clientes aparecerán aquí automáticamente con sus datos, comprobantes y opción de impresión.
          </p>
        </div>
      ) : (
        <table className="admin-table no-print">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Cliente</th>
              <th>DNI / CUIT</th>
              <th>Contacto / Dirección</th>
              <th>Monto Total</th>
              <th>Estado Pago</th>
              <th>Comprobante</th>
              <th>Acciones / Imprimir</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => {
              const currentStatus = ord.status || 'pendiente';
              const isDelivery = ord.delivery_method !== 'retiro' && !ord.delivery_method?.toLowerCase().includes('retiro');

              return (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 800 }}>{ord.id}</td>
                  <td style={{ fontWeight: 700 }}>{ord.client_name}</td>
                  <td>{ord.client_dni || 'No provisto'}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ord.client_phone}</div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block' }}>
                      {isDelivery ? `🚚 Envío: ${ord.client_address || ''} (${ord.client_locality || 'Rosario'})` : `🏬 Retiro por Sucursal`}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                    ${ord.total_amount?.toLocaleString('es-AR')}
                    {ord.is_wholesale && <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 700 }}>Venta Mayorista</div>}
                  </td>
                  
                  {/* Status Dropdown */}
                  <td>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: currentStatus === 'aprobado' ? '#ECFDF5' : (currentStatus === 'enviado' ? '#EFF6FF' : '#FEF3C7'),
                        color: currentStatus === 'aprobado' ? '#047857' : (currentStatus === 'enviado' ? '#1D4ED8' : '#92400E'),
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pendiente">🟡 Pendiente</option>
                      <option value="aprobado">🟢 Aprobado / Pagado</option>
                      <option value="enviado">🔵 Enviado / Despachado</option>
                      <option value="cancelado">🔴 Cancelado</option>
                    </select>
                  </td>

                  {/* Receipt View Button */}
                  <td>
                    {ord.receipt_url ? (
                      <button 
                        onClick={() => setSelectedReceipt({ url: ord.receipt_url, clientName: ord.client_name, orderId: ord.id })}
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} /> Comprobante
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>Sin comprobante</span>
                    )}
                  </td>

                  {/* Print Button — solo habilitado con el pago ya aprobado */}
                  <td>
                    {currentStatus === 'aprobado' ? (
                      <button
                        onClick={() => setSelectedPrintOrder(ord)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#0F172A', borderColor: '#0F172A', color: '#FFF' }}
                      >
                        <Printer size={14} /> Imprimir Comanda
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Aprobá el pago antes de imprimir la comanda"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: 0.5, cursor: 'not-allowed' }}
                      >
                        <Printer size={14} /> Aprobar pago primero
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* RECEIPT MODAL VIEWER */}
      {selectedReceipt && (
        <div className="no-print" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedReceipt(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              Comprobante de Pago — Orden #{selectedReceipt.orderId}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
              Cliente: <strong>{selectedReceipt.clientName}</strong>
            </p>

            <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
              <img 
                src={selectedReceipt.url} 
                alt="Comprobante de pago" 
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '6px' }}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a 
                href={selectedReceipt.url} 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontSize: '0.82rem', color: '#1D4ED8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ExternalLink size={14} /> Abrir en ventana independiente
              </a>
              <button 
                onClick={() => setSelectedReceipt(null)} 
                className="btn-secondary" 
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL PRINTABLE ORDER TICKET / COMANDA MODAL */}
      {selectedPrintOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflow: 'auto',
            padding: '26px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }}>
            {/* Modal Controls (Hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748B' }}>
                Vista Previa de Comanda Universal
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={triggerPrintWindow}
                  className="btn-primary"
                  style={{ fontSize: '0.88rem', padding: '8px 18px', backgroundColor: '#059669', borderColor: '#059669', color: '#FFF' }}
                >
                  <Printer size={16} /> Imprimir Comanda Ahora
                </button>
                <button
                  onClick={() => setSelectedPrintOrder(null)}
                  className="btn-secondary"
                  style={{ fontSize: '0.88rem', padding: '8px 14px' }}
                >
                  <X size={16} /> Cerrar
                </button>
              </div>
            </div>

            {/* PRINTABLE TICKET CONTENT AREA - UNIVERSAL HIGH CONTRAST FORMAT */}
            <div id="printable-order-ticket">
              
              {/* Header */}
              <div className="ticket-header">
                <h1 className="company-title">EL PAQUETERO</h1>
                <p className="ticket-subtitle">COMANDA DE ARMADO Y DESPACHO</p>
                <div className="ticket-order-meta">
                  <div>ORDEN N°: <strong>{selectedPrintOrder.id}</strong></div>
                  <div>FECHA Y HORA: <strong>{new Date(selectedPrintOrder.created_at || Date.now()).toLocaleString('es-AR')} hs</strong></div>
                </div>
              </div>

              {/* Client Info Block */}
              <div className="client-info-box">
                <div className="info-row"><strong>Nombre Completo:</strong> <span>{selectedPrintOrder.client_name}</span></div>
                <div className="info-row"><strong>DNI / CUIT:</strong> <span>{selectedPrintOrder.client_dni || 'Sin DNI'}</span></div>
                <div className="info-row"><strong>Teléfono de Contacto:</strong> <span>{selectedPrintOrder.client_phone}</span></div>
                <div className="info-row">
                  <strong>Método de Entrega:</strong> 
                  <span className="delivery-type-tag">
                    {selectedPrintOrder.delivery_method?.toLowerCase().includes('retiro') ? '🏬 RETIRO POR SUCURSAL' : '🚚 ENVÍO A DOMICILIO / TRANSPORTE'}
                  </span>
                </div>

                {/* Show Shipping Address if Delivery */}
                {(!selectedPrintOrder.delivery_method || !selectedPrintOrder.delivery_method.toLowerCase().includes('retiro')) && (
                  <>
                    <div className="info-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #000' }}>
                      <strong>Dirección de Envío:</strong> <span>{selectedPrintOrder.client_address || 'No especificada'}</span>
                    </div>
                    <div className="info-row">
                      <strong>Localidad / Ciudad:</strong> <span>{selectedPrintOrder.client_locality || 'Rosario'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Itemized Table for Warehouse Assembly */}
              <div className="items-section">
                <h3 className="section-title">DETALLE DEL PEDIDO A PREPARAR:</h3>
                <table className="ticket-table">
                  <thead>
                    <tr>
                      <th style={{ width: '24px' }}>✓</th>
                      <th>Prenda / Producto</th>
                      <th style={{ textAlign: 'center' }}>Talle</th>
                      <th style={{ textAlign: 'center' }}>Cant.</th>
                      <th style={{ textAlign: 'right' }}>P. Unit.</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrintOrder.items && selectedPrintOrder.items.length > 0 ? (
                      selectedPrintOrder.items.map((item, idx) => {
                        const unitPrice = selectedPrintOrder.is_wholesale ? Math.round(item.product.price * 0.60) : item.product.price;
                        const itemTotal = unitPrice * item.quantity;
                        const size = item.product.selectedSize || item.selectedSize || 'Único';

                        return (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>☐</td>
                            <td>
                              <strong>{item.product.name}</strong>
                              {item.product.code && <span className="product-code">Cód: {item.product.code}</span>}
                            </td>
                            <td style={{ textAlign: 'center' }} className="highlight-size">
                              {size}
                            </td>
                            <td style={{ textAlign: 'center' }} className="highlight-qty">
                              x{item.quantity}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              ${unitPrice?.toLocaleString('es-AR')}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>
                              ${itemTotal?.toLocaleString('es-AR')}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                          Sin detalle de prendas individuales.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Totals */}
              <div className="totals-section">
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>
                    Estado del Pago: <strong style={{ textTransform: 'uppercase' }}>{selectedPrintOrder.status || 'APROBADO'}</strong>
                  </span>
                  {selectedPrintOrder.is_wholesale && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                      ✓ Venta Mayorista
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', display: 'block' }}>TOTAL FINAL COMANDA:</span>
                  <span className="grand-total">${selectedPrintOrder.total_amount?.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Warehouse Verification Footer */}
              <div className="warehouse-checks">
                <div style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                  CONTROL DE DEPÓSITO Y CONTROL FINAL:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <span>☐ Control de Talles y Prendas</span>
                  <span>☐ Bolsa / Embalaje</span>
                  <span>☐ Despachado</span>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Firma Armador: ___________________</span>
                  <span>Firma Control: ___________________</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL PRINT CSS STYLES FOR THERMAL POS & STANDARD A4/A5 PRINTERS */}
      <style jsx global>{`
        /* Screen Styles for Ticket */
        #printable-order-ticket {
          background-color: #FFFFFF;
          color: #000000;
          font-family: 'Arial', sans-serif;
          padding: 14px;
          border: 1px solid #000000;
          border-radius: 6px;
        }
        .company-title {
          font-size: 1.5rem;
          font-weight: 900;
          text-align: center;
          margin: 0;
          letter-spacing: 1px;
        }
        .ticket-subtitle {
          font-size: 0.8rem;
          font-weight: 800;
          text-align: center;
          margin: 2px 0 8px 0;
        }
        .ticket-header {
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .ticket-order-meta {
          display: flex;
          justify: space-between;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .client-info-box {
          border: 1.5px solid #000;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 14px;
          font-size: 0.85rem;
        }
        .info-row {
          margin-bottom: 4px;
        }
        .delivery-type-tag {
          font-weight: 900;
          margin-left: 4px;
        }
        .items-section {
          margin-bottom: 14px;
        }
        .section-title {
          font-size: 0.88rem;
          font-weight: 900;
          margin-bottom: 6px;
          border-bottom: 1px solid #000;
          padding-bottom: 3px;
        }
        .ticket-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .ticket-table th {
          border-bottom: 1.5px solid #000;
          padding: 6px 4px;
          text-align: left;
          background-color: #F1F5F9;
          font-weight: 800;
        }
        .ticket-table td {
          border-bottom: 1px solid #E2E8F0;
          padding: 6px 4px;
        }
        .product-code {
          font-size: 0.72rem;
          color: #475569;
          display: block;
        }
        .highlight-size {
          font-weight: 900;
          font-size: 0.95rem;
          color: #000000;
        }
        .highlight-qty {
          font-weight: 900;
          font-size: 1rem;
        }
        .totals-section {
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .grand-total {
          font-size: 1.4rem;
          font-weight: 900;
        }
        .warehouse-checks {
          border: 1px dashed #000;
          padding: 10px;
          border-radius: 4px;
          font-size: 0.78rem;
        }

        /* PRINT MEDIA DIRECTIVES (UNIVERSAL COMPATIBILITY) */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-order-ticket, #printable-order-ticket * {
            visibility: visible !important;
          }
          #printable-order-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .ticket-table th {
            background-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
