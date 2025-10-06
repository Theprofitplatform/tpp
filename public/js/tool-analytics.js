/**
 * Client-side Tool Analytics Tracker
 * Sends usage notifications to Discord via Cloudflare Function
 */

/**
 * Track tool usage and send notification
 * @param {string} toolName - Name of the tool being used
 * @param {Object} userInput - User input data (sanitized)
 */
async function trackToolUsage(toolName, userInput = {}) {
  try {
    // Sanitize user input - remove sensitive data and limit size
    const sanitizedInput = {};
    const allowedKeys = ['topic', 'keyword', 'url', 'domain', 'pageType', 'location', 'businessName', 'competitors'];

    Object.keys(userInput).forEach(key => {
      if (allowedKeys.includes(key) && userInput[key]) {
        // Limit string length to prevent large payloads
        const value = String(userInput[key]).substring(0, 200);
        sanitizedInput[key] = value;
      }
    });

    // Send to analytics endpoint
    fetch('/api/tool-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName,
        userInput: sanitizedInput
      }),
    })
    .then(response => {
      console.log('Analytics response:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Analytics data:', data);
    })
    .catch(err => {
      console.error('Analytics tracking failed:', err);
    });

  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Make available globally
window.trackToolUsage = trackToolUsage;
