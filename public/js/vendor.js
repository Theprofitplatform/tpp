// Vendor libraries and dependencies
// This file contains third-party libraries used across the site

// Basic polyfills and utilities
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Basic intersection observer polyfill check
if (!window.IntersectionObserver) {
  console.warn('IntersectionObserver not supported - animations may not work');
}

console.log('TPP Vendor libraries loaded');