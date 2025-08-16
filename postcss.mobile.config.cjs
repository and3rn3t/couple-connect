module.exports = {
  plugins: {
    tailwindcss: {
      config: process.env.TAILWIND_CONFIG || './tailwind.config.js',
    },
    autoprefixer: {},
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: [
          'advanced',
          {
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
          },
        ],
      },
      '@fullhuman/postcss-purgecss': {
        content: ['./dist/**/*.html', './dist/**/*.js'],
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: [
            // Keep essential utility classes
            /^(flex|grid|block|hidden|relative|absolute|fixed)$/,
            /^(w-|h-|p-|m-|text-|bg-|border-)\w+/,
            /^(hover|focus|active|disabled):/,
            // Keep mobile-specific classes
            /^(mobile|touch|ios|safe-)\w+/,
          ],
          deep: [
            // Keep data attributes and component classes
            /data-\w+/,
            /\[data-\w+\]/,
          ],
        },
      },
    }),
  },
};
