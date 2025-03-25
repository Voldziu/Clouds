// Function to initialize gallery
function initializeGallery() {
  const galleryContainer = document.getElementById('gallery');
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const closeModal = document.querySelector('.close-modal');
  
  if (!galleryContainer || !modal || !modalImage || !closeModal) {
    console.error('Gallery elements not found in the DOM');
    return;
  }
  
  // Load images from gallery folder
  loadGalleryImages(galleryContainer, modalImage, modal);
  
  // Close modal when clicking on close button
  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  // Close modal when clicking outside the image
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  // Close modal on ESC key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// Function to load images from gallery folder
function loadGalleryImages(galleryContainer, modalImage, modal) {
  // Use only local images from the gallery directory
  const imagePaths = [
    'gallery/chom1.jpeg',
    'gallery/chom2.jpeg',
    'gallery/chom3.jpeg',
    'gallery/chom4.jpeg',
    'gallery/chom5.jpeg',
    'gallery/chom6.jpeg',
    'gallery/chom7.jpeg',
    'gallery/chom8.jpeg',
    'gallery/chom9.jpeg',
    'gallery/chom10.jpeg',
    'gallery/chom12.jpeg',
    'gallery/chom13.jpeg',
    'gallery/chom14.jpeg',
    'gallery/chom15.jpeg',
    'gallery/chom16.jpeg',
    'gallery/chom17.jpeg',
    
  ];
  
  // Clear the gallery container
  galleryContainer.innerHTML = '';
  
  // Create gallery items using local images only
  imagePaths.forEach((path, index) => {
    createGalleryItem(galleryContainer, path, index, modalImage, modal);
  });
  
  // Set up lazy loading for images
  setupLazyLoading();
}

// Function to create a gallery item
function createGalleryItem(container, imagePath, index, modalImage, modal) {
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  
  // Create image placeholder
  galleryItem.innerHTML = `<div class="image-placeholder"></div>`;
  container.appendChild(galleryItem);
  
  // Create the actual image but don't load it yet
  const img = new Image();
  img.alt = `Gallery image ${index + 1}`;
  
  // Set data-src instead of src for lazy loading
  img.dataset.src = imagePath;
  
  // Add click event to open modal
  galleryItem.addEventListener('click', () => {
    // Ensure the high-resolution image is loaded for the modal
    modalImage.src = imagePath;
    modal.classList.add('active');
  });
  
  // Store the reference to the div and image for lazy loading
  galleryItem.dataset.index = index;
}

// Function to set up lazy loading for images
function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const galleryItem = entry.target;
          const index = galleryItem.dataset.index;
          const imagePath = `gallery/chom${parseInt(index) + 1}.jpeg`;
          
          // Create actual image element
          const img = new Image();
          img.src = imagePath;
          img.alt = `Chomik image ${parseInt(index) + 1}`;
          img.className = 'gallery-image';
          
          // Handle image load event
          img.onload = function() {
            // Replace placeholder with actual image
            const placeholder = galleryItem.querySelector('.image-placeholder');
            if (placeholder) {
              galleryItem.removeChild(placeholder);
            }
            galleryItem.appendChild(img);
          };
          
          // Handle image error
          img.onerror = function() {
            console.error(`Failed to load image: ${imagePath}`);
            galleryItem.innerHTML = `<div class="image-error">Image not available</div>`;
          };
          
          observer.unobserve(galleryItem);
        }
      });
    }, {
      rootMargin: '100px' // Load images when they're 100px from viewport
    });
    
    galleryItems.forEach(item => {
      imageObserver.observe(item);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    loadAllImagesImmediately();
  }
}

// Fallback function to load all images immediately
function loadAllImagesImmediately() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach((item, index) => {
    const imagePath = `gallery/chom${index + 1}.jpeg`;
    
    // Create actual image element
    const img = new Image();
    img.src = imagePath;
    img.alt = `Chomik image ${index + 1}`;
    img.className = 'gallery-image';
    
    // Handle image load event
    img.onload = function() {
      // Replace placeholder with actual image
      const placeholder = item.querySelector('.image-placeholder');
      if (placeholder) {
        item.removeChild(placeholder);
      }
      item.appendChild(img);
    };
    
    // Handle image error
    img.onerror = function() {
      console.error(`Failed to load image: ${imagePath}`);
      item.innerHTML = `<div class="image-error">Image not available</div>`;
    };
  });
}