import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getMessaging,getToken,onMessage } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging.js";

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcWnzfajRiBIFmithZI_0kX6qzdIMlhOw",
  authDomain: "maklowicz-pwa.firebaseapp.com",
  projectId: "maklowicz-pwa",
  storageBucket: "maklowicz-pwa.firebasestorage.app",
  messagingSenderId: "420433783759",
  appId: "1:420433783759:web:c89c23756ffa10bea0c0ba"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Klucz VAPID - wygeneruj w Firebase Console w sekcji Cloud Messaging > Web Configuration
const vapidKey = 'BEQSxhY47Z5rKkRHr3aVbdOE6xkBiioabWeTN7RamIDzoa_nNi6f3tBM9BjMklnswxDpdjOutj1XOdQUTh9oEyw';

// Funkcja pomocnicza do konwersji klucza VAPID
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Funkcja do żądania tokenu FCM
export async function requestFCMToken() {
  try {
    // Sprawdzenie czy powiadomienia są obsługiwane
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Powiadomienia push nie są obsługiwane w tej przeglądarce');
      return null;
    }

    // Prośba o pozwolenie na powiadomienia
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Zgoda na powiadomienia nie została udzielona');
      return null;
    }

    // Pobieranie tokenu FCM
    try {
      console.log('Próba pobrania tokenu FCM...');
      const currentToken = await getToken(messaging, {
        vapidKey: vapidKey
      });
      
      if (currentToken) {
        console.log('Token FCM uzyskany:', currentToken);
        // Wysyłanie tokenu na serwer (symulacja)
        console.log('Token wysłany na serwer (symulacja):', currentToken);
        return currentToken;
      } else {
        console.log('Nie udało się uzyskać tokenu FCM');
        return null;
      }
    } catch (fcmError) {
      console.error('Błąd FCM:', fcmError);
      
      // Spróbuj użyć Web Push API jako alternatywy
      console.log('Próba użycia Web Push API...');
      const registration = await navigator.serviceWorker.ready;
      
      // Sprawdź istniejącą subskrypcję
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Istniejąca subskrypcja Web Push:', subscription);
        return subscription;
      }
      
      // Utwórz nową subskrypcję
      try {
        const applicationServerKey = urlB64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
        
        console.log('Nowa subskrypcja Web Push utworzona:', subscription);
        return subscription;
      } catch (pushError) {
        console.error('Błąd podczas tworzenia subskrypcji Web Push:', pushError);
        return null;
      }
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji powiadomień:', error);
    return null;
  }
}

// Funkcja do nasłuchiwania powiadomień
export function listenToMessages(callback) {
  // Nasłuchuj powiadomień w trybie aktywnym
  onMessage(messaging, (payload) => {
    console.log('Otrzymano wiadomość gdy aplikacja jest aktywna:', payload);
    
    if (typeof callback === 'function') {
      callback(
        payload.notification?.title || 'Nowa wiadomość',
        payload.notification?.body || 'Sprawdź najnowsze informacje!'
      );
    }
    
    // Pokaż powiadomienie przez Service Worker
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(
        payload.notification?.title || 'Nowa wiadomość', 
        {
          body: payload.notification?.body || 'Sprawdź najnowsze informacje!',
          icon: './icons/apple-touch-icon.png',
          badge: './icons/favicon-96x96.png',
          data: payload.data || {}
        }
      );
    });
  });
}

// Funkcja do wysyłania testowego powiadomienia
export async function sendTestNotification() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker nie jest obsługiwany w tej przeglądarce');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    registration.showNotification('Testowe powiadomienie Maklowicz', {
      body: 'To jest przykładowe powiadomienie z aplikacji Maklowicz PWA!',
      icon: './icons/apple-touch-icon.png',
      badge: './icons/favicon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: './index.html'
      },
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
    });
    
    console.log('Testowe powiadomienie wysłane');
    return true;
  } catch (error) {
    console.error('Błąd podczas wysyłania testowego powiadomienia:', error);
    return false;
  }
}

export { app, messaging, firebaseConfig };