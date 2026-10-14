const CACHE_NAME = 'aics-dining-pwa-shell-transparent-v2';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './aics-icon-192.png',
  './aics-icon-512.png',
  './aics-logo-transparent-1024.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('aics-dining-pwa-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Cache only this GitHub Pages app shell. Never cache the Apps Script report,
  // Google sign-in, reports, or any personal/submission data.
  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});
