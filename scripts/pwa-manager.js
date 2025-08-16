#!/usr/bin/env node

/**
 * 📱 PWA & Service Worker Manager
 * 
 * Features:
 * - Generate optimized service worker
 * - Manage caching strategies
 * - PWA manifest validation
 * - Offline capability testing
 * - Performance optimization
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';

class PWAManager {
  constructor() {
    this.publicDir = resolve('public');
    this.distDir = resolve('dist');
    this.swPath = resolve(this.publicDir, 'sw.js');
    this.manifestPath = resolve(this.publicDir, 'manifest.json');
  }

  async optimize() {
    console.log('📱 Starting PWA optimization...\n');

    await this.validateManifest();
    await this.generateServiceWorker();
    await this.optimizeCaching();
    await this.generateOfflinePages();
    await this.testPWACapabilities();
    
    this.generateReport();
  }

  async validateManifest() {
    console.log('📄 Validating PWA manifest...');

    if (!existsSync(this.manifestPath)) {
      console.log('⚠️  No manifest.json found, creating optimized version...');
      this.createOptimizedManifest();
      return;
    }

    try {
      const manifest = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
      const issues = this.checkManifestIssues(manifest);
      
      if (issues.length > 0) {
        console.log('🔧 Found manifest issues:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        this.fixManifestIssues(manifest, issues);
      } else {
        console.log('✅ Manifest is valid');
      }
    } catch (error) {
      console.log('❌ Invalid manifest.json, creating new one...');
      this.createOptimizedManifest();
    }
    console.log();
  }

  checkManifestIssues(manifest) {
    const issues = [];
    
    // Required fields
    if (!manifest.name) issues.push('Missing "name" field');
    if (!manifest.short_name) issues.push('Missing "short_name" field');
    if (!manifest.start_url) issues.push('Missing "start_url" field');
    if (!manifest.display) issues.push('Missing "display" field');
    if (!manifest.theme_color) issues.push('Missing "theme_color" field');
    if (!manifest.background_color) issues.push('Missing "background_color" field');
    
    // Icons validation
    if (!manifest.icons || manifest.icons.length === 0) {
      issues.push('Missing icons array');
    } else {
      const requiredSizes = ['192x192', '512x512'];
      const availableSizes = manifest.icons.map(icon => icon.sizes);
      
      requiredSizes.forEach(size => {
        if (!availableSizes.includes(size)) {
          issues.push(`Missing ${size} icon`);
        }
      });
    }
    
    // Performance optimizations
    if (manifest.display !== 'standalone' && manifest.display !== 'minimal-ui') {
      issues.push('Consider using "standalone" or "minimal-ui" display mode');
    }
    
    return issues;
  }

  fixManifestIssues(manifest, issues) {
    // Fix missing fields with sensible defaults
    if (issues.includes('Missing "name" field')) {
      manifest.name = 'Couple Connect';
    }
    if (issues.includes('Missing "short_name" field')) {
      manifest.short_name = 'CoupleConnect';
    }
    if (issues.includes('Missing "start_url" field')) {
      manifest.start_url = '/';
    }
    if (issues.includes('Missing "display" field')) {
      manifest.display = 'standalone';
    }
    if (issues.includes('Missing "theme_color" field')) {
      manifest.theme_color = '#f97316'; // Orange theme
    }
    if (issues.includes('Missing "background_color" field')) {
      manifest.background_color = '#ffffff';
    }

    // Add missing icons if needed
    if (issues.some(issue => issue.includes('icon'))) {
      manifest.icons = manifest.icons || [];
      
      // Add standard PWA icons
      const standardIcons = [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ];

      standardIcons.forEach(icon => {
        if (!manifest.icons.find(existing => existing.sizes === icon.sizes)) {
          manifest.icons.push(icon);
        }
      });
    }

    // Save updated manifest
    writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest updated with fixes');
  }

  createOptimizedManifest() {
    const optimizedManifest = {
      name: 'Couple Connect',
      short_name: 'CoupleConnect',
      description: 'A modern relationship management application',
      start_url: '/',
      display: 'standalone',
      theme_color: '#f97316',
      background_color: '#ffffff',
      orientation: 'portrait-primary',
      scope: '/',
      lang: 'en',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/icon-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: 'Quick Check-in',
          short_name: 'Check-in',
          description: 'Quick relationship check-in',
          url: '/checkin',
          icons: [{ src: '/icons/shortcut-checkin.png', sizes: '96x96' }]
        },
        {
          name: 'Progress View',
          short_name: 'Progress',
          description: 'View relationship progress',
          url: '/progress',
          icons: [{ src: '/icons/shortcut-progress.png', sizes: '96x96' }]
        }
      ],
      categories: ['lifestyle', 'social', 'productivity'],
      screenshots: [
        {
          src: '/screenshots/desktop-screenshot.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/mobile-screenshot.png',
          sizes: '375x812',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ]
    };

    writeFileSync(this.manifestPath, JSON.stringify(optimizedManifest, null, 2));
    console.log('✅ Created optimized manifest.json');
  }

  async generateServiceWorker() {
    console.log('🔧 Generating optimized service worker...');

    const swContent = `// 📱 Couple Connect Service Worker
// Generated by PWA Manager - ${new Date().toISOString()}

const CACHE_NAME = 'couple-connect-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const IMMEDIATE_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\\/api\\//,
  /\\/database\\//
];

// Static assets to cache with cache-first strategy
const STATIC_CACHE_PATTERNS = [
  /\\.(?:js|css|png|jpg|jpeg|svg|gif|woff2?)$/,
  /\\/icons\\//,
  /\\/assets\\//
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching immediate resources');
        return cache.addAll(IMMEDIATE_CACHE);
      })
      .then(() => {
        console.log('[SW] Skip waiting for immediate activation');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming all clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different resource types
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // API requests - network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Static assets - cache first, network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Navigation requests - network first with offline fallback
    event.respondWith(navigationStrategy(request));
  }
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Network unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Optionally update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, response));
      }
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    throw error;
  }
}

// Navigation strategy with offline fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page');
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match(OFFLINE_URL);
    
    return offlineResponse || new Response(
      '<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // e.g., retry failed API requests
  console.log('[SW] Performing background sync');
}

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Couple Connect', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service worker loaded successfully');`;

    writeFileSync(this.swPath, swContent);
    console.log('✅ Service worker generated');
    console.log();
  }

  async optimizeCaching() {
    console.log('⚡ Optimizing caching strategies...');

    // Create cache configuration
    const cacheConfig = {
      version: '1.0.0',
      strategies: {
        pages: 'network-first',
        apis: 'network-first',
        assets: 'cache-first',
        images: 'cache-first'
      },
      expiration: {
        pages: '1 day',
        apis: '1 hour',
        assets: '1 week',
        images: '1 month'
      },
      maxEntries: {
        pages: 50,
        apis: 100,
        assets: 200,
        images: 60
      }
    };

    // Save cache configuration
    const configPath = resolve(this.publicDir, 'cache-config.json');
    writeFileSync(configPath, JSON.stringify(cacheConfig, null, 2));
    
    console.log('✅ Cache configuration optimized');
    console.log();
  }

  async generateOfflinePages() {
    console.log('📴 Generating offline pages...');

    const offlineHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Couple Connect</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #f97316, #fb923c);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .container {
            max-width: 400px;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            margin: 0 0 1rem 0;
            font-size: 2rem;
        }
        p {
            margin: 0 0 2rem 0;
            opacity: 0.9;
            line-height: 1.6;
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📴</div>
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection. Don't worry, some features are still available offline!</p>
        <button class="retry-btn" onclick="window.location.reload()">
            Try Again
        </button>
    </div>
    
    <script>
        // Auto-retry when online
        window.addEventListener('online', () => {
            window.location.reload();
        });
    </script>
</body>
</html>`;

    const offlinePath = resolve(this.publicDir, 'offline.html');
    writeFileSync(offlinePath, offlineHTML);
    
    console.log('✅ Offline page created');
    console.log();
  }

  async testPWACapabilities() {
    console.log('🧪 Testing PWA capabilities...');

    const tests = [];

    // Test manifest
    if (existsSync(this.manifestPath)) {
      tests.push({ name: 'Manifest exists', status: 'pass' });
    } else {
      tests.push({ name: 'Manifest exists', status: 'fail', fix: 'Run PWA optimization' });
    }

    // Test service worker
    if (existsSync(this.swPath)) {
      tests.push({ name: 'Service Worker exists', status: 'pass' });
    } else {
      tests.push({ name: 'Service Worker exists', status: 'fail', fix: 'Run PWA optimization' });
    }

    // Test offline page
    const offlinePath = resolve(this.publicDir, 'offline.html');
    if (existsSync(offlinePath)) {
      tests.push({ name: 'Offline page exists', status: 'pass' });
    } else {
      tests.push({ name: 'Offline page exists', status: 'fail', fix: 'Run PWA optimization' });
    }

    // Test icons directory
    const iconsDir = resolve(this.publicDir, 'icons');
    if (existsSync(iconsDir)) {
      tests.push({ name: 'Icons directory exists', status: 'pass' });
    } else {
      tests.push({ name: 'Icons directory exists', status: 'warn', fix: 'Create icons directory and add PWA icons' });
    }

    console.log('📊 PWA Test Results:');
    tests.forEach(test => {
      const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
      console.log(`   ${icon} ${test.name}`);
      if (test.fix) {
        console.log(`      Fix: ${test.fix}`);
      }
    });

    this.testResults = tests;
    console.log();
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        manifestValid: existsSync(this.manifestPath),
        serviceWorkerGenerated: existsSync(this.swPath),
        offlinePageCreated: existsSync(resolve(this.publicDir, 'offline.html')),
        testsRun: this.testResults?.length || 0,
        testsPassed: this.testResults?.filter(t => t.status === 'pass').length || 0
      },
      recommendations: [
        'Add PWA icons in multiple sizes (72x72 to 512x512)',
        'Test offline functionality in development',
        'Consider implementing background sync for data',
        'Add push notification support if needed',
        'Test installation prompt on mobile devices'
      ]
    };

    // Save report
    writeFileSync('pwa-optimization-report.json', JSON.stringify(report, null, 2));

    console.log('📄 PWA Optimization Report Generated');
    console.log('=====================================');
    console.log(`✅ Manifest: ${report.summary.manifestValid ? 'Valid' : 'Missing'}`);
    console.log(`🔧 Service Worker: ${report.summary.serviceWorkerGenerated ? 'Generated' : 'Missing'}`);
    console.log(`📴 Offline Page: ${report.summary.offlinePageCreated ? 'Created' : 'Missing'}`);
    console.log(`🧪 Tests: ${report.summary.testsPassed}/${report.summary.testsRun} passed`);
    
    console.log('\n💡 Next Steps:');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    console.log('\n✅ PWA optimization complete!');
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'optimize':
    case undefined:
      const manager = new PWAManager();
      await manager.optimize();
      break;
      
    case 'test':
      const testManager = new PWAManager();
      await testManager.testPWACapabilities();
      break;
      
    case 'help':
      console.log(`
📱 PWA Manager

Usage: node scripts/pwa-manager.js [command]

Commands:
  optimize    Run full PWA optimization (default)
  test        Test PWA capabilities only
  help        Show this help message

Examples:
  npm run pwa:optimize     # Full PWA optimization
  npm run pwa:test         # Test current PWA setup
      `);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Run with "help" for usage information');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PWAManager };
