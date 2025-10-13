#!/usr/bin/env node

/**
 * Generate service worker for offline support and caching
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('⚙️  Generating service worker...\n');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Get all files to cache
const cacheFiles = glob
  .sync('**/*.{html,css,js,png,jpg,jpeg,gif,svg,webp,woff,woff2}', {
    cwd: distDir,
  })
  .map((file) => `/${file}`);

const version = `v${Date.now()}`;

const serviceWorkerCode = `
// Service Worker for The Profit Platform
// Version: ${version}
// Generated: ${new Date().toISOString()}

const CACHE_NAME = '${version}';
const CACHE_URLS = ${JSON.stringify(cacheFiles, null, 2)};

// Install event - cache all resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching resources');
      return cache.addAll(CACHE_URLS);
    }).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
`.trim();

const swPath = path.join(distDir, 'sw.js');
fs.writeFileSync(swPath, serviceWorkerCode);

console.log(`✅ Service worker generated!`);
console.log(`   File: ${swPath}`);
console.log(`   Version: ${version}`);
console.log(`   Cached files: ${cacheFiles.length}\n`);

// Generate SW registration code
const registerCode = `
<!-- Service Worker Registration -->
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[SW] Registration failed:', error);
      });
  });
}
</script>
`.trim();

console.log('💡 Add this code to your HTML files:\n');
console.log(registerCode);
console.log('');
