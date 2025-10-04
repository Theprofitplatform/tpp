/**
 * Centralized Analytics Module for Tool Tracking
 * Integrates with GA4 and Facebook Pixel
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const ToolAnalytics = {
  /**
   * Track when a tool is started
   */
  toolStarted(toolName: string, formData?: Record<string, any>) {
    // GA4 Event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'tool_started', {
        tool_name: toolName,
        timestamp: Date.now(),
        ...formData
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: toolName,
        content_category: 'tool'
      });
    }

    console.log(`[Analytics] Tool Started: ${toolName}`, formData);
  },

  /**
   * Track when a tool completes successfully
   */
  toolCompleted(toolName: string, result: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'tool_completed', {
        tool_name: toolName,
        result_type: result.status || 'success',
        result_value: result.score || result.rank || result.value,
        timestamp: Date.now()
      });
    }

    console.log(`[Analytics] Tool Completed: ${toolName}`, result);
  },

  /**
   * Track CTA clicks (high-value conversion events)
   */
  ctaClicked(ctaType: string, toolName: string, position: string, metadata?: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        tool_name: toolName,
        cta_type: ctaType,
        cta_position: position,
        value: 500, // Estimated lead value in AUD
        currency: 'AUD',
        ...metadata
      });
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: toolName,
        content_category: ctaType,
        value: 500,
        currency: 'AUD'
      });
    }

    console.log(`[Analytics] CTA Clicked: ${ctaType} on ${toolName} at ${position}`);
  },

  /**
   * Track form field interactions
   */
  formFieldChanged(toolName: string, fieldName: string, value?: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_interaction', {
        tool_name: toolName,
        field_name: fieldName,
        has_value: !!value
      });
    }
  },

  /**
   * Track errors
   */
  errorOccurred(toolName: string, errorType: string, errorMessage: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${toolName}: ${errorType} - ${errorMessage}`,
        fatal: false,
        tool_name: toolName,
        error_type: errorType
      });
    }

    console.error(`[Analytics] Error in ${toolName}:`, errorType, errorMessage);
  },

  /**
   * Track scroll depth (engagement metric)
   */
  scrollDepth(depth: number) {
    if (typeof window !== 'undefined' && window.gtag && depth % 25 === 0) {
      window.gtag('event', 'scroll', {
        percent_scrolled: depth
      });
    }
  },

  /**
   * Track time spent on tool
   */
  timeOnTool(toolName: string, seconds: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'tool_engagement',
        value: seconds,
        event_category: toolName
      });
    }
  },

  /**
   * Track revenue impact shown to user
   */
  revenueImpactShown(toolName: string, impactAmount: number, severity: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'revenue_impact_shown', {
        tool_name: toolName,
        impact_amount: impactAmount,
        severity: severity, // 'critical', 'warning', 'info'
        currency: 'AUD'
      });
    }
  }
};

/**
 * Auto-track scroll depth
 */
if (typeof window !== 'undefined') {
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const percent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (percent > maxScroll && percent % 25 === 0 && percent <= 100) {
      maxScroll = percent;
      ToolAnalytics.scrollDepth(percent);
    }
  });
}

/**
 * Track time on page for engagement
 */
if (typeof window !== 'undefined') {
  const pageLoadTime = Date.now();

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
    const toolName = document.querySelector('[data-tool-name]')?.getAttribute('data-tool-name') || 'unknown';
    ToolAnalytics.timeOnTool(toolName, timeOnPage);
  });
}

export default ToolAnalytics;
