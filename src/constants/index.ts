/**
 * Application Constants - Central Hub
 *
 * This project uses a LOCAL CONSTANTS approach for better maintainability:
 *
 * ✅ RECOMMENDED APPROACH (Currently Used):
 * - Each component defines its own constants locally
 * - Avoids circular dependencies
 * - Keeps constants close to where they're used
 * - Easier to understand and maintain
 *
 * Examples:
 * - App.tsx has APP_CONFIG and ICON_SIZES
 * - GamificationCenter.tsx has ACHIEVEMENT_POINTS and ACHIEVEMENT_THRESHOLDS
 * - ProgressView.tsx has HEALTH_CONSTANTS
 * - NotificationCenter.tsx has NOTIFICATION_DEFAULTS and TIME_CONSTANTS
 *
 * Individual constants files (database.ts, ui.ts, etc.) exist for reference
 * but are not actively used to avoid complexity.
 *
 * This approach provides:
 * - Zero circular dependency issues
 * - Clear code locality
 * - Easy refactoring
 * - Type safety with 'as const'
 */

// If you need to import shared constants, you can import directly from individual files:
// import { TIME } from './time';
// import { UI_SIZES } from './ui';

export {}; // Make this a module
