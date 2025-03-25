// Function to initialize form validation
function initializeFormValidation() {
  const form = document.getElementById('contact-form');
  
  if (!form) {
    console.error('Contact form not found in the DOM');
    return;
  }
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    if (validateForm()) {
      // Form is valid, would normally submit to server
      alert('Form submitted successfully!');
      form.reset();
    }
  });
  
  // Add input event listeners for real-time validation
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  
  nameInput.addEventListener('input', () => {
    validateName(nameInput.value);
  });
  
  emailInput.addEventListener('input', () => {
    validateEmail(emailInput.value);
  });
  
  messageInput.addEventListener('input', () => {
    validateMessage(messageInput.value);
  });
  
  // Load reCAPTCHA script
  loadRecaptchaScript();
}

// Function to validate form with reCAPTCHA
function validateForm() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  
  // Reset error messages
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
  
  // Validate all fields
  const isNameValid = validateName(name);
  const isEmailValid = validateEmail(email);
  const isMessageValid = validateMessage(message);
  
  // Check reCAPTCHA
  const recaptchaError = document.getElementById('recaptcha-error');
  let isRecaptchaValid = false;
  
  // Check if reCAPTCHA has been loaded and if it has been completed
  if (window.grecaptcha) {
    // Get the reCAPTCHA response
    const recaptchaResponse = grecaptcha.getResponse();
    
    if (!recaptchaResponse) {
      recaptchaError.textContent = 'Please complete the reCAPTCHA verification';
    } else {
      isRecaptchaValid = true;
    }
  } else {
    recaptchaError.textContent = 'reCAPTCHA could not be loaded. Please try again later.';
  }
  
  return isNameValid && isEmailValid && isMessageValid && isRecaptchaValid;
}

// Function to validate name
function validateName(name) {
  const nameError = document.getElementById('name-error');
  
  if (!name) {
    nameError.textContent = 'Name is required';
    return false;
  }
  
  if (name.length < 2) {
    nameError.textContent = 'Name should be at least 2 characters long';
    return false;
  }
  
  nameError.textContent = '';
  return true;
}

// Function to validate email
function validateEmail(email) {
  const emailError = document.getElementById('email-error');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    emailError.textContent = 'Email is required';
    return false;
  }
  
  if (!emailRegex.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    return false;
  }
  
  emailError.textContent = '';
  return true;
}

// Function to validate message
function validateMessage(message) {
  const messageError = document.getElementById('message-error');
  
  if (!message) {
    messageError.textContent = 'Message is required';
    return false;
  }
  
  if (message.length < 10) {
    messageError.textContent = 'Message should be at least 10 characters long';
    return false;
  }
  
  messageError.textContent = '';
  return true;
}

// Function to load reCAPTCHA script
function loadRecaptchaScript() {
  if (!document.getElementById('recaptcha-script')) {
    // Create reCAPTCHA script element
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    
    // Add callback for when reCAPTCHA is ready
    script.onload = function() {
      console.log('reCAPTCHA script loaded successfully');
      
      // Reset reCAPTCHA if it was previously rendered
      if (window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset();
        } catch (e) {
          console.warn('Could not reset reCAPTCHA:', e);
        }
      }
    };
    
    // Handle script loading error
    script.onerror = function() {
      console.error('Failed to load reCAPTCHA script');
      document.getElementById('recaptcha-error').textContent = 
        'Could not load CAPTCHA verification. Please check your internet connection.';
    };
    
    // Add script to page
    document.head.appendChild(script);
  }
}