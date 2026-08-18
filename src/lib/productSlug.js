// Genera y parsea los slugs de las URLs individuales de producto
// (/producto/[slug]), con el nombre incluido solo para lectura/SEO: la
// busqueda real siempre se hace por el id, que son los primeros dos
// segmentos del slug (ej "p-0050-campera-algodon-adidas" -> "p-0050").
// Asi un link ya compartido sigue funcionando aunque el nombre del
// producto cambie despues.

export function slugifyName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildProductSlug(product) {
  const namePart = slugifyName(product?.name);
  return namePart ? `${product.id}-${namePart}` : product.id;
}

export function getProductUrlPath(product) {
  return `/producto/${buildProductSlug(product)}`;
}

// Los ids del catalogo tienen la forma "p-0050": prefijo de letras + guion
// + numero. Se toman los primeros dos segmentos del slug como el id real.
export function extractIdFromSlug(slug) {
  if (!slug) return null;
  const parts = slug.split('-');
  if (parts.length < 2) return slug;
  return `${parts[0]}-${parts[1]}`;
}
