module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // Maximum CSS compression for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: [
          'default',
          {
            // Aggressive mobile-optimized compression
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            colormin: true,
            convertValues: {
              length: false, // Preserve px for mobile
              absolute: true,
            },
            reduceIdents: {
              keyframes: false, // Keep animation names
            },
            zindex: false,
            discardUnused: {
              fontFace: true,
              keyframes: true,
              variables: false, // Keep CSS variables
            },
            mergeRules: true,
            mergeLonghand: true,
            calc: { precision: 2 },
            reduceTransforms: true,
            // Additional compression
            minifySelectors: true,
            minifyParams: true,
            normalizeString: true,
            normalizeUrl: true,
            orderedValues: true,
            uniqueSelectors: true,
          },
        ],
      },
    }),
  },
};
