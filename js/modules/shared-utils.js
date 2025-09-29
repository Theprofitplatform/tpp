/**
 * Shared Utilities Library
 * Centralized helper functions for the entire application
 */

// DOM Utilities
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Event Delegation
export const delegate = (element, eventType, selector, handler) => {
    element.addEventListener(eventType, (e) => {
        const target = e.target.closest(selector);
        if (target) handler(e, target);
    });
};

// Debounce & Throttle
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Fetch with retry
export const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
    }
};

// Local Storage with expiry
export const storage = {
    set(key, value, expiryMinutes = 60) {
        const item = {
            value,
            expiry: Date.now() + (expiryMinutes * 60 * 1000)
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }
};

// Performance monitoring
export const measurePerformance = (name) => {
    const start = performance.now();
    return () => {
        const duration = performance.now() - start;
        console.log(`⚡ ${name} took ${duration.toFixed(2)}ms`);

        // Send to analytics
        if (window.gtag) {
            gtag('event', 'timing_complete', {
                name,
                value: Math.round(duration)
            });
        }
    };
};

// Lazy loading wrapper
export const lazyLoad = (importFunc) => {
    let module = null;
    return async (...args) => {
        if (!module) {
            module = await importFunc();
        }
        return module.default ? module.default(...args) : module(...args);
    };
};

// Intersection Observer for lazy components
export const observeLazy = (elements, callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '50px', ...options });

    elements.forEach(el => observer.observe(el));
    return observer;
};

// Module loader with caching
const moduleCache = new Map();
export const loadModule = async (moduleName) => {
    if (moduleCache.has(moduleName)) {
        return moduleCache.get(moduleName);
    }

    const module = await import(`./${moduleName}.js`);
    moduleCache.set(moduleName, module);
    return module;
};

// Feature detection
export const supports = {
    webp: async () => {
        const webp = new Image();
        webp.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        return new Promise(r => {
            webp.onload = webp.onerror = () => r(webp.width === 1);
        });
    },

    observer: 'IntersectionObserver' in window,
    customElements: 'customElements' in window,
    modules: 'noModule' in HTMLScriptElement.prototype,
    webWorker: 'Worker' in window,
    serviceWorker: 'serviceWorker' in navigator
};

// Analytics helper
export const track = (event, data = {}) => {
    // Google Analytics
    if (window.gtag) {
        gtag('event', event, data);
    }

    // Facebook Pixel
    if (window.fbq) {
        fbq('trackCustom', event, data);
    }

    // Custom tracking
    console.log('📊 Event tracked:', event, data);
};

// Ready state handler
export const ready = (fn) => {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

// Export all utilities
export default {
    $,
    $$,
    delegate,
    debounce,
    throttle,
    fetchWithRetry,
    storage,
    measurePerformance,
    lazyLoad,
    observeLazy,
    loadModule,
    supports,
    track,
    ready
};