import React, { useEffect, useState } from 'react';
import RadioPlayer from './RadioPlayer';
import './App.css';
import PrivacyPopup from './PrivacyPopup';

function App() {
  const [location, setLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        (err) => console.warn("Geolokalizacja odrzucona.")
      );
    }

    setBrowserInfo({
      appName: navigator.appName,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Radio Internetowe</h1>
      </header>
      
      <main className="main-content">
        <RadioPlayer />
        
        {location && (
          <div className="location-info">
            <p>Twoja lokalizacja: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
          </div>
        )}
        
        {browserInfo && (
          <div className="browser-info">
            <p>Przeglądarka: {browserInfo.appName}</p>
            <p>System: {browserInfo.platform}</p>
            <p>User Agent: {browserInfo.userAgent.substring(0, 80)}...</p>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>&copy; 2025 Radio Internetowe. Wszelkie prawa zastrzeżone.</p>
      </footer>
      
      <PrivacyPopup />
    </div>
  );
}

export default App;