const cacheName = 'maklowicz-pwa-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/about.html',
  '/contact.html',
  '/images/dish1.jpg',
  '/images/dish2.jpg',
  '/images/dish3.jpg',
  '/icons/favicon-96x96.png',
  '/icons/favicon.svg',
  '/icons/favicon.ico',
  '/icons/apple-touch-icon.png',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  '/icons/apple-splash-640x1136.png',
  '/icons/apple-splash-750x1334.png',
  '/icons/apple-splash-828x1792.png',
  '/icons/apple-splash-1125x2436.png',
  '/icons/apple-splash-1242x2688.png',
  '/icons/apple-splash-1536x2048.png',
  '/icons/apple-splash-1668x2224.png',
  '/icons/apple-splash-1668x2388.png',
  '/icons/apple-splash-2048x2732.png',
  '/manifest.json'
];

// Instalacja Service Workera i buforowanie podstawowych plików
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Otwieranie pamięci podręcznej');
      return cache.addAll(filesToCache);
    })
  );
});

// Obsługa żądań sieciowych z dynamicznym buforowaniem
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Zwracamy zasoby z pamięci podręcznej, jeśli są dostępne
      if (response) {
        return response;
      }
      
      // W przeciwnym razie pobieramy z sieci i buforujemy
      return fetch(event.request).then((fetchResponse) => {
        // Pomijamy buforowanie dla żądań innych niż GET
        if (event.request.method !== 'GET') {
          return fetchResponse;
        }

        // Klonujemy odpowiedź, ponieważ jest strumieniem, który można odczytać tylko raz
        const responseToCache = fetchResponse.clone();

        caches.open(cacheName).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      });
    }).catch(() => {
      // Fallback dla braku połączenia - przekierowanie na stronę główną
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Aktywacja Service Workera i usuwanie starych pamięci podręcznych
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!cacheWhitelist.includes(name)) {
            console.log('Usuwanie starej pamięci podręcznej:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});