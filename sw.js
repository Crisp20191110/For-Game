// Cache the complete app shell as one version: offline mode never mixes modules from different releases.
const BASE = new URL('./', self.location.href);
const PREFIX = 'one-leaf-scope:' + encodeURIComponent(BASE.pathname) + ':';
const CACHE = PREFIX + '7.0.0';
const FILES = ['./', 'index.html', 'public/game.js?v=7.0.0', 'public/game.css?v=7.0.0', 'public/heroes-atlas.png', 'public/heroes-atlas-2.png', 'public/sanctuary.png', 'public/gear-atlas.png', 'public/landscape.svg', 'public/icon.svg', 'public/icon-192.png', 'public/icon-512.png', 'manifest.webmanifest'].map(file => new URL(file, BASE).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(url => new Request(url, { cache: 'reload' })))));
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch { return event.request.mode === 'navigate' ? await cache.match(BASE.href) : Response.error(); }
  }));
});
