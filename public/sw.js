/**
 * Couple Connect Service Worker
 * Provides offline support, caching, and background sync
 */

const CACHE_NAME = 'couple-connect-v1';
const API_CACHE_NAME = 'couple-connect-api-v1';
const STATIC_CACHE_NAME = 'couple-connect-static-v1';

// Core app shell files that should always be cached
const CORE_CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other critical files as they're identified
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/actions/,
  /\/api\/issues/,
  /\/api\/progress/,
  /\/api\/partners/,
];

// Background sync tags
const SYNC_TAGS = {
  ACTIONS: 'sync-actions',
  ISSUES: 'sync-issues',
  PROGRESS: 'sync-progress',
};

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    Promise.all([
      // Cache core app shell
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching core app shell files');
        return cache.addAll(CORE_CACHE_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === SYNC_TAGS.ACTIONS) {
    event.waitUntil(syncActions());
  } else if (event.tag === SYNC_TAGS.ISSUES) {
    event.waitUntil(syncIssues());
  } else if (event.tag === SYNC_TAGS.PROGRESS) {
    event.waitUntil(syncProgress());
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Helper functions

function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/.test(url.pathname);
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// API request handler - Network First with fallback to cache
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);

    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for critical API calls
    return createOfflineResponse(request);
  }
}

// Static asset handler - Cache First
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);

  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Navigation request handler - Network First with app shell fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving app shell');

    // Fallback to cached app shell
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');

    if (cachedResponse) {
      return cachedResponse;
    }

    // Ultimate fallback
    return new Response('App is offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Create offline response for API requests
function createOfflineResponse(request) {
  const url = new URL(request.url);

  // Return appropriate offline data based on endpoint
  if (url.pathname.includes('/actions')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.pathname.includes('/issues')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generic offline response
  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Background sync functions
async function syncActions() {
  try {
    console.log('[SW] Syncing actions...');

    // Get pending actions from IndexedDB
    const pendingActions = await getPendingData('actions');

    for (const action of pendingActions) {
      try {
        const response = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingData('actions', action.id);
          console.log('[SW] Action synced successfully:', action.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync actions failed:', error);
  }
}

async function syncIssues() {
  try {
    console.log('[SW] Syncing issues...');

    const pendingIssues = await getPendingData('issues');

    for (const issue of pendingIssues) {
      try {
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issue.data),
        });

        if (response.ok) {
          await removePendingData('issues', issue.id);
          console.log('[SW] Issue synced successfully:', issue.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync issue:', issue.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync issues failed:', error);
  }
}

async function syncProgress() {
  try {
    console.log('[SW] Syncing progress updates...');

    const pendingProgress = await getPendingData('progress');

    for (const progress of pendingProgress) {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress.data),
        });

        if (response.ok) {
          await removePendingData('progress', progress.id);
          console.log('[SW] Progress synced successfully:', progress.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync progress:', progress.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync progress failed:', error);
  }
}

// IndexedDB helpers for offline data storage
async function getPendingData(type) {
  // This would integrate with your IndexedDB implementation
  // For now, return empty array as placeholder
  return [];
}

async function removePendingData(type, id) {
  // This would remove the synced item from IndexedDB
  console.log('[SW] Would remove pending data:', type, id);
}

// Cache additional URLs requested by the app
async function cacheUrls(urls) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  await cache.addAll(urls);
}

// Periodic cache cleanup (optional)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCaches());
  }
});

async function cleanupOldCaches() {
  // Clean up old cache entries
  const cacheNames = await caches.keys();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');

      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (cacheDate < oneWeekAgo) {
          await cache.delete(request);
        }
      }
    }
  }
}
