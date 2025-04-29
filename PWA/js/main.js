// Import funkcji z Firebase Configuration
import { requestFCMToken, listenToMessages, sendTestNotification } from './firebase-config.js';

// Po załadowaniu strony
window.onload = () => {
  'use strict';
  
  console.log('Inicjalizacja aplikacji...');
  
  // Dodanie przycisku powiadomień do menu
  addNotificationButton();
  
  // Rejestracja Service Workerów
  registerServiceWorkers();
  
  // Animacje dla kart kulinarnych
  initializeCardAnimations();
};

// Funkcja rejestrująca Service Workery
function registerServiceWorkers() {
  if ('serviceWorker' in navigator) {
    // Rejestracja głównego Service Workera
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker zarejestrowany pomyślnie:', registration);
        
        // Inicjalizacja nasłuchiwania wiadomości
        if ('Notification' in window && 'PushManager' in window) {
          listenToMessages(showInAppNotification);
        }
      })
      .catch((error) => console.error('Błąd rejestracji Service Workera:', error));
    
    // Rejestracja Service Workera dla Firebase Messaging
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Messaging Service Worker zarejestrowany pomyślnie:', registration);
      })
      .catch((error) => console.error('Błąd rejestracji Firebase Messaging Service Workera:', error));
  } else {
    console.warn('Service Workery nie są obsługiwane przez tę przeglądarkę');
  }
}

// Funkcja do dodania przycisku powiadomień w menu
function addNotificationButton() {
  const menu = document.querySelector('.menu ul');
  if (!menu) {
    console.error('Nie znaleziono elementu menu');
    return;
  }
  
  // Tworzenie elementu przycisku
  const menuItem = document.createElement('li');
  const notificationBtn = document.createElement('button');
  notificationBtn.textContent = 'Włącz powiadomienia';
  notificationBtn.className = 'notification-btn';
  notificationBtn.id = 'notificationBtn';
  
  // Aktualizacja przycisku na podstawie bieżących uprawnień
  updateNotificationButtonState(notificationBtn);
  
  // Dodanie obsługi kliknięcia
  notificationBtn.addEventListener('click', handleNotificationButtonClick);
  
  // Dodanie przycisku do menu
  menuItem.appendChild(notificationBtn);
  menu.appendChild(menuItem);
  console.log('Przycisk powiadomień dodany do menu');
}

// Aktualizacja stanu przycisku powiadomień
function updateNotificationButtonState(button) {
  if (!button) return;
  
  if (Notification.permission === 'granted') {
    button.textContent = 'Powiadomienia włączone';
    button.classList.add('enabled');
  } else if (Notification.permission === 'denied') {
    button.textContent = 'Powiadomienia zablokowane';
    button.disabled = true;
  } else {
    button.textContent = 'Włącz powiadomienia';
  }
}

// Obsługa kliknięcia przycisku powiadomień

async function handleNotificationButtonClick() {
  console.log('Kliknięto przycisk powiadomień');
  
  try {
    // Próba uzyskania tokenu FCM
    const token = await requestFCMToken();
    
    // Aktualizacja przycisku
    const button = document.getElementById('notificationBtn');
    updateNotificationButtonState(button);
    
    if (token) {
      console.log('Powiadomienia zostały włączone');
      
      // Wyświetlanie tokenu na stronie
      displayFCMToken(token);
      
      // Wysyłanie testowego powiadomienia po 2 sekundach
      setTimeout(() => {
        sendTestNotification();
      }, 2000);
    }
  } catch (error) {
    console.error('Błąd podczas włączania powiadomień:', error);
  }
}

// Funkcja do wyświetlania tokenu FCM na stronie
function displayFCMToken(token) {
  const tokenElement = document.getElementById('fcm-token');
  const copyButton = document.getElementById('copy-token-btn');
  
  if (tokenElement) {
    // Konwersja obiektu subskrypcji na string, jeśli potrzeba
    let tokenText = typeof token === 'string' ? token : JSON.stringify(token);
    
    // Aktualizacja tekstu z tokenem
    tokenElement.textContent = tokenText;
    
    // Pokazanie przycisku kopiowania
    if (copyButton) {
      copyButton.style.display = 'block';
      
      // Dodanie obsługi kopiowania tokenu
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(tokenText)
          .then(() => {
            // Tymczasowa informacja o skopiowaniu
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Skopiowano!';
            
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Błąd podczas kopiowania tokenu:', err);
          });
      });
    }
  }
}

// Funkcja do wyświetlania powiadomień w aplikacji
function showInAppNotification(title, body) {
  // Tworzenie elementu powiadomienia
  const notification = document.createElement('div');
  notification.className = 'in-app-notification';
  notification.innerHTML = `
    <h3>${title}</h3>
    <p>${body}</p>
    <button class="close-btn">×</button>
  `;
  
  // Dodanie do DOM
  document.body.appendChild(notification);
  
  // Pokazanie powiadomienia z animacją
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Automatyczne ukrycie po 5 sekundach
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

// Inicjalizacja animacji dla kart
function initializeCardAnimations() {
  const catCards = document.querySelectorAll('.cat-card');
  if (catCards.length > 0) {
    catCards.forEach((card, index) => {
      // Dodaje opóźnienie animacji dla każdej kolejnej karty
      card.style.animationDelay = `${index * 0.2}s`;
    });
  }
}