/* Control — service worker (offline-first app shell) */
const VERSION = 'control-v1';
const CORE = [
  './',
  './index.html',
  './support.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // never touch S3 PUT / backup uploads
  const url = new URL(req.url);
  // never intercept S3 / backup or other cross-origin API calls except font CDNs
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isFont) return;

  if (sameOrigin) {
    // cache-first for app shell, fall back to network, update cache
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy).catch(() => {}));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
  } else if (isFont) {
    // stale-while-revalidate for fonts
    e.respondWith(
      caches.open(VERSION).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});

/* local reminders: the page posts a schedule; SW fires notifications even if tab is backgrounded */
const timers = {};
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'schedule' && d.id != null) {
    if (timers[d.id]) clearTimeout(timers[d.id]);
    const delay = Math.max(0, d.at - Date.now());
    if (delay > 2147483647) return;
    timers[d.id] = setTimeout(() => {
      self.registration.showNotification(d.title || 'Control', {
        body: d.body || '', tag: String(d.id), icon: './icons/icon-192.png', badge: './icons/favicon-32.png'
      });
    }, delay);
  } else if (d.type === 'cancel' && d.id != null) {
    if (timers[d.id]) { clearTimeout(timers[d.id]); delete timers[d.id]; }
  } else if (d.type === 'notify') {
    self.registration.showNotification(d.title || 'Control', { body: d.body || '', icon: './icons/icon-192.png', badge: './icons/favicon-32.png' });
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cl) => {
    for (const c of cl) { if ('focus' in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('./index.html');
  }));
});
