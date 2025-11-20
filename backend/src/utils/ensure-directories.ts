import fs from 'fs';
import path from 'path';

const directories = [
  path.join(__dirname, '../../data'),
  path.join(__dirname, '../../logs'),
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../../output/pdfs'),
  path.join(__dirname, '../../output/excel'),
];

export function ensureDirectories() {
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Directorio creado: ${dir}`);
    }
  });
}






