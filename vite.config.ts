import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Build configuration constants
const BUILD_CONSTANTS = {
  CHUNK_SIZE_WARNING_LIMIT: 1000, // KB
  DEFAULT_CHUNK_NAME: 'chunk',
} as const;

// File extension patterns for asset organization
const ASSET_PATTERNS = {
  IMAGES: /png|jpe?g|svg|gif|tiff|bmp|ico/i,
  FONTS: /woff2?|eot|ttf|otf/i,
} as const;

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    // Load environment files from .env folder
    envDir: resolve(__dirname, '.env'),

    plugins: [
      react(),
      tailwindcss(),
      // Bundle analyzer - only in analyze mode
      ...(process.env.VITE_BUILD_ANALYZE
        ? [
            visualizer({
              filename: 'dist/bundle-analysis.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src'),
      },
    },
    build: {
      // Mobile-optimized build target
      target: 'es2015', // Better mobile compatibility
      minify: 'terser', // Better compression than esbuild
      sourcemap: process.env.NODE_ENV === 'development',

      // Bundle size optimizations for mobile
      chunkSizeWarningLimit: 500, // Stricter limit for mobile

      // Terser options for mobile optimization
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
      },

      rollupOptions: {
        // Explicit input specification to fix script injection
        input: resolve(__dirname, 'index.html'),

        // Enable tree shaking
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        output: {
          // Optimized chunk splitting to reduce large chunks
          manualChunks: (id) => {
            // Debug: Log what's being chunked
            if (process.env.VITE_BUILD_ANALYZE) {
              console.log('🔍 Chunking:', id);
            }

            // Vendor libraries first - most important for caching
            if (id.includes('node_modules')) {
              // Core React libraries - keep together for performance
              if (id.includes('react-dom')) {
                return 'vendor-react-dom';
              }
              if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-hook-form')) {
                return 'vendor-react';
              }

              // Large UI libraries - separate for better caching
              if (id.includes('@radix-ui')) {
                return 'vendor-radix-ui';
              }

              // State management and data fetching
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-react-query';
              }

              // Icon libraries - lazy loaded separately
              if (id.includes('@phosphor-icons') || id.includes('lucide-react') || id.includes('@heroicons')) {
                return 'vendor-icons';
              }

              // Chart and visualization libraries - should be lazy loaded
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }

              // Animation libraries - lazy loaded
              if (id.includes('framer-motion')) {
                return 'vendor-animations';
              }

              // Form handling
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'vendor-forms';
              }

              // Utility libraries
              if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-utils';
              }

              // Remaining smaller vendor packages
              return 'vendor-misc';
            }

            // Application code chunking
            // Mobile components
            if (id.includes('/components/Mobile') || id.includes('/mobile')) {
              return 'app-mobile';
            }

            // Large components that should be lazy loaded
            if (id.includes('/components/MindmapView') || 
                id.includes('/components/GamificationCenter') ||
                id.includes('/components/PerformanceDashboard')) {
              return 'app-heavy-components';
            }

            // Hook libraries
            if (id.includes('/hooks/')) {
              return 'app-hooks';
            }

            // Services and utilities
            if (id.includes('/services/') || id.includes('/utils/')) {
              return 'app-services';
            }

            // Testing and development libraries (should not be in production)
            if (
              id.includes('@testing-library') ||
              id.includes('vitest') ||
              id.includes('playwright')
            ) {
              return 'testing';
            }

            // Utilities and date libraries
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }

            // CSS and styling libraries
            if (
              id.includes('tailwindcss') ||
              id.includes('@tailwindcss') ||
              id.includes('postcss')
            ) {
              return 'css-tools';
            }

            // Generic large node_modules - catch remaining vendor code
            if (id.includes('node_modules')) {
              // Split large libraries into separate chunks
              if (id.includes('lodash') || id.includes('moment') || id.includes('axios')) {
                return 'vendor-large';
              }

              // Generic vendor chunk for smaller libraries
              return 'vendor';
            }

            // App components that can be chunked separately
            if (id.includes('/src/components/') && !id.includes('node_modules')) {
              // Partner and relationship components
              if (id.includes('Partner') || id.includes('Relationship')) {
                return 'app-partner';
              }

              // Gamification and rewards
              if (
                id.includes('Gamification') ||
                id.includes('Reward') ||
                id.includes('Challenge')
              ) {
                return 'app-gamification';
              }

              // Notification system
              if (id.includes('Notification')) {
                return 'app-notifications';
              }

              // Charts and progress components
              if (id.includes('Chart') || id.includes('Progress') || id.includes('Mindmap')) {
                return 'app-charts';
              }

              // Mobile-specific components
              if (id.includes('Mobile') || id.includes('mobile')) {
                return 'app-mobile';
              }

              // Testing and development components
              if (id.includes('Test') || id.includes('Performance') || id.includes('Dashboard')) {
                return 'app-dev';
              }

              // Action and dialog components
              if (id.includes('Action') || id.includes('Dialog')) {
                return 'app-actions';
              }

              // UI components (shared)
              if (id.includes('/ui/')) {
                return 'app-ui';
              }

              // Default app components
              return 'app-components';
            }

            // Services and hooks
            if (id.includes('/src/services/') || id.includes('/src/hooks/')) {
              return 'app-core';
            }

            // Utilities
            if (id.includes('/src/utils/')) {
              return 'app-utils';
            }

            // All other vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }

            // Main app entry and remaining files
            return 'main';
          },
          // Optimize chunk naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
              : BUILD_CONSTANTS.DEFAULT_CHUNK_NAME;
            return `js/${facadeModuleId}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name!.split('.');
            const ext = info[info.length - 1];
            if (ASSET_PATTERNS.IMAGES.test(ext)) {
              return `img/[name]-[hash].${ext}`;
            }
            if (ASSET_PATTERNS.FONTS.test(ext)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
    },

    // CSS optimization
    css: {
      postcss: './postcss.config.cjs',
      devSourcemap: true,
    },

    // Development optimizations
    server: {
      hmr: {
        overlay: false, // Reduce noise in development
      },
    },

    // Mobile-optimized dependency pre-bundling
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion',
        '@tanstack/react-query',
        // Pre-bundle commonly used mobile utilities
        'clsx',
        'date-fns',
      ],
      exclude: [
        // Exclude mobile-specific components from pre-bundling
        // to enable better code splitting
        '@/components/ui/mobile-card',
        '@/components/ui/mobile-navigation',
        '@/components/ui/mobile-forms',
        // Exclude analysis and testing utilities from build
        '@/scripts/analyze-css',
        '@/scripts/mobile-performance',
        // Exclude large development-only utilities
        '@/components/MobileTestingDashboard',
        '@/components/PerformanceDashboard',
      ],
    },
  };
});
