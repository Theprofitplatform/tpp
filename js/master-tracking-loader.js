// Master Tracking Loader - Ensures all tracking systems are initialized
(function() {
    'use strict';

    // Load tracking configuration
    if (!window.TPP_TRACKING) {
        console.warn('Tracking config not loaded, attempting to load...');
        const script = document.createElement('script');
        script.src = '/js/tracking-config.js';
        script.onload = function() {
            initializeTracking();
        };
        document.head.appendChild(script);
    } else {
        initializeTracking();
    }

    function initializeTracking() {
        const config = window.TPP_TRACKING || {};

        // Google Analytics 4
        if (config.GA4_ID && !config.GA4_ID.includes('XXXX')) {
            // Load gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', config.GA4_ID, {
                'page_path': window.location.pathname,
                'debug_mode': window.location.hostname === 'localhost'
            });

            // Load GA script
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.GA4_ID;
            document.head.appendChild(gaScript);

            console.log('✅ GA4 initialized:', config.GA4_ID);
        }

        // Facebook Pixel
        if (config.FB_PIXEL && !config.FB_PIXEL.includes('XXXX')) {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', config.FB_PIXEL);
            fbq('track', 'PageView');

            console.log('✅ Facebook Pixel initialized:', config.FB_PIXEL);
        }

        // Hotjar
        if (config.HOTJAR_ID && !config.HOTJAR_ID.includes('XXXX')) {
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:config.HOTJAR_ID,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

            console.log('✅ Hotjar initialized:', config.HOTJAR_ID);
        }

        // Google Tag Manager (optional)
        if (config.GTM_ID && !config.GTM_ID.includes('XXXX')) {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',config.GTM_ID);

            console.log('✅ GTM initialized:', config.GTM_ID);
        }

        // Track page view
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTracking);
    } else {
        initializeTracking();
    }
})();
