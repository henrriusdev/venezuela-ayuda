/* Venezuela Ayuda — conservative service worker.
 * Goal: make the app open on flaky/offline connections without ever serving
 * stale form submissions or private data.
 * - Static assets (_next/static, icons): cache-first (they're content-hashed).
 * - Page navigations: network-first, falling back to a cached shell/offline page.
 * - Everything else (POST, APIs, Supabase, cross-origin): passthrough, never cached.
 */
const CACHE = "va-v1";
const PRECACHE = ["/offline.html", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never touch writes

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip Supabase / external
  if (url.pathname.startsWith("/api/")) return; // always live

  // Content-hashed static assets: cache-first.
  if (url.pathname.startsWith("/_next/static/") || PRECACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((hit) => hit || caches.match("/offline.html"))
      )
    );
  }
});
