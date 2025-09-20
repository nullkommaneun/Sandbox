const CACHE = 'evolab-cache-v110';
const ASSETS = ['/', '/index.html','/src/app.js','/src/loop.js','/src/state.js','/src/tests.js','/src/util.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
