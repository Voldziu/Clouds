let pageUrls = { 
  about: '/index.html?about',
  contact: '/index.html?contact',
  gallery: '/index.html?gallery'
};

function OnStartUp() { 
  popStateHandler(); 
}

OnStartUp();

document.querySelector('#about-link').addEventListener('click', (event) => { 
  let stateObj = { page: 'about' }; 
  document.title = 'About'; 
  history.pushState(stateObj, "about", "?about"); 
  RenderAboutPage(); 
});

document.querySelector('#contact-link').addEventListener('click', (event) => { 
  let stateObj = { page: 'contact' }; 
  document.title = 'Contact'; 
  history.pushState(stateObj, "contact", "?contact"); 
  RenderContactPage(); 
});

document.querySelector('#gallery-link').addEventListener('click', (event) => { 
  let stateObj = { page: 'gallery' }; 
  document.title = 'Gallery'; 
  history.pushState(stateObj, "gallery", "?gallery"); 
  RenderGalleryPage(); 
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

function RenderAboutPage() { 
  document.querySelector('main').innerHTML = `
    <h1 class="title">About Me</h1>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
    <p>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
  `;
}

function RenderContactPage() { 
  document.querySelector('main').innerHTML = `
    <h1 class="title">Contact with me</h1>
    <form id="contact-form">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>
      <div id="name-error" class="error"></div>
      
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>
      <div id="email-error" class="error"></div>
      
      <label for="message">Message:</label>
      <textarea id="message" name="message" required></textarea>
      <div id="message-error" class="error"></div>
      
      <div class="recaptcha-container">
        <div id="recaptcha" class="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>
        <div id="recaptcha-error" class="error"></div>
      </div>
      
      <button type="submit">Send</button>
    </form>
  `;
  
  // Initialize form validation after the form is rendered
  if (typeof initializeFormValidation === 'function') {
    initializeFormValidation();
  }
}

function RenderGalleryPage() {
  document.querySelector('main').innerHTML = `
    <h1 class="title">Gallery</h1>
    <div class="gallery-container" id="gallery"></div>
    <div class="modal" id="image-modal">
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <img id="modal-image" src="" alt="Full size image">
      </div>
    </div>
  `;
  
  // Initialize gallery after the gallery container is rendered
  if (typeof initializeGallery === 'function') {
    initializeGallery();
  }
}

function popStateHandler() { 
  let loc = window.location.href.toString().split(window.location.host)[1]; 
  
  if (loc === pageUrls.contact) {
    RenderContactPage();
    document.title = 'Contact';
  } else if (loc === pageUrls.about) {
    RenderAboutPage();
    document.title = 'About';
  } else if (loc === pageUrls.gallery) {
    RenderGalleryPage();
    document.title = 'Gallery';
  }
}

window.onpopstate = popStateHandler;