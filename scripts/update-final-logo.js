const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

// Sources to try for the final logo
const possibleSources = [
  'C:\\Users\\jpbor\\.gemini\\antigravity-ide\\brain\\99ef46da-76dc-4c6a-a3e2-2b8ef7c5cd27\\media__1786374431535.jpg',
  'C:\\Users\\jpbor\\OneDrive\\Documents\\nuego-logo.jpeg',
  'C:\\Users\\jpbor\\OneDrive\\Documents\\logo4.jpeg'
];

let srcLogo = null;
for (const p of possibleSources) {
  if (fs.existsSync(p)) {
    srcLogo = p;
    break;
  }
}

if (!srcLogo) {
  console.error('❌ No se encontró el archivo del nuevo logo.');
  process.exit(1);
}

console.log(`📌 Usando imagen origen: ${srcLogo}`);

const targetWebp = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes', 'logo.webp');
const targetJpeg = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes', 'Logo 2.jpeg');
const publicWebp = path.join(__dirname, '..', 'public', 'logo.webp');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('🔄 Procesando y convirtiendo el nuevo logo definitivo...');
  
  // Convert to WebP
  await sharp(srcLogo).webp({ quality: 90 }).toFile(targetWebp);
  console.log(`✓ Creado: ${targetWebp}`);
  
  // Copy to public/logo.webp
  fs.copyFileSync(targetWebp, publicWebp);
  console.log(`✓ Creado: ${publicWebp}`);

  // Overwrite Logo 2.jpeg for backward compatibility
  await sharp(srcLogo).jpeg({ quality: 90 }).toFile(targetJpeg);
  console.log(`✓ Actualizado fallback: ${targetJpeg}`);

  // Upload to Supabase Storage
  console.log('🚀 Subiendo nuevo logo definitivo a Supabase Storage...');
  const fileBuffer = fs.readFileSync(targetWebp);
  const { data, error } = await supabase.storage
    .from('Productos')
    .upload('logo.webp', fileBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    console.error('❌ Error subiendo a Supabase Storage:', error.message);
  } else {
    const { data: urlData } = supabase.storage.from('Productos').getPublicUrl('logo.webp');
    console.log(`✅ ¡Logo definitivo subido con éxito a Supabase Storage!: ${urlData.publicUrl}`);
  }
}

run().catch(console.error);
