const fs = require('fs');
const path = require('path');

// Configuración: Archivos a ignorar y extensiones a leer
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'coverage', '.nx', 'tmp'];
const INCLUDE_EXTS = ['.ts', '.js', '.json', '.yml', '.yaml', '.md', '.env.example'];
const OUTPUT_FILE = 'PROYECTO_COMPLETO.txt';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (INCLUDE_EXTS.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(__dirname);
let outputContent = `--- FECHA: ${new Date().toISOString()} ---\n\n`;

console.log(`Leyendo ${allFiles.length} archivos...`);

allFiles.forEach(file => {
  // Ignorar el propio script de salida y el generador
  if (file.includes(OUTPUT_FILE) || file.includes('generate_context.js')) return;
  if (file.includes('package-lock.json')) return; // Demasiado ruido

  const relativePath = path.relative(__dirname, file);
  outputContent += `\n================================================================================\n`;
  outputContent += `FILE: ${relativePath}\n`;
  outputContent += `================================================================================\n`;
  try {
    const content = fs.readFileSync(file, 'utf8');
    outputContent += content + '\n';
  } catch (err) {
    outputContent += `[ERROR LEYENDO ARCHIVO]\n`;
  }
});

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`¡Listo! Sube el archivo "${OUTPUT_FILE}" al chat.`);