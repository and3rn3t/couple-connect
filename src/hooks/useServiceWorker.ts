import { useEffect, useState, useCallback } from 'react';
import {
  swManager,
  type ServiceWorkerStatus,
  type OfflineQueueItem,
} from '@/services/serviceWorkerManager';

// Define types for offline queue data
export interface OfflineActionData {
  title: string;
  description?: string;
  issueId?: string;
  partnerId: string;
  assignedTo?: string;
  assignedToId?: string;
  dueDate?: string;
  status?: string;
  notes?: string[];
  [key: string]: unknown;
}

export interface OfflineIssueData {
  title: string;
  description?: string;
  partnerId: string;
  category?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface OfflineProgressData {
  actionId: string;
  status: string;
  partnerId: string;
  timestamp?: string;
  [key: string]: unknown;
}

export type OfflineQueueData = OfflineActionData | OfflineIssueData | OfflineProgressData;

export interface UseServiceWorkerReturn {
  // Status
  status: ServiceWorkerStatus;
  isOffline: boolean;

  // Update management
  updateAvailable: boolean;
  applyUpdate: () => Promise<void>;

  // Offline queue
  offlineQueue: OfflineQueueItem[];
  addToOfflineQueue: (type: 'action' | 'issue' | 'progress', data: OfflineQueueData) => string;
  triggerSync: () => Promise<void>;

  // Utilities
  cacheUrls: (urls: string[]) => Promise<void>;
  getVersion: () => Promise<string>;
}

/**
 * React hook for service worker functionality
 * Provides offline support, caching, and background sync
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [status, setStatus] = useState<ServiceWorkerStatus>(swManager.getStatus());
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(swManager.isOffline());
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(swManager.getOfflineQueue());

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribeStatus = swManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to update notifications
    const unsubscribeUpdate = swManager.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    // Listen for online/offline changes
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeStatus();
      unsubscribeUpdate();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      await swManager.applyUpdate();
      setUpdateAvailable(false);
      // Reload the page to use the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply service worker update:', error);
      throw error;
    }
  }, []);

  const addToOfflineQueue = useCallback(
    (type: 'action' | 'issue' | 'progress', data: OfflineQueueData) => {
      const id = swManager.addToOfflineQueue(type, data);
      setOfflineQueue(swManager.getOfflineQueue());
      return id;
    },
    []
  );

  const triggerSync = useCallback(async () => {
    try {
      await swManager.triggerBackgroundSync();
    } catch (error) {
      console.error('Failed to trigger background sync:', error);
      throw error;
    }
  }, []);

  const cacheUrls = useCallback(async (urls: string[]) => {
    try {
      await swManager.cacheUrls(urls);
    } catch (error) {
      console.error('Failed to cache URLs:', error);
      throw error;
    }
  }, []);

  const getVersion = useCallback(async () => {
    try {
      return await swManager.getVersion();
    } catch (error) {
      console.error('Failed to get service worker version:', error);
      throw error;
    }
  }, []);

  return {
    status,
    isOffline,
    updateAvailable,
    applyUpdate,
    offlineQueue,
    addToOfflineQueue,
    triggerSync,
    cacheUrls,
    getVersion,
  };
}

/**
 * Hook for offline-first data operations
 * Automatically queues operations when offline
 */
export function useOfflineFirst() {
  const { isOffline, addToOfflineQueue, triggerSync } = useServiceWorker();

  const executeWithOfflineSupport = useCallback(
    async <T>(
      operation: () => Promise<T>,
      fallbackData: T,
      queueType?: 'action' | 'issue' | 'progress',
      queueData?: OfflineQueueData
    ): Promise<T> => {
      if (isOffline) {
        // Add to queue if offline and queue data provided
        if (queueType && queueData) {
          addToOfflineQueue(queueType, queueData);
        }
        return fallbackData;
      }

      try {
        return await operation();
      } catch (error) {
        console.error('Operation failed, might be offline:', error);

        // Check if we're actually offline
        if (!navigator.onLine && queueType && queueData) {
          addToOfflineQueue(queueType, queueData);
        }

        return fallbackData;
      }
    },
    [isOffline, addToOfflineQueue]
  );

  return {
    isOffline,
    executeWithOfflineSupport,
    triggerSync,
  };
}

/**
 * Hook for caching important resources
 * Useful for preloading critical app resources
 */
export function useResourceCaching() {
  const { cacheUrls, status } = useServiceWorker();

  const cacheImportantResources = useCallback(
    async (urls: string[]) => {
      if (!status.active) {
        console.warn('Service worker not active, cannot cache resources');
        return;
      }

      try {
        await cacheUrls(urls);
      } catch (error) {
        console.error('Failed to cache resources:', error);
      }
    },
    [cacheUrls, status.active]
  );

  const preloadCriticalResources = useCallback(async () => {
    const criticalUrls = [
      '/', // App shell
      '/manifest.json',
      // Add other critical resources as needed
    ];

    await cacheImportantResources(criticalUrls);
  }, [cacheImportantResources]);

  return {
    cacheImportantResources,
    preloadCriticalResources,
    canCache: status.active,
  };
}
