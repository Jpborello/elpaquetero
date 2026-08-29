'use client';

import { Factory, Truck, Store, MessageCircle } from 'lucide-react';

const ITEMS = [
  {
    icon: Factory,
    title: 'Venta Directa de Fábrica',
    subtitle: 'Sin intermediarios, mejores precios'
  },
  {
    icon: Truck,
    title: 'Envíos a Todo el País',
    subtitle: 'Recibí tu pedido donde estés'
  },
  {
    icon: Store,
    title: 'Retirá en Nuestro Local',
    subtitle: 'Camilo Aldao 2715, Rosario — con este frío, te recibimos con un café calentito ☕'
  },
  {
    icon: MessageCircle,
    title: 'Problemas con WhatsApp',
    subtitle: 'Escribinos por el Chat de la web y te contactamos'
  }
];

export default function TrustBar() {
  return (
    <div className="trust-bar">
      {ITEMS.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="trust-bar-item">
            <div className="trust-bar-icon">
              <Icon size={20} />
            </div>
            <div className="trust-bar-text">
              {item.title}
              <span>{item.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
