// Genera un link directo a un producto puntual (?producto=ID) que la home
// sabe leer al cargar para abrir el modal de detalle de esa prenda.
export function getProductShareUrl(product) {
  if (typeof window === 'undefined' || !product) return '';
  return `${window.location.origin}/?producto=${encodeURIComponent(product.id)}`;
}

// Comparte un producto usando el menu nativo del celular (WhatsApp, etc.)
// cuando esta disponible, o copia el link al portapapeles como respaldo.
export async function shareProduct(product) {
  const url = getProductShareUrl(product);
  const price = product.wholesale_price || product.price;
  const text = `Mirá esta prenda en El Paquetero: ${product.name}${price ? ` — $${price.toLocaleString('es-AR')}` : ''}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'El Paquetero', text, url });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
      // Si el share nativo falla por otro motivo, seguimos al respaldo de copiar.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      return 'copied';
    } catch (e) {
      return 'unsupported';
    }
  }

  return 'unsupported';
}
