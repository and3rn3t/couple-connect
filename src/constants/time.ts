/**
 * Time-related constants
 */

// Time conversion constants
export const TIME = {
  // Milliseconds conversions
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 1000 * 60,
  MS_PER_HOUR: 1000 * 60 * 60,
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  MS_PER_WEEK: 1000 * 60 * 60 * 24 * 7,

  // Hours conversions
  HOURS_PER_DAY: 24,

  // Days conversions
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30, // Approximate
  DAYS_PER_YEAR: 365, // Approximate
} as const;

// Common timeout and interval values
export const TIMEOUTS = {
  // API timeouts
  API_TIMEOUT: 30000, // 30 seconds

  // UI debounce/throttle
  INPUT_DEBOUNCE: 300,
  SEARCH_DEBOUNCE: 500,

  // Auto-save intervals
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds

  // Animation durations
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,

  // Toast durations
  TOAST_SHORT: 3000,
  TOAST_NORMAL: 5000,
  TOAST_LONG: 8000,
} as const;

// Date/time formatting
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'MMM DD, YYYY',
  FULL_DATE: 'MMMM DD, YYYY',
  TIME_12H: 'h:mm A',
  TIME_24H: 'HH:mm',
  DATETIME: 'MMM DD, YYYY h:mm A',
} as const;
