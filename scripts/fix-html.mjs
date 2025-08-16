/**
 * Post-build script to fix the missing script tag in index.html
 * This is a workaround for Vite not injecting the main script tag properly
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const indexPath = join(distDir, 'index.html');

try {
  // Read the current HTML file
  const html = readFileSync(indexPath, 'utf-8');

  // Check if script tag is already present
  if (html.includes('<script type="module"') && html.includes('crossorigin')) {
    console.log('✅ Script tag already present in index.html');
    process.exit(0);
  }

  // Find the main JavaScript file in assets
  const assetsDir = join(distDir, 'assets');
  const files = readdirSync(assetsDir);
  const mainJsFile = files.find(
    (file) => file.includes('index') && file.endsWith('.js') && !file.includes('chunk')
  );

  if (!mainJsFile) {
    console.error('❌ Could not find main JavaScript file in assets directory');
    console.log('Available files:', files);
    process.exit(1);
  }

  // Inject the script tag before closing body tag
  const fixedHtml = html.replace(
    '</body>',
    `    <script type="module" crossorigin src="/assets/${mainJsFile}"></script>\n  </body>`
  );

  // Write the fixed HTML back
  writeFileSync(indexPath, fixedHtml);
  console.log(`✅ Injected script tag for /assets/${mainJsFile} into index.html`);
} catch (error) {
  console.error('❌ Error fixing HTML file:', error.message);
  process.exit(1);
}
