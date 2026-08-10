const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = 'C:\\Users\\jpbor\\OneDrive\\Documents\\productos';
const outDir = path.join(__dirname, '..', 'public', 'elpaquetero_imagenes');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function convert() {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    if (file.match(/\.(jpe?g|png)$/i)) {
      const parsed = path.parse(file);
      const targetPath = path.join(outDir, `${parsed.name}.webp`);
      await sharp(path.join(srcDir, file))
        .webp({ quality: 85 })
        .toFile(targetPath);
      console.log(`Converted successfully: ${parsed.name}.webp -> ${targetPath}`);
    }
  }
}

convert().catch(err => {
  console.error('Conversion error:', err);
  process.exit(1);
});
