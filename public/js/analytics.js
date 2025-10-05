// Analytics - Deferred loading for better performance
// This file is loaded with defer attribute to not block page rendering

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FB947JWCFT', {
  'send_page_view': true,
  'cookie_flags': 'SameSite=None;Secure'
});

// Helper function for tracking events
window.trackEvent = function(eventName, eventParams) {
  gtag('event', eventName, eventParams || {});
};

// Initialize tracking after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Phone number click tracking
  document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'phone_call', {
        'event_category': 'Contact',
        'event_label': this.getAttribute('href'),
        'value': 1
      });
    });
  });

  // Email click tracking
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      gtag('event', 'email_click', {
        'event_category': 'Contact',
        'event_label': this.getAttribute('href'),
        'value': 1
      });
    });
  });

  // External link tracking
  document.querySelectorAll('a[href^="http"]').forEach(function(link) {
    if (!link.href.includes('theprofitplatform.com.au')) {
      link.addEventListener('click', function() {
        gtag('event', 'outbound_click', {
          'event_category': 'Outbound',
          'event_label': this.href
        });
      });
    }
  });

  // Form submission tracking
  document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const formId = this.id || this.getAttribute('name') || 'unnamed_form';
      gtag('event', 'form_submission', {
        'event_category': 'Lead Generation',
        'event_label': formId,
        'value': 10
      });
    });
  });

  // Scroll depth tracking (25%, 50%, 75%, 100%)
  let scrollMarks = {25: false, 50: false, 75: false, 100: false};
  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    Object.keys(scrollMarks).forEach(function(mark) {
      if (scrollPercent >= parseInt(mark) && !scrollMarks[mark]) {
        scrollMarks[mark] = true;
        gtag('event', 'scroll_depth', {
          'event_category': 'Engagement',
          'event_label': mark + '%',
          'value': parseInt(mark)
        });
      }
    });
  });
});

// Hotjar Tracking Code
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:6526316,hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
