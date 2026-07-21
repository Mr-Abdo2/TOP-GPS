self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/download-temp/')) {
    event.respondWith(
      caches.open('report-downloads').then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return new Response('File not found', { status: 404 });
        });
      })
    );
  }
});
