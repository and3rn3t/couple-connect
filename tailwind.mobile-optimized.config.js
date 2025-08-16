import fs from 'fs';

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
