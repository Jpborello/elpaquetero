import { supabase } from '@/lib/supabaseClient';
import { buildProductSlug } from '@/lib/productSlug';

const SITE_URL = 'https://www.elpaquetero.com.ar';

export default async function sitemap() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, updated_at')
    .eq('is_active', true);

  const productEntries = (products || []).map((p) => ({
    url: `${SITE_URL}/producto/${buildProductSlug(p)}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...productEntries
  ];
}
