const cacheName = 'maklowicz-pwa-v1';
const filesToCache = [
  './',
  './index.html',
  './style.css',
  './js/main.js',
  './js/firebase-config.js',
  './about.html',
  './contact.html',
  './manifest.json',
  './firebase-messaging-sw.js',
  './icons/apple-touch-icon.png',
  './icons/favicon-96x96.png',
  './icons/favicon.svg',
  './icons/favicon.ico'
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
      return fetch(event.request)
        .then((fetchResponse) => {
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
        })
        .catch(() => {
          // Fallback dla braku połączenia - przekierowanie na stronę główną
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
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

// Obsługa kliknięć w powiadomienia
self.addEventListener('notificationclick', (event) => {
  console.log('Kliknięto w powiadomienie:', event);
  
  const notification = event.notification;
  const action = event.action;
  
  if (action === 'close') {
    notification.close();
  } else {
    // Sprawdź, czy jakaś karta z aplikacją jest już otwarta
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clientList) => {
        // Jeśli jest otwarta karta, skup się na niej
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // W przeciwnym razie otwórz nową kartę
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
    
    notification.close();
  }
});