// Importujemy Firebase skrypty (wersja compat, która działa w Service Workerach)
importScripts('https://www.gstatic.com/firebasejs/9.6.6/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging-compat.js');

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcWnzfajRiBIFmithZI_0kX6qzdIMlhOw",
  authDomain: "maklowicz-pwa.firebaseapp.com",
  projectId: "maklowicz-pwa",
  storageBucket: "maklowicz-pwa.firebasestorage.app",
  messagingSenderId: "420433783759",
  appId: "1:420433783759:web:c89c23756ffa10bea0c0ba"
};

// Inicjalizacja Firebase w Service Workerze
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log("Firebase Messaging SW inicjalizowany");

// Obsługa wiadomości w tle (gdy aplikacja nie jest aktywnie używana)
messaging.onBackgroundMessage((payload) => {
  console.log('Otrzymano wiadomość w tle:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nowa wiadomość';
  const notificationOptions = {
    body: payload.notification?.body || 'Sprawdź najnowsze kulinarne odkrycia!',
    icon: './icons/apple-touch-icon.png',
    badge: './icons/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: payload.data?.url || './',
      dateOfArrival: Date.now()
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});