// Database configuration and optimization utilities

// Configuration for database operations
export interface DatabaseConfig {
  // Caching configuration
  enableCaching: boolean;
  cacheTimeout: number; // milliseconds
  maxCacheSize: number;

  // Performance settings
  batchSize: number;
  debounceMs: number;
  enableOptimisticUpdates: boolean;

  // Error handling
  retryAttempts: number;
  retryDelay: number;

  // Storage settings
  storagePrefix: string;
  enableCompression: boolean;
  enableBackgroundSync: boolean;
}

export const DEFAULT_CONFIG: DatabaseConfig = {
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,
  batchSize: 10,
  debounceMs: 300,
  enableOptimisticUpdates: true,
  retryAttempts: 3,
  retryDelay: 1000,
  storagePrefix: 'cc_v2',
  enableCompression: false,
  enableBackgroundSync: true,
};

// Cache implementation
class DatabaseCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  set(key: string, data: unknown, ttl?: number): void {
    if (!this.config.enableCaching) return;

    const actualTtl = ttl || this.config.cacheTimeout;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: actualTtl,
    });

    // Cleanup if cache is too large
    if (this.cache.size > this.config.maxCacheSize) {
      this.cleanup();
    }
  }

  get(key: string): unknown | null {
    if (!this.config.enableCaching) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove expired and oldest entries
    const toRemove = Math.max(
      entries.filter(([, entry]) => now - entry.timestamp > entry.ttl).length,
      this.cache.size - this.config.maxCacheSize
    );

    for (let i = 0; i < toRemove; i++) {
      if (entries[i]) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => this.cleanup(), this.config.cacheTimeout);
  }
}

// Debounce utility for database operations
export function debounce<T extends (...args: never[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeout: number;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(async () => {
        const result = await func(...args);
        resolve(result as Awaited<ReturnType<T>>);
      }, wait);
    });
  };
}

// Retry mechanism for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: DatabaseConfig
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.retryAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error('Operation failed with unknown error');
}

// Optimistic updates helper
export class OptimisticUpdates {
  private pendingUpdates = new Map<string, unknown>();

  apply<T>(key: string, optimisticData: T, actualOperation: () => Promise<T>): Promise<T> {
    // Store the optimistic update
    this.pendingUpdates.set(key, optimisticData);

    // Return optimistic data immediately, then update with real data
    return actualOperation()
      .then((result) => {
        this.pendingUpdates.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingUpdates.delete(key);
        throw error;
      });
  }

  getPending(key: string): unknown | null {
    return this.pendingUpdates.get(key) || null;
  }

  hasPending(key: string): boolean {
    return this.pendingUpdates.has(key);
  }
}

// Error handling utilities
export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: unknown, operation: string): never {
  if (error instanceof Error) {
    throw new DatabaseError(`${operation} failed: ${error.message}`, operation, error);
  }
  throw new DatabaseError(`${operation} failed: Unknown error`, operation);
}

// Export singleton instances
export const databaseCache = new DatabaseCache(DEFAULT_CONFIG);
export const optimisticUpdates = new OptimisticUpdates();

// Configuration update function
let currentConfig = { ...DEFAULT_CONFIG };

export function updateDatabaseConfig(config: Partial<DatabaseConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getDatabaseConfig(): DatabaseConfig {
  return { ...currentConfig };
}
