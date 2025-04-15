window.onload = () => {
    'use strict';
    
    // Rejestracja Service Workera
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker zarejestrowany pomyślnie.'))
        .catch((error) => console.error('Błąd rejestracji Service Workera:', error));
    }
    
    // Sprawdzenie czy aplikacja może wysyłać powiadomienia
    if ('Notification' in window && 'PushManager' in window) {
      // Funkcja do żądania uprawnień do powiadomień
      const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Uprawnienia do powiadomień przyznane!');
          showTestNotification();
        } else {
          console.log('Uprawnienia do powiadomień odrzucone.');
        }
      };
      
      // Wyświetlenie testowego powiadomienia
      const showTestNotification = () => {
        const notificationOptions = {
          body: 'Nowe przepisy czekają na odkrycie w aplikacji Maklowicz PWA!',
          icon: '/icons/apple-touch-icon.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          },
          actions: [
            {
              action: 'explore',
              title: 'Zobacz więcej',
              icon: 'images/checkmark.png'
            },
            {
              action: 'close',
              title: 'Zamknij',
              icon: 'images/xmark.png'
            }
          ]
        };
        
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('Witaj w świecie Maklowicza!', notificationOptions);
        });
      };
      
      // Dodanie przycisku do prośby o uprawnienia do powiadomień
      const notificationBtn = document.createElement('button');
      notificationBtn.textContent = 'Włącz powiadomienia';
      notificationBtn.className = 'notification-btn';
      notificationBtn.addEventListener('click', requestNotificationPermission);
      
      // Dodanie przycisku do DOM
      const container = document.querySelector('.container');
      if (container) {
        container.querySelector('main').appendChild(notificationBtn);
      }
    }
    
    // Animacje dla kart z kotami
    const catCards = document.querySelectorAll('.cat-card');
    if (catCards.length > 0) {
      catCards.forEach((card, index) => {
        // Dodaje opóźnienie animacji dla każdej kolejnej karty
        card.style.animationDelay = `${index * 0.2}s`;
      });
    }
  };