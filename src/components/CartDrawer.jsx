'use client';

import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout, currentUser }) {
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.wholesale_price * item.quantity), 0);

  const handleFinishOrder = () => {
    if (cartItems.length === 0) return;

    const orderData = onCheckout(cartItems);

    // Format WhatsApp message
    let message = `*NUEVO PEDIDO MAYORISTA - EL PAQUETERO*\n`;
    message += `Cliente: ${currentUser?.name || 'Cliente Mayorista'}\n`;
    message += `Teléfono: ${currentUser?.phone || 'No especificado'}\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n`;

    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. ${item.product.name} (x${item.quantity}) - $${(item.product.wholesale_price * item.quantity).toLocaleString('es-AR')}\n`;
    });

    message += `\n*TOTAL A PAGAR:* $${totalAmount.toLocaleString('es-AR')}\n`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5493416095021?text=${encodedMsg}`;

    setCheckoutSuccess(true);

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setCheckoutSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className={`drawer-backdrop ${isOpen ? 'active' : ''}`}>
      <div className="cart-drawer-panel">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} className="text-accent-gold" />
            <h3 className="drawer-title">Carrito Mayorista</h3>
          </div>
          <button onClick={onClose} className="qty-btn">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {checkoutSuccess ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>¡Pedido Generado!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Redirigiendo a WhatsApp para coordinar el envío y pago directo...
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontWeight: 600 }}>El carrito está vacío.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Agregá prendas del catálogo para iniciar tu pedido.</p>
            </div>
          ) : (
            cartItems.map((item) => (
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
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} 
                      className="qty-btn"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} 
                      className="qty-btn"
                    >
                      <Plus size={14} />
                    </button>

                    <button 
                      onClick={() => onRemoveItem(item.product.id)} 
                      style={{ marginLeft: 'auto', color: 'var(--accent-crimson)', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && !checkoutSuccess && (
          <div className="drawer-footer">
            <div className="total-summary-row">
              <span>Total Mayorista:</span>
              <span>${totalAmount.toLocaleString('es-AR')}</span>
            </div>

            <button onClick={handleFinishOrder} className="btn-hero-primary" style={{ width: '100%' }}>
              <Send size={18} style={{ display: 'inline', marginRight: '6px' }} /> Enviar Pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
