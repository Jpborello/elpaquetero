const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';
const supabase = createClient(supabaseUrl, serviceRoleKey);

const imagePathPalazo = 'C:/Users/jpbor/.gemini/antigravity-ide/brain/c6641c34-5570-4d54-96ef-c0fd0c6276cb/media__1786453322587.jpg';
const imagePathJoggin = 'C:/Users/jpbor/.gemini/antigravity-ide/brain/c6641c34-5570-4d54-96ef-c0fd0c6276cb/media__1786453333141.jpg';

async function run() {
  console.log('🚀 Procesando y convirtiendo imágenes a WebP...');

  const tempDir = path.join(__dirname, '../temp_offers');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const palazoWebpPath = path.join(tempDir, '0108_PALAZO_LYCRA_DAMA.webp');
  const jogginWebpPath = path.join(tempDir, '0109_JOGGIN_ALGODON_HOMBRE.webp');

  // 1. Overlay $9.500 on Palazo image over $10.000 and convert to WebP
  const svgOverlay = Buffer.from(`
    <svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="120" fill="#FFFFFF" />
      <text x="160" y="88" font-family="'Oswald', 'Impact', 'Arial Narrow', 'Arial', sans-serif" font-weight="900" font-size="78" fill="#000000" text-anchor="middle">$9.500</text>
    </svg>
  `);

  await sharp(imagePathPalazo)
    .composite([{ input: svgOverlay, top: 855, left: 430 }])
    .webp({ quality: 92 })
    .toFile(palazoWebpPath);

  console.log('✓ Imagen Palazo Lycra Dama editada ($9.500) y convertida a WebP.');

  // 2. Convert Joggin image to WebP
  await sharp(imagePathJoggin)
    .webp({ quality: 92 })
    .toFile(jogginWebpPath);

  console.log('✓ Imagen Joggin Algodón Hombre convertida a WebP.');

  // 3. Upload images to Supabase Storage (bucket "Productos")
  console.log('☁️ Subiendo imágenes a Supabase Storage...');

  const palazoStoragePath = 'Mujeres/PANTALONES/0108_PALAZO_LYCRA_DAMA.webp';
  const jogginStoragePath = 'Hombres/PANTALONES/0109_JOGGIN_ALGODON_HOMBRE.webp';

  const palazoBuffer = fs.readFileSync(palazoWebpPath);
  const jogginBuffer = fs.readFileSync(jogginWebpPath);

  const { error: err1 } = await supabase.storage.from('Productos').upload(palazoStoragePath, palazoBuffer, {
    contentType: 'image/webp',
    upsert: true
  });
  if (err1) console.error('Error subiendo Palazo a Storage:', err1);
  else console.log('✓ Palazo subida a Storage correctamente');

  const { error: err2 } = await supabase.storage.from('Productos').upload(jogginStoragePath, jogginBuffer, {
    contentType: 'image/webp',
    upsert: true
  });
  if (err2) console.error('Error subiendo Joggin a Storage:', err2);
  else console.log('✓ Joggin subida a Storage correctamente');

  const palazoUrl = `${supabaseUrl}/storage/v1/object/public/Productos/${palazoStoragePath}`;
  const jogginUrl = `${supabaseUrl}/storage/v1/object/public/Productos/${jogginStoragePath}`;

  console.log('URL Palazo:', palazoUrl);
  console.log('URL Joggin:', jogginUrl);

  // 4. Upsert products in Supabase Database table "products"
  console.log('📦 Guardando nuevos productos en la tabla products de Supabase...');

  const newProducts = [
    {
      id: 'p-0108',
      name: 'Palazo Lycra Dama',
      category: 'Mujeres',
      subcategory: 'Pantalones y Calzas',
      price: 9500,
      wholesale_price: 9500,
      stock: 100,
      sales_count: 0,
      image_url: palazoUrl,
      description: 'Palazo de lycra de dama en oferta especial del talle 1 al 6.',
      is_offer: true,
      is_top_seller: true
    },
    {
      id: 'p-0109',
      name: 'Joggin Algodón Hombre',
      category: 'Hombres',
      subcategory: 'Pantalon',
      price: 9500,
      wholesale_price: 9500,
      stock: 100,
      sales_count: 0,
      image_url: jogginUrl,
      description: 'Jogging de algodón de hombre frizado en talle del 2 al 5.',
      is_offer: true,
      is_top_seller: true
    }
  ];

  const { data: dbData, error: dbError } = await supabase.from('products').upsert(newProducts, { onConflict: 'id' }).select();
  if (dbError) {
    console.error('Error insertando productos en DB:', dbError);
  } else {
    console.log('🎉 ¡Productos guardados exitosamente en la base de datos de Supabase!');
    console.log(JSON.stringify(dbData, null, 2));
  }
}

run().catch(console.error);
