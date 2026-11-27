/* Backstage PWA recovery worker.
 * Network-first while online, cached fallback offline, and scoped cache cleanup.
 * Adds visible startup diagnostics so standalone-app failures are not silently black.
 */
const CACHE_NAME = 'backstage-pwa-recovery-v4';
const CORE = [
  './V71.77B-CREW-WORKFLOW.js',
  './customer-documents.js',
  './equipment-profiles.js',
  './timesheet-period-fix-v3.js',
  './manifest.webmanifest',
  './casual-induction.html',
  './regency-banner.png',
  './regency-banner-day.png',
  './regency-app-logo.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE.map(async url => {
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (response.ok) await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('backstage-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function addBackstageScripts(html) {
  const scripts = [];
  if (!html.includes('equipment-profiles.js')) {
    scripts.push('<script src="./equipment-profiles.js"></script>');
  }
  if (!html.includes('customer-documents.js')) {
    scripts.push('<script src="./customer-documents.js"></script>');
  }
  if (!html.includes('timesheet-period-fix-v3.js')) {
    scripts.push('<script src="./timesheet-period-fix-v3.js?v=3"></script>');
  }
  const diagnostic = `<script>
  (function(){
    function show(message, source, line){
      if(document.getElementById('backstage-startup-diagnostic')) return;
      var panel=document.createElement('pre');
      panel.id='backstage-startup-diagnostic';
      panel.style.cssText='position:fixed;z-index:2147483647;inset:12px;padding:18px;overflow:auto;white-space:pre-wrap;background:#210d0d;color:#fff;border:2px solid #d66;border-radius:12px;font:14px/1.5 monospace';
      panel.textContent='Backstage could not finish starting.\\n\\n'+message+(source?'\\n\\n'+source+(line?':'+line:''):'')+'\\n\\nPlease send this message to support. Your saved data has not been cleared.';
      (document.body||document.documentElement).appendChild(panel);
    }
    window.addEventListener('error',function(e){show(e.message||'A script or resource failed to load',e.filename,e.lineno);});
    window.addEventListener('unhandledrejection',function(e){var r=e.reason;show(r&&r.message?r.message:String(r||'Unhandled promise rejection'));});
  })();
  </script>`;
  const instrumented = html.replace(/<head([^>]*)>/i, (match) => match + diagnostic);
  return instrumented.replace(/<\/body>/i, scripts.join('\n') + '\n</body>');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isDocument = request.mode === 'navigate' || url.pathname.endsWith('/index.html');

    try {
      const fresh = await fetch(request, { cache: 'no-store' });
      if (fresh && fresh.ok) {
        if (isDocument) {
          const cleanCopy = fresh.clone();
          cache.put(request, cleanCopy).catch(() => {});
          const type = fresh.headers.get('content-type') || '';
          if (!type.includes('text/html')) return fresh;
          const body = addBackstageScripts(await fresh.text());
          const headers = new Headers(fresh.headers);
          headers.delete('content-length');
          headers.delete('content-encoding');
          return new Response(body, { status: fresh.status, statusText: fresh.statusText, headers });
        }
        cache.put(request, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) {
        if (!isDocument) return cached;
        const type = cached.headers.get('content-type') || '';
        if (!type.includes('text/html')) return cached;
        const body = addBackstageScripts(await cached.text());
        const headers = new Headers(cached.headers);
        headers.delete('content-length');
        headers.delete('content-encoding');
        return new Response(body, { status: cached.status, statusText: cached.statusText, headers });
      }
      return Response.error();
    }
  })());
});

self.addEventListener('push', event => {
  let payload = { title: 'Backstage', body: 'You have a new notification.', url: './' };
  try { if (event.data) payload = { ...payload, ...event.data.json() }; }
  catch (e) { try { payload.body = event.data?.text() || payload.body; } catch (_) {} }
  event.waitUntil(self.registration.showNotification(payload.title || 'Backstage', {
    body: payload.body || 'You have a new notification.',
    icon: './regency-app-logo.png',
    badge: './regency-app-logo.png',
    tag: payload.tag || 'backstage-' + Date.now(),
    data: { url: payload.url || './' },
    renotify: false
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.origin).href;
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
