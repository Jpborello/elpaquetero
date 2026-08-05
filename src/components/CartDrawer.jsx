'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Truck, Store, Upload, CheckCircle2, UserCheck } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  currentUser,
  onOpenAuth 
}) {
  const [deliveryMethod, setDeliveryMethod] = useState('envio'); // 'envio' or 'retiro'
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLocality, setClientLocality] = useState('');
  
  // Checkout & Receipt state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.wholesale_price * item.quantity), 0);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Use current logged-in user or input form values
    const name = currentUser?.name || clientName;
    const phone = currentUser?.phone || clientPhone;
    const dni = currentUser?.dni || clientDni;
    const locality = currentUser?.locality || clientLocality;

    if (!name || !phone || !dni || !locality) {
      alert('Por favor completá todos los datos personales requeridos (DNI, Teléfono, Nombre y Localidad).');
      return;
    }

    const orderData = onCheckout(cartItems, {
      name,
      phone,
      dni,
      locality,
      deliveryMethod: deliveryMethod === 'envio' ? 'Envío a Domicilio / Transporte' : 'Retiro por Sucursal (Camilo Aldao 2715)'
    });

    setCreatedOrder({
      ...orderData,
      client_name: name,
      client_phone: phone,
      client_dni: dni,
      client_locality: locality,
      delivery_method: deliveryMethod
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
        setReceiptUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!createdOrder) return;

    let message = `*NUEVO PEDIDO MAYORISTA - EL PAQUETERO*\n`;
    message += `*Orden N°:* ${createdOrder.id}\n`;
    message += `*Cliente:* ${createdOrder.client_name}\n`;
    message += `*DNI/CUIT:* ${createdOrder.client_dni}\n`;
    message += `*Teléfono:* ${createdOrder.client_phone}\n`;
    message += `*Localidad:* ${createdOrder.client_locality}\n`;
    message += `*Entrega:* ${createdOrder.delivery_method === 'envio' ? '🚚 Envío a Domicilio' : '🏬 Retiro por Sucursal'}\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n`;

    createdOrder.items.forEach((item, idx) => {
      message += `${idx + 1}. ${item.product.name} (x${item.quantity}) - $${(item.product.wholesale_price * item.quantity).toLocaleString('es-AR')}\n`;
    });

    message += `\n*TOTAL A PAGAR:* $${createdOrder.total_amount.toLocaleString('es-AR')}\n`;
    if (receiptUploaded) {
      message += `📌 *Comprobante de pago adjuntado en sistema.*\n`;
    }

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5493416095021?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset order flow
    setCreatedOrder(null);
    setReceiptImage(null);
    setReceiptUploaded(false);
    onClose();
  };

  return (
    <div className={`drawer-backdrop ${isOpen ? 'active' : ''}`}>
      <div className="cart-drawer-panel">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} className="text-accent-gold" />
            <h3 className="drawer-title">
              {createdOrder ? 'Confirmación de Pedido' : 'Carrito Mayorista'}
            </h3>
          </div>
          <button onClick={onClose} className="qty-btn">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* STEP 2: ORDER CREATED & RECEIPT UPLOAD */}
          {createdOrder ? (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>¡Pedido #{createdOrder.id} Generado!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Monto total: <strong>${createdOrder.total_amount.toLocaleString('es-AR')}</strong>
                </p>

                {/* Raffle Tickets Assigned Card */}
                {createdOrder.raffle_tickets && createdOrder.raffle_tickets.length > 0 && (
                  <div style={{ 
                    marginTop: '12px', 
                    backgroundColor: 'var(--accent-gold-light)', 
                    color: 'var(--accent-gold-hover)', 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px dashed var(--accent-gold)' 
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
                      🎟️ ¡Ganaste {createdOrder.raffle_tickets.length} cupón(es) para el Gran Sorteo!
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Tu(s) Boleto(s): <strong>{createdOrder.raffle_tickets.join(', ')}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Receipt Section */}
              <div style={{ 
                backgroundColor: 'var(--bg-surface-elevated)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={16} /> Adjuntar Comprobante de Pago
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Si ya realizaste la transferencia o pago por Mercado Pago, podés subir la captura aquí:
                </p>

                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  id="receipt-file-input"
                  style={{ display: 'none' }}
                />

                <label 
                  htmlFor="receipt-file-input" 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Upload size={16} /> 
                  {receiptUploaded ? '✓ Comprobante Cargado (Cambiar)' : 'Subir Imagen de Comprobante'}
                </label>

                {receiptImage && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <img 
                      src={receiptImage} 
                      alt="Comprobante" 
                      style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '4px' }}>
                      Comprobante adjuntado correctamente
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleSendToWhatsApp} className="btn-hero-primary" style={{ width: '100%' }}>
                <Send size={18} style={{ display: 'inline', marginRight: '6px' }} /> Confirmar por WhatsApp
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontWeight: 600 }}>El carrito está vacío.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Agregá prendas del catálogo para iniciar tu pedido.</p>
            </div>
          ) : (
            <>
              {/* STEP 1: CART ITEMS & REGISTRATION INPUTS */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                  Prendas en el pedido
                </h4>
                {cartItems.map((item) => (
                  <div key={item.product.id} className="cart-item-row">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.product.name}</div>
                      <div className="cart-item-price">
                        ${(item.product.wholesale_price * item.quantity).toLocaleString('es-AR')}
                      </div>

                      <div className="qty-controls">
                        <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="qty-btn">
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="qty-btn">
                          <Plus size={14} />
                        </button>

                        <button onClick={() => onRemoveItem(item.product.id)} style={{ marginLeft: 'auto', color: 'var(--accent-crimson)', padding: '4px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Option */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Método de Entrega</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('envio')}
                    className={`btn-secondary ${deliveryMethod === 'envio' ? 'active' : ''}`}
                    style={{ 
                      padding: '10px', 
                      fontSize: '0.8rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '4px',
                      backgroundColor: deliveryMethod === 'envio' ? 'var(--text-main)' : 'var(--bg-surface-elevated)',
                      color: deliveryMethod === 'envio' ? '#FFF' : 'var(--text-main)'
                    }}
                  >
                    <Truck size={18} /> Envío a Domicilio
                  </button>

                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('retiro')}
                    className={`btn-secondary ${deliveryMethod === 'retiro' ? 'active' : ''}`}
                    style={{ 
                      padding: '10px', 
                      fontSize: '0.8rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '4px',
                      backgroundColor: deliveryMethod === 'retiro' ? 'var(--text-main)' : 'var(--bg-surface-elevated)',
                      color: deliveryMethod === 'retiro' ? '#FFF' : 'var(--text-main)'
                    }}
                  >
                    <Store size={18} /> Retiro por Sucursal
                  </button>
                </div>
              </div>

              {/* Customer Registration Fields if not logged in */}
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} /> Datos del Cliente
                  </h4>
                  {!currentUser && (
                    <button onClick={onOpenAuth} style={{ fontSize: '0.75rem', color: 'var(--accent-gold-hover)', fontWeight: 700 }}>
                      Iniciar Sesión
                    </button>
                  )}
                </div>

                {currentUser ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div><strong>{currentUser.name}</strong></div>
                    <div>DNI: {currentUser.dni || 'No especificado'} | Tel: {currentUser.phone}</div>
                    <div>Localidad: {currentUser.locality || 'No especificada'}</div>
                  </div>
                ) : (
                  <div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Nombre Completo / Razón Social *" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="form-input" 
                        style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="DNI / CUIT *" 
                        value={clientDni}
                        onChange={(e) => setClientDni(e.target.value)}
                        className="form-input" 
                        style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Teléfono *" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="form-input" 
                        style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                      />
                    </div>

                    <input 
                      type="text" 
                      placeholder="Localidad / Ciudad *" 
                      value={clientLocality}
                      onChange={(e) => setClientLocality(e.target.value)}
                      className="form-input" 
                      style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && !createdOrder && (
          <div className="drawer-footer">
            <div className="total-summary-row">
              <span>Total Mayorista:</span>
              <span>${totalAmount.toLocaleString('es-AR')}</span>
            </div>

            <button onClick={handleCreateOrder} className="btn-hero-primary" style={{ width: '100%' }}>
              Generar Pedido & Subir Comprobante
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
