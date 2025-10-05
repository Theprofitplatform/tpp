/**
 * Cloudflare Pages Function for AI Content Generator
 * Uses Claude 3.5 Sonnet for high-quality, constraint-following content generation
 *
 * V2 Improvements:
 * - Upgraded to Sonnet (better instruction following)
 * - Removed fake uniqueness claims
 * - Fixed statistics hallucination risk
 * - Added output validation
 * - Added rate limiting
 * - Honest quality metrics
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// Content type specific prompts
const PROMPTS = {
  blog_post: {
    system: "You are an expert content writer who creates engaging, data-driven blog posts with personality. Your content stands out with unique insights, specific examples, and carefully researched information. You write with confidence and clarity while maintaining professionalism.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Write a ${length} blog post about "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

CRITICAL Requirements (FOLLOW EXACTLY):
- Length: ${length === 'short' ? '150-300 words' : length === 'medium' ? '300-600 words' : '600-1000 words'}

STATISTICS & DATA (IMPORTANT):
- If you mention statistics, use general ranges: "studies show", "research indicates", "many businesses report"
- NEVER invent specific numbers or cite sources you're not certain about
- Example GOOD: "Research indicates that most businesses see improvements..."
- Example BAD: "According to HubSpot 2024, 61% of marketers..." (don't cite specific sources unless you're 100% certain)
- It's better to use qualitative evidence than fake quantitative data

EXAMPLES (RECOMMENDED):
- Use general examples: "A local bakery in Sydney's eastern suburbs..."
- Or hypothetical framing: "Consider a typical small business..."
- NEVER use specific business names that might exist: "Sarah's Bakery" could be real
- Make examples illustrative but clearly general

STRUCTURE:
- Use ## for H2 headings (not "H2:")
- Use ### for H3 headings if needed
- Include 2-4 section headings
- Keep paragraphs short (2-3 sentences max)

KEYWORD USAGE (STRICT):
- Mention topic/location ONLY 2-3 times total (not in every paragraph)
- Use synonyms: "local area", "this suburb", "the region" instead of repeating location name
- Maximum 2% keyword density - THIS IS CRITICAL

BANNED PHRASES (NEVER USE THESE):
- "in today's digital landscape"
- "it's important to"
- "is the backbone of"
- "we've learned a thing or two"
- "game-changer"
- "game changer"
- Any corporate clichés

CRITICAL: If you use ANY banned phrase, the content will be REJECTED.

TONE & STYLE:
- Start with a compelling hook (question, observation, or bold claim)
- ${tone === 'professional' ? 'Be professional but direct and confident - no fluff' : `Be ${tone} and engaging`}
- Write like a human, not a robot
- Be specific and opinionated, not generic
- Show expertise through insights, not jargon

Write the blog post content only, no title needed:`
  },

  product_description: {
    system: "You are an expert e-commerce copywriter specializing in compelling product descriptions that convert.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Write a ${length} product description for "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Highlight key features and benefits
- Use persuasive language
- Include a call-to-action
- Focus on customer needs and pain points
- Make it scannable with bullet points if appropriate
- Length: ${length === 'short' ? '50-100 words' : length === 'medium' ? '100-200 words' : '200-300 words'}

Write the product description:`
  },

  meta_description: {
    system: "You are an SEO expert specializing in meta descriptions that maximize click-through rates.",
    getUserPrompt: (topic, tone, length) => `Write an SEO-optimized meta description for a page about "${topic}".

Requirements:
- Maximum 155-160 characters
- Include the main keyword naturally
- Create urgency or curiosity
- Make it compelling and click-worthy
- ${tone} tone

Write only the meta description, no explanations:`
  },

  social_media: {
    system: "You are a social media expert who creates engaging posts that drive engagement.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Create a ${length} social media post about "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Engaging hook in the first line
- ${length === 'short' ? '1-2 sentences' : length === 'medium' ? '3-5 sentences' : '6-8 sentences'}
- Include relevant hashtags (2-5)
- Call-to-action
- ${tone} and conversational

Write the social media post:`
  },

  email: {
    system: "You are an email marketing expert who writes emails that get opened and clicked.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Write a ${length} marketing email about "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Compelling subject line (start with "Subject: ")
- Engaging opening that hooks the reader
- Clear value proposition
- Call-to-action
- ${tone} tone
- Length: ${length === 'short' ? '100-200 words' : length === 'medium' ? '200-400 words' : '400-600 words'}

Write the email (include subject line):`
  },

  landing_page: {
    system: "You are a conversion copywriter who creates high-converting landing page copy.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Write landing page copy for "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Strong headline
- Clear value proposition
- Benefits over features
- Social proof mention points
- Strong call-to-action
- ${tone} and persuasive
- Length: ${length === 'short' ? '200-300 words' : length === 'medium' ? '300-500 words' : '500-800 words'}

Write the landing page copy with clear sections:`
  },

  article: {
    system: "You are a professional journalist and content writer who creates informative, well-researched articles.",
    getUserPrompt: (topic, tone, length, targetAudience) => `Write a ${length} article about "${topic}".

Tone: ${tone}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Professional and informative
- Use subheadings to organize content
- Include specific examples or case studies (use general businesses, not specific names)
- Data-driven when possible (use qualitative terms if unsure of exact numbers)
- ${tone} tone
- Length: ${length === 'short' ? '300-500 words' : length === 'medium' ? '500-800 words' : '800-1200 words'}

Write the article:`
  }
};

// Banned phrases detector
const BANNED_PHRASES = [
  "in today's digital landscape",
  "it's important to",
  "is the backbone of",
  "we've learned a thing or two",
  "game-changer",
  "game changer",
  "leverage",
  "synergy",
  "paradigm shift"
];

function hasBannedPhrases(content) {
  const contentLower = content.toLowerCase();
  const found = BANNED_PHRASES.filter(phrase => contentLower.includes(phrase));
  return found.length > 0 ? found : null;
}

// Validate output matches requirements
function validateOutput(content, requirements) {
  const issues = [];
  const words = content.split(/\s+/).length;

  // Word count validation
  const ranges = {
    short: { min: 100, max: 400 },
    medium: { min: 250, max: 700 },
    long: { min: 500, max: 1300 }
  };

  const range = ranges[requirements.length] || ranges.medium;

  if (words < range.min) {
    issues.push(`Content is too short (${words} words). Target: ${range.min}-${range.max} words.`);
  } else if (words > range.max) {
    issues.push(`Content is too long (${words} words). Target: ${range.min}-${range.max} words.`);
  }

  // Tone validation (basic)
  if (requirements.tone === 'professional') {
    const casualMarkers = ['hey there', "let's dive", 'awesome', 'super cool', 'amazing'];
    const foundCasual = casualMarkers.filter(marker =>
      content.toLowerCase().includes(marker)
    );
    if (foundCasual.length > 0) {
      issues.push(`Content uses casual language ("${foundCasual.join('", "')}"Considering despite "professional" tone request.`);
    }
  }

  // Check for banned phrases
  const bannedFound = hasBannedPhrases(content);
  if (bannedFound) {
    issues.push(`⚠️ CRITICAL: Contains banned phrases: ${bannedFound.map(p => `"${p}"`).join(', ')}`);
  }

  return issues;
}

// Calculate honest SEO metrics (no fake scoring)
function analyzeSEO(content, topic) {
  const words = content.split(/\s+/).length;
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  // Calculate keyword density
  const contentLower = content.toLowerCase();
  let keywordCount = 0;
  topicWords.forEach(word => {
    const matches = contentLower.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) keywordCount += matches.length;
  });

  const keywordDensity = ((keywordCount / words) * 100).toFixed(1) + '%';

  // Flesch Reading Ease
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const syllables = content.split(/\s+/).reduce((count, word) => {
    return count + Math.max(1, word.replace(/[^aeiouAEIOU]/g, '').length);
  }, 0);

  const fleschScore = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
  const readability = fleschScore >= 60 ? 'Easy to read' :
                      fleschScore >= 50 ? 'Fairly easy' :
                      fleschScore >= 40 ? 'Average difficulty' :
                      'Difficult to read';

  // Structure analysis
  const hasHeadings = /^##+ /m.test(content);
  const headingCount = (content.match(/^##+ /gm) || []).length;

  return {
    wordCount: words,
    keywordDensity,
    keywordDensityStatus:
      keywordCount / words > 0.05 ? 'Too high (keyword stuffing risk)' :
      keywordCount / words < 0.005 && words > 200 ? 'Too low (may not rank)' :
      'Optimal',
    readability,
    readabilityScore: fleschScore,
    structure: {
      hasHeadings,
      headingCount,
      avgSentenceLength: Math.round(words / sentences)
    }
  };
}

// Generate actionable improvement suggestions
function generateSuggestions(content, contentType, length, topic, validationIssues) {
  const suggestions = [];

  // Add validation issues first (highest priority)
  if (validationIssues.length > 0) {
    suggestions.push(...validationIssues.map(issue => `❌ ${issue}`));
  }

  const words = content.split(/\s+/).length;
  const contentLower = content.toLowerCase();

  // Content type specific suggestions
  if (contentType === 'blog_post') {
    // Check for proper markdown headings
    const hasMarkdownHeadings = /^##+ /m.test(content);
    const hasTextHeadings = /^H[23]:/m.test(content);

    if (!hasMarkdownHeadings && !hasTextHeadings && words > 200) {
      suggestions.push('Add H2/H3 headings (## or ###) to improve structure and readability.');
    } else if (hasTextHeadings && !hasMarkdownHeadings) {
      suggestions.push('Use proper markdown headings (## Heading) instead of "H2:" format.');
    }

    // Check for evidence/examples
    const hasExamples = /example|instance|case|consider/i.test(content);
    if (!hasExamples && words > 300) {
      suggestions.push('Add a concrete example to make your points more relatable and memorable.');
    }

    // Check for data/research mentions
    const hasDataMentions = /research|study|data|survey|report/i.test(content);
    if (!hasDataMentions && words > 400) {
      suggestions.push('Reference research or data (using qualitative terms) to boost credibility.');
    }

    const hasLinks = /\[.*\]\(.*\)/.test(content) || content.includes('http');
    if (!hasLinks && words > 300) {
      suggestions.push('Consider adding 2-3 external links to authoritative sources.');
    }
  }

  if (contentType === 'product_description') {
    if (!/\$|price|cost|value/i.test(content)) {
      suggestions.push('Consider mentioning price or value proposition.');
    }
    if (!/(buy|order|shop|get|add to cart)/i.test(content)) {
      suggestions.push('Add a stronger call-to-action (e.g., "Order now", "Get yours today").');
    }
  }

  if (contentType === 'meta_description') {
    if (content.length > 160) {
      suggestions.push(`Meta description is ${content.length} characters (too long). Trim to under 160 for optimal display.`);
    } else if (content.length < 120) {
      suggestions.push(`Meta description is ${content.length} characters (too short). Expand to 140-160 for maximum impact.`);
    }
  }

  // Keyword density check
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let keywordCount = 0;
  topicWords.forEach(word => {
    const matches = contentLower.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) keywordCount += matches.length;
  });
  const kdPercent = (keywordCount / words) * 100;

  if (kdPercent > 5) {
    suggestions.push(`⚠️ Keyword density is ${kdPercent.toFixed(1)}% (too high). Reduce repetition to avoid keyword stuffing penalty.`);
  } else if (kdPercent < 0.5 && words > 200) {
    suggestions.push(`Keyword density is ${kdPercent.toFixed(1)}% (low). Mention your main topic more naturally.`);
  }

  // Readability check
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = words / sentences;
  if (avgSentenceLength > 25) {
    suggestions.push(`Average sentence length is ${avgSentenceLength.toFixed(0)} words (too long). Break up complex sentences.`);
  }

  // If no issues found
  if (suggestions.length === 0) {
    return ['✅ Content meets quality standards. Ready to use!'];
  }

  return suggestions.slice(0, 6); // Max 6 suggestions
}

// Simple rate limiting using CF KV (if available) or in-memory fallback
const requestCounts = new Map();

async function checkRateLimit(ip, env) {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (env.RATE_LIMIT_KV) {
    // Use KV if available
    const data = await env.RATE_LIMIT_KV.get(key, 'json');
    if (data && data.count >= maxRequests && (now - data.timestamp) < windowMs) {
      return false;
    }
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: (data?.count || 0) + 1, timestamp: now }), {
      expirationTtl: 60
    });
    return true;
  } else {
    // In-memory fallback
    const record = requestCounts.get(ip);
    if (record && record.count >= maxRequests && (now - record.timestamp) < windowMs) {
      return false;
    }
    requestCounts.set(ip, { count: (record?.count || 0) + 1, timestamp: now });

    // Clean up old entries
    if (requestCounts.size > 1000) {
      requestCounts.clear();
    }

    return true;
  }
}

export async function onRequestPost({ request, env }) {
  try {
    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const allowed = await checkRateLimit(ip, env);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please wait 1 minute before trying again.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contentType, topic, tone, length, targetAudience } = await request.json();

    // Validation
    if (!contentType || !topic || !tone || !length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content type, topic, tone, and length are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for Claude API key
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Claude API not configured. Please contact support.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get appropriate prompt
    const promptConfig = PROMPTS[contentType] || PROMPTS.blog_post;
    const userPrompt = promptConfig.getUserPrompt(topic, tone, length, targetAudience);

    // Call Claude API with Sonnet 3.5 (better instruction following)
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Sonnet 3.5 - better instruction following than Haiku
        max_tokens: length === 'short' ? 1000 : length === 'medium' ? 2000 : 3000,
        temperature: 0.7,
        system: promptConfig.system,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const status = claudeResponse.status;
      let errorBody = null;
      try {
        errorBody = await claudeResponse.json();
        console.error('Claude API error:', status, errorBody);
      } catch (e) {
        console.error('Claude API error:', status);
      }

      // Specific error messages
      if (status === 401) {
        return new Response(JSON.stringify({
          success: false,
          error: 'API authentication failed. Please contact support.'
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (status === 400) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid request format. ' + (errorBody?.error?.message || 'Please check parameters.')
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (status === 429) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Service is experiencing high demand. Please try again in 60 seconds.'
        }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (status === 529 || status === 500) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Claude API is temporarily unavailable. Please try again in a few minutes.'
        }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        success: false,
        error: `Failed to generate content (status: ${status}). Please try again.`
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const claudeData = await claudeResponse.json();
    const generatedContent = claudeData.content[0].text;

    // Validate output
    const validationIssues = validateOutput(generatedContent, { contentType, tone, length, topic });

    // Analyze SEO (honest metrics, no fake scores)
    const seoAnalysis = analyzeSEO(generatedContent, topic);

    // Generate suggestions
    const suggestions = generateSuggestions(
      generatedContent,
      contentType,
      length,
      topic,
      validationIssues
    );

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        analysis: seoAnalysis,
        suggestions,
        validation: {
          passed: validationIssues.length === 0,
          issues: validationIssues
        },
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          generated: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Content generator error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate content'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
