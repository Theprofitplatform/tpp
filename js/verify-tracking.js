// Tracking Verification Helper
console.log('%c🔍 Tracking Verification', 'font-size: 16px; font-weight: bold; color: #4CAF50');

// Check what's loaded
const tracking = {
    config: !!window.TPP_TRACKING,
    ga4: !!window.gtag,
    fbPixel: !!window.fbq,
    hotjar: !!window.hj,
    gtm: !!window.dataLayer
};

console.table(tracking);

// Show configured IDs
if (window.TPP_TRACKING) {
    console.log('%c📊 Configured Tracking IDs:', 'font-weight: bold');
    console.log('GA4:', window.TPP_TRACKING.GA4_ID || 'Not set');
    console.log('FB Pixel:', window.TPP_TRACKING.FB_PIXEL || 'Not set');
    console.log('Hotjar:', window.TPP_TRACKING.HOTJAR_ID || 'Not set');
    console.log('GTM:', window.TPP_TRACKING.GTM_ID || 'Not set');
}

// Test event firing
window.testTracking = function() {
    console.log('%c🧪 Testing tracking events...', 'font-weight: bold; color: #2196F3');

    if (window.gtag) {
        gtag('event', 'test_event', {
            'event_category': 'test',
            'event_label': 'manual_test'
        });
        console.log('✅ GA4 test event sent');
    }

    if (window.fbq) {
        fbq('track', 'ViewContent', {
            content_name: 'Test Page'
        });
        console.log('✅ FB Pixel test event sent');
    }

    console.log('Check your analytics real-time reports to verify events are received.');
};

console.log('%c💡 Run testTracking() to send test events', 'color: #FF9800');
