#!/usr/bin/env node

/**
 * Direct CSS Optimization Script
 * Aggressively reduces CSS bundle size by removing unused styles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PurgeCSS } from 'purgecss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Direct CSS Bundle Optimization\n');

async function optimizeCSSBundle() {
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

    // Step 1: Remove specific heavy CSS patterns
    let optimizedCSS = originalCSS;

    // Remove backdrop-filter utilities (heavy and not well supported on mobile)
    optimizedCSS = optimizedCSS.replace(/\\.backdrop-[\\w-]+[^}]*}/g, '');
    console.log('  ✅ Removed backdrop-filter utilities');

    // Remove complex grid layouts (>4 columns for mobile)
    optimizedCSS = optimizedCSS.replace(/\\.grid-cols-(?:[5-9]|1[0-9]|2[0-9])[^}]*}/g, '');
    console.log('  ✅ Removed complex grid layouts');

    // Remove large spacing utilities (>20 for mobile)
    optimizedCSS = optimizedCSS.replace(/\\.(p|m)[lrxy]?-(?:2[4-9]|[3-9][0-9])[^}]*}/g, '');
    console.log('  ✅ Removed large spacing utilities');

    // Remove xl and 2xl responsive variants
    optimizedCSS = optimizedCSS.replace(/@media[^{]*\\([^)]*(?:xl|2xl)[^)]*\\)[^}]*{[^}]*}/g, '');
    console.log('  ✅ Removed xl/2xl responsive variants');

    // Remove unused color variants (keep only primary set)
    const unusedColorPatterns = [
      /\\.bg-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+/g,
      /\\.text-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+/g,
      /\\.border-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+/g,
    ];

    for (const pattern of unusedColorPatterns) {
      optimizedCSS = optimizedCSS.replace(pattern, '');
    }
    console.log('  ✅ Removed unused color variants');

    // Remove animation utilities that aren't used
    optimizedCSS = optimizedCSS.replace(/\\.animate-(?!pulse|spin|bounce)[\\w-]+[^}]*}/g, '');
    console.log('  ✅ Removed unused animation utilities');

    // Remove filter utilities
    optimizedCSS = optimizedCSS.replace(/\\.filter[^}]*}/g, '');
    optimizedCSS = optimizedCSS.replace(
      /\\.(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia)-[\\w-]+[^}]*}/g,
      ''
    );
    console.log('  ✅ Removed filter utilities');

    // Step 2: Use PurgeCSS for more aggressive cleanup
    console.log('  🔍 Running PurgeCSS analysis...');

    const jsFiles = fs.readdirSync(assetsPath).filter((file) => file.endsWith('.js'));
    const htmlFiles = fs.readdirSync(distPath).filter((file) => file.endsWith('.html'));

    const contentFiles = [
      ...jsFiles.map((file) => path.join(assetsPath, file)),
      ...htmlFiles.map((file) => path.join(distPath, file)),
    ];

    const purgeResult = await new PurgeCSS().purge({
      content: contentFiles,
      css: [{ raw: optimizedCSS }],
      safelist: {
        // Keep essential classes
        standard: [
          // Layout essentials
          /^(flex|grid|block|hidden|relative|absolute|fixed)$/,
          /^(container|w-|h-|max-w-)\\w+/,
          // Spacing essentials
          /^(p|m)[lrxy]?-[0-8]$/,
          /^gap-[0-8]$/,
          // Mobile essentials
          /^(touch|mobile|ios|safe)-\\w+/,
          // Interactive states
          /^(hover|focus|active|disabled):/,
          // Typography essentials
          /^text-(sm|base|lg|xl|center|left|right)$/,
          // Colors (keep only project colors)
          /^(bg|text|border)-(primary|secondary|accent|background|foreground|muted|border|destructive|card)$/,
        ],
        deep: [
          // Keep component selectors
          /\[data-\w+\]/,
          /data-\w+/,
          // Keep CSS variables
          /--\w+/,
        ],
      },
    });

    if (purgeResult && purgeResult[0]) {
      optimizedCSS = purgeResult[0].css;
      console.log('  ✅ Applied PurgeCSS optimization');
    }

    // Step 3: Minify whitespace
    optimizedCSS = optimizedCSS
      .replace(/\\s+/g, ' ')
      .replace(/;\\s*}/g, '}')
      .replace(/\\s*{\\s*/g, '{')
      .replace(/;\\s*/g, ';')
      .trim();

    const optimizedSize = (optimizedCSS.length / 1024).toFixed(2);
    const reduction = ((1 - optimizedCSS.length / originalCSS.length) * 100).toFixed(1);

    // Write optimized CSS
    fs.writeFileSync(cssPath, optimizedCSS);

    console.log(
      `  ✅ Optimized: ${originalSize} KB → ${optimizedSize} KB (${reduction}% reduction)`
    );
  }

  console.log('\\n✅ CSS optimization complete!');
  console.log('\\n📊 Run "npm run perf:mobile" to see the results');
}

// Check if dist folder exists
const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

optimizeCSSBundle().catch((error) => {
  console.error('❌ Error during CSS optimization:', error.message);
  process.exit(1);
});
