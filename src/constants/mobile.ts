/**
 * Mobile Constants - Following Apple Human Interface Guidelines
 * Centralized constants for iOS-optimized mobile experience
 * Reference: https://developer.apple.com/design/human-interface-guidelines/
 */

// iOS Breakpoints - Exact device widths for responsive design
export const IOS_BREAKPOINTS = {
  // iPhone SE (3rd gen) and older small devices
  SMALL: 375,
  // iPhone 12 mini, iPhone 13 mini
  SMALL_MAX: 374,
  // iPhone 12, iPhone 13, iPhone 14
  STANDARD: 390,
  STANDARD_MIN: 375,
  STANDARD_MAX: 389,
  // iPhone 12 Pro, iPhone 13 Pro, iPhone 14 Pro
  STANDARD_PLUS: 393,
  STANDARD_PLUS_MIN: 390,
  STANDARD_PLUS_MAX: 427,
  // iPhone 12 Pro Max, iPhone 13 Pro Max, iPhone 14 Pro Max
  LARGE: 428,
  LARGE_MIN: 428,
  // Tablet breakpoint (iPad mini and up)
  TABLET: 768,
  // Desktop breakpoint
  DESKTOP: 1024,
} as const;

// Screen size categories based on device dimensions
export type ScreenSize = 'small' | 'standard' | 'large' | 'tablet' | 'desktop';

// CSS Media Query Breakpoints (for dynamic CSS generation)
export const CSS_BREAKPOINTS = {
  MOBILE_XS: '(max-width: 374px)',
  MOBILE_SM: '(min-width: 375px) and (max-width: 389px)',
  MOBILE_MD: '(min-width: 390px) and (max-width: 427px)',
  MOBILE_LG: '(min-width: 428px) and (max-width: 767px)',
  TABLET: '(min-width: 768px) and (max-width: 1023px)',
  DESKTOP: '(min-width: 1024px)',
} as const;

// Touch Target Sizes (Apple HIG minimum 44pt)
export const IOS_TOUCH_TARGETS = {
  // Minimum touch target (44pt = 44px on 1x displays)
  MINIMUM: 44,
  // Comfortable touch target
  COMFORTABLE: 48,
  // Large touch target for primary actions
  LARGE: 56,
  // Extra large for accessibility
  EXTRA_LARGE: 64,
} as const;

// iOS Layout Dimensions
export const IOS_LAYOUT = {
  // Navigation bar height
  NAV_HEIGHT: 44,
  // Tab bar height (including safe area)
  TAB_BAR_HEIGHT: 83,
  // Status bar height (including Dynamic Island)
  STATUS_BAR_HEIGHT: 44,
  // Modal corner radius
  MODAL_CORNER_RADIUS: 12,
  // Card corner radius
  CARD_CORNER_RADIUS: 8,
  // Button corner radius
  BUTTON_CORNER_RADIUS: 6,
} as const;

// Mobile Spacing System (following 8pt grid)
export const MOBILE_SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 40,
  XXXL: 48,
} as const;

// Mobile Typography Scale
export const MOBILE_TYPOGRAPHY = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 32,
  '4XL': 40,
} as const;

// Haptic Feedback Durations (in milliseconds)
export const HAPTIC_DURATIONS = {
  LIGHT: 10,
  MEDIUM: 20,
  HEAVY: 30,
  SELECTION: 5,
  SUCCESS: 25,
  WARNING: 15,
  ERROR: 35,
} as const;

// Haptic Feedback Patterns (vibration patterns)
export const HAPTIC_PATTERNS = {
  IMPACT: [10, 50, 10],
  NOTIFICATION: [20, 100, 20],
  SUCCESS: [10, 30, 10, 30, 10],
  ERROR: [30, 50, 30, 50, 30],
  HEARTBEAT: [100, 30, 100, 30, 100],
} as const;

// Haptic Feedback Intensities (for future Web Haptics API support)
export const HAPTIC_INTENSITIES = {
  LIGHT: 0.3,
  MEDIUM: 0.6,
  HEAVY: 1.0,
} as const;

// iOS System Colors (Apple Design System)
export const IOS_SYSTEM_COLORS = {
  BLUE: '#007AFF',
  GREEN: '#34C759',
  RED: '#FF3B30',
  ORANGE: '#FF9500',
  YELLOW: '#FFCC00',
  PURPLE: '#AF52DE',
  PINK: '#FF2D92',
  INDIGO: '#5856D6',
  TEAL: '#5AC8FA',
  MINT: '#00C7BE',
  BROWN: '#A2845E',
  GRAY: '#8E8E93',
  GRAY2: '#AEAEB2',
  GRAY3: '#C7C7CC',
  GRAY4: '#D1D1D6',
  GRAY5: '#E5E5EA',
  GRAY6: '#F2F2F7',
} as const;

// Animation Durations (following iOS timing)
export const IOS_ANIMATIONS = {
  // Quick interactions
  FAST: 150,
  // Standard transitions
  STANDARD: 250,
  // Sheet presentations
  SHEET: 350,
  // Page transitions
  PAGE: 500,
  // Loading states
  LOADING: 1000,
} as const;

// Animation Easing Functions (iOS-style cubic bezier)
export const IOS_EASING = {
  // Standard iOS easing
  STANDARD: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  // Emphasis for important actions
  EMPHASIS: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  // Decelerated for natural feel
  DECELERATED: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  // Sharp for quick actions
  SHARP: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
} as const;

// Z-Index Layering System
export const Z_INDEX = {
  // Background elements
  BACKGROUND: -1,
  // Default content
  DEFAULT: 0,
  // Floating elements (FAB, tooltips)
  FLOATING: 10,
  // Sticky headers
  STICKY: 20,
  // Fixed navigation
  FIXED_NAV: 30,
  // Dropdown menus
  DROPDOWN: 40,
  // Modal overlays
  MODAL: 50,
  // Toast notifications
  TOAST: 60,
  // Debug/dev tools
  DEBUG: 9999,
} as const;

// Common Text Content
export const MOBILE_TEXT = {
  LOADING: 'Loading...',
  ERROR: 'Something went wrong',
  RETRY: 'Retry',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add',
  DONE: 'Done',
  BACK: 'Back',
  NEXT: 'Next',
  CLOSE: 'Close',
  UNKNOWN_ISSUE: 'Unknown Issue',
  NO_DUE_DATE: 'No due date',
  EMPTY_STATE: {
    NO_ACTIONS: 'No Actions Yet',
    NO_ACTIONS_DESCRIPTION: 'Start by creating your first action to work on together',
    CREATE_FIRST_ACTION: 'Create First Action',
  },
} as const;

// Status Messages and Notifications
export const NOTIFICATION_MESSAGES = {
  ACTION_COMPLETED: 'Action completed! 🎉',
  ACTION_CREATED: 'Action created successfully',
  ACTION_UPDATED: 'Action updated successfully',
  ACTION_DELETED: 'Action deleted',
  SYNC_SUCCESS: 'Data synced successfully',
  SYNC_ERROR: 'Failed to sync data',
  NETWORK_ERROR: 'Network connection error',
  PERMISSION_DENIED: 'Permission denied',
} as const;

// Action Limits and Constraints
export const ACTION_CONSTRAINTS = {
  MAX_COMPLETED_DISPLAY: 5,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_TITLE_LENGTH: 3,
  TAB_BAR_MAX_ITEMS: 5,
} as const;

// Safe Area CSS Variable Names (for dynamic CSS)
export const SAFE_AREA_VARS = {
  TOP: '--safe-area-top',
  BOTTOM: '--safe-area-bottom',
  LEFT: '--safe-area-left',
  RIGHT: '--safe-area-right',
} as const;

// Touch Gesture Thresholds
export const TOUCH_GESTURES = {
  SWIPE_THRESHOLD: 50, // minimum distance for swipe
  LONG_PRESS_DURATION: 500, // milliseconds
  DOUBLE_TAP_INTERVAL: 300, // milliseconds between taps
  PINCH_THRESHOLD: 0.1, // minimum scale change
} as const;
