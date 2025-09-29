/**
 * Web Design Page Enhanced JavaScript
 * Adds modern UI/UX interactions and animations
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initScrollProgress();
        initScrollAnimations();
        initStatCounters();
        initServiceCardHover();
        initSmoothScroll();
    });

    /**
     * Initialize scroll progress indicator
     */
    function initScrollProgress() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    /**
     * Initialize scroll-triggered animations
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (animatedElements.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Animate children with stagger
                    const children = entry.target.querySelectorAll('.web-design-service-card, .web-design-benefit-item, .web-design-process-step');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Initialize animated stat counters
     */
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.web-design-stat-number');
        if (statNumbers.length === 0) return;

        const animateValue = (element, start, end, duration) => {
            const startTimestamp = Date.now();
            const step = (timestamp) => {
                const progress = Math.min((Date.now() - startTimestamp) / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(easeOutQuart * (end - start) + start);

                // Handle different formats
                const text = element.getAttribute('data-format') || '{value}';
                element.textContent = text.replace('{value}', current);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.textContent = element.getAttribute('data-final') || end;
                }
            };
            window.requestAnimationFrame(step);
        };

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    const text = entry.target.textContent;
                    const value = parseInt(text.replace(/\D/g, ''));

                    if (!isNaN(value)) {
                        // Store original format
                        if (text.includes('+')) {
                            entry.target.setAttribute('data-format', '{value}+');
                            entry.target.setAttribute('data-final', value + '+');
                        } else if (text.includes('%')) {
                            entry.target.setAttribute('data-format', '{value}%');
                            entry.target.setAttribute('data-final', value + '%');
                        } else if (text.includes('Week')) {
                            entry.target.setAttribute('data-final', text);
                        }

                        animateValue(entry.target, 0, value, 2000);
                    }
                }
            });
        }, observerOptions);

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    /**
     * Initialize 3D hover effect for service cards
     */
    function initServiceCardHover() {
        const cards = document.querySelectorAll('.web-design-service-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const offsetTop = target.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Add header scroll effects
     */
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

})();