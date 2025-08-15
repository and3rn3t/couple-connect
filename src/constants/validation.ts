/**
 * Validation constants
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,

  // Text patterns
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  LETTERS_ONLY: /^[a-zA-Z\s]+$/,
} as const;

// Field length constraints
export const FIELD_LIMITS = {
  // Partner information
  PARTNER_NAME: {
    MIN: 1,
    MAX: 50,
  },

  // Action fields
  ACTION_TITLE: {
    MIN: 3,
    MAX: 100,
  },
  ACTION_DESCRIPTION: {
    MIN: 0,
    MAX: 500,
  },

  // Issue fields
  ISSUE_TITLE: {
    MIN: 3,
    MAX: 100,
  },
  ISSUE_DESCRIPTION: {
    MIN: 0,
    MAX: 1000,
  },

  // General text
  NOTE: {
    MIN: 0,
    MAX: 500,
  },
  COMMENT: {
    MIN: 1,
    MAX: 250,
  },
} as const;

// Password requirements
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,
} as const;

// Date validation
export const DATE_CONSTRAINTS = {
  // How far in advance can due dates be set
  MAX_FUTURE_DAYS: 365,

  // How far back can dates be set
  MAX_PAST_DAYS: 30,

  // Default due date offset
  DEFAULT_DUE_DAYS: 7,
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  TOO_SHORT: 'This field is too short',
  TOO_LONG: 'This field is too long',
  INVALID_DATE: 'Please enter a valid date',
  FUTURE_DATE_REQUIRED: 'Date must be in the future',
  PAST_DATE_NOT_ALLOWED: 'Date cannot be in the past',
} as const;
