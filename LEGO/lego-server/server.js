// Importujemy potrzebne moduły
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = express();
const port = 3000;

// Tworzymy folder dla zdjęć, jeśli nie istnieje
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Tworzymy domyślny obrazek placeholder, jeśli nie istnieje
const placeholderPath = path.join(imagesDir, 'placeholder.png');
if (!fs.existsSync(placeholderPath)) {
  // Utworzenie prostego obrazka za pomocą sharp
  sharp({
    create: {
      width: 300,
      height: 200,
      channels: 3,
      background: { r: 200, g: 200, b: 200 }
    }
  })
  .composite([{
    input: Buffer.from(`<svg width="300" height="200">
      <rect width="300" height="200" fill="#cccccc"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#666666">Brak zdjęcia</text>
    </svg>`),
    top: 0,
    left: 0
  }])
  .jpeg()
  .toFile(placeholderPath)
  .catch(err => console.error('Nie udało się utworzyć obrazka placeholder:', err));
}

// Konfiguracja multer do obsługi przesyłania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Tworzymy unikalną nazwę pliku (timestamp + oryginalna nazwa)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'lego-' + uniqueSuffix + ext);
  }
});

// Filtr akceptujący tylko obrazy
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Tylko pliki obrazów są dozwolone!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit 5MB
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Udostępniamy folder public do serwowania statycznych plików
app.use('/public', express.static(path.join(__dirname, 'public')));

// Dane - kolekcja zestawów LEGO
let legoSets = [
  {
    id: 1,
    name: "Millennium Falcon",
    setNumber: "75192",
    theme: "Star Wars",
    pieces: 7541,
    minifigures: 8,
    releaseYear: 2017,
    price: 849.99,
    category: "Ultimate Collector Series",
    ageGroup: "16+",
    rarity: "Exclusive",
    image: "/public/images/placeholder.png"
  },
  {
    id: 2,
    name: "Hogwarts Castle",
    setNumber: "71043",
    theme: "Harry Potter",
    pieces: 6020,
    minifigures: 27,
    releaseYear: 2018,
    price: 399.99,
    category: "Microscale",
    ageGroup: "16+",
    rarity: "Hard to Find",
    image: "/public/images/placeholder.png"
  },
  {
    id: 3,
    name: "Titanic",
    setNumber: "10294",
    theme: "Creator Expert",
    pieces: 9090,
    minifigures: 0,
    releaseYear: 2021,
    price: 629.99,
    category: "Icons",
    ageGroup: "18+",
    rarity: "Exclusive",
    image: "/public/images/placeholder.png"
  },
  {
    id: 4,
    name: "Nintendo Entertainment System",
    setNumber: "71374",
    theme: "Super Mario",
    pieces: 2646,
    minifigures: 0,
    releaseYear: 2020,
    price: 229.99,
    category: "Electronics",
    ageGroup: "18+",
    rarity: "Standard",
    image: "/public/images/placeholder.png"
  },
  {
    id: 5,
    name: "Ghostbusters ECTO-1",
    setNumber: "10274",
    theme: "Creator Expert",
    pieces: 2352,
    minifigures: 0,
    releaseYear: 2020,
    price: 199.99,
    category: "Vehicles",
    ageGroup: "18+",
    rarity: "Standard",
    image: "/public/images/placeholder.png"
  },
  {
    id: 6,
    name: "Colosseum",
    setNumber: "10276",
    theme: "Creator Expert",
    pieces: 9036,
    minifigures: 0,
    releaseYear: 2020,
    price: 549.99,
    category: "Architecture",
    ageGroup: "18+",
    rarity: "Hard to Find",
    image: "/public/images/placeholder.png"
  },
  {
    id: 7,
    name: "Camp Nou - FC Barcelona",
    setNumber: "10284",
    theme: "Creator Expert",
    pieces: 5509,
    minifigures: 0,
    releaseYear: 2021,
    price: 349.99,
    category: "Sports",
    ageGroup: "18+",
    rarity: "Standard",
    image: "/public/images/placeholder.png"
  },
  {
    id: 8,
    name: "Daily Bugle",
    setNumber: "76178",
    theme: "Marvel",
    pieces: 3772,
    minifigures: 25,
    releaseYear: 2021,
    price: 299.99,
    category: "Buildings",
    ageGroup: "18+",
    rarity: "Hard to Find",
    image: "/public/images/placeholder.png"
  },
  {
    id: 9,
    name: "Bonsai Tree",
    setNumber: "10281",
    theme: "Botanical Collection",
    pieces: 878,
    minifigures: 0,
    releaseYear: 2021,
    price: 49.99,
    category: "Plants",
    ageGroup: "18+",
    rarity: "Standard",
    image: "/public/images/placeholder.png"
  },
  {
    id: 10,
    name: "Land Rover Defender",
    setNumber: "42110",
    theme: "Technic",
    pieces: 2573,
    minifigures: 0,
    releaseYear: 2019,
    price: 199.99,
    category: "Vehicles",
    ageGroup: "11+",
    rarity: "Standard",
    image: "/public/images/placeholder.png"
  }
];

// Endpoint do pobierania wszystkich zestawów
app.get('/legosets', (req, res) => {
  res.json(legoSets);
});

// Endpoint do pobierania zestawu po ID
app.get('/legosets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const legoSet = legoSets.find(set => set.id === id);
  
  if (legoSet) {
    res.json(legoSet);
  } else {
    res.status(404).json({ message: "Zestaw LEGO o podanym ID nie został znaleziony." });
  }
});

// Endpoint do pobierania zestawów wg kategorii
app.get('/legosets/category/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filteredSets = legoSets.filter(set => 
    set.category.toLowerCase() === category || 
    set.theme.toLowerCase() === category
  );
  
  if (filteredSets.length > 0) {
    res.json(filteredSets);
  } else {
    res.status(404).json({ message: "Nie znaleziono zestawów LEGO w podanej kategorii." });
  }
});

// Endpoint do przesyłania zdjęcia
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Brak przesłanego pliku' });
    }

    // Kompresja i zmiana rozmiaru zdjęcia za pomocą sharp
    const inputPath = req.file.path;
    const outputFilename = 'compressed-' + req.file.filename;
    const outputPath = path.join(imagesDir, outputFilename);

    await sharp(inputPath)
      .resize(800) // Maksymalna szerokość 800px (zachowuje proporcje)
      .jpeg({ quality: 80 }) // Kompresja JPEG - jakość 80%
      .toFile(outputPath);

    // Usuwamy oryginalny plik
    fs.unlinkSync(inputPath);

    // Zwracamy ścieżkę do skompresowanego pliku
    res.json({ 
      success: true, 
      imagePath: `/public/images/${outputFilename}`
    });
  } catch (error) {
    console.error('Błąd podczas przetwarzania zdjęcia:', error);
    res.status(500).json({ 
      message: 'Wystąpił błąd podczas przetwarzania zdjęcia',
      error: error.message
    });
  }
});

// Endpoint do dodawania nowego zestawu
app.post('/legosets', (req, res) => {
  const { 
    name, 
    setNumber, 
    theme, 
    pieces, 
    minifigures, 
    releaseYear, 
    price, 
    category, 
    ageGroup, 
    rarity, 
    image 
  } = req.body;
  
  // Walidacja podstawowych danych
  if (!name || !setNumber || !theme) {
    return res.status(400).json({ 
      message: "Brak wymaganych danych. Wymagane pola: name, setNumber, theme." 
    });
  }
  
  // Automatyczne generowanie ID (następne dostępne ID)
  const maxId = legoSets.reduce((max, set) => (set.id > max ? set.id : max), 0);
  const newId = maxId + 1;
  console.log(image);
  const newLegoSet = { 
    id: newId, 
    name, 
    setNumber, 
    theme, 
    pieces: pieces || 0,
    minifigures: minifigures || 0,
    releaseYear: releaseYear || new Date().getFullYear(),
    price: price || 0,
    category: category || theme,
    ageGroup: ageGroup || "All",
    rarity: rarity || "Standard",
    image: image || "/public/images/placeholder.jpg"
  };
  
  legoSets.push(newLegoSet);
  res.status(201).json(newLegoSet);
});

// Endpoint do aktualizacji zestawu
app.put('/legosets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updateData = req.body;
  
  const setIndex = legoSets.findIndex(set => set.id === id);
  
  if (setIndex === -1) {
    return res.status(404).json({ message: "Zestaw LEGO o podanym ID nie został znaleziony." });
  }
  
  // Aktualizujemy tylko te pola, które zostały przesłane w żądaniu
  // Nie pozwalamy na aktualizację ID
  delete updateData.id; 
  
  // Aktualizacja danych zestawu
  legoSets[setIndex] = { 
    ...legoSets[setIndex], 
    ...updateData 
  };
  
  res.json(legoSets[setIndex]);
});

// Endpoint do usuwania zestawu
app.delete('/legosets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const setIndex = legoSets.findIndex(set => set.id === id);
  
  if (setIndex === -1) {
    return res.status(404).json({ message: "Zestaw LEGO o podanym ID nie został znaleziony." });
  }
  
  // Usuwamy zestaw
  const deletedSet = legoSets.splice(setIndex, 1)[0];
  
  // Jeśli zdjęcie nie jest placeholderem i istnieje, usuwamy je
  if (deletedSet.image && deletedSet.image !== '/public/images/placeholder.jpg') {
    const imagePath = path.join(__dirname, deletedSet.image);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Nie udało się usunąć pliku zdjęcia:', err);
      }
    }
  }
  
  res.json({ 
    message: "Zestaw LEGO został usunięty.",
    deletedSet
  });
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer LEGO REST API działa na http://localhost:${port}`);
});