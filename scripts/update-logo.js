const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const srcLogo = 'C:\\Users\\jpbor\\OneDrive\\Documents\\Nuevo-Logo.jpeg';
const targetWebp = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes', 'logo.webp');
const targetJpeg = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes', 'Logo 2.jpeg');
const publicWebp = path.join(__dirname, '..', 'public', 'logo.webp');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('🔄 Procesando y convirtiendo el nuevo logo...');
  
  // Convert to WebP
  await sharp(srcLogo).webp({ quality: 90 }).toFile(targetWebp);
  console.log(`✓ Creado: ${targetWebp}`);
  
  // Copy to public/logo.webp
  fs.copyFileSync(targetWebp, publicWebp);
  console.log(`✓ Creado: ${publicWebp}`);

  // Also convert/overwrite Logo 2.jpeg so existing fallbacks get the new logo
  await sharp(srcLogo).jpeg({ quality: 90 }).toFile(targetJpeg);
  console.log(`✓ Actualizado fallback: ${targetJpeg}`);

  // Upload to Supabase Storage
  console.log('🚀 Subiendo nuevo logo a Supabase Storage...');
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
    console.log(`✅ ¡Logo subido con éxito a Supabase Storage!: ${urlData.publicUrl}`);
  }
}

run().catch(console.error);
