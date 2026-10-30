/* My Personal Tool Kit — service worker.
   Bump VERSION whenever index.html changes so installed copies update. */
const VERSION = 'v1';
const CORE = 'tk-core-' + VERSION;
const EXT = 'tk-external-v1'; // fonts / CDN libs, cached on first online use
const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CORE && k !== EXT).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;

  // Same-origin pages: network first (so updates show), fall back to cache offline.
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CORE).then(c => c.put('./index.html', copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      );
      return;
    }
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CORE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Cross-origin (Google Fonts, jsDelivr libs): stale-while-revalidate, opaque responses allowed.
  e.respondWith(
    caches.open(EXT).then(cache =>
      cache.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
