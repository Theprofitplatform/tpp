import axios from 'axios';

/**
 * Google PageSpeed Insights API Integration
 * Provides real Core Web Vitals and performance metrics
 *
 * API Docs: https://developers.google.com/speed/docs/insights/v5/get-started
 * Free tier: 25,000 requests per day
 */

/**
 * Fetch PageSpeed Insights data for a given URL
 * @param {string} url - The URL to analyze
 * @param {string} apiKey - Google PageSpeed API key (optional, but recommended)
 * @returns {Promise<Object>} PageSpeed data
 */
export async function getPageSpeedData(url, apiKey = null) {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    // Build API URL
    const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const params = {
      url: fullUrl,
      category: 'performance',
      strategy: 'mobile' // Mobile-first indexing
    };

    // Add API key if provided
    if (apiKey) {
      params.key = apiKey;
    }

    const response = await axios.get(apiUrl, {
      params,
      timeout: 30000 // PageSpeed can take 20-30 seconds
    });

    const data = response.data;

    // Extract key metrics
    const lighthouseResult = data.lighthouseResult;
    const loadingExperience = data.loadingExperience;

    // Core Web Vitals
    const metrics = lighthouseResult.audits;

    return {
      success: true,
      url: fullUrl,
      strategy: 'mobile',
      performanceScore: Math.round(lighthouseResult.categories.performance.score * 100),
      coreWebVitals: {
        // Largest Contentful Paint (LCP)
        lcp: metrics['largest-contentful-paint']?.displayValue || 'N/A',
        lcpScore: metrics['largest-contentful-paint']?.score || 0,
        lcpNumeric: metrics['largest-contentful-paint']?.numericValue || 0,

        // First Input Delay (FID) - estimated via Total Blocking Time
        tbt: metrics['total-blocking-time']?.displayValue || 'N/A',
        tbtScore: metrics['total-blocking-time']?.score || 0,

        // Cumulative Layout Shift (CLS)
        cls: metrics['cumulative-layout-shift']?.displayValue || 'N/A',
        clsScore: metrics['cumulative-layout-shift']?.score || 0,
        clsNumeric: metrics['cumulative-layout-shift']?.numericValue || 0,

        // Overall assessment
        assessment: getWebVitalsAssessment(
          metrics['largest-contentful-paint']?.score || 0,
          metrics['total-blocking-time']?.score || 0,
          metrics['cumulative-layout-shift']?.score || 0
        )
      },
      metrics: {
        firstContentfulPaint: metrics['first-contentful-paint']?.displayValue || 'N/A',
        speedIndex: metrics['speed-index']?.displayValue || 'N/A',
        timeToInteractive: metrics['interactive']?.displayValue || 'N/A',
        totalBlockingTime: metrics['total-blocking-time']?.displayValue || 'N/A'
      },
      opportunities: extractOpportunities(lighthouseResult.audits),
      fieldData: loadingExperience?.metrics || null
    };
  } catch (error) {
    console.error('PageSpeed API error:', error.message);

    // Return graceful fallback instead of failing
    return {
      success: false,
      error: error.message,
      fallback: true,
      performanceScore: null,
      coreWebVitals: {
        lcp: 'Unable to fetch',
        cls: 'Unable to fetch',
        tbt: 'Unable to fetch',
        assessment: 'Unknown'
      }
    };
  }
}

/**
 * Get simplified performance assessment
 */
function getWebVitalsAssessment(lcpScore, tbtScore, clsScore) {
  const avgScore = (lcpScore + tbtScore + clsScore) / 3;

  if (avgScore >= 0.9) return 'Good';
  if (avgScore >= 0.5) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Extract top performance opportunities
 */
function extractOpportunities(audits) {
  const opportunities = [];

  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'unminified-css',
    'unminified-javascript'
  ];

  opportunityAudits.forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit && audit.score !== null && audit.score < 1) {
      opportunities.push({
        title: audit.title,
        description: audit.description,
        potentialSavings: audit.displayValue || 'Unknown'
      });
    }
  });

  return opportunities.slice(0, 5); // Top 5 opportunities
}

/**
 * Batch fetch PageSpeed data for multiple URLs
 * Uses sequential requests to avoid rate limiting
 */
export async function batchGetPageSpeed(urls, apiKey = null) {
  const results = [];

  for (const url of urls) {
    const result = await getPageSpeedData(url, apiKey);
    results.push(result);

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Get simplified comparison object for two URLs
 */
export async function comparePageSpeed(url1, url2, apiKey = null) {
  const [data1, data2] = await Promise.all([
    getPageSpeedData(url1, apiKey),
    getPageSpeedData(url2, apiKey)
  ]);

  return {
    domain1: {
      url: url1,
      score: data1.performanceScore,
      assessment: data1.coreWebVitals.assessment,
      lcp: data1.coreWebVitals.lcp,
      cls: data1.coreWebVitals.cls
    },
    domain2: {
      url: url2,
      score: data2.performanceScore,
      assessment: data2.coreWebVitals.assessment,
      lcp: data2.coreWebVitals.lcp,
      cls: data2.coreWebVitals.cls
    },
    winner: (data1.performanceScore || 0) > (data2.performanceScore || 0) ? 'domain1' : 'domain2'
  };
}
