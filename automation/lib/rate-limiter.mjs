#!/usr/bin/env node

/**
 * Rate Limiter with Exponential Backoff
 *
 * Prevents API rate limit errors by:
 * - Tracking requests per minute
 * - Queuing excess requests
 * - Implementing exponential backoff on 429 errors
 * - Providing request slot management
 *
 * Usage:
 *   import { AnthropicRateLimiter } from './automation/lib/rate-limiter.mjs';
 *
 *   const limiter = new AnthropicRateLimiter(50); // 50 requests/min
 *
 *   const result = await limiter.withRetry(async () => {
 *     return await anthropic.messages.create({...});
 *   });
 */

export class AnthropicRateLimiter {
  constructor(requestsPerMinute = 50, options = {}) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = []; // Timestamps of recent requests
    this.maxRetries = options.maxRetries || 3;
    this.initialBackoff = options.initialBackoff || 1000; // 1 second
    this.maxBackoff = options.maxBackoff || 32000; // 32 seconds
    this.verbose = options.verbose || false;
  }

  /**
   * Wait for an available request slot
   * Implements sliding window rate limiting
   */
  async waitForSlot() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    if (this.requests.length >= this.requestsPerMinute) {
      // Calculate wait time until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest) + 100; // +100ms buffer

      if (this.verbose) {
        console.log(`⏳ Rate limit: ${this.requests.length}/${this.requestsPerMinute} requests. Waiting ${waitTime}ms...`);
      }

      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Recursive check after waiting
      return this.waitForSlot();
    }

    // Add current request timestamp
    this.requests.push(now);

    if (this.verbose) {
      console.log(`✅ Request slot acquired (${this.requests.length}/${this.requestsPerMinute})`);
    }
  }

  /**
   * Execute function with automatic retries and exponential backoff
   *
   * @param {Function} fn - Async function to execute
   * @param {Object} options - Retry options
   * @returns {Promise<any>} - Function result
   */
  async withRetry(fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait for rate limit slot
        await this.waitForSlot();

        // Execute function
        const result = await fn();

        return result;

      } catch (error) {
        lastError = error;

        // Check if it's a rate limit error
        const isRateLimitError = error.status === 429 ||
                                  error.error?.type === 'rate_limit_error' ||
                                  error.message?.includes('rate limit');

        // Check if it's a temporary error worth retrying
        const isRetryableError = error.status >= 500 ||
                                  error.code === 'ECONNRESET' ||
                                  error.code === 'ETIMEDOUT' ||
                                  isRateLimitError;

        if (!isRetryableError || attempt >= maxRetries) {
          // Don't retry non-retryable errors or if max retries reached
          throw error;
        }

        // Calculate exponential backoff
        const backoff = Math.min(
          this.initialBackoff * Math.pow(2, attempt - 1),
          this.maxBackoff
        );

        // Add jitter (random 0-20% variation)
        const jitter = backoff * 0.2 * Math.random();
        const waitTime = backoff + jitter;

        console.warn(`⚠️  ${isRateLimitError ? 'Rate limit' : 'Temporary error'} (attempt ${attempt}/${maxRetries})`);
        console.warn(`   Error: ${error.message}`);
        console.warn(`   Retrying in ${(waitTime / 1000).toFixed(1)}s...`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // If rate limit error, clear some request slots
        if (isRateLimitError) {
          this.requests = [];
          console.log('   Cleared rate limit queue');
        }
      }
    }

    // All retries exhausted
    throw new Error(`Max retries (${maxRetries}) exhausted. Last error: ${lastError.message}`);
  }

  /**
   * Get current rate limit status
   * @returns {Object} - Status information
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requests.filter(time => time > oneMinuteAgo);

    return {
      requestsInLastMinute: recentRequests.length,
      requestsPerMinute: this.requestsPerMinute,
      slotsAvailable: this.requestsPerMinute - recentRequests.length,
      utilizationPercent: (recentRequests.length / this.requestsPerMinute * 100).toFixed(1),
    };
  }

  /**
   * Reset rate limiter (for testing)
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Pre-configured rate limiters for different services
 */
export const rateLimiters = {
  anthropic: new AnthropicRateLimiter(50), // 50 req/min
  googleSearchConsole: new AnthropicRateLimiter(300), // 300 req/min
  unsplash: new AnthropicRateLimiter(50), // 50 req/hour (conservative)
};

export default AnthropicRateLimiter;
