// Mobile-optimized Tailwind config
// Reduces CSS bundle size by limiting variants and utilities

module.exports = {
  // Limit which utilities are generated to reduce CSS size
  corePlugins: {
    // Disable utilities not commonly needed for mobile
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,

    // Disable complex layout utilities
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,

    // Disable rarely used utilities
    scrollSnapAlign: false,
    scrollSnapStop: false,
    scrollSnapType: false,

    // Keep mobile-essential utilities
    display: true,
    flexbox: true,
    grid: true,
    spacing: true,
    colors: true,
    borderRadius: true,
    fontSize: true,
    fontWeight: true,
    textAlign: true,
    textColor: true,
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

  // Reduce variants to only what's needed for mobile
  variants: {
    extend: {
      // Limit to essential interactive states
      backgroundColor: ['hover', 'focus', 'active'],
      textColor: ['hover', 'focus'],
      borderColor: ['hover', 'focus'],
      opacity: ['hover', 'focus', 'disabled'],
      scale: ['hover', 'active'],

      // Mobile-specific variants
      display: ['mobile-xs', 'mobile-sm', 'mobile-md', 'mobile-lg'],
      padding: ['mobile-xs', 'mobile-sm', 'mobile-md', 'mobile-lg'],
      margin: ['mobile-xs', 'mobile-sm', 'mobile-md', 'mobile-lg'],
    },
  },
};
