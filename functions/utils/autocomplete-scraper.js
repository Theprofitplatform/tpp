/**
 * Google Autocomplete Scraper
 * Free API for real user query suggestions
 */

/**
 * Fetch Google Autocomplete suggestions
 * @param {string} keyword - Seed keyword
 * @param {string} location - Country code (default: 'au' for Australia)
 * @returns {Promise<string[]>} Array of autocomplete suggestions
 */
export async function fetchGoogleAutocomplete(keyword, location = 'au') {
  try {
    // Google's public autocomplete API
    // Used by google.com search box - no auth needed
    const url = `https://www.google.com/complete/search?q=${encodeURIComponent(keyword)}&gl=${location}&hl=en&client=firefox`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.status}`);
    }

    const text = await response.text();

    // Parse JSON response
    // Format: [query, [suggestions], {...}, {...}]
    const data = JSON.parse(text);
    const suggestions = data[1] || [];

    return suggestions;

  } catch (error) {
    console.error('❌ Autocomplete scraper error:', error);
    return []; // Return empty array on failure
  }
}

/**
 * Fetch autocomplete for multiple keyword variations
 * @param {string} baseKeyword - Base keyword
 * @param {string[]} modifiers - Modifiers to append (e.g., ['near me', 'cost', 'services'])
 * @param {string} location - Country code
 * @returns {Promise<string[]>} Combined unique suggestions
 */
export async function fetchAutocompleteVariations(baseKeyword, modifiers = [], location = 'au') {
  const allSuggestions = new Set();

  // Base keyword suggestions
  const baseSuggestions = await fetchGoogleAutocomplete(baseKeyword, location);
  baseSuggestions.forEach(s => allSuggestions.add(s));

  // Variations with modifiers
  for (const modifier of modifiers) {
    const query = `${baseKeyword} ${modifier}`;
    const suggestions = await fetchGoogleAutocomplete(query, location);
    suggestions.forEach(s => allSuggestions.add(s));

    // Small delay to be respectful to Google
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Array.from(allSuggestions);
}

/**
 * Fetch question-based autocomplete suggestions
 * @param {string} keyword - Base keyword
 * @param {string} location - Country code
 * @returns {Promise<string[]>} Question-based suggestions
 */
export async function fetchQuestionSuggestions(keyword, location = 'au') {
  const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'does'];
  const allSuggestions = new Set();

  for (const questionWord of questionWords) {
    const query = `${questionWord} ${keyword}`;
    const suggestions = await fetchGoogleAutocomplete(query, location);

    // Only keep suggestions that actually contain the keyword
    suggestions
      .filter(s => s.toLowerCase().includes(keyword.toLowerCase()))
      .forEach(s => allSuggestions.add(s));

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Array.from(allSuggestions);
}

/**
 * Get Sydney-specific autocomplete variations
 * @param {string} keyword - Base keyword
 * @returns {Promise<string[]>} Sydney-specific suggestions
 */
export async function fetchSydneyVariations(keyword) {
  const locations = [
    'Sydney',
    'Sydney CBD',
    'Parramatta',
    'Bondi',
    'Chatswood',
    'Penrith',
    'Liverpool',
    'Manly',
    'North Sydney',
    'Eastern Suburbs Sydney'
  ];

  const allSuggestions = new Set();

  for (const location of locations) {
    const query = `${keyword} ${location}`;
    const suggestions = await fetchGoogleAutocomplete(query, 'au');
    suggestions.forEach(s => allSuggestions.add(s));

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Array.from(allSuggestions);
}

/**
 * Comprehensive autocomplete research
 * Combines base, variations, questions, and location-specific suggestions
 * @param {string} keyword - Seed keyword
 * @param {string} location - Target location
 * @returns {Promise<Object>} Categorized suggestions
 */
export async function comprehensiveAutocomplete(keyword, location = 'Sydney, Australia') {
  const isSydney = location.toLowerCase().includes('sydney');

  // Parallel requests for speed
  const [
    baseSuggestions,
    questionSuggestions,
    sydneySuggestions,
    commercialSuggestions
  ] = await Promise.all([
    fetchGoogleAutocomplete(keyword, 'au'),
    fetchQuestionSuggestions(keyword, 'au'),
    isSydney ? fetchSydneyVariations(keyword) : Promise.resolve([]),
    fetchAutocompleteVariations(keyword, ['near me', 'cost', 'price', 'services', 'companies'], 'au')
  ]);

  // Combine and deduplicate
  const allSuggestions = new Set([
    ...baseSuggestions,
    ...questionSuggestions,
    ...sydneySuggestions,
    ...commercialSuggestions
  ]);

  // Categorize
  const categorized = {
    questions: [],
    commercial: [],
    location: [],
    general: []
  };

  Array.from(allSuggestions).forEach(suggestion => {
    const lower = suggestion.toLowerCase();

    if (/^(how|what|why|when|where|who|which|can|should|does)/.test(lower)) {
      categorized.questions.push(suggestion);
    } else if (/\b(cost|price|cheap|affordable|buy|near me|services|companies)\b/.test(lower)) {
      categorized.commercial.push(suggestion);
    } else if (/\b(sydney|parramatta|bondi|chatswood|penrith|liverpool|manly)\b/i.test(suggestion)) {
      categorized.location.push(suggestion);
    } else {
      categorized.general.push(suggestion);
    }
  });

  return {
    total: allSuggestions.size,
    categories: categorized,
    all: Array.from(allSuggestions)
  };
}
