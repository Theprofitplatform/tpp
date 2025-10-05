/**
 * Retry Logic with Exponential Backoff
 * For handling transient API failures
 */

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
function isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error.response) {
    const status = error.response.status;
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429;
  }

  // Google Ads API specific errors
  if (error.errors && Array.isArray(error.errors)) {
    const firstError = error.errors[0];

    // Retry on quota/rate limit errors
    if (firstError.error_code?.quota_error === 'RESOURCE_EXHAUSTED') {
      return true;
    }

    // Retry on transient errors
    if (firstError.error_code?.internal_error) {
      return true;
    }

    // Don't retry on auth errors
    if (firstError.error_code?.authentication_error) {
      return false;
    }

    // Don't retry on request errors (invalid input)
    if (firstError.error_code?.request_error) {
      return false;
    }
  }

  // Default: retry on unknown errors
  return true;
}

/**
 * Execute a function with retry logic and exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} [options.maxRetries=3] - Maximum number of retry attempts
 * @param {number} [options.initialDelay=1000] - Initial delay in milliseconds
 * @param {number} [options.maxDelay=10000] - Maximum delay in milliseconds
 * @param {number} [options.backoffMultiplier=2] - Backoff multiplier
 * @param {Function} [options.onRetry] - Callback called before each retry
 * @returns {Promise<*>} Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry = null,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the function
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        console.log(`Non-retryable error, not retrying:`, error.message);
        throw error;
      }

      // Log retry attempt
      console.log(JSON.stringify({
        event: 'retry_attempt',
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: error.message,
      }));

      // Call onRetry callback if provided
      if (onRetry) {
        try {
          await onRetry(attempt, error, delay);
        } catch (callbackError) {
          console.error('Error in onRetry callback:', callbackError);
        }
      }

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  // All retries failed, throw the last error
  console.error(JSON.stringify({
    event: 'retry_exhausted',
    maxRetries,
    error: lastError.message,
  }));

  throw lastError;
}

/**
 * Retry wrapper specifically for Google Ads API calls
 * @param {Function} fn - Async function to execute
 * @param {Object} context - Context information for logging
 * @returns {Promise<*>} Result of the function
 */
export async function retryGoogleAdsCall(fn, context = {}) {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    onRetry: (attempt, error, delay) => {
      console.log(JSON.stringify({
        event: 'google_ads_retry',
        attempt: attempt + 1,
        delay,
        error: error.message,
        context,
      }));
    },
  });
}
