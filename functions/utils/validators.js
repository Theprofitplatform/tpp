/**
 * Input Validation Utilities for Keyword Research API
 */

// Valid location values
export const VALID_LOCATIONS = [
  'Sydney, Australia',
  'Sydney CBD',
  'Parramatta',
  'Bondi',
  'Chatswood',
  'Penrith',
  'Liverpool',
];

// Valid intent values
export const VALID_INTENTS = [
  'all',
  'commercial',
  'informational',
  'transactional',
  'navigational',
];

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Validate keyword input
 * @param {string} keyword - The keyword to validate
 * @returns {ValidationResult}
 */
export function validateKeyword(keyword) {
  if (!keyword) {
    return { valid: false, error: 'Keyword is required' };
  }

  if (typeof keyword !== 'string') {
    return { valid: false, error: 'Keyword must be a string' };
  }

  const trimmed = keyword.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Keyword cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Keyword must be 100 characters or less' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Keyword must be at least 2 characters' };
  }

  // Check for suspicious patterns (basic XSS/injection prevention)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // Event handlers like onclick=
    /\{%/,     // Template injection
    /\{\{/,    // Template injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Invalid characters in keyword' };
    }
  }

  return { valid: true, keyword: trimmed };
}

/**
 * Validate location input
 * @param {string} location - The location to validate
 * @returns {ValidationResult}
 */
export function validateLocation(location) {
  // Location is optional
  if (!location) {
    return { valid: true, location: 'Sydney, Australia' };
  }

  if (typeof location !== 'string') {
    return { valid: false, error: 'Location must be a string' };
  }

  if (!VALID_LOCATIONS.includes(location)) {
    return {
      valid: false,
      error: `Invalid location. Must be one of: ${VALID_LOCATIONS.join(', ')}`
    };
  }

  return { valid: true, location };
}

/**
 * Validate intent input
 * @param {string} intent - The intent to validate
 * @returns {ValidationResult}
 */
export function validateIntent(intent) {
  // Intent is optional
  if (!intent) {
    return { valid: true, intent: 'all' };
  }

  if (typeof intent !== 'string') {
    return { valid: false, error: 'Intent must be a string' };
  }

  if (!VALID_INTENTS.includes(intent)) {
    return {
      valid: false,
      error: `Invalid intent. Must be one of: ${VALID_INTENTS.join(', ')}`
    };
  }

  return { valid: true, intent };
}

/**
 * Validate all keyword research inputs
 * @param {Object} data - Request data
 * @param {string} data.keyword - The keyword
 * @param {string} [data.location] - The location
 * @param {string} [data.intent] - The intent
 * @returns {ValidationResult}
 */
export function validateKeywordResearchRequest(data) {
  // Validate keyword
  const keywordResult = validateKeyword(data.keyword);
  if (!keywordResult.valid) {
    return keywordResult;
  }

  // Validate location
  const locationResult = validateLocation(data.location);
  if (!locationResult.valid) {
    return locationResult;
  }

  // Validate intent
  const intentResult = validateIntent(data.intent);
  if (!intentResult.valid) {
    return intentResult;
  }

  return {
    valid: true,
    keyword: keywordResult.keyword,
    location: locationResult.location,
    intent: intentResult.intent,
  };
}
