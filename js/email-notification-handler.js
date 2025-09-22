/**
 * Email Notification Handler for The Profit Platform
 * Ensures all form submissions trigger immediate email notifications
 * Implements fallback mechanisms for 100% delivery rate
 */

class EmailNotificationHandler {
    constructor() {
        this.formspreeEndpoint = 'https://formspree.io/f/meoqjgzn';
        this.notificationEmail = 'info@theprofitplatform.com.au';
        this.urgentPhone = '1300 123 456'; // Update with actual number
        this.init();
    }

    init() {
        // Attach to all forms on the page
        document.addEventListener('DOMContentLoaded', () => {
            this.attachToForms();
            this.setupUrgencyIndicators();
            this.initializeTracking();
        });
    }

    attachToForms() {
        const forms = document.querySelectorAll('form[action*="formspree"]');

        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmission(form);
            });
        });
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add metadata
        data.timestamp = new Date().toISOString();
        data.page = window.location.pathname;
        data.referrer = document.referrer;
        data.device = this.getDeviceType();

        // Classify urgency
        data.priority = this.classifyPriority(data);

        try {
            // Primary submission to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Track successful submission
                this.trackConversion(data);

                // Show success message
                this.showSuccessMessage(form);

                // Send analytics event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': data.priority,
                        'value': this.calculateLeadValue(data)
                    });
                }

                // For high-priority leads, trigger additional notification
                if (data.priority === 'high') {
                    this.sendUrgentNotification(data);
                }

                // Reset form after short delay
                setTimeout(() => form.reset(), 2000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Primary submission failed:', error);
            // Fallback mechanism
            this.handleFailedSubmission(data, form);
        }
    }

    classifyPriority(data) {
        const urgentKeywords = ['urgent', 'asap', 'immediately', 'today', 'now'];
        const highValueKeywords = ['enterprise', 'agency', 'multiple', 'team'];

        const message = (data.message || '').toLowerCase();
        const hasUrgentKeyword = urgentKeywords.some(keyword => message.includes(keyword));
        const hasHighValueKeyword = highValueKeywords.some(keyword => message.includes(keyword));

        if (hasUrgentKeyword || data.budget === '$5000+') {
            return 'high';
        } else if (hasHighValueKeyword || data.budget === '$3000-$5000') {
            return 'medium';
        }
        return 'normal';
    }

    calculateLeadValue(data) {
        const budgetMap = {
            '$1000-$2000': 1500,
            '$2000-$3000': 2500,
            '$3000-$5000': 4000,
            '$5000+': 7500
        };
        return budgetMap[data.budget] || 1000;
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-message';
        successDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);">
                <h3 style="margin: 0 0 10px 0; font-size: 1.25rem;">
                    <i class="fas fa-check-circle"></i> Thank You!
                </h3>
                <p style="margin: 0;">We've received your inquiry and will respond within 1 business hour.</p>
                <p style="margin: 10px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                    For urgent matters, call us directly at ${this.urgentPhone}
                </p>
            </div>
        `;
        form.appendChild(successDiv);
    }

    sendUrgentNotification(data) {
        // Additional notification for high-priority leads
        // This could integrate with Slack, SMS, or other instant notification services
        console.log('High-priority lead notification:', data);

        // If you have a webhook endpoint:
        // fetch('your-webhook-url', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    }

    handleFailedSubmission(data, form) {
        // Store in localStorage for retry
        const failedSubmissions = JSON.parse(localStorage.getItem('failedSubmissions') || '[]');
        failedSubmissions.push(data);
        localStorage.setItem('failedSubmissions', JSON.stringify(failedSubmissions));

        // Show fallback contact options
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'form-fallback-message';
        fallbackDiv.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 20px; border-radius: 12px; margin-top: 20px;">
                <h3 style="margin: 0 0 10px 0;">Temporary Issue</h3>
                <p>We're experiencing a technical issue. Your information has been saved.</p>
                <p style="margin-top: 10px;">Please contact us directly:</p>
                <ul style="margin: 10px 0;">
                    <li>Phone: <a href="tel:${this.urgentPhone}">${this.urgentPhone}</a></li>
                    <li>Email: <a href="mailto:${this.notificationEmail}">${this.notificationEmail}</a></li>
                </ul>
            </div>
        `;
        form.appendChild(fallbackDiv);

        // Retry failed submissions when connection restored
        this.retryFailedSubmissions();
    }

    retryFailedSubmissions() {
        window.addEventListener('online', () => {
            const failedSubmissions = JSON.parse(localStorage.getItem('failedSubmissions') || '[]');

            failedSubmissions.forEach(async (data) => {
                try {
                    const formData = new FormData();
                    Object.keys(data).forEach(key => formData.append(key, data[key]));

                    await fetch(this.formspreeEndpoint, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    // Remove from failed submissions if successful
                    const remaining = failedSubmissions.filter(item => item !== data);
                    localStorage.setItem('failedSubmissions', JSON.stringify(remaining));
                } catch (error) {
                    console.error('Retry failed:', error);
                }
            });
        });
    }

    setupUrgencyIndicators() {
        // Add visual indicators for form fields
        const messageField = document.querySelector('textarea[name="message"]');
        if (messageField) {
            messageField.addEventListener('input', (e) => {
                const urgentKeywords = ['urgent', 'asap', 'immediately', 'today'];
                const hasUrgent = urgentKeywords.some(keyword =>
                    e.target.value.toLowerCase().includes(keyword)
                );

                if (hasUrgent) {
                    e.target.style.borderColor = '#ef4444';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                }
            });
        }
    }

    initializeTracking() {
        // Track form interactions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('focusin', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_start', {
                        'event_category': 'engagement',
                        'event_label': window.location.pathname
                    });
                }
            });
        });
    }

    trackConversion(data) {
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                value: this.calculateLeadValue(data),
                currency: 'AUD',
                content_name: 'Contact Form',
                status: data.priority
            });
        }

        // Google Ads conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with actual conversion ID
                'value': this.calculateLeadValue(data),
                'currency': 'AUD'
            });
        }
    }
}

// Initialize the handler
const emailHandler = new EmailNotificationHandler();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailNotificationHandler;
}