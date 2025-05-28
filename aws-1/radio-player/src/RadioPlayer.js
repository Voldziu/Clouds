import React, { useState, useRef, useEffect } from 'react';

const stations = {
    Antyradio: 'https://ant-waw-01.cdn.eurozet.pl/ant-waw.mp3',
    RMF_FM: 'https://rs6-krk2.rmfstream.pl/RMFFM48',
    Radio_Maryja: 'https://radiomaryja.fastcast4u.com/proxy/radiomaryja?mp=/1'
  };

  
  const RadioPlayer = () => {
    
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStation, setCurrentStation] = useState(Object.keys(stations)[0]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(null);
  
    useEffect(() => {
      audioRef.current = new Audio(stations[currentStation]);
      audioRef.current.volume = volume;
      
      const timer = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);
  
    const switchStation = async (newStation) => {
      setIsLoading(true);
      const wasPlaying = isPlaying;
      
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      // Create new audio element
      audioRef.current = new Audio(stations[newStation]);
      audioRef.current.volume = volume;
      
      // If was playing, start new station
      if (wasPlaying) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Failed to play new station:', error);
          setIsPlaying(false);
        }
      }
      
      setIsLoading(false);
    };
  
    const handleStationChange = (e) => {
      const newStation = e.target.value;
      setCurrentStation(newStation);
      switchStation(newStation);
    };
  
    const togglePlayPause = async () => {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Playback failed:', error);
          setIsPlaying(false);
        }
      }
    };
  

  
    const handleVolumeChange = (e) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    };
  
    return (
      <div className="radio-player">
        <h2>Odtwarzacz Radiowy</h2>
        <select value={currentStation} onChange={handleStationChange} disabled={isLoading}>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
        <button 
          onClick={togglePlayPause}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ff4444' : '#4CAF50',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Ładowanie...' : (isPlaying ? 'Pauza' : 'Odtwórz')}
        </button>
        <div>
          <label>Głośność: </label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
          />
        </div>
        <div className="date-time">
          <p>Data: {currentDateTime.toLocaleDateString()}</p>
          <p>Godzina: {currentDateTime.toLocaleTimeString()}</p>
        </div>
      </div>
    );
  };
  
  export default RadioPlayer;