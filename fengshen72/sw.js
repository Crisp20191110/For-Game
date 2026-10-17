const CACHE='fengshen-tianming-72-v8.6';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const ART=['./heroes-atlas.png','./heroes-atlas-2.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);await cache.addAll(CORE);
 await Promise.allSettled(ART.map(async path=>{const response=await fetch(path);if(response.ok)await cache.put(path,response)}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('fengshen-tianming-')&&name!==CACHE).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const duplicate=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',duplicate)).catch(()=>{}))}
   return response;
  }).catch(async()=>await caches.match('./index.html')||new Response('暂时离线，请联网首次加载游戏',{status:503})));return;
 }
 event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
  if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,clone)).catch(()=>{}))}
  return response;
 })));
});