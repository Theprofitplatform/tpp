/**
 * Meta Tag Generator Module
 * Generates optimized meta titles, descriptions, and Open Graph tags for SEO
 */

// Character limits for meta tags
const LIMITS = {
  title: { min: 50, max: 60, absolute_max: 70 },
  description: { min: 150, max: 160, absolute_max: 170 },
  og_title: { max: 60 },
  og_description: { max: 200 },
  twitter_title: { max: 70 },
  twitter_description: { max: 200 }
};

/**
 * Generate optimized meta title
 */
function generateMetaTitle(topic, businessName = '', includeYear = false) {
  const year = new Date().getFullYear();
  const yearText = includeYear ? ` ${year}` : '';

  const templates = [
    `${topic}${yearText} | ${businessName || 'Expert Guide'}`,
    `${topic}: Complete Guide${yearText} | ${businessName}`,
    `Best ${topic}${yearText} | ${businessName || 'Professional Services'}`,
    `${topic}${yearText} - ${businessName || 'Your Trusted Resource'}`,
    `Ultimate Guide to ${topic}${yearText} | ${businessName}`,
    `${topic} Services${yearText} | ${businessName}`,
    `Professional ${topic}${yearText} | ${businessName}`
  ];

  // Find templates that fit within limits
  const validTemplates = templates.filter(t => {
    const len = t.length;
    return len >= LIMITS.title.min && len <= LIMITS.title.absolute_max;
  });

  // Fallback if no valid templates
  if (validTemplates.length === 0) {
    const fallback = `${topic}${businessName ? ' | ' + businessName : ''}`;
    return fallback.substring(0, LIMITS.title.absolute_max);
  }

  return validTemplates[0];
}

/**
 * Generate optimized meta description
 */
function generateMetaDescription(topic, location = '', cta = true) {
  const locationText = location ? ` in ${location}` : '';
  const ctaText = cta ? ' Get started today!' : '';

  const templates = [
    `Discover professional ${topic}${locationText}. Expert solutions, proven results, and exceptional service. ${cta ? 'Contact us for a free consultation!' : 'Learn more today.'}`,
    `Looking for ${topic}${locationText}? We provide comprehensive solutions with measurable results. ${cta ? 'Get your free quote now!' : 'Explore our services.'}`,
    `Expert ${topic}${locationText}. Trusted by businesses for quality, reliability, and outstanding results. ${cta ? 'Start your journey today!' : 'Learn how we can help.'}`,
    `Transform your business with professional ${topic}${locationText}. Proven strategies, expert guidance, real results. ${cta ? 'Book your consultation!' : 'Discover more.'}`,
    `Professional ${topic}${locationText}. We help businesses achieve their goals with data-driven strategies. ${cta ? 'Get started now!' : 'Learn about our approach.'}`,
    `Comprehensive ${topic}${locationText}. Quality service, competitive pricing, guaranteed satisfaction. ${cta ? 'Request a free quote!' : 'See what we offer.'}`,
  ];

  // Find templates that fit within limits
  const validTemplates = templates.filter(t => {
    const len = t.length;
    return len >= LIMITS.description.min && len <= LIMITS.description.absolute_max;
  });

  // Fallback if no valid templates
  if (validTemplates.length === 0) {
    const fallback = `Expert ${topic}${locationText}. Professional services with proven results.${ctaText}`;
    const truncated = fallback.substring(0, LIMITS.description.absolute_max);

    // Ensure we don't cut off mid-word
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
  }

  return validTemplates[0];
}

/**
 * Generate Open Graph tags
 */
function generateOpenGraphTags(topic, description, businessName = '', type = 'website') {
  return {
    'og:title': generateMetaTitle(topic, businessName).substring(0, LIMITS.og_title.max),
    'og:description': description.substring(0, LIMITS.og_description.max),
    'og:type': type,
    'og:site_name': businessName || 'Your Business'
  };
}

/**
 * Generate Twitter Card tags
 */
function generateTwitterTags(topic, description, businessName = '') {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': generateMetaTitle(topic, businessName).substring(0, LIMITS.twitter_title.max),
    'twitter:description': description.substring(0, LIMITS.twitter_description.max)
  };
}

/**
 * Analyze meta tag quality
 */
function analyzeMetaTags(title, description) {
  const analysis = {
    title: {
      length: title.length,
      status: 'good',
      issues: []
    },
    description: {
      length: description.length,
      status: 'good',
      issues: []
    },
    overallScore: 100
  };

  // Analyze title
  if (title.length < LIMITS.title.min) {
    analysis.title.status = 'warning';
    analysis.title.issues.push(`Title is too short (${title.length} chars). Aim for ${LIMITS.title.min}-${LIMITS.title.max} characters.`);
    analysis.overallScore -= 20;
  } else if (title.length > LIMITS.title.max && title.length <= LIMITS.title.absolute_max) {
    analysis.title.status = 'warning';
    analysis.title.issues.push(`Title is slightly long (${title.length} chars). May be truncated in search results.`);
    analysis.overallScore -= 10;
  } else if (title.length > LIMITS.title.absolute_max) {
    analysis.title.status = 'error';
    analysis.title.issues.push(`Title is too long (${title.length} chars). Will be truncated. Keep under ${LIMITS.title.max} chars.`);
    analysis.overallScore -= 25;
  }

  // Check for missing pipe separator
  if (!title.includes('|') && !title.includes('-')) {
    analysis.title.status = analysis.title.status === 'error' ? 'error' : 'warning';
    analysis.title.issues.push('Consider adding brand name separated by | or -');
    analysis.overallScore -= 5;
  }

  // Analyze description
  if (description.length < LIMITS.description.min) {
    analysis.description.status = 'warning';
    analysis.description.issues.push(`Description is too short (${description.length} chars). Aim for ${LIMITS.description.min}-${LIMITS.description.max} characters.`);
    analysis.overallScore -= 20;
  } else if (description.length > LIMITS.description.max && description.length <= LIMITS.description.absolute_max) {
    analysis.description.status = 'warning';
    analysis.description.issues.push(`Description is slightly long (${description.length} chars). May be truncated.`);
    analysis.overallScore -= 10;
  } else if (description.length > LIMITS.description.absolute_max) {
    analysis.description.status = 'error';
    analysis.description.issues.push(`Description is too long (${description.length} chars). Will be truncated. Keep under ${LIMITS.description.max} chars.`);
    analysis.overallScore -= 25;
  }

  // Check for call-to-action
  const ctaWords = ['get', 'start', 'discover', 'learn', 'find', 'contact', 'call', 'book', 'try', 'explore'];
  const hasCTA = ctaWords.some(word => description.toLowerCase().includes(word));
  if (!hasCTA) {
    analysis.description.issues.push('Consider adding a call-to-action to improve click-through rate.');
    analysis.overallScore -= 5;
  }

  // Ensure score doesn't go below 0
  analysis.overallScore = Math.max(0, analysis.overallScore);

  return analysis;
}

/**
 * Generate suggestions for improvement
 */
function generateSuggestions(analysis, pageType = 'general') {
  const suggestions = [];

  // Page type specific suggestions
  const pageTypeAdvice = {
    homepage: 'Include your brand name and primary value proposition.',
    product: 'Highlight key features, benefits, and unique selling points.',
    blog: 'Include the main topic and year for freshness signals.',
    service: 'Emphasize expertise, location (if local), and call-to-action.',
    about: 'Focus on credibility, experience, and what makes you unique.',
    contact: 'Make it easy to understand how to reach you and response time.'
  };

  if (pageTypeAdvice[pageType]) {
    suggestions.push({
      type: 'tip',
      message: `For ${pageType} pages: ${pageTypeAdvice[pageType]}`
    });
  }

  // General SEO suggestions
  suggestions.push({
    type: 'tip',
    message: 'Use your target keyword near the beginning of the title.'
  });

  suggestions.push({
    type: 'tip',
    message: 'Include numbers or power words (Best, Guide, Ultimate, Top, How to) to increase CTR.'
  });

  suggestions.push({
    type: 'tip',
    message: 'Write for users first, search engines second. Make it compelling!'
  });

  if (analysis.overallScore < 80) {
    suggestions.push({
      type: 'warning',
      message: 'Your meta tags need improvement. Address the issues highlighted above.'
    });
  }

  suggestions.push({
    type: 'tip',
    message: 'Test your meta tags with Google\'s Rich Results Test tool.'
  });

  return suggestions;
}

/**
 * Generate HTML code snippet
 */
function generateHTMLSnippet(title, description, openGraph, twitter, canonicalUrl = '') {
  let html = `<!-- Primary Meta Tags -->\n`;
  html += `<title>${title}</title>\n`;
  html += `<meta name="title" content="${title}">\n`;
  html += `<meta name="description" content="${description}">\n`;

  if (canonicalUrl) {
    html += `<link rel="canonical" href="${canonicalUrl}">\n`;
  }

  html += `\n<!-- Open Graph / Facebook -->\n`;
  Object.entries(openGraph).forEach(([key, value]) => {
    html += `<meta property="${key}" content="${value}">\n`;
  });

  if (canonicalUrl) {
    html += `<meta property="og:url" content="${canonicalUrl}">\n`;
  }

  html += `\n<!-- Twitter -->\n`;
  Object.entries(twitter).forEach(([key, value]) => {
    html += `<meta property="${key}" content="${value}">\n`;
  });

  return html;
}

/**
 * Main function to generate complete meta tag set
 */
export async function generateMetaTags({
  topic,
  businessName = '',
  location = '',
  pageType = 'general',
  includeYear = false,
  includeCTA = true,
  canonicalUrl = '',
  customTitle = '',
  customDescription = ''
}) {
  try {
    // Validate inputs
    if (!topic && !customTitle) {
      throw new Error('Topic or custom title is required');
    }

    // Generate or use custom meta tags
    const title = customTitle || generateMetaTitle(topic, businessName, includeYear);
    const description = customDescription || generateMetaDescription(topic, location, includeCTA);

    // Generate social media tags
    const openGraph = generateOpenGraphTags(topic || customTitle, description, businessName);
    const twitter = generateTwitterTags(topic || customTitle, description, businessName);

    // Analyze quality
    const analysis = analyzeMetaTags(title, description);

    // Generate suggestions
    const suggestions = generateSuggestions(analysis, pageType);

    // Generate HTML snippet
    const htmlSnippet = generateHTMLSnippet(title, description, openGraph, twitter, canonicalUrl);

    return {
      success: true,
      metaTags: {
        title,
        description,
        openGraph,
        twitter
      },
      analysis,
      suggestions,
      htmlSnippet,
      limits: LIMITS
    };
  } catch (error) {
    console.error('Meta tag generation error:', error);
    throw error;
  }
}
