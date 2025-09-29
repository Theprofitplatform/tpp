/**
 * Growth Form - Production-grade form handler with accessibility and validation
 *
 * Features:
 * - Two-step form progression with data persistence
 * - Comprehensive validation with error summary
 * - Australian phone number formatting
 * - Website URL normalization with favicon preview
 * - Keyboard navigation for service pills
 * - Spam protection (honeypot + optional Turnstile)
 * - UTM parameter capture
 * - Focus management and accessibility
 */

class GrowthForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 2;
    this.formData = {};
    this.validators = {};
    this.isSubmitting = false;

    // DOM elements
    this.form = null;
    this.stepper = null;
    this.step1 = null;
    this.step2 = null;
    this.errorSummary = null;
    this.errorList = null;

    // Validation rules
    this.validationRules = {
      name: { required: true, minLength: 2 },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      service: { required: true },
      phone: { pattern: /^\+61\s\d{3}\s\d{3}\s\d{3}$/, required: false },
      website: { pattern: /^https?:\/\/.+\..+/, required: false },
      privacy_consent: { required: true }
    };

    this.init();
  }

  /**
   * Initialize the form and set up event listeners
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Set up form elements and event listeners
   */
  setup() {
    this.form = document.getElementById('growth-form');
    if (!this.form) return;

    // Get DOM elements
    this.stepper = document.querySelector('.stepper');
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    this.errorSummary = document.getElementById('error-summary');
    this.errorList = document.getElementById('error-list');

    // Set up event listeners
    this.setupStepNavigation();
    this.setupValidation();
    this.setupPhoneFormatting();
    this.setupWebsitePreview();
    this.setupServicePills();
    this.setupFormSubmission();
    this.setupUtmCapture();
    this.setupDataPersistence();
    this.setupServiceAutoPreselection();

    // Initialize stepper
    this.updateStepper();

    // Restore persisted data
    this.restoreFormData();

    console.log('Growth Form initialized successfully');
  }

  /**
   * Set up step navigation
   */
  setupStepNavigation() {
    const continueBtn = document.getElementById('continue-step1');
    const backBtn = document.getElementById('back-step2');

    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.validateStep(1)) {
          this.goToStep(2);
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToStep(1);
      });
    }

    // Enable/disable continue button based on Step 1 validation
    this.setupContinueButtonState();
  }

  /**
   * Set up continue button state based on form validation
   */
  setupContinueButtonState() {
    const continueBtn = document.getElementById('continue-step1');
    const requiredFields = ['name', 'email', 'service'];

    if (!continueBtn) return;

    const checkFormState = () => {
      const isValid = requiredFields.every(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return false;

        if (field.type === 'radio') {
          return this.form.querySelector(`[name="${fieldName}"]:checked`);
        }
        return field.value.trim() !== '';
      });

      continueBtn.disabled = !isValid;
      continueBtn.setAttribute('aria-describedby', isValid ? '' : 'continue-help');
    };

    // Check on input changes
    requiredFields.forEach(fieldName => {
      const fields = this.form.querySelectorAll(`[name="${fieldName}"]`);
      fields.forEach(field => {
        field.addEventListener('input', checkFormState);
        field.addEventListener('change', checkFormState);
      });
    });

    // Initial check
    checkFormState();
  }

  /**
   * Navigate to a specific step
   */
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    // Persist data before changing steps
    this.persistFormData();

    // Update current step
    this.currentStep = stepNumber;

    // Update step visibility
    this.step1?.classList.toggle('active', stepNumber === 1);
    this.step2?.classList.toggle('active', stepNumber === 2);

    // Update stepper
    this.updateStepper();

    // Clear any error summary when navigating
    this.hideErrorSummary();

    // Focus management
    if (stepNumber === 2) {
      const step2Title = document.getElementById('step2-title');
      if (step2Title) {
        step2Title.focus();
      }
    } else {
      const step1Title = document.getElementById('step1-title');
      if (step1Title) {
        step1Title.focus();
      }
    }

    // Analytics
    this.trackStepChange(stepNumber);
  }

  /**
   * Update stepper visual state
   */
  updateStepper() {
    if (!this.stepper) return;

    // Update progress bar
    const progressFill = this.stepper.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
    }

    // Update step indicators
    const stepItems = this.stepper.querySelectorAll('.stepper-item');
    stepItems.forEach((item, index) => {
      const stepNumber = index + 1;
      item.classList.toggle('active', stepNumber === this.currentStep);
      item.classList.toggle('completed', stepNumber < this.currentStep);

      const indicator = item.querySelector('.stepper-indicator');
      if (indicator) {
        indicator.setAttribute('aria-current', stepNumber === this.currentStep ? 'step' : 'false');
      }
    });
  }

  /**
   * Set up form validation
   */
  setupValidation() {
    // Real-time validation on blur
    Object.keys(this.validationRules).forEach(fieldName => {
      const fields = this.form.querySelectorAll(`[name="${fieldName}"]`);
      fields.forEach(field => {
        field.addEventListener('blur', () => {
          this.validateField(fieldName);
        });
      });
    });
  }

  /**
   * Validate a specific field
   */
  validateField(fieldName) {
    const rules = this.validationRules[fieldName];
    if (!rules) return true;

    const field = this.form.querySelector(`[name="${fieldName}"]`);
    let value;

    // Get field value based on type
    if (field.type === 'radio') {
      const checkedField = this.form.querySelector(`[name="${fieldName}"]:checked`);
      value = checkedField ? checkedField.value : '';
    } else if (field.type === 'checkbox') {
      value = field.checked;
    } else {
      value = field.value.trim();
    }

    const errors = [];

    // Required validation
    if (rules.required) {
      if (!value || (typeof value === 'string' && value === '') || (typeof value === 'boolean' && !value)) {
        errors.push(this.getErrorMessage(fieldName, 'required'));
      }
    }

    // Pattern validation
    if (rules.pattern && value && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors.push(this.getErrorMessage(fieldName, 'pattern'));
      }
    }

    // Length validation
    if (rules.minLength && value && typeof value === 'string') {
      if (value.length < rules.minLength) {
        errors.push(this.getErrorMessage(fieldName, 'minLength'));
      }
    }

    // Update field state
    this.updateFieldValidation(fieldName, errors);

    return errors.length === 0;
  }

  /**
   * Get error message for field validation
   */
  getErrorMessage(fieldName, type) {
    const messages = {
      name: {
        required: 'Please enter your name',
        minLength: 'Name must be at least 2 characters'
      },
      email: {
        required: 'Please enter your email address',
        pattern: 'Please enter a valid email address'
      },
      service: {
        required: 'Please select a service'
      },
      phone: {
        pattern: 'Please enter a valid Australian phone number'
      },
      website: {
        pattern: 'Please enter a valid website URL'
      },
      privacy_consent: {
        required: 'You must agree to the Privacy Policy to continue'
      }
    };

    return messages[fieldName]?.[type] || 'Please check this field';
  }

  /**
   * Update field validation state
   */
  updateFieldValidation(fieldName, errors) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (!field || !errorElement) return;

    const hasErrors = errors.length > 0;

    // Update field aria-invalid
    field.setAttribute('aria-invalid', hasErrors);

    // Update error display
    if (hasErrors) {
      errorElement.textContent = errors[0];
      errorElement.classList.add('active');
    } else {
      errorElement.textContent = '';
      errorElement.classList.remove('active');
    }
  }

  /**
   * Validate current step
   */
  validateStep(stepNumber) {
    const fieldsToValidate = stepNumber === 1
      ? ['name', 'email', 'service']
      : ['privacy_consent', 'phone', 'website'];

    const errors = [];
    let isValid = true;

    fieldsToValidate.forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        const rules = this.validationRules[fieldName];
        if (rules.required || (fieldName === 'phone' && this.form.querySelector('[name="phone"]').value.trim())) {
          const fieldLabel = this.getFieldLabel(fieldName);
          errors.push({
            field: fieldName,
            message: this.getErrorMessage(fieldName, 'required'),
            label: fieldLabel
          });
          isValid = false;
        }
      }
    });

    if (!isValid && stepNumber === 1) {
      this.showErrorSummary(errors);
    }

    return isValid;
  }

  /**
   * Get field label for error summary
   */
  getFieldLabel(fieldName) {
    const labels = {
      name: 'Name',
      email: 'Email',
      service: 'Service',
      phone: 'Phone',
      website: 'Website',
      privacy_consent: 'Privacy Policy'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Show error summary
   */
  showErrorSummary(errors) {
    if (!this.errorSummary || !this.errorList || errors.length === 0) return;

    // Clear existing errors
    this.errorList.innerHTML = '';

    // Set aria-live for dynamic updates
    this.errorSummary.setAttribute('aria-live', 'polite');

    // Add new errors
    errors.forEach(error => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${error.field}`;
      link.textContent = error.message;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.focusField(error.field);
      });
      li.appendChild(link);
      this.errorList.appendChild(li);
    });

    // Show error summary
    this.errorSummary.style.display = 'block';
    this.errorSummary.focus();
  }

  /**
   * Hide error summary
   */
  hideErrorSummary() {
    if (this.errorSummary) {
      this.errorSummary.style.display = 'none';
    }
  }

  /**
   * Focus on a specific field
   */
  focusField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.focus();
    }
  }

  /**
   * Set up Australian phone number formatting
   */
  setupPhoneFormatting() {
    const phoneInput = this.form.querySelector('.phone-input');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      // Handle different input formats
      if (value.startsWith('61')) {
        value = value.substring(2);
      } else if (value.startsWith('0')) {
        value = value.substring(1);
      }

      // Format as +61 XXX XXX XXX
      if (value.length === 0) {
        e.target.value = '';
      } else if (value.length <= 3) {
        e.target.value = `+61 ${value}`;
      } else if (value.length <= 6) {
        e.target.value = `+61 ${value.substring(0, 3)} ${value.substring(3)}`;
      } else {
        e.target.value = `+61 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6, 9)}`;
      }
    });

    phoneInput.addEventListener('blur', () => {
      this.validateField('phone');
    });
  }

  /**
   * Set up website preview functionality
   */
  setupWebsitePreview() {
    const websiteInput = this.form.querySelector('.website-input');
    const preview = document.getElementById('website-preview');

    if (!websiteInput || !preview) return;

    // Throttled input handler for performance
    let throttledTimeout;
    websiteInput.addEventListener('input', (e) => {
      clearTimeout(throttledTimeout);
      throttledTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          // Performance optimization for real-time preview
          if (e.target.value.trim()) {
            this.updateWebsitePreview(e.target.value.trim(), preview);
          }
        });
      }, 300);
    });

    websiteInput.addEventListener('blur', (e) => {
      let url = e.target.value.trim();

      if (url && !url.match(/^https?:\/\//)) {
        url = `https://${url}`;
        e.target.value = url;
      }

      if (url) {
        this.updateWebsitePreview(url, preview);
      } else {
        preview.style.display = 'none';
      }

      this.validateField('website');
    });
  }

  /**
   * Update website preview with favicon
   */
  async updateWebsitePreview(url, preview) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

      const favicon = preview.querySelector('.favicon-preview');
      const domainSpan = preview.querySelector('.domain-preview');

      if (favicon && domainSpan) {
        favicon.src = faviconUrl;
        favicon.onerror = () => {
          favicon.style.display = 'none';
        };
        domainSpan.textContent = domain;
        preview.style.display = 'flex';
      }
    } catch {
      preview.style.display = 'none';
    }
  }

  /**
   * Set up service pills keyboard navigation
   */
  setupServicePills() {
    // Service pills are handled by their own component script
    // This method can be extended if additional integration is needed
  }

  /**
   * Set up form submission
   */
  setupFormSubmission() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (this.currentStep === 1) {
        if (this.validateStep(1)) {
          this.goToStep(2);
        }
        return;
      }

      // Step 2 submission
      if (!this.validateStep(2) || this.isSubmitting) {
        return;
      }

      await this.submitForm();
    });
  }

  /**
   * Submit form data
   */
  async submitForm() {
    this.isSubmitting = true;

    const submitBtn = document.getElementById('submit-form');
    const btnText = submitBtn?.querySelector('span');
    const spinner = submitBtn?.querySelector('.submit-spinner');

    // Update button state
    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (spinner) spinner.style.display = 'block';
    }

    try {
      // Check honeypot
      const honeypot = this.form.querySelector('[name="company_website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        throw new Error('Spam detected');
      }

      // Prepare form data
      const formData = new FormData(this.form);

      // Add UTM parameters
      this.addUtmParameters(formData);

      // Submit to existing endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Success
      this.handleSubmissionSuccess();
      this.trackFormSubmission('success');

    } catch (error) {
      console.error('Form submission error:', error);
      this.handleSubmissionError(error);
      this.trackFormSubmission('error', error.message);
    } finally {
      this.isSubmitting = false;

      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'block';
        if (spinner) spinner.style.display = 'none';
      }
    }
  }

  /**
   * Handle successful form submission
   */
  handleSubmissionSuccess() {
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');

    if (successMessage) {
      successMessage.style.display = 'flex';
      successMessage.focus();
    }
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }

    // Hide form
    const formSteps = this.form.querySelectorAll('.form-step');
    formSteps.forEach(step => step.style.display = 'none');
    if (this.stepper) this.stepper.style.display = 'none';

    // Clear persisted data
    this.clearPersistedData();
  }

  /**
   * Handle form submission error
   */
  handleSubmissionError(error) {
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');

    if (errorMessage) {
      errorMessage.style.display = 'flex';
      errorMessage.focus();
    }
    if (successMessage) {
      successMessage.style.display = 'none';
    }
  }

  /**
   * Set up UTM parameter capture
   */
  setupUtmCapture() {
    const urlParams = new URLSearchParams(window.location.search);
    this.utmParams = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
      if (urlParams.has(param)) {
        this.utmParams[param] = urlParams.get(param);
      }
    });
  }

  /**
   * Add UTM parameters to form data
   */
  addUtmParameters(formData) {
    Object.entries(this.utmParams).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  /**
   * Set up data persistence
   */
  setupDataPersistence() {
    // Save data on input changes for Step 1 fields
    const step1Fields = ['name', 'email', 'service'];
    step1Fields.forEach(fieldName => {
      const fields = this.form.querySelectorAll(`[name="${fieldName}"]`);
      fields.forEach(field => {
        field.addEventListener('input', () => this.persistFormData());
        field.addEventListener('change', () => this.persistFormData());
      });
    });
  }

  /**
   * Persist form data to session storage
   */
  persistFormData() {
    try {
      const data = new FormData(this.form);
      const persistedData = {};

      for (const [key, value] of data.entries()) {
        if (['name', 'email', 'service'].includes(key)) {
          persistedData[key] = value;
        }
      }

      sessionStorage.setItem('gjForm', JSON.stringify(persistedData));
    } catch (error) {
      console.warn('Could not persist form data:', error);
    }
  }

  /**
   * Restore form data from session storage
   */
  restoreFormData() {
    try {
      const stored = sessionStorage.getItem('gjForm');
      if (!stored) return;

      const data = JSON.parse(stored);

      Object.entries(data).forEach(([key, value]) => {
        const field = this.form.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === 'radio') {
            const targetRadio = this.form.querySelector(`[name="${key}"][value="${value}"]`);
            if (targetRadio) {
              targetRadio.checked = true;
              // Update service pills if applicable
              const pill = targetRadio.closest('[data-service-pill]');
              if (pill) {
                pill.setAttribute('aria-checked', 'true');
              }
            }
          } else {
            field.value = value;
          }
        }
      });
    } catch (error) {
      console.warn('Could not restore form data:', error);
    }
  }

  /**
   * Clear persisted data
   */
  clearPersistedData() {
    try {
      sessionStorage.removeItem('gjForm');
    } catch (error) {
      console.warn('Could not clear persisted data:', error);
    }
  }

  /**
   * Set up service auto-preselection from URL
   */
  setupServiceAutoPreselection() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');

    if (!serviceParam) return;

    const serviceMap = {
      'seo': 'seo',
      'google-ads': 'paid-ads',
      'web-design': 'web-design',
      'full-strategy': 'full-strategy'
    };

    const targetValue = serviceMap[serviceParam];
    if (targetValue) {
      const radio = this.form.querySelector(`[name="service"][value="${targetValue}"]`);
      if (radio) {
        radio.checked = true;
        // Update service pill if applicable
        const pill = document.querySelector(`[for="${radio.id}"]`);
        if (pill) {
          pill.setAttribute('aria-checked', 'true');
        }
      }
    }
  }

  /**
   * Track step changes for analytics
   */
  trackStepChange(stepNumber) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_step_change', {
        form_name: 'growth_journey',
        step_number: stepNumber
      });
    }

    // Generic dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_form_step',
        step: stepNumber,
        form_name: 'growth_journey'
      });
    }
  }

  /**
   * Track form submission for analytics
   */
  trackFormSubmission(status, error = null) {
    const eventData = {
      form_name: 'growth_journey',
      status: status
    };

    if (error) {
      eventData.error = error;
    }

    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', status === 'success' ? 'form_submit' : 'form_error', eventData);
    }

    // Generic dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: status === 'success' ? 'lead_form_submit' : 'lead_form_error',
        ...eventData
      });
    }
  }
}

// Initialize form when DOM is ready
const growthForm = new GrowthForm();