const CACHE_NAME = 'v1';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.css',
        '/index.js',
        '/favicon.ico',
        '/v.png',
        '/l.png',
        '/vbh.png',
        '/ball.png',
        '/r.png',
        '/b.png',
        '/logo192.png',
        '/logo512.png',
        '/questions.json',
        '/manifest.json',
        '/vite.svg',
        '/button-click-sound.mp3',
        '/game.mp3',
        '/goal.mp3',
        '/home.mp3',
        '/Paddle Ball Hit Sound Effect HD.mp3',
        '/questions.mp3',
        '/wrong.mp3',
        '/correct.mp3',
        '/valuehero.png',
        '/valuehero2.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
      })
  );
});
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});