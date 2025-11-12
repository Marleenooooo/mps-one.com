// Minimal service worker for asset and API caching
// Strategies:
// - assets/* → cache-first
// - HTML navigations → network-first with cache fallback
// - same-origin API GET /api/* → stale-while-revalidate

const VERSION = 'v1';
const ASSET_CACHE = `assets-${VERSION}`;
const HTML_CACHE = `html-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(HTML_CACHE).then((cache) => cache.addAll(['/','/index.html']).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (![ASSET_CACHE, HTML_CACHE, API_CACHE].includes(k)) return caches.delete(k);
        })
      );
      await self.clients.claim();
    })()
  );
});

function isSameOrigin(url) {
  try { return new URL(url).origin === self.location.origin; } catch { return false; }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // ignore non-GET

  const url = new URL(req.url);
  const sameOrigin = isSameOrigin(req.url);

  // Cache-first for built assets
  if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch (e) {
          return cached || new Response('offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Network-first for HTML navigations
  const isHTML = req.mode === 'navigate' || (sameOrigin && url.pathname.endsWith('.html')) || (sameOrigin && url.pathname === '/');
  if (isHTML) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(HTML_CACHE);
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put('/index.html', res.clone());
          return res;
        } catch {
          const fallback = await cache.match('/index.html');
          return fallback || new Response('offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Stale-while-revalidate for same-origin API GET
  if (sameOrigin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || fetchPromise || new Response('offline', { status: 503 });
      })()
    );
  }
});

