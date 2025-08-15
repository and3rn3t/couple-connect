/**
 * Notification-related constants
 */

// Default notification settings
export const NOTIFICATION_DEFAULTS = {
  ENABLED: true,
  OVERDUE_REMINDERS: true,
  DEADLINE_WARNINGS: true,
  PARTNER_UPDATES: true,
  WARNING_DAYS: 3,
  BROWSER_NOTIFICATIONS: false,
} as const;

// Notification timing
export const NOTIFICATION_TIMING = {
  // How often to check for new notifications (in ms)
  CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // How long to keep completed action notifications
  CLEANUP_AFTER_HOURS: 24,

  // Minimum time between notifications of same type
  DUPLICATE_THRESHOLD_HOURS: 1,

  // Maximum age for partner completion notifications
  MAX_COMPLETION_AGE_HOURS: 24,
} as const;

// Notification display limits
export const NOTIFICATION_LIMITS = {
  MAX_UNREAD_DISPLAY: 9, // Show "9+" for counts > 9
  MAX_NOTIFICATIONS_STORED: 100,
  MAX_NOTIFICATIONS_DISPLAYED: 50,
} as const;

// Warning day options
export const WARNING_DAY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
] as const;

// Notification priority levels
export const NOTIFICATION_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  OVERDUE: 'overdue',
  DEADLINE_SOON: 'deadline-soon',
  PARTNER_COMPLETED: 'partner-completed',
} as const;
