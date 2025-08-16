#!/usr/bin/env node

/**
 * Bundle Optimization Script for Mobile
 * Analyzes and optimizes bundle size for mobile performance
 */

import { rollup } from 'rollup';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Mobile Bundle Optimization\n');

/**
 * Analyze current bundle and suggest optimizations
 */
async function optimizeBundle() {
  try {
    // Read Vite config to understand current setup
    const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
    let viteConfig = '';

    try {
      viteConfig = readFileSync(viteConfigPath, 'utf8');
    } catch (error) {
      console.log('❌ Could not read vite.config.ts');
      return;
    }

    console.log('📊 Analyzing current bundle configuration...');

    // Check if code splitting is enabled
    const hasCodeSplitting =
      viteConfig.includes('manualChunks') || viteConfig.includes('splitVendorChunkPlugin');
    console.log(`Code Splitting: ${hasCodeSplitting ? '✅ Enabled' : '❌ Not configured'}`);

    // Check for mobile-specific optimizations
    const hasMobileOptimization =
      viteConfig.includes('mobile') ||
      (viteConfig.includes('target') && viteConfig.includes('es2015'));
    console.log(`Mobile Target: ${hasMobileOptimization ? '✅ Configured' : '❌ Not optimized'}`);

    // Generate optimized Vite config
    if (!hasCodeSplitting || !hasMobileOptimization) {
      console.log('\n🔧 Generating optimized Vite configuration...');

      const optimizedConfig = generateOptimizedViteConfig(viteConfig);

      // Write optimized config
      const backupPath = viteConfigPath + '.backup';
      writeFileSync(backupPath, viteConfig);
      writeFileSync(viteConfigPath, optimizedConfig);

      console.log('✅ Vite configuration optimized for mobile');
      console.log('📝 Original config backed up to vite.config.ts.backup');
    }

    // Suggest further optimizations
    console.log('\n💡 Additional Optimization Suggestions:');
    console.log('1. Enable tree shaking for unused exports');
    console.log('2. Use dynamic imports for route-based code splitting');
    console.log('3. Optimize images with WebP format');
    console.log('4. Enable compression (gzip/brotli) on server');
    console.log('5. Use CDN for static assets');
  } catch (error) {
    console.error('❌ Error during bundle optimization:', error.message);
  }
}

/**
 * Generate optimized Vite configuration
 */
function generateOptimizedViteConfig(originalConfig) {
  // Parse the original config and add optimizations
  const optimizations = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          react: ['react', 'react-dom'],

          // Router
          router: ['react-router-dom'],

          // UI Libraries
          ui: ['@phosphor-icons/react', 'framer-motion'],

          // Mobile-specific chunks
          mobile: [
            './src/components/ui/mobile-card',
            './src/components/ui/mobile-navigation',
            './src/components/ui/mobile-forms',
            './src/components/ui/mobile-layout',
            './src/hooks/use-mobile',
            './src/hooks/useMobilePerformance',
          ],

          // Utilities
          utils: ['date-fns', 'clsx'],
        },
      },
    },
    // Enable compression
    cssCodeSplit: true,
    sourcemap: false, // Disable in production for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  // Mobile-specific optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
});
`;

  return optimizations;
}

/**
 * Create a mobile-specific build script
 */
function createMobileBuildScript() {
  const script = `#!/usr/bin/env node

/**
 * Mobile-optimized build script
 */

import { build } from 'vite';

console.log('📱 Building for mobile optimization...');

async function buildForMobile() {
  try {
    await build({
      mode: 'production',
      build: {
        target: 'es2015',
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Mobile-specific chunking strategy
              if (id.includes('mobile')) return 'mobile';
              if (id.includes('node_modules/react')) return 'react';
              if (id.includes('node_modules')) return 'vendor';
              return 'main';
            },
          },
        },
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
          },
        },
      },
    });

    console.log('✅ Mobile build completed successfully!');
  } catch (error) {
    console.error('❌ Mobile build failed:', error);
    process.exit(1);
  }
}

buildForMobile();
`;

  const scriptPath = path.join(projectRoot, 'scripts', 'build-mobile.js');
  writeFileSync(scriptPath, script);
  console.log('📝 Created mobile build script: scripts/build-mobile.js');
}

// Main execution
async function main() {
  await optimizeBundle();
  createMobileBuildScript();

  console.log('\n🎉 Bundle optimization complete!');
  console.log('Run "npm run build" to test the optimized configuration.');
}

main();
