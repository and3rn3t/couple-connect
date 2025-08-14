/**
 * UI-related constants
 */

// Component sizing
export const UI_SIZES = {
  // Icon sizes
  ICON_XS: 12,
  ICON_SM: 14,
  ICON_MD: 16,
  ICON_LG: 20,
  ICON_XL: 24,

  // Badge dimensions
  BADGE_HEIGHT: 20,
  BADGE_WIDTH: 20,

  // Avatar sizes
  AVATAR_SM: 32,
  AVATAR_MD: 40,
  AVATAR_LG: 48,
  AVATAR_XL: 64,

  // Button heights
  BUTTON_SM: 32,
  BUTTON_MD: 40,
  BUTTON_LG: 48,
} as const;

// Layout dimensions
export const LAYOUT = {
  // Sidebar
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 60,

  // Header
  HEADER_HEIGHT: 64,

  // Content spacing
  CONTENT_PADDING: 24,
  SECTION_SPACING: 32,

  // Breakpoints (matching Tailwind)
  MOBILE_MAX: 768,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025,
} as const;

// Modal and dialog sizes
export const DIALOG_SIZES = {
  // Width constraints
  SM_MAX_WIDTH: '24rem', // 384px
  MD_MAX_WIDTH: '32rem', // 512px
  LG_MAX_WIDTH: '48rem', // 768px
  XL_MAX_WIDTH: '56rem', // 896px

  // Height constraints
  MAX_HEIGHT: '80vh',
  MOBILE_MAX_HEIGHT: '90vh',
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Animation easing
export const ANIMATIONS = {
  EASING: {
    EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  SPRING: {
    BOUNCY: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SOFT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// Common CSS values
export const CSS_VALUES = {
  BORDER_RADIUS: {
    SM: '0.375rem',
    MD: '0.5rem',
    LG: '0.75rem',
    FULL: '9999px',
  },
  SHADOW: {
    SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    MD: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    LG: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const;
