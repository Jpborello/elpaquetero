'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Truck, Store, Upload, CheckCircle2, UserCheck, Sparkles, Tag, Copy, Check, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { dataStore } from '@/lib/dataStore';
import useCloseOnBack from '@/lib/useCloseOnBack';

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
  const handleClose = useCloseOnBack(isOpen, onClose);
  const [deliveryMethod, setDeliveryMethod] = useState('envio'); // 'envio' or 'retiro'
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLocality, setClientLocality] = useState('');
  
  const [clientAddress, setClientAddress] = useState('');
  
  // Checkout & Receipt state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);

  const activeOrderFromStore = dataStore.getActiveOrder();
  const displayOrder = createdOrder || activeOrderFromStore;

  const transferAlias = dataStore.getTransferAlias();

  const handleCopyAlias = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(transferAlias);
    }
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2500);
  };

  // 40% OFF Wholesale Discount calculations (threshold: $50.000)
  const retailSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const WHOLESALE_THRESHOLD = 50000;
  const isWholesaleQualified = retailSubtotal >= WHOLESALE_THRESHOLD;
  const discountAmount = isWholesaleQualified ? Math.round(retailSubtotal * 0.40) : 0;
  const finalTotal = retailSubtotal - discountAmount;
  const amountNeeded = Math.max(0, WHOLESALE_THRESHOLD - retailSubtotal);
  const progressPercent = Math.min(100, Math.round((retailSubtotal / WHOLESALE_THRESHOLD) * 100));

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const name = currentUser?.name || clientName;
    const phone = currentUser?.phone || clientPhone;
    const dni = currentUser?.dni || clientDni;
    const locality = currentUser?.locality || clientLocality;
    const address = clientAddress || currentUser?.address || '';

    if (!name || !phone || !dni || !locality) {
      alert('Por favor completá todos los datos personales requeridos (DNI, Teléfono, Nombre y Localidad).');
      return;
    }

    const orderData = onCheckout(cartItems, {
      name,
      phone,
      dni,
      locality,
      address,
      isRegistered: Boolean(currentUser),
      deliveryMethod: deliveryMethod === 'envio' ? 'Envío a Domicilio / Transporte' : 'Retiro por Sucursal (Camilo Aldao 2715)'
    });

    const fullOrderObj = {
      ...orderData,
      client_name: name,
      client_phone: phone,
      client_dni: dni,
      client_locality: locality,
      client_address: address,
      delivery_method: deliveryMethod
    };

    setCreatedOrder(fullOrderObj);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !displayOrder) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result);
      setReceiptUploaded(true);
    };
    reader.readAsDataURL(file);

    if (supabase) {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const filePath = `comprobantes/comprobante_${displayOrder.id}_${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('Productos').upload(filePath, file, { upsert: true });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('Productos').getPublicUrl(filePath);
          const receiptPublicUrl = urlData.publicUrl;
          dataStore.updateOrderReceipt(displayOrder.id, receiptPublicUrl);
        }
      } catch (err) {
        console.warn('Error subiendo comprobante a Supabase Storage:', err);
      }
    }
  };

  const handleSendToWhatsApp = () => {
    if (!displayOrder) return;

    let message = `*NUEVO PEDIDO - EL PAQUETERO*\n`;
    message += `*Orden N°:* ${displayOrder.id}\n`;
    message += `*Cliente:* ${displayOrder.client_name}\n`;
    message += `*DNI/CUIT:* ${displayOrder.client_dni}\n`;
    message += `*Teléfono:* ${displayOrder.client_phone}\n`;
    message += `*Localidad:* ${displayOrder.client_locality}\n`;
    message += `*Entrega:* ${displayOrder.delivery_method === 'envio' ? '🚚 Envío a Domicilio' : '🏬 Retiro por Sucursal'}\n\n`;
    
    if (displayOrder.is_wholesale) {
      message += `🎉 *¡DESCUENTO MAYORISTA APLICADO: 40% OFF!*\n\n`;
    }

    message += `*DETALLE DEL PEDIDO:*\n`;

    (displayOrder.items || []).forEach((item, idx) => {
      const itemUnitPrice = displayOrder.is_wholesale ? Math.round(item.product.price * 0.60) : item.product.price;
      const itemTotal = itemUnitPrice * item.quantity;
      message += `${idx + 1}. ${item.product.name} (x${item.quantity}) - $${itemTotal.toLocaleString('es-AR')}\n`;
    });

    if (displayOrder.is_wholesale && displayOrder.discount_applied) {
      message += `\n*Subtotal Minorista:* $${(displayOrder.total_amount + displayOrder.discount_applied).toLocaleString('es-AR')}`;
      message += `\n*Descuento 40% Mayorista:* -$${displayOrder.discount_applied.toLocaleString('es-AR')}`;
    }

    message += `\n*TOTAL FINAL A PAGAR:* $${displayOrder.total_amount.toLocaleString('es-AR')}\n`;
    
    if (receiptUploaded || displayOrder.receipt_url) {
      message += `📌 *Comprobante de pago adjuntado en sistema.*\n`;
    }

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5493416095021?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStartNewOrder = () => {
    dataStore.clearActiveOrder();
    setCreatedOrder(null);
    setReceiptImage(null);
    setReceiptUploaded(false);
  };

  return (
    <div className={`drawer-backdrop ${isOpen ? 'active' : ''}`}>
      <div className="cart-drawer-panel">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} className="text-accent-gold" />
            <h3 className="drawer-title">
              {createdOrder ? 'Confirmación de Pedido' : 'Tu Carrito de Compras'}
            </h3>
          </div>
          <button onClick={handleClose} className="qty-btn">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* STEP 2: ORDER CREATED OR ACTIVE PENDING ORDER & RECEIPT UPLOAD */}
          {displayOrder ? (
            <div style={{ padding: '10px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  ¡Pedido #{displayOrder.id} Generado!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Monto total: <strong>${displayOrder.total_amount?.toLocaleString('es-AR')}</strong>
                </p>

                {displayOrder.is_wholesale && (
                  <div style={{
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    border: '1px solid #A7F3D0',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginTop: '10px'
                  }}>
                    🎉 40% OFF Mayorista Aplicado (-${displayOrder.discount_applied?.toLocaleString('es-AR')})
                  </div>
                )}

                {/* Raffle Tickets Assigned Card (ONLY for registered users) */}
                {displayOrder.raffle_tickets && displayOrder.raffle_tickets.length > 0 ? (
                  <div style={{ 
                    marginTop: '12px', 
                    backgroundColor: 'var(--accent-gold-light)', 
                    color: 'var(--accent-gold-hover)', 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px dashed var(--accent-gold)' 
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
                      🎟️ ¡Ganaste {displayOrder.raffle_tickets.length} cupón(es) para el Gran Sorteo!
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Tu(s) Boleto(s): <strong>{displayOrder.raffle_tickets.join(', ')}</strong>
                    </div>
                  </div>
                ) : !displayOrder.is_registered ? (
                  <div style={{
                    marginTop: '12px',
                    backgroundColor: '#FFFBEB',
                    color: '#B45309',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    border: '1px solid #FDE68A',
                    fontWeight: 600
                  }}>
                    💡 *Tip*: Si te registrás como usuario, participás automáticamente del Gran Sorteo con cupones en tus compras mayoristas.
                  </div>
                ) : null}
              </div>

              {/* Bank Transfer Alias Card */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '2px dashed #3B82F6',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CreditCard size={16} /> Alias para Transferencia Bancaria
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px', 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #BFDBFE', 
                  padding: '10px 14px', 
                  borderRadius: '8px',
                  margin: '12px 0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1D4ED8', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {transferAlias}
                  </span>
                  <button 
                    type="button" 
                    onClick={handleCopyAlias}
                    style={{
                      backgroundColor: copiedAlias ? '#10B981' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedAlias ? <Check size={15} /> : <Copy size={15} />}
                    {copiedAlias ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#1E40AF', margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
                  Podés adjuntar tu comprobante de pago subiendo la foto desde esta pantalla o enviárnoslo por WhatsApp junto con tu pedido.
                </p>
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
                  {receiptUploaded || displayOrder.receipt_url ? '✓ Comprobante Cargado (Cambiar)' : 'Subir Imagen de Comprobante'}
                </label>

                {(receiptImage || displayOrder.receipt_url) && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <img 
                      src={receiptImage || displayOrder.receipt_url} 
                      alt="Comprobante" 
                      style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '4px' }}>
                      Comprobante adjuntado correctamente
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleSendToWhatsApp} className="btn-hero-primary" style={{ width: '100%', marginBottom: '12px' }}>
                <Send size={18} style={{ display: 'inline', marginRight: '6px' }} /> Confirmar por WhatsApp
              </button>

              <button 
                onClick={handleStartNewOrder} 
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                🛒 Realizar un Nuevo Pedido
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
              {/* WHOLESALE 40% DISCOUNT PROGRESS BANNER */}
              <div style={{
                backgroundColor: isWholesaleQualified ? '#ECFDF5' : '#FEF3C7',
                border: `1px solid ${isWholesaleQualified ? '#6EE7B7' : '#FDE68A'}`,
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ 
                    fontSize: '0.82rem', 
                    fontWeight: 800, 
                    color: isWholesaleQualified ? '#047857' : '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {isWholesaleQualified ? (
                      <>🎉 ¡40% OFF MAYORISTA ACTIVADO!</>
                    ) : (
                      <><Sparkles size={15} /> ¡Sumá ${amountNeeded.toLocaleString('es-AR')} más para 40% OFF!</>
                    )}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isWholesaleQualified ? '#047857' : '#92400E' }}>
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '7px', backgroundColor: isWholesaleQualified ? '#A7F3D0' : '#FDE68A', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${progressPercent}%`, 
                    height: '100%', 
                    backgroundColor: isWholesaleQualified ? '#059669' : '#D97706',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {!isWholesaleQualified && (
                  <p style={{ fontSize: '0.73rem', color: '#92400E', marginTop: '6px', margin: 0 }}>
                    Al superar los $50.000 se aplica automáticamente un <strong>40% de descuento mayorista</strong>.
                  </p>
                )}
              </div>

              {/* STEP 1: CART ITEMS & REGISTRATION INPUTS */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                  Prendas en el pedido
                </h4>
                {cartItems.map((item) => {
                  const unitPrice = item.product.price;
                  const itemWholesaleUnitPrice = Math.round(unitPrice * 0.60);
                  const itemRetailTotal = unitPrice * item.quantity;
                  const itemWholesaleTotal = itemWholesaleUnitPrice * item.quantity;

                  return (
                    <div key={item.product.id} className="cart-item-row">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name} 
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-title">
                          {item.product.name}
                          {(item.product.selectedSize || item.selectedSize) && (
                            <span style={{ marginLeft: '6px', fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Talle: {item.product.selectedSize || item.selectedSize}
                            </span>
                          )}
                        </div>
                        
                        <div className="cart-item-price" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isWholesaleQualified ? (
                            <>
                              <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                                ${itemWholesaleTotal.toLocaleString('es-AR')}
                              </span>
                              <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.8rem' }}>
                                ${itemRetailTotal.toLocaleString('es-AR')}
                              </span>
                              <span style={{ backgroundColor: '#D1FAE5', color: '#047857', fontSize: '0.68rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>
                                -40%
                              </span>
                            </>
                          ) : (
                            <span>${itemRetailTotal.toLocaleString('es-AR')}</span>
                          )}
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
                  );
                })}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Localidad / Ciudad *" 
                        value={clientLocality}
                        onChange={(e) => setClientLocality(e.target.value)}
                        className="form-input" 
                        style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Dirección / Calle *" 
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="form-input" 
                        style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && !createdOrder && (
          <div className="drawer-footer">
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>
                <span>Subtotal Minorista:</span>
                <span>${retailSubtotal.toLocaleString('es-AR')}</span>
              </div>

              {isWholesaleQualified && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>
                  <span>Descuento 40% Mayorista:</span>
                  <span>-${discountAmount.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div className="total-summary-row" style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Total Final:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isWholesaleQualified ? '#059669' : 'var(--text-main)' }}>
                  ${finalTotal.toLocaleString('es-AR')}
                </span>
              </div>
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
