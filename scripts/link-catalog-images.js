const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'lib', 'catalogData.js');
const imgRoot = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes');

// Recursively find all .webp files in public/elpaquetero_imagenes
function getAllWebpFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllWebpFiles(filePath, fileList);
    } else if (file.toLowerCase().endsWith('.webp')) {
      const relPath = '/' + path.relative(path.join(__dirname, '..', 'public'), filePath).replace(/\\/g, '/');
      fileList.push({ fileName: file, relPath, code: file.substring(0, 4) });
    }
  }
  return fileList;
}

function run() {
  const webpFiles = getAllWebpFiles(imgRoot);
  console.log(`🔎 Encontradas ${webpFiles.length} imágenes WebP en el catálogo...`);

  let catalogContent = fs.readFileSync(catalogPath, 'utf8');

  let updatedCount = 0;
  webpFiles.forEach(({ fileName, relPath, code }) => {
    if (/^\d{4}/.test(code)) {
      // Find matching product by code (e.g. '0044' or '0003' or '0148')
      const regex = new RegExp(`(code:\\s*['"]${code}['"][\\s\\S]*?image_url:\\s*['"])([^'"]+)(['"])`, 'g');
      if (regex.test(catalogContent)) {
        catalogContent = catalogContent.replace(regex, (match, p1, p2, p3) => `${p1}${relPath}${p3}`);
        console.log(`🔗 Producto Cód ${code} vinculado a: ${relPath}`);
        updatedCount++;
      }
    }
  });

  fs.writeFileSync(catalogPath, catalogContent, 'utf8');
  console.log(`\n🎉 ¡Actualizado catalogData.js con ${updatedCount} enlaces directos a imágenes WebP comprimidas!`);
}

run();
