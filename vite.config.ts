import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = process.env.PROJECT_ROOT || __dirname;

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
      // Optimize build performance
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: process.env.NODE_ENV === 'development',

      // Bundle size optimizations
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Optimize chunk splitting
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom'],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
            ],
            charts: ['recharts', 'd3'],
            utils: ['date-fns', 'clsx', 'tailwind-merge'],
          },
          // Optimize chunk naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name!.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `img/[name]-[hash].${ext}`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
    },

    // Development optimizations
    server: {
      hmr: {
        overlay: false, // Reduce noise in development
      },
    },

    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', '@tanstack/react-query'],
      exclude: [
        // Exclude large dependencies that don't need pre-bundling
      ],
    },
  };
});
