/**
 * ExitIntentPopup Module
 * Converted to ES6 module with enhanced functionality
 */

import utils from './shared-utils.js';
const { $, $$, delegate, debounce, throttle, fetchWithRetry, track, ready } = utils;

/**
 * Exit Intent Popup System
 * Captures 15-20% of abandoning visitors
 * Implements smart triggering to avoid annoyance
 */

class ExitIntentPopup {
    constructor() {
        this.config = {
            delay: 0, // Trigger immediately on exit intent
            cookieName: 'tpp_exit_popup_shown',
            cookieExpiry: 7, // Days
            mobileDelay: 15000, // 15 seconds for mobile
            minTimeOnPage: 5000, // 5 seconds minimum
            scrollThreshold: 30 // Show after 30% scroll on mobile
        };

        this.analytics = {
            shown: 0,
            closed: 0,
            converted: 0
        };

        this.init();
    }

    init() {
        if (this.shouldShowPopup()) {
            this.createPopupHTML();
            this.attachEventListeners();
            this.trackPageTime();
        }
    }

    shouldShowPopup() {
        // Check if popup was already shown
        if (this.getCookie(this.config.cookieName)) {
            return false;
        }

        // Don't show on thank you or privacy pages
        const excludedPages = ['/thank-you', '/privacy', '/terms', '/disclaimer'];
        if (excludedPages.some(page => window.location.pathname.includes(page))) {
            return false;
        }

        return true;
    }

    createPopupHTML() {
        const popupHTML = `
            <div id="exit-intent-overlay" class="exit-popup-overlay" style="display: none;">
                <div class="exit-popup-container">
                    <button class="exit-popup-close" aria-label="Close popup">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="exit-popup-content">
                        <div class="exit-popup-badge">
                            <span>LIMITED TIME OFFER</span>
                        </div>

                        <h2 class="exit-popup-title">
                            Wait! Don't Leave Empty-Handed
                        </h2>

                        <div class="exit-popup-value">
                            <span class="value-amount">$997</span>
                            <span class="value-label">VALUE</span>
                        </div>

                        <h3 class="exit-popup-subtitle">
                            Get Your FREE Digital Marketing Audit
                        </h3>

                        <ul class="exit-popup-benefits">
                            <li><i class="fas fa-check"></i> Comprehensive SEO Analysis</li>
                            <li><i class="fas fa-check"></i> Google Ads Account Review</li>
                            <li><i class="fas fa-check"></i> Competitor Benchmarking Report</li>
                            <li><i class="fas fa-check"></i> Custom Growth Strategy Roadmap</li>
                            <li><i class="fas fa-check"></i> 30-Minute Strategy Call Included</li>
                        </ul>

                        <form id="exit-popup-form" class="exit-popup-form" action="https://formspree.io/f/meoqjgzn" method="POST">
                            <input type="hidden" name="source" value="exit_intent_popup">
                            <input type="hidden" name="offer" value="free_audit">

                            <div class="form-group">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    required
                                    class="exit-popup-input"
                                >
                            </div>

                            <div class="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    required
                                    class="exit-popup-input"
                                >
                            </div>

                            <div class="form-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Your Phone (Optional)"
                                    class="exit-popup-input"
                                >
                            </div>

                            <button type="submit" class="exit-popup-submit">
                                Get My Free Audit Now
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </form>

                        <p class="exit-popup-disclaimer">
                            🔒 Your information is 100% secure. No spam, ever.
                        </p>

                        <div class="exit-popup-urgency">
                            <i class="fas fa-clock"></i>
                            <span>Offer expires in <span id="countdown-timer">10:00</span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS
        const styles = `
            <style>
                .exit-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .exit-popup-container {
                    background: white;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s ease-out;
                }

                .exit-popup-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                }

                .exit-popup-close:hover {
                    background: #f3f4f6;
                    transform: rotate(90deg);
                }

                .exit-popup-content {
                    padding: 40px 30px 30px;
                    text-align: center;
                }

                .exit-popup-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-bottom: 20px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .exit-popup-title {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 20px;
                    color: #111827;
                    line-height: 1.2;
                }

                .exit-popup-value {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 15px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    border-radius: 10px;
                }

                .value-amount {
                    font-size: 36px;
                    font-weight: 900;
                    color: #f59e0b;
                    text-decoration: line-through;
                }

                .value-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: #92400e;
                }

                .exit-popup-subtitle {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 0 25px;
                    color: #059669;
                }

                .exit-popup-benefits {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 30px;
                    text-align: left;
                    display: inline-block;
                }

                .exit-popup-benefits li {
                    padding: 8px 0;
                    font-size: 15px;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .exit-popup-benefits i {
                    color: #10b981;
                    font-size: 14px;
                }

                .exit-popup-form {
                    margin-bottom: 20px;
                }

                .exit-popup-input {
                    width: 100%;
                    padding: 14px 18px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 16px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }

                .exit-popup-input:focus {
                    outline: none;
                    border-color: #4F46E5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .exit-popup-submit {
                    width: 100%;
                    padding: 16px 24px;
                    background: linear-gradient(135deg, #4F46E5, #6366F1);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .exit-popup-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
                }

                .exit-popup-disclaimer {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0 0 15px;
                }

                .exit-popup-urgency {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #fee2e2;
                    border-radius: 8px;
                    color: #dc2626;
                    font-size: 14px;
                    font-weight: 600;
                }

                @media (max-width: 480px) {
                    .exit-popup-content {
                        padding: 30px 20px;
                    }

                    .exit-popup-title {
                        font-size: 24px;
                    }

                    .value-amount {
                        font-size: 28px;
                    }

                    .exit-popup-benefits {
                        font-size: 14px;
                    }
                }
            </style>
        `;

        // Inject into page
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    attachEventListeners() {
        const overlay = document.getElementById('exit-intent-overlay');
        const closeBtn = document.querySelector('.exit-popup-close');
        const form = document.getElementById('exit-popup-form');

        // Desktop exit intent
        if (!this.isMobile()) {
            document.addEventListener('mouseout', (e) => {
                if (e.clientY <= 0 && this.canShowPopup()) {
                    this.showPopup();
                }
            });
        } else {
            // Mobile triggers
            this.setupMobileTriggers();
        }

        // Close button
        closeBtn.addEventListener('click', () => {
            this.closePopup();
            this.trackEvent('closed');
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closePopup();
                this.trackEvent('closed_overlay');
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(form);
        });

        // Start countdown timer
        this.startCountdown();
    }

    setupMobileTriggers() {
        // Time-based trigger
        setTimeout(() => {
            if (this.canShowPopup()) {
                this.showPopup();
            }
        }, this.config.mobileDelay);

        // Scroll-based trigger
        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            if (!scrollTriggered && this.canShowPopup()) {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

                if (scrollPercent > this.config.scrollThreshold) {
                    scrollTriggered = true;
                    this.showPopup();
                }
            }
        });

        // Back button trigger
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', () => {
            if (this.canShowPopup()) {
                this.showPopup();
                window.history.pushState(null, '', window.location.href);
            }
        });
    }

    trackPageTime() {
        this.pageLoadTime = Date.now();
    }

    canShowPopup() {
        const overlay = document.getElementById('exit-intent-overlay');
        const timeOnPage = Date.now() - this.pageLoadTime;

        return overlay.style.display === 'none' &&
               timeOnPage >= this.config.minTimeOnPage &&
               !this.getCookie(this.config.cookieName);
    }

    showPopup() {
        const overlay = document.getElementById('exit-intent-overlay');
        overlay.style.display = 'flex';

        // Set cookie
        this.setCookie(this.config.cookieName, 'true', this.config.cookieExpiry);

        // Track event
        this.trackEvent('shown');
        this.analytics.shown++;

        // Focus management for accessibility
        const firstInput = overlay.querySelector('input[name="name"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    closePopup() {
        const overlay = document.getElementById('exit-intent-overlay');
        overlay.style.display = 'none';
        this.analytics.closed++;
    }

    async handleFormSubmission(form) {
        const submitBtn = form.querySelector('.exit-popup-submit');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success
                this.analytics.converted++;
                this.trackEvent('converted');

                // Show success message
                const content = document.querySelector('.exit-popup-content');
                content.innerHTML = `
                    <div style="padding: 40px 20px;">
                        <div style="font-size: 48px; color: #10b981; margin-bottom: 20px;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 15px; color: #111827;">
                            Success! Check Your Email
                        </h2>
                        <p style="font-size: 16px; color: #6b7280; margin: 0 0 25px;">
                            Your free audit is on its way. We'll be in touch within 1 business hour.
                        </p>
                        <button onclick="document.getElementById('exit-intent-overlay').style.display='none'"
                                style="padding: 12px 30px; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                            Continue Browsing
                        </button>
                    </div>
                `;

                // Auto-close after 5 seconds
                setTimeout(() => this.closePopup(), 5000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);

            // Show error message
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Add error message
            const errorMsg = document.createElement('p');
            errorMsg.style.color = '#dc2626';
            errorMsg.style.fontSize = '14px';
            errorMsg.style.marginTop = '10px';
            errorMsg.textContent = 'Something went wrong. Please try again or call us directly.';
            form.appendChild(errorMsg);
        }
    }

    startCountdown() {
        let seconds = 600; // 10 minutes
        const timerElement = document.getElementById('countdown-timer');

        if (!timerElement) return;

        const updateTimer = () => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

            if (seconds > 0) {
                seconds--;
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.textContent = 'Expired';
            }
        };

        updateTimer();
    }

    trackEvent(action) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exit_intent_' + action, {
                'event_category': 'engagement',
                'event_label': window.location.pathname
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined' && action === 'converted') {
            fbq('track', 'Lead', {
                content_name: 'Exit Intent Popup',
                value: 997,
                currency: 'AUD'
            });
        }

        console.log(`Exit Intent: ${action}`, this.analytics);
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ExitIntentPopup();
    });
} else {
    new ExitIntentPopup();
}

export default ExitIntentPopup;

// Performance tracking
track('module_loaded', { module: 'exit-intent-popup' });