import React, { useState } from 'react';

const PrivacyPopup = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="privacy-popup">
      <div className="popup-content">
        <h3>Polityka Prywatności</h3>
        <p>
          Ta strona używa geolokalizacji i zbiera podstawowe informacje o przeglądarce 
          w celu poprawy działania aplikacji.
        </p>
        <p>
          Korzystając ze strony wyrażasz zgodę na przetwarzanie tych danych zgodnie z 
          polityką prywatności. Dane są używane wyłącznie do wyświetlania informacji 
          na stronie i nie są przesyłane na zewnątrz.
        </p>
        <p>
          Aplikacja może używać cookies do zapisywania preferencji użytkownika.
        </p>
        <button onClick={() => setIsVisible(false)}>
          Akceptuję i zamknij
        </button>
      </div>
    </div>
  );
};

export default PrivacyPopup;