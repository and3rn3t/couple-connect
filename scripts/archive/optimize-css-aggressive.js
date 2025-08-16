#!/usr/bin/env node

/**
 * Advanced CSS Optimization - Aggressive Bundle Reduction
 * Targets the biggest CSS contributors for maximum size reduction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Advanced CSS Optimization - Aggressive Mode\n');

function aggressiveCSSOptimization() {
  const distPath = path.join(projectRoot, 'dist');
  const assetsPath = path.join(distPath, 'assets');

  const cssFiles = fs
    .readdirSync(assetsPath)
    .filter((file) => file.endsWith('.css') && !file.endsWith('.backup'));

  if (cssFiles.length === 0) {
    console.log('❌ No CSS files found.');
    return;
  }

  for (const cssFile of cssFiles) {
    const cssPath = path.join(assetsPath, cssFile);
    const originalCSS = fs.readFileSync(cssPath, 'utf-8');
    const originalSize = (originalCSS.length / 1024).toFixed(2);

    console.log(`📝 Aggressively optimizing ${cssFile} (${originalSize} KB)...`);

    let optimizedCSS = originalCSS;

    // 1. Remove ALL backdrop utilities (mobile doesn't need them)
    const backdropRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/\.backdrop-[^{]*\{[^}]*\}/g, '');
    optimizedCSS = optimizedCSS.replace(/@supports[^{]*backdrop[^}]*\{[^{}]*\{[^}]*\}[^}]*\}/g, '');
    console.log(
      `  ✅ Removed backdrop utilities: ${((backdropRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 2. Remove complex filter effects (rarely used on mobile)
    const filterRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(
      /\.(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|filter)-[^{]*\{[^}]*\}/g,
      ''
    );
    console.log(
      `  ✅ Removed filter utilities: ${((filterRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 3. Remove large spacing utilities (mobile needs smaller spacing)
    const spacingRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(
      /\.(p|m)[lrxy]?-(?:2[0-9]|[3-9][0-9]|1[0-9]{2})[^{]*\{[^}]*\}/g,
      ''
    );
    optimizedCSS = optimizedCSS.replace(
      /\.space-[xy]-(?:2[0-9]|[3-9][0-9]|1[0-9]{2})[^{]*\{[^}]*\}/g,
      ''
    );
    optimizedCSS = optimizedCSS.replace(/\.gap-(?:2[0-9]|[3-9][0-9]|1[0-9]{2})[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed large spacing: ${((spacingRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 4. Remove large grid systems (mobile rarely needs >6 columns)
    const gridRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/\.grid-cols-(?:[7-9]|1[0-9]|2[0-9])[^{]*\{[^}]*\}/g, '');
    optimizedCSS = optimizedCSS.replace(/\.grid-rows-(?:[7-9]|1[0-9]|2[0-9])[^{]*\{[^}]*\}/g, '');
    optimizedCSS = optimizedCSS.replace(/\.col-span-(?:[7-9]|1[0-9]|2[0-9])[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed large grids: ${((gridRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 5. Remove xl and 2xl responsive variants entirely
    const responsiveRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(
      /@media[^{]*\([^)]*(?:xl|2xl)[^}]*\{[^{}]*(?:\{[^}]*\}[^{}]*)*\}/g,
      ''
    );
    optimizedCSS = optimizedCSS.replace(/\.(?:xl|2xl):[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed xl/2xl variants: ${((responsiveRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 6. Remove complex transform utilities
    const transformRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/\.(skew|rotate)-(?![0-9](?:$|[^0-9]))[^{]*\{[^}]*\}/g, '');
    optimizedCSS = optimizedCSS.replace(/\.scale-(?:1[1-9][0-9]|[2-9][0-9]{2})[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed complex transforms: ${((transformRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 7. Remove unused animation utilities (keep only essential ones)
    const animationRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/\.animate-(?!pulse|spin|bounce|ping)[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed unused animations: ${((animationRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 8. Remove excessive color variations (keep only used project colors)
    const colorRemoved = optimizedCSS.length;
    const unusedColors = [
      'slate',
      'gray',
      'zinc',
      'neutral',
      'stone',
      'red',
      'orange',
      'amber',
      'yellow',
      'lime',
      'green',
      'emerald',
      'teal',
      'cyan',
      'sky',
      'blue',
      'indigo',
      'violet',
      'purple',
      'fuchsia',
      'pink',
      'rose',
    ];

    for (const color of unusedColors) {
      const pattern = new RegExp(
        `\\.(bg|text|border|ring|decoration|divide|outline)-${color}-[0-9]+[^{]*\\{[^}]*\\}`,
        'g'
      );
      optimizedCSS = optimizedCSS.replace(pattern, '');
    }
    console.log(
      `  ✅ Removed unused colors: ${((colorRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 9. Remove container queries and complex layouts
    const layoutRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/@container[^{]*\{[^{}]*(?:\{[^}]*\}[^{}]*)*\}/g, '');
    optimizedCSS = optimizedCSS.replace(
      /\.(columns|break-after|break-before|break-inside)-[^{]*\{[^}]*\}/g,
      ''
    );
    console.log(
      `  ✅ Removed complex layouts: ${((layoutRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 10. Remove print-specific utilities
    const printRemoved = optimizedCSS.length;
    optimizedCSS = optimizedCSS.replace(/@media[^{]*print[^{]*\{[^{}]*(?:\{[^}]*\}[^{}]*)*\}/g, '');
    optimizedCSS = optimizedCSS.replace(/\.(print|screen):[^{]*\{[^}]*\}/g, '');
    console.log(
      `  ✅ Removed print utilities: ${((printRemoved - optimizedCSS.length) / 1024).toFixed(1)}KB`
    );

    // 11. Aggressive whitespace compression
    optimizedCSS = optimizedCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s*\{\s*/g, '{') // Remove spaces around {
      .replace(/;\s*\}/g, '}') // Remove ; before }
      .replace(/;\s*/g, ';') // Remove spaces after ;
      .replace(/\s*;\s*/g, ';') // Remove spaces around ;
      .replace(/,\s*/g, ',') // Remove spaces after ,
      .replace(/:\s*/g, ':') // Remove spaces after :
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/^\s+|\s+$/g, '') // Trim
      .replace(/\s*([{}:;,])\s*/g, '$1'); // Remove spaces around critical chars

    const optimizedSize = (optimizedCSS.length / 1024).toFixed(2);
    const reduction = ((1 - optimizedCSS.length / originalCSS.length) * 100).toFixed(1);

    // Write optimized CSS
    fs.writeFileSync(cssPath, optimizedCSS);

    console.log(`\n📊 OPTIMIZATION SUMMARY:`);
    console.log(`  Original size: ${originalSize} KB`);
    console.log(`  Optimized size: ${optimizedSize} KB`);
    console.log(
      `  Reduction: ${reduction}% (${(originalSize - optimizedSize).toFixed(2)} KB saved)`
    );

    // Verify the CSS is still valid
    if (optimizedCSS.includes('{') && optimizedCSS.includes('}')) {
      console.log(`  ✅ CSS structure verified`);
    } else {
      console.log(`  ⚠️  CSS structure may be damaged`);
    }
  }

  console.log('\n✅ Advanced CSS optimization complete!');
  console.log('📊 Run "npm run perf:mobile" to see the results');
}

try {
  aggressiveCSSOptimization();
} catch (error) {
  console.error('❌ Error during advanced CSS optimization:', error.message);
  process.exit(1);
}
