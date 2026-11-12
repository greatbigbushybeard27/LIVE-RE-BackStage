const CACHE_NAME = 'backstage-v71-77b1-crew-picker-ui';
const CORE = ['./','./index.html','./V71.77B-CREW-WORKFLOW.js','./manifest.webmanifest','./casual-induction.html','./regency-banner.png','./regency-banner-day.png','./regency-app-logo.png','./apple-touch-icon.png'];
self.addEventListener('install', event => { event.waitUntil((async()=>{const c=await caches.open(CACHE_NAME); for(const url of CORE){try{await c.add(new Request(url,{cache:'reload'}));}catch(e){}} await self.skipWaiting();})()); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))); await self.clients.claim();})()); });
self.addEventListener('fetch', event => {const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith((async()=>{try{const fresh=await fetch(req,{cache:'no-store'});if(fresh&&fresh.ok){const c=await caches.open(CACHE_NAME);c.put(req,fresh.clone()).catch(()=>{});}return fresh;}catch(e){return (await caches.match(req))||Response.error();}})());});
self.addEventListener('push', event => {
  let payload={title:'Backstage',body:'You have a new notification.',url:'./'};
  try{if(event.data)payload={...payload,...event.data.json()};}catch(e){try{payload.body=event.data?.text()||payload.body;}catch(_){}}
  event.waitUntil(self.registration.showNotification(payload.title||'Backstage',{
    body:payload.body||'You have a new notification.',
    icon:'./regency-app-logo.png',badge:'./regency-app-logo.png',
    tag:payload.tag||'backstage-'+Date.now(),data:{url:payload.url||'./'},
    renotify:false
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil((async()=>{const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of clientsList){if('focus'in c){await c.focus();if('navigate'in c)await c.navigate(target);return;}}if(self.clients.openWindow)await self.clients.openWindow(target);})());
});
