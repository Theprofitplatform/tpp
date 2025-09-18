/**
 * The Profit Platform - Consolidated JavaScript
 * Optimized and consolidated functionality from main.js and homepage.js
 * Performance-focused with modern patterns
 */

// ================================
// CORE UTILITIES & PERFORMANCE
// ================================

// Throttle utility for performance-critical functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce utility for input handlers
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

// Check if animations should be reduced
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ================================
// SCROLL PROGRESS & PERFORMANCE
// ================================

class ScrollProgressManager {
    constructor() {
        this.progressBar = document.getElementById('progressBar');
        this.ticking = false;
        this.init();
    }

    updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);

        if (this.progressBar) {
            const currentWidth = parseFloat(this.progressBar.style.width) || 0;
            const targetWidth = scrollPercent;
            const diff = targetWidth - currentWidth;

            if (Math.abs(diff) > 0.1) {
                this.progressBar.style.width = (currentWidth + diff * 0.1) + '%';
            } else {
                this.progressBar.style.width = targetWidth + '%';
            }
        }
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateProgress());
            this.ticking = true;
            setTimeout(() => { this.ticking = false; }, 16); // ~60fps
        }
    }

    init() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
    }
}

// ================================
// MOBILE NAVIGATION MANAGER
// ================================

class MobileNavigationManager {
    constructor() {
        this.elements = {
            menuToggle: document.getElementById('menuToggle'),
            mobileNav: document.getElementById('mobileNav'),
            mobileNavOverlay: document.getElementById('mobileNavOverlay'),
            mobileNavClose: document.getElementById('mobileNavClose')
        };
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.elements.menuToggle || !this.elements.mobileNav) {
            console.warn('Mobile navigation elements not found');
            return;
        }

        this.bindEvents();
        this.addTouchFeedback();
    }

    bindEvents() {
        // Toggle button
        this.elements.menuToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Close button
        this.elements.mobileNavClose?.addEventListener('click', () => this.close());

        // Overlay click
        this.elements.mobileNavOverlay?.addEventListener('click', () => this.close());

        // Close on navigation link click
        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close on window resize for larger screens
        window.addEventListener('resize', () => {
            if (window.innerWidth > 968 && this.isOpen) {
                this.close();
            }
        });
    }

    addTouchFeedback() {
        if (!this.elements.menuToggle) return;

        this.elements.menuToggle.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });

        this.elements.menuToggle.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.elements.menuToggle?.classList.add('active');
        this.elements.mobileNav?.classList.add('active');
        this.elements.mobileNavOverlay?.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        // Update ARIA attributes
        this.elements.menuToggle?.setAttribute('aria-expanded', 'true');
        this.elements.mobileNav?.setAttribute('aria-hidden', 'false');
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.elements.menuToggle?.classList.remove('active');
        this.elements.mobileNav?.classList.remove('active');
        this.elements.mobileNavOverlay?.classList.remove('active');

        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';

        // Update ARIA attributes
        this.elements.menuToggle?.setAttribute('aria-expanded', 'false');
        this.elements.mobileNav?.setAttribute('aria-hidden', 'true');
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}

// ================================
// HEADER EFFECTS MANAGER
// ================================

class HeaderEffectsManager {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollTop = 0;
        this.init();
    }

    init() {
        if (!this.header) return;

        const throttledScroll = throttle(() => this.handleScroll(), 16);
        window.addEventListener('scroll', throttledScroll, { passive: true });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add/remove scrolled class
        if (scrollTop > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        this.updateActiveNavLink();
        this.lastScrollTop = scrollTop;
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        const headerHeight = this.header.offsetHeight;

        let activeSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ================================
// ENHANCED BUTTON SYSTEM
// ================================

class ButtonEffectsManager {
    constructor() {
        this.init();
        this.addRippleStyles();
    }

    init() {
        document.querySelectorAll('.btn').forEach(button => {
            this.addRippleEffect(button);
            this.addHoverEffects(button);
            this.addMagneticEffect(button);
        });
    }

    addRippleEffect(button) {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    }

    addHoverEffects(button) {
        button.addEventListener('mouseenter', function() {
            if (prefersReducedMotion) return;

            const transform = this.classList.contains('btn-primary') ?
                'translateY(-3px) scale(1.02)' : 'translateY(-2px) scale(1.02)';
            this.style.transform = transform;
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }

    addMagneticEffect(button) {
        if (prefersReducedMotion) return;

        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) translateY(-2px) scale(1.02)`;
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }

    addRippleStyles() {
        if (document.getElementById('ripple-styles')) return;

        const rippleStyle = document.createElement('style');
        rippleStyle.id = 'ripple-styles';
        rippleStyle.textContent = `
            @keyframes ripple {
                from {
                    transform: scale(0);
                    opacity: 1;
                }
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    }
}

// ================================
// SMOOTH SCROLLING MANAGER
// ================================

class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleClick.bind(this));
        });
    }

    handleClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));

        if (target) {
            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ================================
// INTERSECTION OBSERVER MANAGER WITH LAZY LOADING
// ================================

class IntersectionManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.lazyLoadOptions = {
            threshold: 0.1,
            rootMargin: '50px 0px'
        };
        this.init();
    }

    init() {
        this.setupAnimationObserver();
        this.setupCounterObserver();
        this.setupLazyLoading();
        this.setupImageLazyLoading();
    }

    setupAnimationObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'animated');

                    // Add staggered animation delay for grouped elements
                    const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                    const index = Array.from(siblings).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, this.observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    setupCounterObserver() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.counter').forEach(el => {
            counterObserver.observe(el);
        });
    }

    setupLazyLoading() {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyContent(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, this.lazyLoadOptions);

        // Observe elements marked for lazy loading
        document.querySelectorAll('[data-lazy-load]').forEach(el => {
            lazyObserver.observe(el);
        });

        // Observe below-fold sections
        document.querySelectorAll('section:nth-child(n+3)').forEach(section => {
            lazyObserver.observe(section);
        });
    }

    setupImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, this.lazyLoadOptions);

        // Observe images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Convert existing images to lazy loading
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.src && img.src && !this.isAboveFold(img)) {
                img.dataset.src = img.src;
                img.src = this.generatePlaceholder(img.width || 300, img.height || 200);
                img.classList.add('lazy-image');
                imageObserver.observe(img);
            }
        });
    }

    loadLazyContent(element) {
        // Add loading class
        element.classList.add('lazy-loading');

        // Simulate content loading with a delay
        setTimeout(() => {
            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');

            // Trigger any specific loading behavior
            const loadType = element.dataset.lazyLoad;
            if (loadType) {
                this.handleSpecificLazyLoad(element, loadType);
            }
        }, 100);
    }

    loadLazyImage(img) {
        img.classList.add('lazy-loading');

        const actualSrc = img.dataset.src;
        if (actualSrc) {
            const imageLoader = new Image();
            imageLoader.onload = () => {
                img.src = actualSrc;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
                img.removeAttribute('data-src');
            };
            imageLoader.onerror = () => {
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-error');
            };
            imageLoader.src = actualSrc;
        }
    }

    handleSpecificLazyLoad(element, type) {
        switch (type) {
            case 'testimonials':
                this.loadTestimonials(element);
                break;
            case 'stats':
                this.loadStats(element);
                break;
            case 'services':
                this.loadServices(element);
                break;
            case 'contact-form':
                this.loadContactForm(element);
                break;
            default:
                console.log(`Lazy loading: ${type} for element`, element);
        }
    }

    loadTestimonials(element) {
        const testimonialCards = element.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in', 'visible');
            }, index * 100);
        });
    }

    loadStats(element) {
        const statItems = element.querySelectorAll('.stats-item');
        statItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('fade-in', 'visible');
                // Trigger counter animation if present
                const counter = item.querySelector('.counter, [data-target]');
                if (counter) {
                    const target = parseFloat(counter.dataset.target || counter.textContent);
                    this.animateCounter(counter, target);
                }
            }, index * 150);
        });
    }

    loadServices(element) {
        const serviceCards = element.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in', 'visible');
            }, index * 120);
        });
    }

    loadContactForm(element) {
        const form = element.querySelector('form');
        if (form) {
            form.classList.add('fade-in', 'visible');
            // Initialize form enhancements
            if (window.WebsiteManager && window.WebsiteManager.getManager) {
                const formManager = window.WebsiteManager.getManager('formEnhancements');
                if (formManager) {
                    formManager.enhanceForm(form);
                }
            }
        }
    }

    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight;
    }

    generatePlaceholder(width, height) {
        // Generate a simple SVG placeholder
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Loading...</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    animateCounters(element) {
        const counters = element.querySelectorAll('.counter, [data-target]');

        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target || counter.textContent);
            this.animateCounter(counter, target);
        });
    }

    animateCounter(element, target, suffix = '') {
        let current = 0;
        const duration = 2000;
        const startTime = Date.now();

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            current = target * easedProgress;

            if (target % 1 === 0) {
                element.textContent = Math.floor(current) + suffix;
            } else {
                element.textContent = current.toFixed(1) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// ================================
// PRICING TOGGLE MANAGER
// ================================

class PricingToggleManager {
    constructor() {
        this.toggle = document.getElementById('pricingToggle');
        this.priceElements = document.querySelectorAll('.price');
        this.toggleLabels = document.querySelectorAll('.toggle-label');
        this.isAnnual = false;
        this.init();
    }

    init() {
        if (!this.toggle || this.priceElements.length === 0) return;

        this.toggle.addEventListener('click', () => this.handleToggle());
        this.setInitialState();
    }

    handleToggle() {
        this.isAnnual = !this.isAnnual;
        this.toggle.classList.toggle('active');

        this.updateLabels();
        this.updatePrices();
    }

    updateLabels() {
        this.toggleLabels.forEach((label, index) => {
            if (index === 0) { // Monthly label
                label.classList.toggle('active', !this.isAnnual);
            } else { // Annual label
                label.classList.toggle('active', this.isAnnual);
            }
        });
    }

    updatePrices() {
        this.priceElements.forEach(priceEl => {
            priceEl.style.transition = 'opacity 0.3s ease';
            priceEl.style.opacity = '0.5';

            setTimeout(() => {
                const monthlyPrice = priceEl.getAttribute('data-monthly');
                const annualPrice = priceEl.getAttribute('data-annual');

                if (monthlyPrice && annualPrice) {
                    const price = this.isAnnual ? annualPrice : monthlyPrice;
                    priceEl.textContent = `$${parseInt(price).toLocaleString()}`;
                }

                priceEl.style.opacity = '1';
            }, 150);
        });
    }

    setInitialState() {
        if (this.toggleLabels.length > 0) {
            this.toggleLabels[0].classList.add('active'); // Monthly active by default
        }
    }
}

// ================================
// FORM ENHANCEMENT MANAGER
// ================================

class FormEnhancementManager {
    constructor() {
        this.init();
    }

    init() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            this.addFocusEffects(input);
            this.addValidationFeedback(input);
        });
    }

    addFocusEffects(input) {
        input.addEventListener('focus', function() {
            this.closest('.form-group')?.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.closest('.form-group')?.classList.remove('focused');
            if (this.value) {
                this.closest('.form-group')?.classList.add('filled');
            } else {
                this.closest('.form-group')?.classList.remove('filled');
            }
        });
    }

    addValidationFeedback(input) {
        const debouncedValidation = debounce(() => {
            const isValid = input.checkValidity();
            const formGroup = input.closest('.form-group');

            if (formGroup) {
                if (input.value && !isValid) {
                    formGroup.classList.add('error');
                    formGroup.classList.remove('success');
                } else if (input.value && isValid) {
                    formGroup.classList.remove('error');
                    formGroup.classList.add('success');
                } else {
                    formGroup.classList.remove('error', 'success');
                }
            }
        }, 300);

        input.addEventListener('input', debouncedValidation);
    }
}

// ================================
// PERFORMANCE MANAGER WITH LOADING STATES
// ================================

class PerformanceManager {
    constructor() {
        this.metrics = {};
        this.loadingStates = new Map();
        this.init();
    }

    init() {
        this.initPerformanceObserver();
        this.monitorResourceLoading();
        this.initLoadingStates();
    }

    initPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics[entry.name] = entry;
                }
            });
            observer.observe({ entryTypes: ['navigation', 'resource'] });
        }
    }

    monitorResourceLoading() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }
        });
    }

    initLoadingStates() {
        this.enhanceFormsWithLoadingStates();
        this.enhanceCTAButtons();
        this.addSkeletonLoading();
    }

    enhanceFormsWithLoadingStates() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    this.setButtonLoading(submitBtn, true);

                    setTimeout(() => {
                        this.setButtonLoading(submitBtn, false);
                    }, 2000);
                }
            });
        });
    }

    enhanceCTAButtons() {
        const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary, .contact-button');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.type !== 'submit' && !button.href) {
                    this.setButtonLoading(button, true);

                    setTimeout(() => {
                        this.setButtonLoading(button, false);
                    }, 1500);
                }
            });
        });
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
            button.disabled = true;
            button.classList.add('loading');

            if (!button.querySelector('.spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner';
                spinner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416"><animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/><animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/></circle></svg>';
                button.prepend(spinner);
            }
        } else {
            button.textContent = button.dataset.originalText || button.textContent;
            button.disabled = false;
            button.classList.remove('loading');

            const spinner = button.querySelector('.spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    addSkeletonLoading() {
        const contentSections = document.querySelectorAll('.testimonial-card, .stats-item, .service-card');

        contentSections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.showSkeletonLoading(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            observer.observe(section);
        });
    }

    showSkeletonLoading(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }
}

// ================================
// MAIN INITIALIZATION
// ================================

class WebsiteManager {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        try {
            // Core functionality
            this.managers.scrollProgress = new ScrollProgressManager();
            this.managers.mobileNav = new MobileNavigationManager();
            this.managers.headerEffects = new HeaderEffectsManager();
            this.managers.smoothScroll = new SmoothScrollManager();
            this.managers.intersection = new IntersectionManager();

            // Enhanced features
            this.managers.buttonEffects = new ButtonEffectsManager();
            this.managers.pricingToggle = new PricingToggleManager();
            this.managers.formEnhancements = new FormEnhancementManager();
            this.managers.performance = new PerformanceManager();

            console.log('Website managers initialized successfully:', Object.keys(this.managers));
        } catch (error) {
            console.error('Error initializing website managers:', error);
        }
    }

    // Public API for accessing managers
    getManager(name) {
        return this.managers[name];
    }
}

// ================================
// GLOBAL INITIALIZATION
// ================================

// Initialize the website when the script loads
const website = new WebsiteManager();

// Expose to global scope for debugging/external access
window.WebsiteManager = website;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteManager;
}