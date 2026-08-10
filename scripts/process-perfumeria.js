const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';

const inputDir = 'C:\\Users\\jpbor\\OneDrive\\Escritorio\\elpaquetero\\Perfumeria';
const outputDir = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes', 'Perfumeria');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function uploadToStorage(storagePath, fileBuffer) {
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${storagePath}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'image/webp',
      'x-upsert': 'true'
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Error subiendo ${storagePath}:`, response.status, errText);
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
}

async function run() {
  const files = fs.readdirSync(inputDir);
  console.log('Archivos a procesar:', files.length);

  const results = [];

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
    
    const baseName = path.parse(file).name;
    const webpName = `${baseName}.webp`;
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, webpName);

    // Convert to webp
    await sharp(inputPath)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    console.log('Convertido WebP:', webpName);

    // Upload to Supabase Storage via REST
    const fileBuffer = fs.readFileSync(outputPath);
    const storagePath = `Productos/Perfumeria/${webpName}`;
    const publicUrl = await uploadToStorage(storagePath, fileBuffer);

    if (publicUrl) {
      console.log('Subido a Supabase:', publicUrl);
    }

    results.push({
      file,
      baseName,
      webpName,
      publicUrl: publicUrl || `${supabaseUrl}/storage/v1/object/public/${storagePath}`
    });
  }

  fs.writeFileSync(path.join(__dirname, 'perfumeria-processed.json'), JSON.stringify(results, null, 2));
  console.log('Proceso completado con éxito. Total procesados:', results.length);
}

run().catch(console.error);
