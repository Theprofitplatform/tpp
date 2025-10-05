/**
 * CORS Configuration for Cloudflare Pages Functions
 * Restricts API access to authorized domains only
 */

// Allowed origins for API access
const ALLOWED_ORIGINS = [
  'https://theprofitplatform.com.au',
  'https://www.theprofitplatform.com.au',
  'https://tpp-production.pages.dev',
];

// Development origins (only in dev environment)
const DEV_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:4321',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:4321',
];

/**
 * Get CORS headers for a request
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Object} CORS headers
 */
export function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');

  // Determine allowed origins based on environment
  let allowedOrigins = [...ALLOWED_ORIGINS];

  // Add dev origins in development/preview environments
  if (env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'preview') {
    allowedOrigins = [...allowedOrigins, ...DEV_ORIGINS];
  }

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Create a JSON response with CORS headers
 * @param {Object} data - Response data
 * @param {Object} options - Response options (status, headers, etc.)
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Response}
 */
export function jsonResponse(data, options, request, env) {
  const corsHeaders = getCorsHeaders(request, env);

  return new Response(
    JSON.stringify(data),
    {
      status: options.status || 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }
  );
}

/**
 * Handle OPTIONS preflight request
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @returns {Response}
 */
export function handleOptions(request, env) {
  const corsHeaders = getCorsHeaders(request, env);
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
