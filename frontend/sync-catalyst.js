import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const targetDir = path.resolve(__dirname, '../catalyst-web-client');

if (!fs.existsSync(distDir)) {
  console.error('[Sync] Error: frontend/dist does not exist. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy dist files to catalyst-web-client
fs.cpSync(distDir, targetDir, { recursive: true });

// Ensure client-package.json exists
const clientPkgPath = path.join(targetDir, 'client-package.json');
if (!fs.existsSync(clientPkgPath)) {
  fs.writeFileSync(
    clientPkgPath,
    JSON.stringify(
      {
        name: 'CrimeIntel',
        version: '1.0.0',
        homepage: 'index.html',
      },
      null,
      2
    )
  );
}

console.log('✓ Successfully synchronized frontend/dist to catalyst-web-client!');
