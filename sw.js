const CACHE = 'one-leaf-v1';
const FILES = ['/', '/index.html', '/src/app.js', '/src/game.js', '/src/style.css', '/public/landscape.svg', '/public/icon.svg', '/public/icon-192.png', '/public/icon-512.png', '/manifest.webmanifest'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('one-leaf-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && FILES.includes(new URL(event.request.url).pathname)) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? await caches.match('/') : Response.error())));
});
