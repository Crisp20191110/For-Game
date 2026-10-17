const CACHE='fengshen-tianming-72-v8.2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(a=>Promise.all(a.filter(k=>k.startsWith('fengshen-tianming-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(CACHE).then(c=>c.put('./index.html',y))}return x}).catch(()=>caches.match('./index.html')));return;}
e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{if(y.ok)caches.open(CACHE).then(c=>c.put(r,y.clone()));return y})));});