/**
 * 💾 Cloudflare Cache Service
 * Making love data load faster than lightning! ⚡💕
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Serve stale data while fetching fresh
  namespace?: string; // Cache namespace for organization
  tags?: string[]; // Cache tags for bulk invalidation
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

export interface RelationshipCacheKeys {
  coupleProfile: (coupleId: string) => string;
  dailyActions: (coupleId: string, date: string) => string;
  achievements: (coupleId: string) => string;
  relationshipHealth: (coupleId: string) => string;
  weeklyProgress: (coupleId: string, week: string) => string;
  userPreferences: (userId: string) => string;
}

/**
 * 🎯 Cache key generators for relationship data
 */
export const RELATIONSHIP_CACHE_KEYS: RelationshipCacheKeys = {
  coupleProfile: (coupleId: string) => `couple:${coupleId}:profile`,
  dailyActions: (coupleId: string, date: string) => `couple:${coupleId}:actions:${date}`,
  achievements: (coupleId: string) => `couple:${coupleId}:achievements`,
  relationshipHealth: (coupleId: string) => `couple:${coupleId}:health`,
  weeklyProgress: (coupleId: string, week: string) => `couple:${coupleId}:progress:${week}`,
  userPreferences: (userId: string) => `user:${userId}:preferences`,
};

export class CloudflareCacheService {
  private readonly defaultTtl = 3600; // 1 hour
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly maxMemoryCacheSize = 100;

  constructor(private cacheNamespace: string = 'couple-connect') {}

  /**
   * 💕 Get cached relationship data
   * @param key Cache key
   * @param options Cache options
   * @returns Cached data or null
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      // First, try memory cache for frequently accessed data
      const memoryResult = this.getFromMemory<T>(fullKey);
      if (memoryResult !== null) {
        return memoryResult;
      }

      // Then try browser cache (Cache API)
      const browserResult = await this.getFromBrowserCache<T>(fullKey);
      if (browserResult !== null) {
        // Store in memory for faster subsequent access
        this.setInMemory(fullKey, browserResult, options.ttl || this.defaultTtl);
        return browserResult;
      }

      // Finally, try localStorage as fallback
      const localResult = this.getFromLocalStorage<T>(fullKey);
      if (localResult !== null) {
        // Store in higher-level caches
        await this.setInBrowserCache(fullKey, localResult, options.ttl || this.defaultTtl);
        this.setInMemory(fullKey, localResult, options.ttl || this.defaultTtl);
        return localResult;
      }

      return null;
    } catch (error) {
      console.warn('💔 Cache get error:', error);
      return null;
    }
  }

  /**
   * 🌟 Set cached relationship data
   * @param key Cache key
   * @param data Data to cache
   * @param options Cache options
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTtl;

    try {
      // Store in all cache layers
      this.setInMemory(fullKey, data, ttl, options.tags);
      await this.setInBrowserCache(fullKey, data, ttl, options.tags);
      this.setInLocalStorage(fullKey, data, ttl, options.tags);
    } catch (error) {
      console.warn('💔 Cache set error:', error);
    }
  }

  /**
   * 🔄 Get data with automatic cache-aside pattern
   * @param key Cache key
   * @param fetcher Function to fetch fresh data
   * @param options Cache options
   * @returns Cached or fresh data
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache the fresh data
    await this.set(key, fresh, options);

    return fresh;
  }

  /**
   * 🎯 Invalidate specific cache entries
   * @param key Cache key or pattern
   * @param options Invalidation options
   */
  async invalidate(
    key: string,
    options: { namespace?: string; pattern?: boolean } = {}
  ): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);

    try {
      if (options.pattern) {
        // Pattern-based invalidation
        await this.invalidatePattern(fullKey);
      } else {
        // Single key invalidation
        this.memoryCache.delete(fullKey);
        localStorage.removeItem(fullKey);

        if ('caches' in window) {
          const cache = await caches.open(this.cacheNamespace);
          await cache.delete(this.createCacheRequest(fullKey));
        }
      }
    } catch (error) {
      console.warn('💔 Cache invalidation error:', error);
    }
  }

  /**
   * 🏷️ Invalidate cache entries by tags
   * @param tags Tags to invalidate
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      // Memory cache invalidation by tags
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }

      // localStorage invalidation by tags (scan all keys)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.cacheNamespace)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item) as CacheEntry;
              if (parsed.tags && parsed.tags.some((tag) => tags.includes(tag))) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Browser cache invalidation would require more complex implementation
      // For now, we'll clear the entire cache when tags are used
      if ('caches' in window) {
        await caches.delete(this.cacheNamespace);
      }
    } catch (error) {
      console.warn('💔 Cache tag invalidation error:', error);
    }
  }

  /**
   * 🧹 Clear all caches
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();

      // Clear localStorage entries for this namespace
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.cacheNamespace)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear browser cache
      if ('caches' in window) {
        await caches.delete(this.cacheNamespace);
      }
    } catch (error) {
      console.warn('💔 Cache clear error:', error);
    }
  }

  /**
   * 📊 Get cache statistics
   * @returns Cache usage statistics
   */
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const memoryEntries = Array.from(this.memoryCache.values());
    const timestamps = memoryEntries.map((entry) => entry.timestamp);

    return {
      memorySize: this.memoryCache.size,
      localStorageSize: this.getLocalStorageSize(),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  /**
   * 🛠️ Private helper methods
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.cacheNamespace;
    return `${ns}:${key}`;
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setInMemory<T>(key: string, data: T, ttl: number, tags?: string[]): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    });
  }

  private async getFromBrowserCache<T>(key: string): Promise<T | null> {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open(this.cacheNamespace);
      const request = this.createCacheRequest(key);
      const response = await cache.match(request);

      if (!response) return null;

      const data = await response.json();
      const cacheControl = response.headers.get('cache-control');

      // Check if expired
      if (cacheControl && this.isCacheExpired(response)) {
        await cache.delete(request);
        return null;
      }

      return data as T;
    } catch {
      return null;
    }
  }

  private async setInBrowserCache<T>(
    key: string,
    data: T,
    ttl: number,
    tags?: string[]
  ): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(this.cacheNamespace);
      const request = this.createCacheRequest(key);

      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${ttl}`,
          'X-Cached-At': Date.now().toString(),
          'X-Cache-Tags': tags ? tags.join(',') : '',
        },
      });

      await cache.put(request, response);
    } catch (error) {
      console.warn('💔 Browser cache set error:', error);
    }
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<T>;
      const now = Date.now();

      if (now > entry.timestamp + entry.ttl * 1000) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  private setInLocalStorage<T>(key: string, data: T, ttl: number, tags?: string[]): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded error gracefully
      console.warn('💔 localStorage quota exceeded:', error);
    }
  }

  private createCacheRequest(key: string): Request {
    return new Request(`https://cache.local/${key}`);
  }

  private isCacheExpired(response: Response): boolean {
    const cachedAt = response.headers.get('X-Cached-At');
    const cacheControl = response.headers.get('Cache-Control');

    if (!cachedAt || !cacheControl) return true;

    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (!maxAgeMatch) return true;

    const maxAge = parseInt(maxAgeMatch[1]) * 1000;
    const age = Date.now() - parseInt(cachedAt);

    return age > maxAge;
  }

  private async invalidatePattern(pattern: string): Promise<void> {
    // Memory cache pattern invalidation
    const keysToDelete = Array.from(this.memoryCache.keys()).filter((key) => key.includes(pattern));
    keysToDelete.forEach((key) => this.memoryCache.delete(key));

    // localStorage pattern invalidation
    const localKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(pattern)) {
        localKeysToRemove.push(key);
      }
    }
    localKeysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  private getLocalStorageSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.cacheNamespace)) {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size;
  }
}

/**
 * 🌟 Default cache service instance
 */
export const cacheService = new CloudflareCacheService('couple-connect');

/**
 * 💕 React hook for cached relationship data
 * @param key Cache key
 * @param fetcher Data fetcher function
 * @param options Cache options
 * @returns Cached data, loading state, and refresh function
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = React.useCallback(async () => {
    if (options.enabled === false) return;

    try {
      setLoading(true);
      setError(null);

      const result = await cacheService.getOrFetch(key, fetcher, options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate: () => cacheService.invalidate(key),
  };
}

/**
 * 💝 Example usage:
 *
 * ```tsx
 * import { useCachedData, RELATIONSHIP_CACHE_KEYS } from '@/services/cloudflareCache';
 *
 * function CoupleProfile({ coupleId }: { coupleId: string }) {
 *   const { data: couple, loading, refresh } = useCachedData(
 *     RELATIONSHIP_CACHE_KEYS.coupleProfile(coupleId),
 *     () => fetchCoupleData(coupleId),
 *     { ttl: 1800, tags: ['couple', 'profile'] }
 *   );
 *
 *   if (loading) return <div>Loading love data... 💕</div>;
 *
 *   return (
 *     <div>
 *       <h1>{couple?.name1} & {couple?.name2}</h1>
 *       <button onClick={refresh}>Refresh 🔄</button>
 *     </div>
 *   );
 * }
 * ```
 */

// Need React import for the hook
import React from 'react';
