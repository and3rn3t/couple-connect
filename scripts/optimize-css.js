#!/usr/bin/env node

/**
 * CSS Bundle Optimization Script
 * Implements aggressive CSS optimization for mobile performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Aggressive CSS Optimization for Mobile\n');

// Step 1: Create optimized Tailwind config for production
function createOptimizedTailwindConfig() {
  console.log('📝 Creating optimized Tailwind configuration...');

  const optimizedConfig = `import fs from 'fs';

/** @type {import('tailwindcss').Config} */

// Load theme
let theme = {};
try {
  const themePath = './theme.json';
  if (fs.existsSync(themePath)) {
    theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
  }
} catch (err) {
  console.error('failed to parse custom styles', err);
}

const defaultTheme = {
  container: {
    center: true,
    padding: '1rem',
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
    },
  },
  extend: {
    // MOBILE-OPTIMIZED: Reduced breakpoints
    screens: {
      'mobile': { 'max': '767px' },
      'desktop': { 'min': '768px' },
      'touch': { 'raw': '(pointer: coarse)' },
    },
    // MOBILE-OPTIMIZED: Essential colors only
    colors: {
      'primary': 'var(--color-primary)',
      'secondary': 'var(--color-secondary)',
      'accent': 'var(--color-accent)',
      'background': 'var(--color-background)',
      'foreground': 'var(--color-foreground)',
      'muted': 'var(--color-muted)',
      'border': 'var(--color-border)',
      'ring': 'var(--color-ring)',
      'destructive': 'var(--color-destructive)',
      'card': 'var(--color-card)',
    },
    // MOBILE-OPTIMIZED: Reduced spacing scale
    spacing: {
      '0': '0',
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '6': '1.5rem',
      '8': '2rem',
      '12': '3rem',
      '16': '4rem',
      '44': '2.75rem', // iOS touch target
    },
    // MOBILE-OPTIMIZED: Essential border radius
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      'full': '9999px',
    },
  },
};

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // MOBILE-OPTIMIZED: Exclude heavy components from CSS scanning
    '!./src/components/charts/**',
    '!./src/components/admin/**',
    '!./src/test/**',
    '!./e2e/**',
  ],

  // MOBILE-OPTIMIZED: Disable unused core plugins
  corePlugins: {
    // Disable backdrop filters (heavy CSS)
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,

    // Disable complex layout (rarely used on mobile)
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,

    // Disable print-specific utilities
    pageBreakAfter: false,
    pageBreakBefore: false,
    pageBreakInside: false,

    // Disable scroll utilities (can use CSS)
    scrollMargin: false,
    scrollPadding: false,

    // Keep essential mobile utilities
    display: true,
    flexbox: true,
    grid: true,
    spacing: true,
    colors: true,
    borderRadius: true,
    fontSize: true,
    fontWeight: true,
    textAlign: true,
    backgroundColor: true,
    borderWidth: true,
    borderColor: true,
    margin: true,
    padding: true,
    width: true,
    height: true,
    position: true,
    zIndex: true,
    overflow: true,
    boxShadow: true,
    opacity: true,
    transform: true,
    transition: true,
  },

  theme: { ...defaultTheme, ...theme },

  plugins: [
    function ({ addUtilities, addComponents }) {
      // Essential mobile utilities only
      const mobileUtilities = {
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.ios-tap': {
          '-webkit-tap-highlight-color': 'transparent',
          'transition': 'transform 0.1s ease-out',
          '&:active': {
            'transform': 'scale(0.97)',
          },
        },
      };

      addUtilities(mobileUtilities);
    },
  ],
};
`;

  fs.writeFileSync(path.join(projectRoot, 'tailwind.mobile-optimized.config.js'), optimizedConfig);

  console.log('✅ Created tailwind.mobile-optimized.config.js');
}

// Step 2: Create critical CSS extraction
function createCriticalCSS() {
  console.log('📝 Creating critical CSS strategy...');

  const criticalCSSContent = `/* Critical CSS - Above the fold mobile styles */
/* Inline this in index.html for fastest mobile loading */

:root {
  --color-primary: #a45eff;
  --color-secondary: #453345;
  --color-accent: #ff6c98;
  --color-background: #0f0a0f;
  --color-foreground: #f8f0f8;
  --color-muted: #2f212f;
  --color-border: #453345;
  --color-ring: #a45eff;
  --color-destructive: #ff4757;
  --color-card: #1a111a;
}

/* Essential mobile layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
.p-4 { padding: 1rem; }
.text-center { text-align: center; }
.bg-background { background-color: var(--color-background); }
.text-foreground { color: var(--color-foreground); }

/* Mobile touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* iOS tap effects */
.ios-tap {
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease-out;
}
.ios-tap:active {
  transform: scale(0.97);
}

/* Safe areas */
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
`;

  fs.writeFileSync(path.join(projectRoot, 'src', 'critical.css'), criticalCSSContent);

  console.log('✅ Created src/critical.css');
}

// Step 3: Update package.json scripts
function updatePackageScripts() {
  console.log('📝 Adding optimized build scripts...');

  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  // Add mobile-optimized build scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:mobile-optimized': 'TAILWIND_CONFIG=tailwind.mobile-optimized.config.js npm run build',
    'build:css-optimized':
      'postcss src/index.css -o dist/assets/main.css --config postcss.config.cjs',
    'analyze:css-size': 'du -sh dist/assets/*.css',
    'purge:css':
      'purgecss --css dist/assets/*.css --content dist/assets/*.js --output dist/assets/',
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json scripts');
}

// Step 4: Create PostCSS optimization config
function createPostCSSOptimization() {
  console.log('📝 Creating PostCSS optimization config...');

  const postCSSConfig = `module.exports = {
  plugins: {
    tailwindcss: {
      config: process.env.TAILWIND_CONFIG || './tailwind.config.js'
    },
    autoprefixer: {},
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['advanced', {
          // Aggressive optimization for mobile
          reduceIdents: true,
          mergeIdents: true,
          discardComments: { removeAll: true },
          discardDuplicates: true,
          discardEmpty: true,
          minifyFontValues: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          normalizeUrl: true,
          normalizeWhitespace: true,
          orderedValues: true,
          reduceTransforms: true,
          svgo: true,
          uniqueSelectors: true,
        }],
      },
      '@fullhuman/postcss-purgecss': {
        content: [
          './dist/**/*.html',
          './dist/**/*.js',
        ],
        defaultExtractor: content => content.match(/[\\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: [
            // Keep essential utility classes
            /^(flex|grid|block|hidden|relative|absolute|fixed)$/,
            /^(w-|h-|p-|m-|text-|bg-|border-)\\w+/,
            /^(hover|focus|active|disabled):/,
            // Keep mobile-specific classes
            /^(mobile|touch|ios|safe-)\\w+/,
          ],
          deep: [
            // Keep data attributes and component classes
            /data-\\w+/,
            /\\[data-\\w+\\]/,
          ],
        },
      },
    }),
  },
};
`;

  fs.writeFileSync(path.join(projectRoot, 'postcss.mobile.config.cjs'), postCSSConfig);

  console.log('✅ Created postcss.mobile.config.cjs');
}

// Step 5: Create Vite CSS optimization plugin
function createViteCSSPlugin() {
  console.log('📝 Creating Vite CSS optimization plugin...');

  const vitePluginContent = `import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function mobileCSSOptimization(): Plugin {
  return {
    name: 'mobile-css-optimization',
    generateBundle(options, bundle) {
      // Find CSS files in bundle
      const cssFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.css')
      );

      for (const fileName of cssFiles) {
        const file = bundle[fileName];
        if (file.type === 'asset' && typeof file.source === 'string') {
          // Remove unused CSS for mobile
          let css = file.source;

          // Remove backdrop-filter utilities (not well supported on mobile)
          css = css.replace(/\\.backdrop-[^\\s{]+[^}]*}/g, '');

          // Remove complex grid utilities for mobile
          css = css.replace(/\\.grid-cols-(?:[5-9]|1[0-9])[^}]*}/g, '');

          // Remove large spacing utilities for mobile
          css = css.replace(/\\.(p|m)[lrxy]?-(?:2[4-9]|[3-9][0-9])[^}]*}/g, '');

          // Remove unused responsive variants
          css = css.replace(/@media[^{]+\\([^)]*xl[^)]*\\)[^}]*{[^}]*}/g, '');

          // Compress whitespace
          css = css.replace(/\\s+/g, ' ').trim();

          file.source = css;

          console.log(\`📱 Optimized \${fileName}: \${(css.length / 1024).toFixed(1)}KB\`);
        }
      }
    },
  };
}
`;

  fs.writeFileSync(path.join(projectRoot, 'src', 'vite-mobile-css.ts'), vitePluginContent);

  console.log('✅ Created src/vite-mobile-css.ts');
}

// Main execution
async function optimizeCSS() {
  try {
    console.log('🚀 Starting aggressive CSS optimization...\n');

    createOptimizedTailwindConfig();
    createCriticalCSS();
    updatePackageScripts();
    createPostCSSOptimization();
    createViteCSSPlugin();

    console.log('\n✅ CSS Optimization Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run build:mobile-optimized');
    console.log('2. Check bundle size: npm run analyze:css-size');
    console.log('3. Test mobile performance: npm run lighthouse:mobile');
    console.log('\n🎯 Expected CSS size reduction: 407KB → ~80-120KB');
  } catch (error) {
    console.error('❌ Error during CSS optimization:', error.message);
    process.exit(1);
  }
}

optimizeCSS();
