const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());







//Ustawienie silnika szablonów EJS
app.set('view engine', 'ejs');

//Główna trasa
app.get('/', (req, res) => {res.render('index', { title: 'Strona główna', message: 'Witaj świecie!' });});


app.post('/', (req, res) => {res.send('Got a POST request');});
app.post('/submit-form', (req, res) => {
  console.log(req.body);
  res.send('Formularz został wysłany!');
  });
app.put('/user', (req, res) => {res.send('Got a PUT request at /user');});
app.delete('/user', (req, res) => {res.send('Got a DELETE request at /user');});
app.get('/contact', (req, res) => {res.render('contact', { title: 'Kontakt' });});

// Trasa dla podstrony "Galeria"
app.get('/gallery', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const galleryDir = path.join(__dirname, 'public', 'images', 'gallery');
  
  // Odczytaj pliki z katalogu galerii
  fs.readdir(galleryDir, (err, files) => {
      if (err) {
          console.error('Błąd odczytu katalogu galerii:', err);
          return res.status(500).render('error', { 
              title: 'Błąd', 
              message: 'Nie można wczytać galerii' 
          });
      }

      // Przefiltruj tylko pliki obrazów
      const imageFiles = files.filter(file => 
          ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
      );

      res.render('gallery', { 
          title: 'Galeria', 
          images: imageFiles 
      });
  });
});

app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Nie znaleziono' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Błąd serwera' });
});




  

  
  function shutdown() {
    console.log('Closing server...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }
  
  // Listen for termination signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

//Start serwera
module.exports.handler = serverless(app);
if (process.env.NODE_ENV !== 'serverless') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Aplikacja nasłuchuje na porcie ${port}`);
  });
}