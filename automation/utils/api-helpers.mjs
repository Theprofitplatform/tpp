/**
 * API Helper Utilities
 * Provides retry logic, rate limiting, and error handling for API calls
 */

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of successful function call
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw error; // Authentication/authorization errors
      }

      if (attempt === maxRetries) {
        break; // Last attempt failed
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const waitTime = delay + jitter;

      console.warn(
        `⚠️  Attempt ${attempt + 1}/${maxRetries + 1} failed: ${error.message}`
      );
      console.log(`   Retrying in ${Math.round(waitTime / 1000)}s...`);

      if (onRetry) {
        onRetry(attempt + 1, error, waitTime);
      }

      await sleep(waitTime);
    }
  }

  throw lastError;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  constructor(maxTokens, refillRate) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  async waitForToken() {
    while (this.tokens < 1) {
      // Refill tokens based on time elapsed
      const now = Date.now();
      const elapsed = (now - this.lastRefill) / 1000;
      const tokensToAdd = elapsed * this.refillRate;

      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;

      if (this.tokens < 1) {
        const waitTime = (1 - this.tokens) / this.refillRate * 1000;
        await sleep(waitTime);
      }
    }

    this.tokens -= 1;
  }

  async execute(fn) {
    await this.waitForToken();
    return fn();
  }
}

/**
 * Create a cached API call wrapper
 * @param {Function} fn - API function to cache
 * @param {Object} cache - Cache object (key-value store)
 * @param {Function} keyFn - Function to generate cache key from arguments
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} Cached version of the function
 */
export function withCache(fn, cache, keyFn, ttl = 3600000) {
  return async function(...args) {
    const key = keyFn(...args);

    // Check cache
    if (cache[key]) {
      const { data, timestamp } = cache[key];
      const age = Date.now() - timestamp;

      if (age < ttl) {
        console.log(`💾 Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
        return data;
      }

      // Expired
      delete cache[key];
    }

    // Call function
    console.log(`🌐 Cache miss: ${key} - fetching fresh data`);
    const data = await fn(...args);

    // Store in cache
    cache[key] = {
      data,
      timestamp: Date.now()
    };

    return data;
  };
}

/**
 * Validate API response
 * @param {Object} response - API response object
 * @param {Object} schema - Expected schema
 * @throws {Error} If validation fails
 */
export function validateResponse(response, schema) {
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in response)) {
      throw new Error(`Missing required field: ${key}`);
    }

    if (typeof response[key] !== type && response[key] !== null) {
      throw new Error(
        `Invalid type for ${key}: expected ${type}, got ${typeof response[key]}`
      );
    }
  }
}

export default {
  retryWithBackoff,
  RateLimiter,
  withCache,
  validateResponse,
  sleep
};
