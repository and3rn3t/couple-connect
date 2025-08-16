#!/usr/bin/env node

/**
 * Tailwind CSS Usage Analysis and Optimization
 * Analyzes actual usage and creates a minimal CSS build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Tailwind CSS Usage Analysis\n');

// Extract all Tailwind classes used in the codebase
function extractUsedClasses() {
  const srcPath = path.join(projectRoot, 'src');
  const usedClasses = new Set();

  // Patterns to find Tailwind classes
  const patterns = [
    /class(?:Name)?=["'`]([^"'`]*?)["'`]/g,
    /cn\([^)]*?["'`]([^"'`]*?)["'`]/g,
    /className:\s*["'`]([^"'`]*?)["'`]/g,
  ];

  function scanFile(filePath) {
    if (!filePath.match(/\.(tsx?|jsx?)$/)) return;

    const content = fs.readFileSync(filePath, 'utf-8');

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classes = match[1].split(/\s+/).filter(Boolean);
        classes.forEach((cls) => {
          // Only include valid Tailwind classes
          if (cls.match(/^[a-z-]+(\[[^\]]+\])?(:[\w-]+)*$/)) {
            usedClasses.add(cls);
          }
        });
      }
    }
  }

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          scanDirectory(filePath);
        }
      } else {
        scanFile(filePath);
      }
    }
  }

  scanDirectory(srcPath);
  return Array.from(usedClasses).sort();
}

// Analyze the current CSS file
function analyzeCSSFile() {
  const distPath = path.join(projectRoot, 'dist');
  const assetsPath = path.join(distPath, 'assets');

  const cssFiles = fs
    .readdirSync(assetsPath)
    .filter((file) => file.endsWith('.css') && !file.endsWith('.backup'));

  if (cssFiles.length === 0) {
    console.log('❌ No CSS files found. Please run npm run build first.');
    return null;
  }

  const cssFile = cssFiles[0];
  const cssPath = path.join(assetsPath, cssFile);
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  return { cssFile, cssPath, cssContent };
}

// Create optimized Tailwind config based on actual usage
function createMinimalTailwindConfig(usedClasses) {
  console.log('📝 Creating minimal Tailwind configuration...');

  // Analyze used classes to determine what features we need
  const analysis = {
    colors: new Set(),
    spacing: new Set(),
    breakpoints: new Set(),
    utilities: new Set(),
  };

  usedClasses.forEach((cls) => {
    // Extract color usage
    const colorMatch = cls.match(/^(bg|text|border)-(\\w+)(-\\d+)?/);
    if (colorMatch) {
      analysis.colors.add(colorMatch[2]);
    }

    // Extract spacing usage
    const spacingMatch = cls.match(/^[pm][lrxy]?-(\\d+)/);
    if (spacingMatch) {
      analysis.spacing.add(spacingMatch[1]);
    }

    // Extract breakpoint usage
    const breakpointMatch = cls.match(/^(sm|md|lg|xl|2xl):/);
    if (breakpointMatch) {
      analysis.breakpoints.add(breakpointMatch[1]);
    }

    // Track utility types
    if (cls.startsWith('flex')) analysis.utilities.add('flexbox');
    if (cls.startsWith('grid')) analysis.utilities.add('grid');
    if (cls.startsWith('transform')) analysis.utilities.add('transform');
  });

  console.log(`📊 Analysis Results:`);
  console.log(`  Colors used: ${analysis.colors.size} (${Array.from(analysis.colors).join(', ')})`);
  console.log(
    `  Spacing values: ${analysis.spacing.size} (${Array.from(analysis.spacing)
      .sort((a, b) => Number(a) - Number(b))
      .join(', ')})`
  );
  console.log(
    `  Breakpoints: ${analysis.breakpoints.size} (${Array.from(analysis.breakpoints).join(', ')})`
  );
  console.log(
    `  Utilities: ${analysis.utilities.size} (${Array.from(analysis.utilities).join(', ')})`
  );

  // Create minimal safelist for Tailwind JIT
  const safelist = usedClasses.map((cls) => {
    // Handle dynamic classes and states
    if (cls.includes(':')) {
      return cls;
    }
    return cls;
  });

  const minimalConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  // Explicit safelist of used classes
  safelist: ${JSON.stringify(safelist, null, 4)},

  theme: {
    extend: {
      // Only include used colors
      colors: {
        ${Array.from(analysis.colors)
          .map((color) => `'${color}': 'var(--color-${color})',`)
          .join('\n        ')}
      },

      // Only include used spacing
      spacing: {
        ${Array.from(analysis.spacing)
          .sort((a, b) => Number(a) - Number(b))
          .map((space) => `'${space}': '${Number(space) * 0.25}rem',`)
          .join('\n        ')}
      },

      // Only include used breakpoints
      screens: {
        ${Array.from(analysis.breakpoints)
          .map((bp) => {
            const sizes = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' };
            return `'${bp}': '${sizes[bp]}',`;
          })
          .join('\n        ')}
      },
    },
  },

  // Disable unused core plugins
  corePlugins: {
    ${Array.from(analysis.utilities).includes('flexbox') ? '' : 'flexbox: false,'}
    ${Array.from(analysis.utilities).includes('grid') ? '' : 'grid: false,'}
    ${Array.from(analysis.utilities).includes('transform') ? '' : 'transform: false,'}

    // Disable heavy features
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,

    // Disable complex layouts
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
  },

  plugins: [],
};
`;

  fs.writeFileSync(path.join(projectRoot, 'tailwind.minimal.config.js'), minimalConfig);

  console.log('✅ Created tailwind.minimal.config.js');
  return safelist.length;
}

async function main() {
  try {
    console.log('🔍 Extracting used Tailwind classes...');
    const usedClasses = extractUsedClasses();
    console.log(`📊 Found ${usedClasses.length} unique Tailwind classes in use\n`);

    // Show some examples
    console.log('📝 Sample used classes:');
    usedClasses.slice(0, 20).forEach((cls) => console.log(`  ${cls}`));
    if (usedClasses.length > 20) {
      console.log(`  ... and ${usedClasses.length - 20} more\n`);
    }

    // Analyze current CSS
    const cssData = analyzeCSSFile();
    if (cssData) {
      const currentSize = (cssData.cssContent.length / 1024).toFixed(2);
      console.log(`📊 Current CSS size: ${currentSize} KB\n`);
    }

    // Create minimal config
    const safelistCount = createMinimalTailwindConfig(usedClasses);

    console.log(`\n✅ Analysis complete!`);
    console.log(`📋 Next steps:`);
    console.log(`1. Copy tailwind.config.js to tailwind.config.backup.js`);
    console.log(`2. Copy tailwind.minimal.config.js to tailwind.config.js`);
    console.log(`3. Run: npm run build`);
    console.log(`4. Check the new CSS size`);
    console.log(`\n🎯 Expected reduction: Significant (targeting <200KB)`);

    // Save detailed analysis
    const analysisReport = {
      timestamp: new Date().toISOString(),
      totalClassesUsed: usedClasses.length,
      usedClasses: usedClasses,
      currentCSSSize: cssData ? cssData.cssContent.length : null,
      recommendation: 'Use minimal Tailwind config for production builds',
    };

    fs.writeFileSync(
      path.join(projectRoot, 'tailwind-usage-analysis.json'),
      JSON.stringify(analysisReport, null, 2)
    );

    console.log(`📄 Detailed analysis saved to tailwind-usage-analysis.json`);
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

main();
