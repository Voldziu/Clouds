import React, { useState } from 'react';

import './App.css';

// Zastąp to własnym kluczem API
const apiKey =process.env.REACT_APP_OPENWEATHERMAP_API_KEY; 

// Definicje warunków pogodowych
const weatherConditions = {
  Thunderstorm: {
    color: '#616161',
    title: 'Burza',
    subtitle: 'Uważaj na błyskawice!',
    icon: '⚡️'
  },
  Drizzle: {
    color: '#0044CC',
    title: 'Mżawka',
    subtitle: 'Lekkie opady',
    icon: '🌦️'
  },
  Rain: {
    color: '#005BEA',
    title: 'Deszcz',
    subtitle: 'Weź parasol',
    icon: '🌧️'
  },
  Snow: {
    color: '#00d2ff',
    title: 'Śnieg',
    subtitle: 'Ubierz się ciepło',
    icon: '❄️'
  },
  Clear: {
    color: '#f7b733',
    title: 'Słonecznie',
    subtitle: 'Idealna pogoda!',
    icon: '☀️'
  },
  Clouds: {
    color: '#1F1C2C',
    title: 'Pochmurno',
    subtitle: 'Może przejaśni się później',
    icon: '☁️'
  },
  Mist: {
    color: '#3CD3AD',
    title: 'Mgła',
    subtitle: 'Uważaj na drodze',
    icon: '🌫️'
  }
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);

  // Funkcja do pobierania danych pogodowych na podstawie nazwy miasta
  const getWeather = async () => {
    if (!city.trim()) {
      alert('Proszę wpisać nazwę miasta');
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${apiKey}&units=metric&lang=pl`
      );

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Sprawdzenie, czy dane pogodowe są poprawne
      if (!data || !data.weather || data.weather.length === 0) {
        alert('Nie udało się pobrać danych pogodowych.');
        return;
      }

      setWeatherData(data);
    } catch (error) {
      console.error('Błąd:', error);
      alert(error.message || 'Wystąpił błąd podczas pobierania danych');
    }
  };

  // Funkcja do pobierania pogody na podstawie lokalizacji użytkownika
  const getLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pl`
          )
            .then(response => response.json())
            .then(data => setWeatherData(data))
            .catch(error => console.error(error));
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert('Aby pobrać pogodę dla Twojej lokalizacji, musisz zezwolić na dostęp do lokalizacji.');
          } else {
            alert(`Błąd geolokalizacji: ${error.message}`);
          }
        }
      );
    } else {
      alert('Twoja przeglądarka nie wspiera geolokalizacji');
    }
  };

  // Określenie warunków pogodowych na podstawie danych
  const condition = weatherData
    ? weatherConditions[weatherData.weather[0].main] || weatherConditions.Clear
    : weatherConditions.Clear;

  return (
    <div className="App" style={{ backgroundColor: condition.color }}>
      <h1>{condition.title}</h1>
      <h2>{condition.subtitle}</h2>
      
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Wpisz nazwę miasta"
          className="city-input"
        />
        <button onClick={getWeather} className="weather-button">Sprawdź pogodę</button>
        <button onClick={getLocationWeather} className="location-button">Użyj mojej lokalizacji</button>
      </div>

      {weatherData && (
        <div id="weatherInfo">
          <h2>{weatherData.name}, {weatherData.sys.country}</h2>
          <p className="weather-description">{condition.icon} {weatherData.weather[0].description}</p>
          <div className="weather-details">
            <p>Temperatura: <strong>{weatherData.main.temp}°C</strong></p>
            <p>Ciśnienie: <strong>{weatherData.main.pressure} hPa</strong></p>
            <p>Wilgotność: <strong>{weatherData.main.humidity}%</strong></p>
            <p>Prędkość wiatru: <strong>{weatherData.wind.speed} m/s</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;