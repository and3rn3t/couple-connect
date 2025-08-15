#!/usr/bin/env node

/**
 * Simple CSS Optimization Script
 * Reduces CSS bundle size by removing heavy patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Simple CSS Bundle Optimization\n');

function optimizeCSSBundle() {
  const distPath = path.join(projectRoot, 'dist');
  const assetsPath = path.join(distPath, 'assets');

  // Find CSS files in dist/assets
  const cssFiles = fs.readdirSync(assetsPath).filter((file) => file.endsWith('.css'));

  if (cssFiles.length === 0) {
    console.log('❌ No CSS files found in dist/assets. Please run npm run build first.');
    return;
  }

  for (const cssFile of cssFiles) {
    const cssPath = path.join(assetsPath, cssFile);
    const originalCSS = fs.readFileSync(cssPath, 'utf-8');
    const originalSize = (originalCSS.length / 1024).toFixed(2);

    console.log(`📝 Processing ${cssFile} (${originalSize} KB)...`);

    let optimizedCSS = originalCSS;

    // 1. Remove backdrop-filter utilities (heavy and poor mobile support)
    const backdropCount = (optimizedCSS.match(/\.backdrop-/g) || []).length;
    optimizedCSS = optimizedCSS.replace(/\.backdrop-[^{]*{[^}]*}/g, '');
    console.log(`  ✅ Removed ${backdropCount} backdrop-filter utilities`);

    // 2. Remove large grid utilities (mobile rarely needs >4 columns)
    const gridCount = (optimizedCSS.match(/\.grid-cols-(?:[5-9]|1[0-9])/g) || []).length;
    optimizedCSS = optimizedCSS.replace(/\.grid-cols-(?:[5-9]|1[0-9])[^{]*{[^}]*}/g, '');
    console.log(`  ✅ Removed ${gridCount} large grid utilities`);

    // 3. Remove large spacing utilities (mobile needs smaller spacing)
    const spacingCount = (optimizedCSS.match(/\.[pm][lrxy]?-(?:2[4-9]|[3-9][0-9])/g) || []).length;
    optimizedCSS = optimizedCSS.replace(/\.[pm][lrxy]?-(?:2[4-9]|[3-9][0-9])[^{]*{[^}]*}/g, '');
    console.log(`  ✅ Removed ${spacingCount} large spacing utilities`);

    // 4. Remove xl and 2xl responsive variants (mobile-first approach)
    const xlCount = (optimizedCSS.match(/@media[^{]*\([^)]*(?:xl|2xl)/g) || []).length;
    optimizedCSS = optimizedCSS.replace(
      /@media[^{]*\([^)]*(?:xl|2xl)[^}]*{[^{}]*{[^}]*}[^}]*}/g,
      ''
    );
    console.log(`  ✅ Removed ${xlCount} xl/2xl responsive utilities`);

    // 5. Remove unused filter utilities
    const filterCount = (
      optimizedCSS.match(
        /\.(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia)-/g
      ) || []
    ).length;
    optimizedCSS = optimizedCSS.replace(
      /\.(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia)-[^{]*{[^}]*}/g,
      ''
    );
    console.log(`  ✅ Removed ${filterCount} filter utilities`);

    // 6. Remove complex transform utilities
    const transformCount = (optimizedCSS.match(/\.(?:skew|rotate)-(?:[^s]|s[^c])/g) || []).length;
    optimizedCSS = optimizedCSS.replace(/\.(?:skew|rotate)-(?:[^s]|s[^c])[^{]*{[^}]*}/g, '');
    console.log(`  ✅ Removed ${transformCount} complex transform utilities`);

    // 7. Remove unused animation utilities (keep only essential ones)
    const animationCount = (optimizedCSS.match(/\.animate-(?!pulse|spin|bounce)/g) || []).length;
    optimizedCSS = optimizedCSS.replace(/\.animate-(?!pulse|spin|bounce)[^{]*{[^}]*}/g, '');
    console.log(`  ✅ Removed ${animationCount} unused animation utilities`);

    // 8. Compress whitespace
    optimizedCSS = optimizedCSS
      .replace(/\s+/g, ' ')
      .replace(/; }/g, '}')
      .replace(/ { /g, '{')
      .replace(/; /g, ';')
      .trim();

    const optimizedSize = (optimizedCSS.length / 1024).toFixed(2);
    const reduction = ((1 - optimizedCSS.length / originalCSS.length) * 100).toFixed(1);

    // Create backup of original
    fs.writeFileSync(cssPath + '.backup', originalCSS);

    // Write optimized CSS
    fs.writeFileSync(cssPath, optimizedCSS);

    console.log(
      `  ✅ Optimized: ${originalSize} KB → ${optimizedSize} KB (${reduction}% reduction)`
    );
    console.log(`  💾 Backup saved as ${cssFile}.backup`);
  }

  console.log('\n✅ CSS optimization complete!');
  console.log('\n📊 Run "npm run perf:mobile" to see the results');
}

// Check if dist folder exists
const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

try {
  optimizeCSSBundle();
} catch (error) {
  console.error('❌ Error during CSS optimization:', error.message);
  process.exit(1);
}
