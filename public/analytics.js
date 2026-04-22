// Google Analytics - Permit Intelligence Platform
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-740YX0W0GE', { debug_mode: true });

// Custom event tracking
function trackEvent(action, category, label = null) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
    console.log(`📊 Analytics: ${category} - ${action}${label ? ' - ' + label : ''}`);
  }
}

console.log('✅ Google Analytics ready (debug mode)');
