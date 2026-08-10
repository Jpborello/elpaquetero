const { createClient } = require('@supabase/supabase-js');
const { CATALOG_PRODUCTS } = require('../src/lib/catalogData');
let ws;
try { ws = require('ws'); } catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  ...(ws ? { realtime: { transport: ws } } : {})
});

async function run() {
  console.log('🚀 Poblando la base de datos Supabase con los 160 productos del catálogo real...\n');

  // 1. Borrar los 12 productos antiguos de muestra (p-1 a p-12)
  const oldIds = Array.from({ length: 12 }, (_, i) => `p-${i + 1}`);
  const { error: delError } = await supabase.from('products').delete().in('id', oldIds);
  if (delError) {
    console.warn('Nota al borrar viejos:', delError.message);
  } else {
    console.log('✓ Eliminados los 12 productos de muestra antiguos de la base de datos.');
  }

  // 2. Preparar los 160 productos utilizando únicamente las columnas existentes en la tabla 'products' de Supabase
  const formattedProducts = CATALOG_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory || null,
    price: p.price,
    wholesale_price: p.wholesale_price,
    stock: p.stock,
    image_url: p.image_url,
    description: p.description || '',
    is_offer: p.is_offer || false,
    is_top_seller: p.is_top_seller || false
  }));

  const chunkSize = 40;
  let totalInserted = 0;

  for (let i = 0; i < formattedProducts.length; i += chunkSize) {
    const chunk = formattedProducts.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error insertando lote ${i + 1}-${i + chunk.length}:`, error.message);
    } else {
      totalInserted += chunk.length;
      console.log(`✓ Insertado lote ${i + 1} a ${i + chunk.length} de 160 productos.`);
    }
  }

  console.log(`\n🎉 ¡Base de datos de Supabase actualizada con éxito! Total de productos en la tabla 'products': ${totalInserted}`);
}

run();
