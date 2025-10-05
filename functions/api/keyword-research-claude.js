/**
 * Claude AI Keyword Research Module
 * Uses Anthropic Claude API for intelligent keyword generation
 * Cost: $0 (uses your Claude Code Max subscription)
 */

import Anthropic from '@anthropic-ai/sdk';
import { comprehensiveAutocomplete } from '../utils/autocomplete-scraper.js';

/**
 * Generate keywords using Claude AI with real autocomplete data
 * @param {Object} env - Cloudflare environment variables
 * @param {string} seedKeyword - Base keyword
 * @param {string} location - Target location
 * @param {string} intent - Search intent filter
 * @returns {Promise<Object>} Formatted keyword research results
 */
export async function generateKeywordsWithClaude(env, seedKeyword, location = 'Sydney, Australia', intent = 'all') {
  // Check if Claude API key is configured
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  try {
    // Step 1: Get real autocomplete data from Google (free)
    console.log('🔍 Fetching Google autocomplete suggestions...');
    const autocompleteData = await comprehensiveAutocomplete(seedKeyword, location);

    // Step 2: Analyze with Claude AI
    console.log('🤖 Analyzing with Claude AI...');
    const claudeResults = await analyzeWithClaude(
      env.ANTHROPIC_API_KEY,
      seedKeyword,
      location,
      intent,
      autocompleteData
    );

    return claudeResults;

  } catch (error) {
    console.error('❌ Claude keyword research error:', error);
    throw error;
  }
}

/**
 * Analyze keywords with Claude AI
 * @param {string} apiKey - Anthropic API key
 * @param {string} seedKeyword - Base keyword
 * @param {string} location - Target location
 * @param {string} intent - Search intent
 * @param {Object} autocompleteData - Real Google autocomplete data
 * @returns {Promise<Object>} Keyword analysis
 */
async function analyzeWithClaude(apiKey, seedKeyword, location, intent, autocompleteData) {
  const client = new Anthropic({
    apiKey: apiKey,
  });

  // Craft optimized prompt
  const prompt = createSEOResearchPrompt(seedKeyword, location, intent, autocompleteData);

  // Call Claude API (using Haiku for cost efficiency)
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022', // Cheapest, fastest model
    max_tokens: 4096,
    temperature: 0.7, // Balanced creativity/accuracy
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // Parse JSON response
  const responseText = message.content[0].text;

  // Extract JSON from response (Claude might wrap it in markdown)
  let jsonMatch = responseText.match(/```json\n([\s\S]+?)\n```/);
  if (!jsonMatch) {
    jsonMatch = responseText.match(/\{[\s\S]+\}/);
  }

  const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
  const result = JSON.parse(jsonText);

  // Add metadata
  result.dataSource = 'claude-ai';
  result.dataQuality = 'ai-enhanced';
  result.autocompleteCount = autocompleteData.total;
  result.model = 'claude-3.5-haiku';

  return result;
}

/**
 * Create optimized SEO research prompt for Claude
 */
function createSEOResearchPrompt(seedKeyword, location, intent, autocompleteData) {
  const autocompleteList = autocompleteData.all.slice(0, 30).join('\n- ');

  return `You are an expert SEO keyword researcher specializing in Australian markets, particularly Sydney.

**Task**: Generate a comprehensive keyword research report for SEO strategy.

**Input Data**:
- Seed Keyword: "${seedKeyword}"
- Target Location: ${location}
- Search Intent Focus: ${intent}
- Real Google Autocomplete Suggestions (${autocompleteData.total} total):
${autocompleteList}

**Your Expertise**:
You have deep knowledge of:
1. Google's search algorithm and ranking factors
2. Australian search behavior patterns
3. Sydney's local business market and demographics
4. Seasonal search trends in Australia
5. Competition levels for different keyword types
6. Conversion potential of various keyword intents

**Required Output**:
Generate 30 high-quality keyword suggestions with the following for each:

1. **keyword** - The exact keyword phrase
2. **volume** - Estimated monthly search volume (educated estimate based on):
   - Keyword specificity (broad terms = higher volume)
   - Geographic scope (Australia-wide vs Sydney-specific)
   - Industry size and digital adoption
   - Seasonal factors
   - Similar keyword patterns you've seen
   - Use realistic numbers: Sydney-specific keywords typically range 20-2000/month

3. **difficulty** - Ranking difficulty (Low/Medium/High) based on:
   - Keyword commercial intent (high intent = high competition)
   - Domain authority typically needed (analyze typical ranking sites)
   - Number of established competitors
   - SERP feature complexity (featured snippets, local pack, etc.)

4. **intent** - Search intent (Commercial/Informational/Buyer/Navigational)
   - Commercial: Looking for services/products
   - Informational: Learning/research
   - Buyer: Ready to purchase
   - Navigational: Looking for specific brand/location

5. **priority** - SEO priority (high/medium/low) based on:
   - Volume/difficulty ratio (sweet spot = high priority)
   - Commercial value (buyer intent = higher priority)
   - Ranking opportunity (low competition + decent volume)
   - Strategic fit for ${location} business

6. **type** - Keyword type (short/long-tail)
   - short: 1-3 words
   - long-tail: 4+ words

**Strategy Guidelines**:
- Include 40% of the real autocomplete suggestions (they're actual user queries)
- Add 30% semantic variations and related terms
- Add 20% question-based keywords (how, what, why, etc.)
- Add 10% location-specific variations (Sydney suburbs)
- Mix intent types: 50% commercial, 30% informational, 20% buyer
- Prioritize keywords with good volume/difficulty ratio
- Focus on Sydney-specific opportunities (local SEO advantage)

**Volume Estimation Guidelines**:
- "digital marketing Sydney" = ~880/month (medium competition city-level service)
- "SEO services Sydney" = ~1600/month (high demand city-level service)
- "Parramatta digital marketing" = ~50/month (suburb-specific)
- "how to rank on Google Sydney" = ~70/month (question-based, city-specific)
- "affordable SEO Sydney" = ~170/month (qualifier + city service)

**Output Format** (strict JSON):
{
  "keywords": [
    {
      "keyword": "digital marketing Sydney",
      "volume": "880",
      "difficulty": "Medium",
      "intent": "Commercial",
      "priority": "high",
      "type": "short"
    },
    ...29 more keywords
  ],
  "avgVolume": "calculated average volume",
  "clusters": [
    {
      "name": "Cluster Name",
      "keywords": ["keyword1", "keyword2", ...]
    }
  ]
}

**Cluster Categories** (group keywords into these):
- SEO Services
- Google Ads
- Web Design
- Local SEO
- Content Marketing
- Questions & Research

Provide ONLY the JSON output, no additional text.`;
}

/**
 * Quick keyword generation (faster, uses cached autocomplete)
 * @param {Object} env - Environment variables
 * @param {string} seedKeyword - Base keyword
 * @param {string} location - Target location
 * @returns {Promise<Object>} Quick keyword results
 */
export async function quickKeywordGeneration(env, seedKeyword, location = 'Sydney, Australia') {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const quickPrompt = `Generate 10 quick keyword suggestions for "${seedKeyword}" in ${location}.

Return JSON format:
{
  "keywords": [
    {"keyword": "...", "volume": "...", "difficulty": "...", "intent": "...", "priority": "...", "type": "..."}
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2048,
    messages: [{ role: 'user', content: quickPrompt }]
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]+\}/);
  const result = JSON.parse(jsonMatch[0]);

  result.dataSource = 'claude-ai-quick';
  result.dataQuality = 'ai-generated';

  return result;
}

/**
 * Estimate search volume for a single keyword using Claude
 * @param {Object} env - Environment variables
 * @param {string} keyword - Keyword to analyze
 * @returns {Promise<Object>} Volume estimate with reasoning
 */
export async function estimateKeywordVolume(env, keyword) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const prompt = `As an SEO expert, estimate the monthly search volume for this keyword in Australia:
"${keyword}"

Consider:
- Geographic scope (national vs city vs suburb)
- Industry size and digital adoption
- Keyword specificity
- Seasonal factors

Provide a realistic estimate and brief reasoning.

JSON format:
{
  "keyword": "${keyword}",
  "estimatedVolume": "number",
  "volumeRange": "min-max",
  "reasoning": "brief explanation",
  "confidence": "low/medium/high"
}`;

  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]+\}/);
  return JSON.parse(jsonMatch[0]);
}
