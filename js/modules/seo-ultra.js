/**
 * SeoUltra Module
 * Converted to ES6 module with enhanced functionality
 */

import utils from './shared-utils.js';
const { $, $$, delegate, debounce, throttle, fetchWithRetry, track, ready } = utils;

class SeoUltra {
    constructor() {
        this.init();
    }

    init() {
        // Ultra Revolutionary SEO Section JavaScript

// Revenue Counter Animation
const animateRevenueCounter = () {
    const counter = document.getElementById('revenue-counter');
    if (!counter) return;

    const target = parseInt(counter.dataset.target);
    const duration = 3000; // 3 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
            // Start continuous counting after initial animation
            startContinuousCounter(target);
        }
        counter.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

const startContinuousCounter = (baseValue) {
    const counter = document.getElementById('revenue-counter');
    if (!counter) return;

    setInterval(() => {
        const currentValue = parseInt(counter.textContent.replace(/,/g, ''));
        const increment = Math.floor(Math.random() * 100) + 50;
        const newValue = currentValue + increment;
        counter.textContent = newValue.toLocaleString();
    }, 2000);
}

// Number Counter Animation
const animateCounters = () {
    const counters = document.querySelectorAll('.counter');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current).toLocaleString();
                }, 16);

                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ROI Calculator
const initROICalculator = () {
    const slider = document.getElementById('roi-slider');
    const inputVal = document.getElementById('roi-input-val');
    const outputVal = document.getElementById('roi-output-val');

    if (!slider || !inputVal || !outputVal) return;

    slider.addEventListener('input', (e) => {
        const investment = parseInt(e.target.value);
        const roi = investment * 5.22; // 522% ROI
        inputVal.textContent = investment.toLocaleString();
        outputVal.textContent = Math.floor(roi).toLocaleString();
    });
}

// Testimonial Carousel
const initTestimonialCarousel = () {
    const track = document.getElementById('testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;

    const showTestimonial = (index) {
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        track.style.transform = `translateX(-${index * 100}%)`;
    }

    const nextTestimonial = () {
        currentIndex = (currentIndex + 1) % cards.length;
        showTestimonial(currentIndex);
    }

    const prevTestimonial = () {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showTestimonial(currentIndex);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
    if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            showTestimonial(currentIndex);
        });
    });

    // Auto-rotate every 5 seconds
    setInterval(nextTestimonial, 5000);
}

// Before/After Slider
const initBeforeAfterSlider = () {
    const slider = document.querySelector('.slider-container');
    const handle = document.querySelector('.slider-handle');
    const beforeSide = document.querySelector('.before-side');
    const afterSide = document.querySelector('.after-side');

    if (!slider || !handle) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const updateSlider = (x) {
        const rect = slider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));

        handle.style.left = `${percent}%`;
        beforeSide.style.width = `${percent}%`;
        afterSide.style.width = `${100 - percent}%`;
    }

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        handle.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSlider(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        handle.style.cursor = 'ew-resize';
    });

    // Touch support
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateSlider(e.touches[0].clientX);
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Countdown Timer
const initCountdownTimer = () {
    const timer = document.getElementById('countdown-timer');
    if (!timer) return;

    // Set end time to midnight
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(23, 59, 59, 999);

    const updateTimer = () {
        const now = new Date();
        const diff = endTime - now;

        if (diff <= 0) {
            // Reset for next day
            endTime.setDate(endTime.getDate() + 1);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Typing Animation for Location
const initTypingAnimation = () {
    const element = document.getElementById('typed-location');
    if (!element) return;

    const locations = [
        'Sydney Businesses',
        'Australian Companies',
        'Local Services',
        'E-commerce Stores',
        'Professional Services'
    ];

    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let charIndex = 0;

    const type = () {
        const fullText = locations[currentIndex];

        if (isDeleting) {
            currentText = fullText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = fullText.substring(0, charIndex + 1);
            charIndex++;
        }

        element.textContent = currentText;

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === fullText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % locations.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
}

// Particle Animation Enhancement
const enhanceParticles = () {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const randomX = Math.random() * window.innerWidth;
        const randomDelay = Math.random() * 20;
        particle.style.left = `${randomX}px`;
        particle.style.animationDelay = `${randomDelay}s`;
    });
}

// Scroll-triggered Animations
const initScrollAnimations = () {
    const elements = document.querySelectorAll('[data-aos]');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.dataset.aos;
                const delay = element.dataset.aosDelay || 0;

                setTimeout(() => {
                    element.classList.add('aos-animate', `aos-${animation}`);
                }, delay);

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    elements.forEach(element => observer.observe(element));
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    animateRevenueCounter();
    animateCounters();
    initROICalculator();
    initTestimonialCarousel();
    initBeforeAfterSlider();
    initCountdownTimer();
    initTypingAnimation();
    enhanceParticles();
    initScrollAnimations();
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
    }
}

export default new SeoUltra();

// Performance tracking
track('module_loaded', { module: 'seo-ultra' });