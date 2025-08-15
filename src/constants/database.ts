/**
 * Database and storage constants
 */

// Database configuration defaults
export const DATABASE_CONFIG = {
  // Storage keys
  STORAGE_PREFIX: 'cc_v2',

  // Cache settings
  DEFAULT_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  ENABLE_CACHING: true,

  // Performance settings
  BATCH_SIZE: 10,
  DEBOUNCE_MS: 300,
  ENABLE_OPTIMISTIC_UPDATES: true,

  // Retry mechanism
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second

  // Background sync
  ENABLE_BACKGROUND_SYNC: true,
  SYNC_INTERVAL: 30 * 1000, // 30 seconds

  // Compression
  ENABLE_COMPRESSION: false,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  // User data
  CURRENT_PARTNER: 'currentPartner',
  OTHER_PARTNER: 'otherPartner',

  // App data
  ACTIONS: 'actions',
  ISSUES: 'issues',

  // Settings
  NOTIFICATION_SETTINGS: 'notification-settings',
  APP_SETTINGS: 'app-settings',

  // Cache
  CACHE_METADATA: 'cache-metadata',
  LAST_SYNC: 'last-sync',

  // Performance
  PERFORMANCE_METRICS: 'performance-metrics',
} as const;

// Data validation limits
export const DATA_LIMITS = {
  // Text field lengths
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  NOTE_MAX_LENGTH: 1000,

  // Collection sizes
  MAX_ACTIONS_PER_ISSUE: 50,
  MAX_ISSUES_TOTAL: 100,
  MAX_NOTES_PER_ACTION: 10,

  // File sizes (if applicable)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
