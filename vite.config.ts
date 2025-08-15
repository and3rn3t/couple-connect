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
            // Core React - always needed
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react';
            }

            // Router - loaded early
            if (id.includes('react-router-dom')) {
              return 'router';
            }

            // Mobile-specific components - lazy loaded
            if (
              id.includes('mobile-card') ||
              id.includes('mobile-navigation') ||
              id.includes('mobile-forms') ||
              id.includes('mobile-layout') ||
              id.includes('touch-feedback') ||
              id.includes('use-mobile') ||
              id.includes('useMobilePerformance') ||
              id.includes('useHapticFeedback')
            ) {
              return 'mobile';
            }

            // UI library chunks - smaller chunks
            if (id.includes('@radix-ui/react-dialog')) {
              return 'ui-dialog';
            }
            if (id.includes('@radix-ui/react-dropdown')) {
              return 'ui-dropdown';
            }
            if (id.includes('@radix-ui/react-select')) {
              return 'ui-select';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-base';
            }

            // Animation libraries - lazy loaded
            if (id.includes('framer-motion')) {
              return 'animations';
            }

            // Icons - can be lazy loaded
            if (id.includes('@phosphor-icons')) {
              return 'icons';
            }

            // Charts - definitely lazy loaded
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }

            // Utilities - small and commonly used
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }

            // Testing dashboard - lazy loaded
            if (id.includes('MobileTestingDashboard') || id.includes('PerformanceDashboard')) {
              return 'testing';
            }

            // Large vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
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
        'react-router-dom',
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
      ],
    },
  };
});
