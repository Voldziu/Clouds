import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcWnzfajRiBIFmithZI_0kX6qzdIMlhOw",
  authDomain: "maklowicz-pwa.firebaseapp.com",
  projectId: "maklowicz-pwa",
  storageBucket: "maklowicz-pwa.firebasestorage.app",
  messagingSenderId: "420433783759",
  appId: "1:420433783759:web:c89c23756ffa10bea0c0ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}

// Funkcja do rejestracji tokena FCM
export async function requestFCMToken(publicVapidKey) {
  try {
    console.log("Próba uzyskania tokena FCM...");
    // Najpierw sprawdź uprawnienia do powiadomień
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Uprawnienia do powiadomień odrzucone.');
      return null;
    }
    
    console.log("Uprawnienia przyznane, pobieranie tokena...");
    // Pobierz token FCM
    const currentToken = await getToken(messaging, {
      vapidKey: publicVapidKey
    });
    
    if (currentToken) {
      console.log('Token FCM uzyskany:', currentToken);
      
      // Tutaj możesz wysłać token na swój serwer
      // await sendTokenToServer(currentToken);
      
      return currentToken;
    } else {
      console.log('Nie udało się uzyskać tokena FCM.');
      return null;
    }
  } catch (error) {
    console.error('Błąd podczas rejestracji tokena FCM:', error);
    return null;
  }
}

// Nasłuchuj wiadomości, gdy aplikacja jest aktywna
export function listenToMessages(callback) {
  console.log("Uruchamianie nasłuchiwania wiadomości Firebase...");
  onMessage(messaging, (payload) => {
    console.log('Otrzymano wiadomość, gdy aplikacja jest aktywna:', payload);
    
    if (typeof callback === 'function') {
      callback(
        payload.notification?.title || 'Nowa wiadomość',
        payload.notification?.body || 'Sprawdź najnowsze kulinarne odkrycia!'
      );
    }
  });
  console.log("Nasłuchiwanie wiadomości Firebase uruchomione.");
}

export { app, messaging, firebaseConfig };