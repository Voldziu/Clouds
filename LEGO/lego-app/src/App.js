import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [legoSets, setLegoSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    setNumber: '',
    theme: '',
    pieces: '',
    minifigures: '',
    releaseYear: '',
    price: '',
    category: '',
    ageGroup: '',
    rarity: 'Standard',
    image: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = 'http://localhost:3000';

  // Pobieranie wszystkich zestawów LEGO przy ładowaniu aplikacji
  useEffect(() => {
    fetchLegoSets();
  }, []);

  // Funkcja pobierająca wszystkie zestawy
  const fetchLegoSets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/legosets`);
      if (!response.ok) {
        throw new Error('Nie udało się pobrać danych');
      }
      const data = await response.json();
      setLegoSets(data);
      setError(null);
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych: ' + err.message);
      console.error('Błąd:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obsługa zmiany danych w formularzu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Obsługa wyboru pliku
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Sprawdzamy, czy plik jest obrazem
      if (!file.type.match('image.*')) {
        alert('Proszę wybrać plik obrazu (JPG, PNG, GIF, itp.)');
        return;
      }
      
      // Sprawdzamy rozmiar pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Plik jest zbyt duży. Maksymalny rozmiar to 5MB.');
        return;
      }
      
      setSelectedFile(file);
      
      // Tworzymy podgląd obrazu
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          image: e.target.result // Tymczasowy podgląd (data URL)
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Funkcja przesyłająca zdjęcie na serwer
  const uploadImage = async () => {
    if (!selectedFile) {
      return null; // Brak pliku do przesłania
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const xhr = new XMLHttpRequest();
      
      // Monitorowanie postępu przesyłania
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      // Oczekujemy na zakończenie żądania
      const response = await new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error('Błąd przesyłania pliku'));
            }
          }
        };
        
        xhr.open('POST', `${API_URL}/upload`, true);
        xhr.send(formData);
      });
      
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return response.imagePath; // Zwracamy ścieżkę do przesłanego pliku
    } catch (error) {
      console.error('Błąd przesyłania zdjęcia:', error);
      setIsUploading(false);
      alert('Nie udało się przesłać zdjęcia: ' + error.message);
      return null;
    }
  };

  // Resetowanie formularza
  const resetForm = () => {
    setFormData({
      name: '',
      setNumber: '',
      theme: '',
      pieces: '',
      minifigures: '',
      releaseYear: '',
      price: '',
      category: '',
      ageGroup: '',
      rarity: 'Standard',
      image: ''
    });
    setIsEditing(false);
    setSelectedSet(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Funkcja dodająca nowy zestaw
  const handleAddSet = async (e) => {
    e.preventDefault();
    
    // Walidacja wymaganych pól
    if (!formData.name || !formData.setNumber || !formData.theme) {
      alert('Wypełnij wymagane pola: Nazwa, Numer zestawu i Temat');
      return;
    }

    try {
      // Najpierw przesyłamy zdjęcie (jeśli wybrano)
      let imagePath = formData.image;
      if (selectedFile) {
        imagePath = await uploadImage();
        if (!imagePath) {
          if (!window.confirm('Wystąpił problem z przesłaniem zdjęcia. Czy chcesz kontynuować bez zdjęcia?')) {
            return;
          }
          imagePath = '/public/images/placeholder.jpg';
        }
      }

      // Tworzymy kopię formData z zaktualizowaną ścieżką do zdjęcia
      const updatedFormData = {
        ...formData,
        image: imagePath
      };

      const response = await fetch(`${API_URL}/legosets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        throw new Error('Nie udało się dodać zestawu');
      }

      const newSet = await response.json();
      setLegoSets([...legoSets, newSet]);
      resetForm();
      alert('Zestaw został dodany pomyślnie!');
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania zestawu: ' + err.message);
      console.error('Błąd:', err);
    }
  };

  // Funkcja aktualizująca zestaw
  const handleUpdateSet = async (e) => {
    e.preventDefault();
    
    if (!selectedSet) return;

    try {
      // Najpierw przesyłamy zdjęcie (jeśli wybrano)
      let imagePath = formData.image;
      if (selectedFile) {
        imagePath = await uploadImage();
        if (!imagePath) {
          if (!window.confirm('Wystąpił problem z przesłaniem zdjęcia. Czy chcesz kontynuować bez zmiany zdjęcia?')) {
            return;
          }
          // Zachowaj obecne zdjęcie
          imagePath = selectedSet.image;
        }
      }

      // Tworzymy kopię formData z zaktualizowaną ścieżką do zdjęcia
      const updatedFormData = {
        ...formData,
        image: imagePath
      };

      const response = await fetch(`${API_URL}/legosets/${selectedSet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować zestawu');
      }

      const updatedSet = await response.json();
      setLegoSets(legoSets.map(set => set.id === updatedSet.id ? updatedSet : set));
      resetForm();
      alert('Zestaw został zaktualizowany pomyślnie!');
    } catch (err) {
      setError('Wystąpił błąd podczas aktualizacji zestawu: ' + err.message);
      console.error('Błąd:', err);
    }
  };

  // Funkcja usuwająca zestaw
  const handleDeleteSet = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/legosets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć zestawu');
      }

      setLegoSets(legoSets.filter(set => set.id !== id));
      alert('Zestaw został usunięty pomyślnie!');
    } catch (err) {
      setError('Wystąpił błąd podczas usuwania zestawu: ' + err.message);
      console.error('Błąd:', err);
    }
  };

  // Funkcja ustawiająca formularz do edycji
  const handleEditSet = (set) => {
    setSelectedSet(set);
    setFormData({
      name: set.name,
      setNumber: set.setNumber,
      theme: set.theme,
      pieces: set.pieces,
      minifigures: set.minifigures,
      releaseYear: set.releaseYear,
      price: set.price,
      category: set.category || '',
      ageGroup: set.ageGroup || '',
      rarity: set.rarity || 'Standard',
      image: set.image || ''
    });
    setIsEditing(true);
    
    // Przewijanie do formularza
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="app-container">
      <header>
        <h1>LEGO Kolekcja Manager</h1>
      </header>

      <div className="content">
        <section className="form-section">
          <h2>{isEditing ? 'Edytuj zestaw LEGO' : 'Dodaj nowy zestaw LEGO'}</h2>
          <form onSubmit={isEditing ? handleUpdateSet : handleAddSet}>
            <div className="form-group">
              <label htmlFor="name">Nazwa zestawu *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setNumber">Numer zestawu *</label>
              <input
                type="text"
                id="setNumber"
                name="setNumber"
                value={formData.setNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Temat *</label>
              <input
                type="text"
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pieces">Liczba klocków</label>
                <input
                  type="number"
                  id="pieces"
                  name="pieces"
                  value={formData.pieces}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="minifigures">Liczba minifigurek</label>
                <input
                  type="number"
                  id="minifigures"
                  name="minifigures"
                  value={formData.minifigures}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="releaseYear">Rok wydania</label>
                <input
                  type="number"
                  id="releaseYear"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleInputChange}
                  min="1949"
                  max="2025"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Cena</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Kategoria</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ageGroup">Grupa wiekowa</label>
                <input
                  type="text"
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rarity">Rzadkość</label>
                <select
                  id="rarity"
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Hard to Find">Hard to Find</option>
                  <option value="Exclusive">Exclusive</option>
                  <option value="Rare">Rare</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="imageFile">Zdjęcie zestawu</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="file-input"
                />
                <label htmlFor="imageFile" className="file-input-label">
                  Wybierz plik zdjęcia
                </label>
                {selectedFile && (
                  <span className="file-name">{selectedFile.name}</span>
                )}
              </div>
              
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}% przesłano</span>
                </div>
              )}
              
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image.startsWith('data:') ? formData.image : `${API_URL}${formData.image}`} alt="Podgląd" />
                </div>
              )}
              
              <p className="image-info">
                Obsługiwane formaty: JPG, PNG, GIF. Maksymalny rozmiar: 5MB.
                <br />
                Zdjęcie zostanie automatycznie zoptymalizowane.
              </p>
            </div>

            <div className="button-group">
              <button type="submit">
                {isEditing ? 'Aktualizuj zestaw' : 'Dodaj zestaw'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="cancel-button">
                  Anuluj edycję
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="lego-sets-section">
          <h2>Kolekcja zestawów LEGO</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-message">Ładowanie zestawów...</div>
          ) : legoSets.length === 0 ? (
            <div className="empty-message">Brak zestawów LEGO w kolekcji</div>
          ) : (
            <div className="lego-sets-grid">
              {legoSets.map(set => (
                <div key={set.id} className="lego-set-card">
                  <div className="lego-set-image">
                    <img src={set.image.startsWith('http') ? set.image : `${API_URL}${set.image}`} alt={set.name} />
                  </div>
                  <div className="lego-set-info">
                    <h3>{set.name}</h3>
                    <p><strong>Numer:</strong> {set.setNumber}</p>
                    <p><strong>Temat:</strong> {set.theme}</p>
                    <p><strong>Klocki:</strong> {set.pieces}</p>
                    <p><strong>Rok:</strong> {set.releaseYear}</p>
                    <p><strong>Cena:</strong> ${set.price}</p>
                    {set.category && <p><strong>Kategoria:</strong> {set.category}</p>}
                    {set.ageGroup && <p><strong>Wiek:</strong> {set.ageGroup}</p>}
                    {set.rarity && <p><strong>Rzadkość:</strong> {set.rarity}</p>}
                    <div className="button-group">
                      <button onClick={() => handleEditSet(set)} className="edit-button">
                        Edytuj
                      </button>
                      <button onClick={() => handleDeleteSet(set.id)} className="delete-button">
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer>
        <p>&copy; 2025 LEGO Kolekcja Manager</p>
      </footer>
    </div>
  );
}

export default App;