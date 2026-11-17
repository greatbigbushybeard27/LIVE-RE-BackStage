const CACHE_NAME = 'backstage-equipment-profiles-v1';
const CORE = ['./','./index.html','./V71.77B-CREW-WORKFLOW.js','./customer-documents.js','./equipment-profiles.js','./manifest.webmanifest','./casual-induction.html','./regency-banner.png','./regency-banner-day.png','./regency-app-logo.png','./apple-touch-icon.png'];
self.addEventListener('install', event => { event.waitUntil((async()=>{const c=await caches.open(CACHE_NAME); for(const url of CORE){try{await c.add(new Request(url,{cache:'reload'}));}catch(e){}} await self.skipWaiting();})()); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))); await self.clients.claim();})()); });
self.addEventListener('fetch', event => {const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith((async()=>{const isApp=req.mode==='navigate'||new URL(req.url).pathname.endsWith('/index.html');const inject=async response=>{if(!isApp||!response||!response.ok)return response;const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))return response;let body=await response.text();if(!body.includes('customer-documents.js'))body=body.replace(/<\/body>/i,'<script src="./customer-documents.js?v=71.89"></script></body>');if(!body.includes('equipment-profiles.js'))body=body.replace(/<\\/body>/i,'<script src="./equipment-profiles.js?v=1"></script></body>');const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');return new Response(body,{status:response.status,statusText:response.statusText,headers});};try{const fresh=await fetch(req,{cache:'no-store'});if(fresh&&fresh.ok){const c=await caches.open(CACHE_NAME);c.put(req,fresh.clone()).catch(()=>{});}return await inject(fresh);}catch(e){return await inject((await caches.match(req))||Response.error());}})());});
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
