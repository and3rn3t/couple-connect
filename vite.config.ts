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
        // Enable tree shaking
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        output: {
          // Mobile-optimized chunk splitting
          manualChunks: (id) => {
            // Debug: Log what's being chunked
            if (process.env.VITE_BUILD_ANALYZE) {
              console.log('🔍 Chunking:', id);
            }

            // Log uncaught large files that go to main chunk
            if (id.includes('node_modules') && process.env.VITE_BUILD_ANALYZE) {
              const chunks = id.split('/');
              const packageName = chunks.find((chunk) => chunk.includes('@') || chunk.length > 3);
              console.log('📦 Package:', packageName, '- Size estimate: checking...');
            }

            // Core React libraries - loaded early
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-dom')) {
              if (process.env.VITE_BUILD_ANALYZE) console.log('  → react-vendor');
              return 'react-vendor';
            }

            if (id.includes('react-dom')) {
              if (process.env.VITE_BUILD_ANALYZE) console.log('  → react-dom');
              return 'react-dom';
            }

            // Large UI libraries - separate chunks
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }

            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }

            // Icon libraries - separate chunks for lazy loading
            if (id.includes('@phosphor-icons/react')) {
              return 'icons-phosphor';
            }

            if (id.includes('lucide-react')) {
              return 'icons-lucide';
            }

            // Chart libraries - definitely lazy loaded
            if (id.includes('recharts')) {
              return 'charts-recharts';
            }

            if (id.includes('d3')) {
              return 'charts-d3';
            }

            // Animation libraries - lazy loaded
            if (id.includes('framer-motion')) {
              return 'animations';
            }

            // Database and data libraries
            if (id.includes('dexie') || id.includes('idb')) {
              return 'database';
            }

            // Service worker and PWA libraries
            if (id.includes('workbox') || id.includes('sw-')) {
              return 'pwa';
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
