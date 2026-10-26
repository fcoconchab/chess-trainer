const CACHE = 'ajedrez-v2.4.8';
const ENGINE_CACHE = 'ajedrez-motor-17.1-lite'; // el motor (7 MB) se guarda aparte y no se borra al actualizar la app
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== ENGINE_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Lichess y otros: siempre red
  if (url.pathname.includes('/sf/')) {
    // motor: primero la copia guardada, si no hay, red y se guarda
    e.respondWith(caches.open(ENGINE_CACHE).then(cache => cache.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
