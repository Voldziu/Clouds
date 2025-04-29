// Importujemy Firebase skrypty (wersja compat, która działa w Service Workerach)
importScripts('https://www.gstatic.com/firebasejs/9.6.6/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging-compat.js');

// Konfiguracja Firebase - musi być taka sama jak w firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyAcWnzfajRiBIFmithZI_0kX6qzdIMlhOw",
  authDomain: "maklowicz-pwa.firebaseapp.com",
  projectId: "maklowicz-pwa",
  storageBucket: "maklowicz-pwa.firebasestorage.app",
  messagingSenderId: "420433783759",
  appId: "1:420433783759:web:c89c23756ffa10bea0c0ba"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('Firebase Messaging Service Worker został zainicjalizowany');

// Obsługa wiadomości w tle (gdy aplikacja nie jest aktywnie używana)
messaging.onBackgroundMessage((payload) => {
  console.log('Otrzymano wiadomość w tle:', payload);
  
  // Tytuł i treść powiadomienia
  const notificationTitle = payload.notification?.title || 'Maklowicz PWA';
  const notificationBody = payload.notification?.body || 'Mamy dla Ciebie nowe informacje!';
  
  // Opcje powiadomienia
  const notificationOptions = {
    body: notificationBody,
    icon: './icons/apple-touch-icon.png',
    badge: './icons/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Otwórz'
      },
      {
        action: 'close',
        title: 'Zamknij'
      }
    ]
  };

  // Pokazanie powiadomienia
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Obsługa kliknięć w powiadomienia
self.addEventListener('notificationclick', (event) => {
  console.log('Kliknięto w powiadomienie:', event);
  
  const notification = event.notification;
  const action = event.action;
  
  // Zamknięcie powiadomienia
  notification.close();
  
  // Obsługa akcji
  if (action === 'close') {
    // Nic nie robimy, powiadomienie już zostało zamknięte
    return;
  }
  
  // Domyślna akcja lub action === 'open'
  // Pobierz URL z danych powiadomienia lub użyj domyślnego
  const urlToOpen = notification.data?.url || './';
  
  // Sprawdź, czy jakaś karta z aplikacją jest już otwarta
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Jeśli jest otwarta karta, skup się na niej
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // W przeciwnym razie otwórz nową kartę
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});