#!/usr/bin/env node

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
