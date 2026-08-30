// Hexhaven offline service worker.
// Host this file in the SAME folder as hexhaven.html (e.g. rename hexhaven.html
// to index.html) on any static http(s) host. The page registers it automatically;
// nothing else to configure. Bump CACHE below if you replace hexhaven.html later,
// so returning players pick up the new version instead of a stale cached copy.

const CACHE = 'hexhaven-shell-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add(self.registration.scope)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first with a cache fallback, so players online always get the latest
// build, and players offline (or with a flaky connection) still get something.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
