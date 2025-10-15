/**
 * Perplexity API Client
 * Real-time web search with citations for blog content enrichment
 *
 * Phase 2 Enhancement: Statistics Enrichment
 */

import 'dotenv/config';

/**
 * Simple rate limiter for API calls
 */
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async execute(fn) {
    // Clean old requests outside window
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // Wait if at limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      console.log(`   ⏱️  Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 100));
    }

    // Execute and track
    this.requests.push(Date.now());
    return await fn();
  }
}

/**
 * Perplexity API Client
 */
export class PerplexityClient {
  constructor(apiKey = process.env.PERPLEXITY_API_KEY) {
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY not found in environment');
    }

    this.apiKey = apiKey;
    this.baseURL = 'https://api.perplexity.ai';
    this.rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute (Perplexity limit)
  }

  /**
   * Query Perplexity API
   * @param {string} prompt - Search query
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Response with content and citations
   */
  async query(prompt, options = {}) {
    return await this.rateLimiter.execute(async () => {
      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: options.model || 'sonar',
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || 0.2,
            return_citations: true,
            return_images: false,
            search_recency_filter: options.recencyFilter || 'month'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        return {
          content: data.choices[0].message.content,
          citations: data.citations || [],
          usage: data.usage,
          success: true
        };
      } catch (error) {
        console.error('   ❌ Perplexity query failed:', error.message);
        return {
          content: null,
          citations: [],
          usage: null,
          success: false,
          error: error.message
        };
      }
    });
  }

  /**
   * Enrich a statistic with verified data and citations
   * @param {string} claim - The statistic or claim to verify/enrich
   * @param {Object} context - Context about the blog post
   * @returns {Promise<Object>} Enriched statistic with sources
   */
  async enrichStatistic(claim, context = {}) {
    const prompt = `Find verified, authoritative statistics for: "${claim}"

**Context**:
- Topic: ${context.topic || 'Digital marketing'}
- Category: ${context.category || 'Marketing'}
- Location: Sydney, Australia (prefer Australian/Sydney data if available)
- Recency: Prefer 2024-2025 data

**Requirements**:
1. Provide exact statistic with source
2. Include source name, publication year, and URL
3. Prefer: Industry reports, research studies, government data, or authoritative publications
4. If multiple sources exist, choose most reputable
5. If no exact match, provide closest relevant statistic

**Return ONLY in this format** (no extra text):
Statistic: [exact number/percentage with brief context]
Source: [Publication Name, Year]
URL: [source URL]

If no verified data found, return:
NOT_FOUND: Brief explanation why`;

    return await this.query(prompt, {
      recencyFilter: 'year', // Allow data from past year
      temperature: 0.1 // Lower temperature for factual queries
    });
  }

  /**
   * Get Sydney-specific data for a topic
   * @param {string} topic - The topic to research
   * @param {string} category - Category (SEO, Google Ads, etc.)
   * @returns {Promise<Object>} Sydney-specific insights
   */
  async getSydneyData(topic, category) {
    const prompt = `Find recent Sydney, Australia specific data and insights for: ${topic}

**Category**: ${category}

**Required Information**:
1. Sydney market size or statistics
2. Sydney-specific trends or insights
3. Australian industry benchmarks (if Sydney data unavailable)
4. Local case studies or examples

**Requirements**:
- Focus on Sydney, NSW, Australia
- Prefer 2024-2025 data
- Include sources and URLs
- Provide actionable insights for Sydney businesses

Return in structured format with citations.`;

    return await this.query(prompt, {
      recencyFilter: 'month',
      temperature: 0.2
    });
  }

  /**
   * Verify a claim or fact
   * @param {string} claim - Claim to verify
   * @param {Object} context - Context for verification
   * @returns {Promise<Object>} Verification result
   */
  async verifyFact(claim, context = {}) {
    const prompt = `Verify this claim and provide authoritative sources:

"${claim}"

**Context**: ${context.topic || 'General'}

**Task**:
1. Is this claim accurate? (TRUE/FALSE/PARTIALLY TRUE/CANNOT VERIFY)
2. What are the most authoritative sources supporting or refuting this?
3. What is the correct information if claim is false?
4. Provide source URLs

Return format:
Verdict: [TRUE/FALSE/PARTIALLY TRUE/CANNOT VERIFY]
Explanation: [Brief explanation]
Sources: [List of authoritative sources with URLs]
Correct Version: [If claim is false, provide correct version]`;

    return await this.query(prompt, {
      recencyFilter: 'year',
      temperature: 0.1
    });
  }

  /**
   * Find trending topics in a category
   * @param {string} category - Category to search (SEO, Google Ads, etc.)
   * @param {string} location - Location focus (Sydney, Australia)
   * @returns {Promise<Object>} Trending topics
   */
  async getTrendingTopics(category, location = 'Sydney, Australia') {
    const prompt = `Find the top 10 trending topics in ${category} for ${location} in 2025.

**Requirements**:
1. Topics relevant to local businesses
2. Recent trends (last 3 months)
3. Provide brief explanation why each topic is trending
4. Include search volume indicators if available
5. Provide sources

Return as numbered list with:
- Topic title
- Why it's trending
- Relevance score (1-10)
- Source URL`;

    return await this.query(prompt, {
      recencyFilter: 'month',
      temperature: 0.3
    });
  }

  /**
   * Get competitive intelligence
   * @param {string} competitor - Competitor name or domain
   * @param {string} focus - What to analyze (content, strategy, etc.)
   * @returns {Promise<Object>} Competitive insights
   */
  async getCompetitiveIntel(competitor, focus = 'content strategy') {
    const prompt = `Analyze ${competitor}'s ${focus}:

**Analysis Required**:
1. Recent content topics (last 3 months)
2. Content performance indicators
3. Strategy strengths and weaknesses
4. Opportunities for differentiation

Provide actionable insights with sources.`;

    return await this.query(prompt, {
      recencyFilter: 'month',
      temperature: 0.2
    });
  }
}

/**
 * Singleton instance
 */
let perplexityClient = null;

export function getPerplexityClient() {
  if (!perplexityClient) {
    try {
      perplexityClient = new PerplexityClient();
    } catch (error) {
      console.warn('⚠️  Perplexity client initialization failed:', error.message);
      return null;
    }
  }
  return perplexityClient;
}

export default { PerplexityClient, getPerplexityClient };
