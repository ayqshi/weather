const CACHE = 'weather-shell-v1';
const SHELL = ['./index.html', './manifest.json','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Never cache live API calls (weather/air-quality/alerts/map tiles) — always go to network
// so data is never stale/mocked. Only the app shell is cached for offline app-open.
self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isApi = url.includes('open-meteo.com') || url.includes('api.weather.gov') ||
                url.includes('bigdatacloud.net') || url.includes('rainviewer.com') ||
                url.includes('cartocdn.com') || url.includes('openstreetmap.org');
  if (isApi) return; // let it hit the network normally

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
