const CACHE_NAME = 'next-export-dynamic-cache';

self.addEventListener('install', () => {
  console.log('🛠 Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('⚡ Service Worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  let decodedPath = decodeURIComponent(url.pathname);

  // 末尾が `/` の場合は `index.html` を補完
  if (decodedPath.endsWith('/')) {
    decodedPath += 'index.html';
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(decodedPath).then(response =>
        response || fetch(event.request)
      )
    )
  );
});

self.addEventListener('message', async event => {
  if (event.data?.type === 'CACHE_FILE') {
    const { path, buffer, mimeType } = event.data;

    const response = new Response(buffer, {
      headers: { 'Content-Type': mimeType },
    });

    const cache = await caches.open(CACHE_NAME);
    await cache.put(path, response);

    console.log(`✅ Cached ${path}`);
  }
});
