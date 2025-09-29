// Plugins and utilities
// Common functionality and helpers

// Smooth scroll utility
function smoothScrollTo(element) {
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return re.test(phone);
}

// Animation utilities
function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.display = 'block';

  const start = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    element.style.opacity = progress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// Common event handlers
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

console.log('TPP Plugins loaded');