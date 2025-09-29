// Enhanced Form Handler with Progressive Enhancement
(function() {
    'use strict';

    // CSRF token storage
    let csrfToken = null;
    let sessionId = null;

    // Form submission endpoints (in priority order)
    const ENDPOINTS = [
        { url: 'https://formspree.io/f/meoqjgzn', type: 'formspree' },
        { url: '/api/form-submit', type: 'node' },
        { url: '/form-handler.php', type: 'php' }
    ];

    // Initialize CSRF token
    async function initCSRFToken() {
        try {
            // Try Node.js endpoint first
            const response = await fetch('/api/csrf-token').catch(() => null);
            if (response && response.ok) {
                const data = await response.json();
                csrfToken = data.csrf_token;
                sessionId = data.session_id;
                return;
            }

            // Fallback to PHP endpoint
            const phpResponse = await fetch('/form-handler.php').catch(() => null);
            if (phpResponse && phpResponse.ok) {
                const data = await phpResponse.json();
                csrfToken = data.csrf_token;
            }
        } catch (error) {
            console.warn('Could not initialize CSRF token:', error);
        }
    }

    // Enhanced form validation
    function validateForm(formData) {
        const errors = [];

        // Required fields
        const required = ['firstName', 'lastName', 'email', 'phone', 'industry', 'budget', 'message'];
        for (const field of required) {
            if (!formData.get(field)?.trim()) {
                errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            }
        }

        // Email validation (comprehensive regex)
        const email = formData.get('email');
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (email && !emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }

        // Phone validation (international format)
        const phone = formData.get('phone');
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
            errors.push('Please enter a valid phone number');
        }

        // Message length
        const message = formData.get('message');
        if (message && (message.length < 10 || message.length > 1000)) {
            errors.push('Message must be between 10 and 1000 characters');
        }

        // Consent validation
        if (!formData.get('consent')) {
            errors.push('Please consent to data processing');
        }

        return errors;
    }

    // Submit form with fallback mechanism
    async function submitFormWithFallback(formData) {
        const errors = [];

        // Add CSRF token if available
        if (csrfToken) {
            formData.append('csrf_token', csrfToken);
        }

        // Try each endpoint in order
        for (const endpoint of ENDPOINTS) {
            try {
                let response;

                if (endpoint.type === 'formspree') {
                    // Formspree submission
                    response = await fetch(endpoint.url, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                } else if (endpoint.type === 'node') {
                    // Node.js endpoint
                    const jsonData = Object.fromEntries(formData.entries());
                    response = await fetch(endpoint.url, {
                        method: 'POST',
                        body: JSON.stringify(jsonData),
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Session-Id': sessionId || ''
                        }
                    });
                } else if (endpoint.type === 'php') {
                    // PHP endpoint
                    const jsonData = Object.fromEntries(formData.entries());
                    response = await fetch(endpoint.url, {
                        method: 'POST',
                        body: JSON.stringify(jsonData),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                if (response && response.ok) {
                    return { success: true, endpoint: endpoint.type };
                }

                errors.push(`${endpoint.type} failed: ${response?.statusText || 'Unknown error'}`);
            } catch (error) {
                errors.push(`${endpoint.type} error: ${error.message}`);
            }
        }

        // All endpoints failed
        throw new Error('All submission endpoints failed: ' + errors.join(', '));
    }

    // Enhanced form handler
    function enhanceForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Remove novalidate for progressive enhancement
        form.removeAttribute('novalidate');

        // Add HTML5 validation attributes
        const fields = {
            firstName: { required: true, minLength: 1, maxLength: 50, pattern: '^[a-zA-Z\\s\\-\\']+$' },
            lastName: { required: true, minLength: 1, maxLength: 50, pattern: '^[a-zA-Z\\s\\-\\']+$' },
            email: { required: true, type: 'email', pattern: emailRegex.source },
            phone: { required: true, type: 'tel', pattern: '^[\\+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$' },
            industry: { required: true },
            budget: { required: true },
            message: { required: true, minLength: 10, maxLength: 1000 },
            consent: { required: true }
        };

        for (const [name, attrs] of Object.entries(fields)) {
            const field = form.elements[name];
            if (!field) continue;

            for (const [attr, value] of Object.entries(attrs)) {
                if (attr === 'pattern' && value) {
                    field.setAttribute('pattern', value);
                } else if (attr === 'minLength' && value) {
                    field.setAttribute('minlength', value);
                } else if (attr === 'maxLength' && value) {
                    field.setAttribute('maxlength', value);
                } else if (attr === 'required' && value) {
                    field.setAttribute('required', '');
                } else if (attr === 'type' && value) {
                    field.setAttribute('type', value);
                }
            }
        }

        // Add submit handler
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Client-side validation
            const validationErrors = validateForm(formData);
            if (validationErrors.length > 0) {
                showErrors(validationErrors);
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                const result = await submitFormWithFallback(formData);

                // Success
                showSuccess();
                form.reset();

                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'Contact',
                        event_label: 'Contact Form',
                        value: 1
                    });
                }

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = '/?success=1';
                }, 2000);

            } catch (error) {
                console.error('Form submission error:', error);
                showError('Failed to submit form. Please try again or contact us directly.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        // Add real-time validation
        form.addEventListener('blur', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                validateField(e.target);
            }
        }, true);
    }

    // Validate individual field
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message') || createErrorElement(formGroup);

        // Clear previous error
        formGroup.classList.remove('error');
        errorElement.textContent = '';
        field.setAttribute('aria-invalid', 'false');

        // Check validity
        if (!field.checkValidity()) {
            formGroup.classList.add('error');
            errorElement.textContent = field.validationMessage || 'This field is invalid';
            field.setAttribute('aria-invalid', 'true');
            return false;
        }

        return true;
    }

    // Create error element
    function createErrorElement(formGroup) {
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        formGroup.appendChild(errorElement);
        return errorElement;
    }

    // Show validation errors
    function showErrors(errors) {
        const alertContainer = document.getElementById('form-alerts') || createAlertContainer();
        alertContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Please fix the following errors:</strong>
                <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
            </div>
        `;
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Show success message
    function showSuccess() {
        const alertContainer = document.getElementById('form-alerts') || createAlertContainer();
        alertContainer.innerHTML = `
            <div class="alert alert-success" role="alert">
                <strong>Success!</strong> Your message has been sent successfully.
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        const alertContainer = document.getElementById('form-alerts') || createAlertContainer();
        alertContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Error!</strong> ${message}
            </div>
        `;
    }

    // Create alert container
    function createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'form-alerts';
        container.className = 'form-alerts';
        const form = document.getElementById('contactForm');
        form.parentNode.insertBefore(container, form);
        return container;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        await initCSRFToken();
        enhanceForm();
    }

})();