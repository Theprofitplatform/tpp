// Retargeting Pixel Setup
(function() {
    // Track page views for retargeting
    const pageData = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };

    // Facebook Pixel Events for Retargeting
    if (window.fbq) {
        // Track specific pages for custom audiences
        if (window.location.pathname.includes('services')) {
            fbq('track', 'ViewContent', {
                content_name: 'Services Page',
                content_category: 'Services'
            });
        }
        if (window.location.pathname.includes('contact')) {
            fbq('track', 'Lead', {
                content_name: 'Contact Page Visit'
            });
        }
        if (window.location.pathname.includes('seo')) {
            fbq('track', 'ViewContent', {
                content_name: 'SEO Service',
                value: 1500,
                currency: 'AUD'
            });
        }
    }

    // Google Ads Remarketing
    if (window.gtag) {
        gtag('event', 'page_view', {
            'send_to': 'AW-CONVERSION_ID',
            'value': getPageValue(),
            'items': [{
                'id': window.location.pathname,
                'google_business_vertical': 'custom'
            }]
        });
    }

    function getPageValue() {
        // Assign values to pages for smart bidding
        const values = {
            '/contact.html': 100,
            '/services.html': 50,
            '/seo.html': 75,
            '/google-ads.html': 75,
            '/': 25
        };
        return values[window.location.pathname] || 10;
    }

    // LinkedIn Insight Tag (if configured)
    if (window._linkedin_data_partner_ids) {
        window._linkedin_data_partner_ids.push(pageData);
    }

    console.log('Retargeting pixels fired for:', window.location.pathname);
})();
