/**
 * DataForSEO Integration - Direct API Calls (No SDK)
 * Bundle size: <1MB ✅ (no dependencies)
 * Cost: ~$0.05 per request
 */

/**
 * Fetch real keyword data from DataForSEO API
 * @param {Object} env - Cloudflare environment variables
 * @param {string} keyword - Seed keyword
 * @param {string} location - Location string (e.g., "Sydney, Australia")
 * @returns {Promise<Object>} Formatted keyword data
 */
export async function fetchDataForSEOKeywords(env, keyword, location = 'Sydney, Australia') {
  // Check if DataForSEO credentials are configured
  if (!env.DATAFORSEO_LOGIN || !env.DATAFORSEO_PASSWORD) {
    throw new Error('DATAFORSEO_CREDENTIALS_NOT_CONFIGURED');
  }

  // Create Basic Auth header
  const auth = btoa(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`);

  // Map location to DataForSEO location code
  const locationCode = getLocationCode(location);

  // Prepare request payload
  const payload = [{
    location_code: locationCode,
    language_code: 'en',
    keywords: [keyword],
    search_partners: false,
    date_from: null,
    date_to: null,
    include_adult_keywords: false,
    sort_by: 'relevance'
  }];

  try {
    // Call DataForSEO API
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DataForSEO API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message}`);
    }

    // Transform DataForSEO response to our format
    return transformDataForSEOResponse(data, keyword, location);

  } catch (error) {
    console.error('❌ DataForSEO API error:', error);
    throw error;
  }
}

/**
 * Get DataForSEO location code from location string
 */
function getLocationCode(location) {
  const locationMap = {
    'Sydney, Australia': 2036,      // Australia
    'Sydney CBD': 2036,
    'Parramatta': 2036,
    'Bondi': 2036,
    'Chatswood': 2036,
    'Penrith': 2036,
    'Liverpool': 2036,
    'Melbourne, Australia': 2036,
    'Brisbane, Australia': 2036,
    'Perth, Australia': 2036,
  };

  return locationMap[location] || 2036; // Default to Australia
}

/**
 * Transform DataForSEO response to our keyword format
 */
function transformDataForSEOResponse(data, seedKeyword, location) {
  const results = data.tasks?.[0]?.result?.[0];

  if (!results || !results.keywords) {
    return {
      keywords: [],
      avgVolume: '0',
      clusters: [],
      source: 'dataforseo',
      dataQuality: 'real'
    };
  }

  // Extract and format keywords
  const keywords = results.keywords.map(kw => ({
    keyword: kw.keyword,
    volume: kw.search_volume?.toString() || '0',
    difficulty: mapCompetitionToDifficulty(kw.competition, kw.competition_index),
    intent: inferSearchIntent(kw.keyword),
    priority: calculatePriority(kw.search_volume, kw.competition_index),
    type: kw.keyword.split(' ').length > 3 ? 'long-tail' : 'short',
    cpc: kw.cpc ? `$${kw.cpc.toFixed(2)}` : null,
    competition_index: kw.competition_index
  }));

  // Sort by volume and priority
  keywords.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return parseInt(b.volume) - parseInt(a.volume);
  });

  // Limit to top 30 results
  const topKeywords = keywords.slice(0, 30);

  // Calculate average volume
  const avgVolume = topKeywords.length > 0
    ? Math.floor(topKeywords.reduce((sum, kw) => sum + parseInt(kw.volume), 0) / topKeywords.length)
    : 0;

  // Generate keyword clusters
  const clusters = generateClusters(topKeywords);

  return {
    keywords: topKeywords,
    avgVolume: avgVolume.toString(),
    clusters,
    source: 'dataforseo',
    dataQuality: 'real',
    totalKeywords: keywords.length,
    location,
    seedKeyword
  };
}

/**
 * Map DataForSEO competition to difficulty level
 */
function mapCompetitionToDifficulty(competition, competitionIndex) {
  if (!competitionIndex && competitionIndex !== 0) {
    return 'Medium';
  }

  if (competitionIndex < 30) return 'Low';
  if (competitionIndex < 70) return 'Medium';
  return 'High';
}

/**
 * Infer search intent from keyword
 */
function inferSearchIntent(keyword) {
  const kwLower = keyword.toLowerCase();

  // Question-based keywords are informational
  if (/^(how|what|why|when|where|who|which|can|should|does|is|are)/.test(kwLower)) {
    return 'Informational';
  }

  // Buyer intent keywords
  if (/\b(buy|purchase|price|cost|cheap|affordable|best|top|review)\b/.test(kwLower)) {
    return 'Buyer';
  }

  // Service/commercial intent
  if (/\b(services|agency|company|consultant|expert|professional|hire)\b/.test(kwLower)) {
    return 'Commercial';
  }

  // Brand/navigation intent
  if (/\b(login|sign in|download|official|website)\b/.test(kwLower)) {
    return 'Navigational';
  }

  // Default to commercial
  return 'Commercial';
}

/**
 * Calculate priority based on volume and competition
 */
function calculatePriority(volume, competitionIndex) {
  if (!volume || volume < 50) return 'low';

  // High volume, low competition = high priority
  if (volume > 500 && competitionIndex < 30) return 'high';

  // High volume, medium competition = high priority
  if (volume > 1000 && competitionIndex < 70) return 'high';

  // Medium volume, low competition = high priority
  if (volume > 200 && competitionIndex < 30) return 'high';

  // Medium volume, medium competition = medium priority
  if (volume > 100 && competitionIndex < 70) return 'medium';

  return 'low';
}

/**
 * Generate keyword clusters
 */
function generateClusters(keywords) {
  const clusters = {
    'SEO Services': [],
    'Google Ads': [],
    'Web Design': [],
    'Local SEO': [],
    'Content Marketing': [],
    'Questions & Research': []
  };

  keywords.forEach(kw => {
    const keywordLower = kw.keyword.toLowerCase();

    if (keywordLower.includes('seo') && !keywordLower.includes('google ads')) {
      clusters['SEO Services'].push(kw.keyword);
    } else if (keywordLower.includes('google ads') || keywordLower.includes('ppc')) {
      clusters['Google Ads'].push(kw.keyword);
    } else if (keywordLower.includes('web design') || keywordLower.includes('website')) {
      clusters['Web Design'].push(kw.keyword);
    } else if (keywordLower.includes('local') || keywordLower.includes('google my business')) {
      clusters['Local SEO'].push(kw.keyword);
    } else if (keywordLower.includes('content') || keywordLower.includes('marketing')) {
      clusters['Content Marketing'].push(kw.keyword);
    } else if (keywordLower.includes('how') || keywordLower.includes('what') || keywordLower.includes('why')) {
      clusters['Questions & Research'].push(kw.keyword);
    }
  });

  // Convert to array format and filter empty clusters
  return Object.entries(clusters)
    .filter(([name, keywords]) => keywords.length > 0)
    .map(([name, keywords]) => ({ name, keywords: keywords.slice(0, 8) }));
}
