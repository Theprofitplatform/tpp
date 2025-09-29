/**
 * Comprehensive Tracking Implementation
 * GA4, Facebook Pixel, Hotjar, and Microsoft Clarity
 * Tracks all conversion points and user behavior
 */

class TrackingImplementation {
    constructor() {
        this.config = {
            ga4: {
                id: 'G-FB947JWCFT', // Production GA4 ID
                enabled: true
            },
            facebook: {
                pixelId: 'XXXXXXXXXX', // Replace with actual Pixel ID
                enabled: true
            },
            hotjar: {
                hjid: '6526316', // Production Hotjar Site ID
                hjsv: 6,
                enabled: true
            },
            clarity: {
                projectId: 'XXXXXXXXXX', // Replace with actual Clarity ID
                enabled: false // Enable when ready
            },
            googleAds: {
                conversionId: 'AW-XXXXXXXXX', // Replace with actual conversion ID
                enabled: true
            }
        };

        this.init();
    }

    init() {
        this.loadGA4();
        this.loadFacebookPixel();
        this.loadHotjar();
        this.loadGoogleAdsConversion();
        if (this.config.clarity.enabled) {
            this.loadClarity();
        }

        // Setup event tracking after all scripts load
        window.addEventListener('load', () => {
            this.setupEventTracking();
            this.setupEcommerceTracking();
            this.setupCustomDimensions();
        });
    }

    loadGA4() {
        if (!this.config.ga4.enabled) return;

        // GA4 Global Site Tag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga4.id}`;
        document.head.appendChild(script);

        // GA4 Configuration
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', this.config.ga4.id, {
            'page_path': window.location.pathname,
            'debug_mode': window.location.hostname === 'localhost'
        });

        // Enhanced Ecommerce
        gtag('config', this.config.ga4.id, {
            'custom_map.dimension1': 'user_type',
            'custom_map.dimension2': 'page_category',
            'custom_map.dimension3': 'form_type'
        });

        console.log('GA4 tracking initialized');
    }

    loadFacebookPixel() {
        if (!this.config.facebook.enabled) return;

        !function(f,b,e,v,n,t,s) {
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', this.config.facebook.pixelId);
        fbq('track', 'PageView');

        // Track page category
        const pageCategory = this.getPageCategory();
        if (pageCategory !== 'other') {
            fbq('track', 'ViewContent', {
                content_category: pageCategory,
                content_type: 'page'
            });
        }

        console.log('Facebook Pixel initialized');
    }

    loadHotjar() {
        if (!this.config.hotjar.enabled) return;

        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:this.config.hotjar.hjid,hjsv:this.config.hotjar.hjsv};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

        console.log('Hotjar initialized');
    }

    loadClarity() {
        if (!this.config.clarity.enabled) return;

        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", this.config.clarity.projectId);

        console.log('Microsoft Clarity initialized');
    }

    loadGoogleAdsConversion() {
        if (!this.config.googleAds.enabled) return;

        // Google Ads conversion tracking
        window.gtag = window.gtag || function() { dataLayer.push(arguments); };

        // Track conversions on form submissions
        document.addEventListener('tpp_form_submit', (event) => {
            gtag('event', 'conversion', {
                'send_to': `${this.config.googleAds.conversionId}/XXXXXXXXX`,
                'value': event.detail.value || 1000,
                'currency': 'AUD'
            });
        });
    }

    setupEventTracking() {
        // Phone number clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('contact', 'phone_click', link.href.replace('tel:', ''));

                // Facebook Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Contact', {
                        contact_type: 'phone'
                    });
                }
            });
        });

        // Email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('contact', 'email_click', link.href.replace('mailto:', ''));

                // Facebook Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Contact', {
                        contact_type: 'email'
                    });
                }
            });
        });

        // CTA button clicks
        document.querySelectorAll('.btn-primary, .cta-button, [class*="action"]').forEach(button => {
            button.addEventListener('click', () => {
                const buttonText = button.textContent.trim();
                this.trackEvent('engagement', 'cta_click', buttonText);
            });
        });

        // Form interactions
        this.trackFormInteractions();

        // Scroll depth tracking
        this.trackScrollDepth();

        // Time on page tracking
        this.trackTimeOnPage();

        // External link tracking
        this.trackExternalLinks();
    }

    trackFormInteractions() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            let formStarted = false;
            const formName = form.id || 'unnamed_form';

            // Track form starts
            form.addEventListener('focusin', () => {
                if (!formStarted) {
                    formStarted = true;
                    this.trackEvent('form', 'form_start', formName);

                    // Facebook Pixel
                    if (typeof fbq !== 'undefined') {
                        fbq('track', 'InitiateCheckout', {
                            content_name: formName
                        });
                    }
                }
            });

            // Track form submissions
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);

                // Calculate lead value
                const leadValue = this.calculateLeadValue(data);

                this.trackEvent('conversion', 'form_submit', formName, leadValue);

                // Facebook Pixel conversion
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', {
                        value: leadValue,
                        currency: 'AUD',
                        content_name: formName
                    });
                }

                // Google Ads conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': `${this.config.googleAds.conversionId}/form_submit`,
                        'value': leadValue,
                        'currency': 'AUD'
                    });
                }

                // Custom event for other scripts
                document.dispatchEvent(new CustomEvent('tpp_form_submit', {
                    detail: { formName, data, value: leadValue }
                }));
            });

            // Track form abandonment
            let formFields = form.querySelectorAll('input, textarea, select');
            let filledFields = new Set();

            formFields.forEach(field => {
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        filledFields.add(field.name);
                    }
                });
            });

            // Check for abandonment on page unload
            window.addEventListener('beforeunload', () => {
                if (filledFields.size > 0 && !form.dataset.submitted) {
                    this.trackEvent('form', 'form_abandon', formName, filledFields.size);
                }
            });
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !tracked.has(threshold)) {
                        tracked.add(threshold);
                        this.trackEvent('engagement', 'scroll_depth', `${threshold}%`);
                    }
                });
            }
        });

        // Send max scroll on page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('engagement', 'max_scroll_depth', `${maxScroll}%`);
        });
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        const milestones = [10, 30, 60, 120, 300]; // seconds
        const tracked = new Set();

        const checkMilestones = () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);

            milestones.forEach(milestone => {
                if (timeSpent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('engagement', 'time_on_page', `${milestone}s`);
                }
            });

            if (tracked.size < milestones.length) {
                setTimeout(checkMilestones, 5000);
            }
        };

        setTimeout(checkMilestones, 5000);

        // Track total time on page unload
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('engagement', 'total_time_on_page', `${totalTime}s`);
        });
    }

    trackExternalLinks() {
        document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('outbound', 'click', link.href);
            });
        });
    }

    setupEcommerceTracking() {
        // Track service views
        const service = this.getServiceFromPage();
        if (service) {
            this.trackEvent('ecommerce', 'view_item', service.name, service.value);

            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'ViewContent', {
                    content_name: service.name,
                    content_category: 'service',
                    value: service.value,
                    currency: 'AUD'
                });
            }
        }
    }

    setupCustomDimensions() {
        // Set user type
        const userType = this.getUserType();
        if (typeof gtag !== 'undefined') {
            gtag('config', this.config.ga4.id, {
                'user_type': userType,
                'page_category': this.getPageCategory()
            });
        }
    }

    trackEvent(category, action, label = null, value = null) {
        // GA4
        if (typeof gtag !== 'undefined') {
            const eventParams = {
                'event_category': category,
                'event_label': label
            };

            if (value !== null) {
                eventParams.value = value;
            }

            gtag('event', action, eventParams);
        }

        // Hotjar custom events
        if (typeof hj !== 'undefined') {
            hj('event', `${category}_${action}`);
        }

        console.log('Event tracked:', { category, action, label, value });
    }

    calculateLeadValue(formData) {
        const budgetMap = {
            '$1000-$2000': 1500,
            '$2000-$3000': 2500,
            '$3000-$5000': 4000,
            '$5000+': 7500
        };

        return budgetMap[formData.budget] || 2000;
    }

    getPageCategory() {
        const path = window.location.pathname;
        if (path.includes('seo')) return 'seo';
        if (path.includes('google-ads')) return 'google-ads';
        if (path.includes('web-design')) return 'web-design';
        if (path.includes('contact')) return 'contact';
        if (path === '/' || path.includes('index')) return 'home';
        return 'other';
    }

    getServiceFromPage() {
        const path = window.location.pathname;
        const services = {
            'seo': { name: 'SEO Services', value: 2000 },
            'google-ads': { name: 'Google Ads Management', value: 1500 },
            'web-design': { name: 'Web Design', value: 3000 }
        };

        for (const [key, service] of Object.entries(services)) {
            if (path.includes(key)) {
                return service;
            }
        }
        return null;
    }

    getUserType() {
        // Check if returning visitor
        if (document.cookie.includes('returning_visitor=true')) {
            return 'returning';
        }

        // Set returning visitor cookie
        document.cookie = 'returning_visitor=true; max-age=2592000; path=/'; // 30 days

        // Check referrer
        const referrer = document.referrer;
        if (referrer.includes('google')) return 'organic_search';
        if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
        if (referrer.includes('linkedin')) return 'professional';
        if (!referrer) return 'direct';

        return 'referral';
    }
}

// Initialize tracking
const tracking = new TrackingImplementation();

// Export for use in other scripts
window.TPPTracking = tracking;