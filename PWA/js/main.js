// Import funkcji z Firebase Configuration
import { requestFCMToken, listenToMessages } from '../firebase-config.js';

window.onload = () => {
  'use strict';
  
  console.log('Inicjalizacja aplikacji...');
  
  // Dodanie przycisku powiadomień do menu
  addNotificationButton();
  
  // Sprawdzenie czy Service Worker jest obsługiwany
  if ('serviceWorker' in navigator) {
    // Rejestracja głównego Service Workera
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker zarejestrowany pomyślnie.', registration);
        // Inicjalizacja powiadomień po zarejestrowaniu Service Workera
        if ('Notification' in window && 'PushManager' in window) {
          initializeNotifications(registration);
        }
      })
      .catch((error) => console.error('Błąd rejestracji Service Workera:', error));
    
    // Rejestracja Service Workera dla Firebase Messaging
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Messaging Service Worker zarejestrowany pomyślnie.', registration);
      })
      .catch((error) => console.error('Błąd rejestracji Firebase Messaging Service Workera:', error));
  }
  
  // Funkcja do dodania przycisku powiadomień do menu
  function addNotificationButton() {
    console.log('Dodawanie przycisku powiadomień...');
    const menu = document.querySelector('.menu ul');
    console.log('Element menu:', menu);
    
    if (menu) {
      const menuItem = document.createElement('li');
      const notificationBtn = document.createElement('button');
      notificationBtn.textContent = 'Włącz powiadomienia';
      notificationBtn.className = 'notification-btn';
      notificationBtn.addEventListener('click', () => {
        console.log('Kliknięto przycisk powiadomień');
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            requestNotificationPermission(registration);
          });
        }
      });
      menuItem.appendChild(notificationBtn);
      menu.appendChild(menuItem);
      console.log('Przycisk powiadomień dodany');
    } else {
      console.error('Nie znaleziono elementu menu');
    }
  }
  
  // Funkcja do zainicjowania powiadomień
  function initializeNotifications(swRegistration) {
    console.log('Inicjalizacja powiadomień...');
    
    // Nasłuchuj wiadomości Firebase, gdy aplikacja jest aktywna
    listenToMessages(showInAppNotification);
  }
  
  // Funkcja do żądania uprawnień do powiadomień
  async function requestNotificationPermission(swRegistration) {
    try {
      console.log('Żądanie uprawnień do powiadomień...');
      
      // Klucz VAPID - wygeneruj go w Firebase Console w Cloud Messaging -> Web Configuration -> Generate Key Pair
      const vapidPublicKey = 'BM3fcqUy5T72t0iWqpN1s1lxczSA-iN3_uDDukh9LGAMkN56xqbN-oMKPPkH1hpYWXNAzxR9LLsNTZ0wW8pJPRo';
      
      // Pobierz token FCM
      console.log('Próba uzyskania tokena FCM z kluczem VAPID:', vapidPublicKey.substring(0, 10) + '...');
      const token = await requestFCMToken(vapidPublicKey);
      
      if (token) {
        console.log('Token FCM uzyskany, pokazywanie testowego powiadomienia');
        // Pokazanie testowego powiadomienia
        showTestNotification(swRegistration);
      } else {
        console.error('Nie udało się uzyskać tokena FCM');
      }
    } catch (error) {
      console.error('Błąd podczas żądania uprawnień:', error);
    }
  }
  
  // Wyświetlenie testowego powiadomienia
  function showTestNotification(swRegistration) {
    const notificationOptions = {
      body: 'Nowe przepisy czekają na odkrycie w aplikacji Maklowicz PWA!',
      icon: './icons/apple-touch-icon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Zobacz więcej'
        },
        {
          action: 'close',
          title: 'Zamknij'
        }
      ]
    };
    
    swRegistration.showNotification('Witaj w świecie Maklowicza!', notificationOptions);
  }
  
  // Funkcja do wyświetlania powiadomień w aplikacji
  function showInAppNotification(title, body) {
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    notification.innerHTML = `
      <h3>${title}</h3>
      <p>${body}</p>
      <button class="close-btn">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Pokaż notyfikację
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Ukryj po 5 sekundach
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
    
    // Obsługa przycisku zamknięcia
    notification.querySelector('.close-btn').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
  
  // Animacje dla kart kulinarnych
  const catCards = document.querySelectorAll('.cat-card');
  if (catCards.length > 0) {
    catCards.forEach((card, index) => {
      // Dodaje opóźnienie animacji dla każdej kolejnej karty
      card.style.animationDelay = `${index * 0.2}s`;
    });
  }
};