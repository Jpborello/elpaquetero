import { getProductUrlPath } from './productSlug';

// Genera el link a la pagina propia del producto (/producto/[slug]), con
// metadata e imagen especifica de esa prenda para que la vista previa en
// WhatsApp/redes muestre el producto real y no el logo generico de la home.
export function getProductShareUrl(product) {
  if (typeof window === 'undefined' || !product) return '';
  return `${window.location.origin}${getProductUrlPath(product)}`;
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
