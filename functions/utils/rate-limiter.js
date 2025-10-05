/**
 * Rate Limiter for Cloudflare Pages Functions
 * Uses in-memory storage (simple) or KV storage (production)
 */

// Simple in-memory cache for rate limiting
// NOTE: This resets on function cold starts. For production, use Cloudflare KV
const rateLimitCache = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  // Per IP address limits
  perIp: {
    requests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Global limits (all IPs)
  global: {
    requests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

/**
 * Get client IP from request
 * @param {Request} request - The request object
 * @returns {string} Client IP address
 */
function getClientIp(request) {
  // Cloudflare provides client IP in CF-Connecting-IP header
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]
    || request.headers.get('X-Real-IP')
    || 'unknown';
}

/**
 * Clean up expired entries from cache
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, data] of rateLimitCache.entries()) {
    if (now > data.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}

/**
 * Check if request should be rate limited
 * @param {Request} request - The request object
 * @param {Object} env - Environment variables (for KV storage)
 * @returns {Object} Rate limit result
 */
export function checkRateLimit(request, env) {
  const clientIp = getClientIp(request);
  const now = Date.now();

  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance on each request
    cleanupCache();
  }

  // Check per-IP rate limit
  const ipKey = `ip:${clientIp}`;
  const ipWindow = Math.floor(now / RATE_LIMITS.perIp.windowMs);
  const ipCacheKey = `${ipKey}:${ipWindow}`;

  let ipData = rateLimitCache.get(ipCacheKey);
  if (!ipData) {
    ipData = {
      count: 0,
      resetTime: (ipWindow + 1) * RATE_LIMITS.perIp.windowMs,
    };
    rateLimitCache.set(ipCacheKey, ipData);
  }

  ipData.count++;

  // Check if IP limit exceeded
  if (ipData.count > RATE_LIMITS.perIp.requests) {
    const retryAfter = Math.ceil((ipData.resetTime - now) / 1000);

    return {
      allowed: false,
      reason: 'IP rate limit exceeded',
      limit: RATE_LIMITS.perIp.requests,
      remaining: 0,
      resetTime: ipData.resetTime,
      retryAfter,
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.perIp.requests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': ipData.resetTime.toString(),
        'Retry-After': retryAfter.toString(),
      },
    };
  }

  // Check global rate limit
  const globalKey = 'global';
  const globalWindow = Math.floor(now / RATE_LIMITS.global.windowMs);
  const globalCacheKey = `${globalKey}:${globalWindow}`;

  let globalData = rateLimitCache.get(globalCacheKey);
  if (!globalData) {
    globalData = {
      count: 0,
      resetTime: (globalWindow + 1) * RATE_LIMITS.global.windowMs,
    };
    rateLimitCache.set(globalCacheKey, globalData);
  }

  globalData.count++;

  // Check if global limit exceeded
  if (globalData.count > RATE_LIMITS.global.requests) {
    const retryAfter = Math.ceil((globalData.resetTime - now) / 1000);

    return {
      allowed: false,
      reason: 'Global rate limit exceeded',
      limit: RATE_LIMITS.global.requests,
      remaining: 0,
      resetTime: globalData.resetTime,
      retryAfter,
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.global.requests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': globalData.resetTime.toString(),
        'Retry-After': retryAfter.toString(),
      },
    };
  }

  // Rate limit not exceeded
  const remaining = RATE_LIMITS.perIp.requests - ipData.count;

  return {
    allowed: true,
    remaining,
    resetTime: ipData.resetTime,
    headers: {
      'X-RateLimit-Limit': RATE_LIMITS.perIp.requests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': ipData.resetTime.toString(),
    },
  };
}

/**
 * Create rate limit exceeded response
 * @param {Object} rateLimitResult - Rate limit check result
 * @param {Request} request - The request object
 * @param {Object} env - Environment variables
 * @returns {Response}
 */
export function createRateLimitResponse(rateLimitResult, request, env) {
  const { getCorsHeaders } = require('./cors.js');
  const corsHeaders = getCorsHeaders(request, env);

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`,
      limit: rateLimitResult.limit,
      retryAfter: rateLimitResult.retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...rateLimitResult.headers,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Production-ready rate limiter using Cloudflare KV (optional)
 * Uncomment and configure KV binding in wrangler.toml to use this
 */
/*
export async function checkRateLimitKV(request, env) {
  if (!env.RATE_LIMITER_KV) {
    // Fallback to in-memory if KV not configured
    return checkRateLimit(request, env);
  }

  const clientIp = getClientIp(request);
  const now = Date.now();
  const windowStart = Math.floor(now / RATE_LIMITS.perIp.windowMs);
  const key = `ratelimit:${clientIp}:${windowStart}`;

  // Get current count from KV
  const currentCount = parseInt(await env.RATE_LIMITER_KV.get(key)) || 0;
  const newCount = currentCount + 1;

  // Store updated count with expiration
  await env.RATE_LIMITER_KV.put(
    key,
    newCount.toString(),
    { expirationTtl: RATE_LIMITS.perIp.windowMs / 1000 }
  );

  // Check if limit exceeded
  if (newCount > RATE_LIMITS.perIp.requests) {
    const resetTime = (windowStart + 1) * RATE_LIMITS.perIp.windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    return {
      allowed: false,
      reason: 'Rate limit exceeded',
      limit: RATE_LIMITS.perIp.requests,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMITS.perIp.requests - newCount,
    resetTime: (windowStart + 1) * RATE_LIMITS.perIp.windowMs,
  };
}
*/
