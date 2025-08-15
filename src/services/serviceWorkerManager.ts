/**
 * Service Worker Manager
 * Handles registration, updates, and communication with the service worker
 */

// Extend ServiceWorkerRegistration to include sync (experimental API)
interface _ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
}

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  error?: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'action' | 'issue' | 'progress';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCallbacks: Array<(registration: ServiceWorkerRegistration) => void> = [];
  private statusCallbacks: Array<(status: ServiceWorkerStatus) => void> = [];
  private offlineQueue: OfflineQueueItem[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SWManager] Service Worker not supported');
      this.notifyStatusChange({
        supported: false,
        registered: false,
        installing: false,
        waiting: false,
        active: false,
        error: 'Service Worker not supported',
      });
      return;
    }

    try {
      await this.register();
      this.setupMessageListener();
      this.setupOnlineListener();
    } catch (error) {
      console.error('[SWManager] Initialization failed:', error);
      this.notifyStatusChange({
        supported: true,
        registered: false,
        installing: false,
        waiting: false,
        active: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async register() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SWManager] Registering service worker...');
      }

      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      if (process.env.NODE_ENV === 'development') {
        console.warn('[SWManager] Service worker registered successfully');
      }

      // Handle different states
      this.registration.addEventListener('updatefound', () => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SWManager] Service worker update found');
        }
        this.handleUpdateFound();
      });

      // Check for existing service worker
      if (this.registration.active) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SWManager] Service worker already active');
        }
        this.notifyStatusChange(this.getCurrentStatus());
      }

      if (this.registration.waiting) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SWManager] Service worker waiting');
        }
        this.notifyUpdateAvailable();
      }

      return this.registration;
    } catch (error) {
      console.error('[SWManager] Service worker registration failed:', error);
      throw error;
    }
  }
  private handleUpdateFound() {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    this.notifyStatusChange(this.getCurrentStatus());

    newWorker.addEventListener('statechange', () => {
      console.warn('[SWManager] Service worker state changed:', newWorker.state);

      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.warn('[SWManager] New service worker installed, update available');
          this.notifyUpdateAvailable();
        } else {
          // First install
          console.warn('[SWManager] Service worker installed for the first time');
        }
      }

      this.notifyStatusChange(this.getCurrentStatus());
    });
  }

  private setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'CACHE_UPDATED':
          if (process.env.NODE_ENV === 'development') {
            console.warn('[SWManager] Cache updated for:', data.url);
          }
          break;
        case 'OFFLINE_QUEUE_PROCESSED':
          if (process.env.NODE_ENV === 'development') {
            console.warn('[SWManager] Offline queue processed:', data.count);
          }
          break;
        default:
          console.warn('[SWManager] Unknown message from service worker:', type);
      }
    });
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SWManager] Back online, triggering background sync');
      }
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SWManager] Gone offline');
      }
    });
  }

  private getCurrentStatus(): ServiceWorkerStatus {
    if (!this.registration) {
      return {
        supported: 'serviceWorker' in navigator,
        registered: false,
        installing: false,
        waiting: false,
        active: false,
      };
    }

    return {
      supported: true,
      registered: true,
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting,
      active: !!this.registration.active,
    };
  }

  private notifyStatusChange(status: ServiceWorkerStatus) {
    this.statusCallbacks.forEach((callback) => callback(status));
  }

  private notifyUpdateAvailable() {
    this.updateCallbacks.forEach((callback) => {
      if (this.registration) {
        callback(this.registration);
      }
    });
  }

  // Public API

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    return this.getCurrentStatus();
  }

  /**
   * Listen for status changes
   */
  onStatusChange(callback: (status: ServiceWorkerStatus) => void) {
    this.statusCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Listen for service worker updates
   */
  onUpdateAvailable(callback: (registration: ServiceWorkerRegistration) => void) {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Apply waiting service worker update
   */
  async applyUpdate() {
    if (!this.registration?.waiting) {
      throw new Error('No service worker update available');
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Wait for the new service worker to be active
    return new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
      });
    });
  }

  /**
   * Cache specific URLs
   */
  async cacheUrls(urls: string[]) {
    if (!this.registration?.active) {
      throw new Error('No active service worker');
    }

    this.registration.active.postMessage({
      type: 'CACHE_URLS',
      data: { urls },
    });
  }

  /**
   * Add item to offline queue
   */
  addToOfflineQueue(type: 'action' | 'issue' | 'progress', data: Record<string, unknown>): string {
    const item: OfflineQueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.offlineQueue.push(item);

    // Store in localStorage as backup
    this.saveOfflineQueue();

    if (process.env.NODE_ENV === 'development') {
      console.warn('[SWManager] Added to offline queue:', item.id);
    }
    return item.id;
  }

  /**
   * Trigger background sync
   */
  async triggerBackgroundSync() {
    // Note: Background Sync API has limited browser support
    // This is a graceful fallback approach
    try {
      // Check if background sync is supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await Promise.all([
          (this.registration as _ServiceWorkerRegistrationWithSync)?.sync?.register('sync-actions'),
          (this.registration as _ServiceWorkerRegistrationWithSync)?.sync?.register('sync-issues'),
          (this.registration as _ServiceWorkerRegistrationWithSync)?.sync?.register(
            'sync-progress'
          ),
        ]);
      } else {
        console.warn('[SWManager] Background sync not supported, using alternative approach');
        // Fallback: trigger immediate sync attempt
        this.processOfflineQueueImmediately();
      }
    } catch (error) {
      console.error('[SWManager] Failed to register background sync:', error);
    }
  }

  private async processOfflineQueueImmediately() {
    // Immediate processing fallback for browsers without background sync
    try {
      const queue = this.getOfflineQueue();
      if (queue.length === 0) return;

      // Process each item in the queue
      for (const item of queue) {
        try {
          // This would integrate with your actual API calls
          await this.syncQueueItem(item);
          this.removeFromOfflineQueue(item.id);
        } catch (error) {
          console.error('[SWManager] Failed to sync queue item:', item.id, error);
        }
      }
    } catch (error) {
      console.error('[SWManager] Failed to process offline queue:', error);
    }
  }

  private async syncQueueItem(item: OfflineQueueItem) {
    // This would contain the actual sync logic for each item type
    // For now, it's a placeholder that would integrate with your API
    console.warn('[SWManager] Syncing item:', item.type, item.id);

    // Example sync logic:
    // switch (item.type) {
    //   case 'action':
    //     return await this.syncAction(item.data);
    //   case 'issue':
    //     return await this.syncIssue(item.data);
    //   case 'progress':
    //     return await this.syncProgress(item.data);
    // }
  } /**
   * Check if app is offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get offline queue items
   */
  getOfflineQueue(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  /**
   * Clear offline queue (when items are successfully synced)
   */
  clearOfflineQueue() {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  /**
   * Remove specific item from offline queue
   */
  removeFromOfflineQueue(id: string) {
    const index = this.offlineQueue.findIndex((item) => item.id === id);
    if (index > -1) {
      this.offlineQueue.splice(index, 1);
      this.saveOfflineQueue();
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem('sw-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('[SWManager] Failed to save offline queue:', error);
    }
  }

  private loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('sw-offline-queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('[SWManager] Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Get service worker version
   */
  async getVersion(): Promise<string> {
    if (!this.registration?.active) {
      throw new Error('No active service worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };

      this.registration!.active!.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Timeout getting service worker version'));
      }, 5000);
    });
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager();
