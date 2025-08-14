/**
 * Performance monitoring constants
 */

// Performance metrics limits
export const PERFORMANCE_LIMITS = {
  // Maximum metrics to store in memory
  MAX_METRICS: 1000,

  // Time windows for analysis
  ANALYSIS_WINDOW_24H: 24 * 60 * 60 * 1000, // 24 hours
  ANALYSIS_WINDOW_1H: 60 * 60 * 1000, // 1 hour

  // Performance thresholds
  SLOW_OPERATION_THRESHOLD: 500, // ms
  VERY_SLOW_OPERATION_THRESHOLD: 1000, // ms

  // Reporting limits
  MAX_SLOW_OPERATIONS_SHOWN: 10,
  MAX_OPERATION_TYPES_TRACKED: 50,
} as const;

// Cache performance targets
export const CACHE_TARGETS = {
  // Target cache hit rates
  MINIMUM_HIT_RATE: 0.8, // 80%
  OPTIMAL_HIT_RATE: 0.95, // 95%

  // Success rate targets
  MINIMUM_SUCCESS_RATE: 0.95, // 95%
  OPTIMAL_SUCCESS_RATE: 0.99, // 99%
} as const;

// Performance monitoring intervals
export const MONITORING_INTERVALS = {
  // How often to clean up old metrics
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour

  // How often to log performance reports
  REPORT_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours

  // How long to keep metrics
  METRICS_RETENTION: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Build and bundle performance
export const BUILD_PERFORMANCE = {
  // Build time targets
  FAST_BUILD_THRESHOLD: 10000, // 10 seconds
  SLOW_BUILD_THRESHOLD: 30000, // 30 seconds

  // Bundle size targets
  CHUNK_SIZE_WARNING: 1000, // KB
  TOTAL_SIZE_WARNING: 5000, // KB

  // Dependency limits
  MAX_DEPENDENCIES_WARNING: 50,
} as const;
