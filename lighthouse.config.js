module.exports = {
  ci: {
    collect: {
      // Use deployed URL in CI, localhost for local development
      url: process.env.CI ? [
        'https://couple-connect.pages.dev',
        'https://couple-connect.pages.dev/dashboard',
        'https://couple-connect.pages.dev/actions',
      ] : [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/actions',
      ],
      // Only start server for local development
      startServerCommand: process.env.CI ? undefined : 'npm run preview',
      startServerReadyPattern: process.env.CI ? undefined : 'Local:',
      startServerReadyTimeout: process.env.CI ? undefined : 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.7 }],

        // Core Web Vitals
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],

        // Mobile-specific metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        interactive: ['warn', { maxNumericValue: 3800 }],

        // PWA requirements
        'installable-manifest': 'error',
        'service-worker': 'warn',
        'works-offline': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',

        // Performance budget
        'resource-summary:script:size': ['warn', { maxNumericValue: 800000 }], // 800KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 250000 }], // 250KB CSS
        'resource-summary:total:size': ['warn', { maxNumericValue: 1500000 }], // 1.5MB total
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      host: 'localhost',
    },
  },
};
