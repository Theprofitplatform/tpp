/**
 * ComponentLibrary Module
 * Converted to ES6 module with enhanced functionality
 */

import utils from './shared-utils.js';
const { $, $$, delegate, debounce, throttle, fetchWithRetry, track, ready } = utils;

/**
 * Component Library System
 * Central registry for all reusable components
 * Manages loading, caching, and initialization
 */

class ComponentLibrary {
    constructor() {
        this.components = new Map();
        this.cache = new Map();
        this.loadQueue = [];
        this.isProcessing = false;

        // Register available components
        this.registerComponents();

        // Auto-initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    registerComponents() {
        // Define all available components
        this.register('footer', {
            path: '/components/layout/footer.html',
            selector: 'footer[role="contentinfo"], [data-component="footer"]',
            replace: true,
            initialize: (element) => this.initFooter(element)
        });

        this.register('service-card', {
            path: '/components/sections/service-card.html',
            selector: '[data-component="service-card"]',
            template: true,
            initialize: (element, data) => this.initServiceCard(element, data)
        });

        this.register('testimonial', {
            path: '/components/sections/testimonial.html',
            selector: '[data-component="testimonial"]',
            template: true,
            initialize: (element, data) => this.initTestimonial(element, data)
        });

        this.register('pricing-card', {
            path: '/components/sections/pricing-card.html',
            selector: '[data-component="pricing-card"]',
            template: true,
            initialize: (element, data) => this.initPricingCard(element, data)
        });

        this.register('cta-section', {
            path: '/components/sections/cta.html',
            selector: '[data-component="cta-section"]',
            template: true,
            initialize: (element, data) => this.initCTA(element, data)
        });

        this.register('contact-form', {
            path: '/components/forms/contact.html',
            selector: '[data-component="contact-form"]',
            replace: true,
            initialize: (element) => this.initContactForm(element)
        });
    }

    register(name, config) {
        this.components.set(name, {
            name,
            ...config,
            loaded: false,
            instances: []
        });
    }

    async initialize() {
        console.log('🎨 Component Library initializing...');

        // Find all component placeholders
        for (const [name, component] of this.components) {
            const elements = document.querySelectorAll(component.selector);

            if (elements.length > 0) {
                console.log(`Found ${elements.length} ${name} component(s)`);

                for (const element of elements) {
                    await this.loadComponent(name, element);
                }
            }
        }

        // Process any queued components
        await this.processQueue();

        console.log('✅ Component Library initialized');

        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('components:ready', {
            detail: { components: Array.from(this.components.keys()) }
        }));
    }

    async loadComponent(name, targetElement) {
        const component = this.components.get(name);

        if (!component) {
            console.error(`Component "${name}" not registered`);
            return;
        }

        try {
            // Check cache
            let html = this.cache.get(component.path);

            if (!html) {
                // Fetch component HTML
                const response = await fetch(component.path);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                html = await response.text();
                this.cache.set(component.path, html);
            }

            // Process template if needed
            if (component.template && targetElement.dataset) {
                html = this.processTemplate(html, targetElement.dataset);
            }

            // Insert or replace HTML
            if (component.replace) {
                // Replace entire element
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const newElement = temp.firstElementChild;

                if (newElement) {
                    targetElement.parentNode.replaceChild(newElement, targetElement);
                    targetElement = newElement;
                }
            } else {
                // Insert into element
                targetElement.innerHTML = html;
            }

            // Initialize component
            if (component.initialize) {
                component.initialize(targetElement, targetElement.dataset);
            }

            // Track instance
            component.instances.push(targetElement);
            component.loaded = true;

            // Dispatch loaded event
            targetElement.dispatchEvent(new CustomEvent('component:loaded', {
                detail: { name, element: targetElement },
                bubbles: true
            }));

            console.log(`✅ Loaded ${name} component`);
        } catch (error) {
            console.error(`Failed to load ${name} component:`, error);

            // Add to retry queue
            this.loadQueue.push({ name, element: targetElement });
        }
    }

    processTemplate(html, data) {
        // Simple template processing
        let processed = html;

        // Replace {{variable}} with data attributes
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value);
        }

        return processed;
    }

    async processQueue() {
        if (this.isProcessing || this.loadQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.loadQueue.length > 0) {
            const { name, element } = this.loadQueue.shift();
            await this.loadComponent(name, element);
        }

        this.isProcessing = false;
    }

    // Component Initializers
    initFooter(element) {
        // Re-attach social link tracking
        const socialLinks = element.querySelectorAll('.social-icon');
        socialLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.TPPTracking) {
                    const platform = link.getAttribute('aria-label');
                    window.TPPTracking.trackEvent('social', 'click', platform);
                }
            });
        });

        // Newsletter form
        const newsletterForm = element.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Handle newsletter signup
                const email = newsletterForm.querySelector('input[type="email"]').value;
                console.log('Newsletter signup:', email);

                // Show success message
                newsletterForm.innerHTML = '<p style="color: #10b981;">Thank you for subscribing!</p>';
            });
        }
    }

    initServiceCard(element, data) {
        // Add hover effects
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-5px)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });

        // Track clicks
        const links = element.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.TPPTracking) {
                    window.TPPTracking.trackEvent('service', 'click', data.service || 'unknown');
                }
            });
        });
    }

    initTestimonial(element, data) {
        // Add rating stars if needed
        const ratingElement = element.querySelector('.testimonial-rating');
        if (ratingElement && data.rating) {
            const rating = parseInt(data.rating);
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += i < rating ? '★' : '☆';
            }
            ratingElement.textContent = stars;
        }

        // Lazy load images
        const img = element.querySelector('img[data-src]');
        if (img && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            observer.observe(img);
        }
    }

    initPricingCard(element, data) {
        // Add popular badge if featured
        if (data.featured === 'true') {
            const badge = document.createElement('div');
            badge.className = 'pricing-badge';
            badge.textContent = 'Most Popular';
            element.prepend(badge);
        }

        // Track CTA clicks
        const ctaButton = element.querySelector('.btn-primary, .cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                if (window.TPPTracking) {
                    window.TPPTracking.trackEvent('pricing', 'cta_click', data.plan || 'unknown');
                }
            });
        }
    }

    initCTA(element, data) {
        // Add urgency if specified
        if (data.urgency === 'true') {
            const urgencyText = document.createElement('p');
            urgencyText.className = 'cta-urgency';
            urgencyText.innerHTML = '⚡ Limited time offer - Act now!';
            element.querySelector('.cta-content')?.appendChild(urgencyText);
        }

        // Track interaction
        element.addEventListener('click', (e) => {
            if (e.target.matches('a, button')) {
                if (window.TPPTracking) {
                    window.TPPTracking.trackEvent('cta', 'click', data.campaign || 'general');
                }
            }
        });
    }

    initContactForm(element) {
        // Attach email notification handler
        if (window.EmailNotificationHandler) {
            const handler = new EmailNotificationHandler();
            const form = element.querySelector('form');
            if (form) {
                handler.attachToForms();
            }
        }

        // Add form validation
        const form = element.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                const email = form.querySelector('input[type="email"]');
                const phone = form.querySelector('input[type="tel"]');

                // Basic validation
                if (email && !email.value.includes('@')) {
                    e.preventDefault();
                    alert('Please enter a valid email address');
                    return;
                }

                if (phone && phone.value.length < 10) {
                    e.preventDefault();
                    alert('Please enter a valid phone number');
                    return;
                }
            });
        }
    }

    // Utility Methods
    reload(componentName) {
        // Clear cache and reload component
        const component = this.components.get(componentName);
        if (component) {
            this.cache.delete(component.path);
            component.instances.forEach(element => {
                this.loadComponent(componentName, element);
            });
        }
    }

    clearCache() {
        this.cache.clear();
        console.log('Component cache cleared');
    }

    getStats() {
        const stats = {
            registered: this.components.size,
            loaded: Array.from(this.components.values()).filter(c => c.loaded).length,
            cached: this.cache.size,
            instances: 0
        };

        for (const component of this.components.values()) {
            stats.instances += component.instances.length;
        }

        return stats;
    }
}

// Initialize the component library
window.ComponentLibrary = new ComponentLibrary();

// Global helper function
window.loadComponent = async (name, selector) => {
    const element = document.querySelector(selector);
    if (element) {
        return await window.ComponentLibrary.loadComponent(name, element);
    }
};

console.log('📚 Component Library loaded');

export default ComponentLibrary;

// Performance tracking
track('module_loaded', { module: 'component-library' });