import fs from 'fs';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Disable unused utilities completely
  corePlugins: {
    // Disable animations and transitions (use Framer Motion instead)
    animation: false,
    transitionProperty: false,
    transitionDelay: false,
    transitionDuration: false,
    transitionTimingFunction: false,
    
    // Disable print styles (mobile-first app)
    pageBreakAfter: false,
    pageBreakBefore: false,
    pageBreakInside: false,
    
    // Disable rarely used layout
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
    
    // Disable accessibility features we handle manually
    screenReaders: false,
    
    // Disable backdrop features (use manual CSS)
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    
    // Keep only essential utilities
    display: true,
    flexbox: true,
    gap: true,
    grid: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnStart: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowStart: true,
    gridTemplateColumns: true,
    gridTemplateRows: true,
    justifyContent: true,
    justifyItems: true,
    justifySelf: true,
    alignContent: true,
    alignItems: true,
    alignSelf: true,
    
    // Essential spacing
    margin: true,
    padding: true,
    space: true,
    
    // Essential sizing
    width: true,
    minWidth: true,
    maxWidth: true,
    height: true,
    minHeight: true,
    maxHeight: true,
    
    // Essential colors
    textColor: true,
    backgroundColor: true,
    borderColor: true,
    
    // Essential borders
    borderRadius: true,
    borderWidth: true,
    borderStyle: true,
    
    // Essential typography
    fontSize: true,
    fontWeight: true,
    lineHeight: true,
    textAlign: true,
    
    // Essential positioning
    position: true,
    inset: true,
    top: true,
    right: true,
    bottom: true,
    left: true,
    zIndex: true,
    
    // Essential overflow
    overflow: true,
    overflowX: true,
    overflowY: true,
    
    // Essential visibility
    visibility: true,
    opacity: true,
    
    // Essential shadows (minimal)
    boxShadow: true,
    
    // Essential transforms (minimal)
    transform: true,
    scale: true,
    rotate: true,
    translate: true,
  },
  
  theme: {
    // Minimal responsive breakpoints
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
    },
    
    // Minimal color palette
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      
      // Only essential grays
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      
      // Only essential blues
      blue: {
        500: '#3b82f6',
        600: '#2563eb',
      },
      
      // Only essential reds
      red: {
        500: '#ef4444',
        600: '#dc2626',
      },
      
      // Only essential greens
      green: {
        500: '#10b981',
        600: '#059669',
      },
    },
    
    // Minimal spacing scale
    spacing: {
      '0': '0px',
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
      '40': '10rem',
      '48': '12rem',
      '56': '14rem',
      '64': '16rem',
    },
    
    // Minimal font sizes
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    
    // Minimal border radius
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      'DEFAULT': '0.25rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      'full': '9999px',
    },
  },
  
  plugins: [
    // Only essential mobile utilities
    function ({ addUtilities }) {
      addUtilities({
        '.touch-target-44': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.ios-touch-feedback': {
          'transition': 'transform 0.1s ease-out',
          '&:active': {
            'transform': 'scale(0.97)',
          },
        },
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      });
    },
  ],
};