/**
 * Cloudflare Pages Function for SEO Audit
 * Uses Google PageSpeed Insights API to get comprehensive SEO data
 */

export async function onRequestPost({ request }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Google PageSpeed Insights API
    const apiKey = 'AIzaSyA308cZv0hNvZdC8VAM15v8CE12HEsHzCQ';
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile&key=${apiKey}`;

    const psiResponse = await fetch(psiUrl);

    if (!psiResponse.ok) {
      const errorData = await psiResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || 'PageSpeed Insights API failed');
    }

    const psiData = await psiResponse.json();
    const lighthouse = psiData.lighthouseResult;

    // Calculate overall SEO score (weighted average)
    const seoScore = Math.round(lighthouse.categories.seo.score * 100);
    const performanceScore = Math.round(lighthouse.categories.performance.score * 100);
    const accessibilityScore = Math.round(lighthouse.categories.accessibility.score * 100);
    const bestPracticesScore = Math.round(lighthouse.categories['best-practices'].score * 100);

    // Overall score: 40% SEO, 30% Performance, 20% Accessibility, 10% Best Practices
    const overallScore = Math.round(
      seoScore * 0.4 + performanceScore * 0.3 + accessibilityScore * 0.2 + bestPracticesScore * 0.1
    );

    // Category scores
    const categoryScores = {
      'SEO': seoScore,
      'Performance': performanceScore,
      'Accessibility': accessibilityScore,
      'Best Practices': bestPracticesScore
    };

    // Meta tag analysis
    const metaAudits = {
      'document-title': lighthouse.audits['document-title'],
      'meta-description': lighthouse.audits['meta-description'],
      'viewport': lighthouse.audits['viewport'],
      'canonical': lighthouse.audits['canonical']
    };

    const meta = {
      title: {
        value: metaAudits['document-title']?.score === 1 ? 'Present' : 'Missing',
        status: metaAudits['document-title']?.score === 1 ? 'pass' : 'fail',
        message: metaAudits['document-title']?.title || '',
        severity: metaAudits['document-title']?.score === 1 ? 'info' : 'critical'
      },
      description: {
        value: metaAudits['meta-description']?.score === 1 ? 'Present' : 'Missing',
        status: metaAudits['meta-description']?.score === 1 ? 'pass' : 'fail',
        message: metaAudits['meta-description']?.title || '',
        severity: metaAudits['meta-description']?.score === 1 ? 'info' : 'critical'
      },
      og: {
        count: 'N/A',
        status: 'warning',
        message: 'Open Graph tags not checked by Lighthouse',
        severity: 'warning'
      },
      canonical: {
        value: metaAudits['canonical']?.score === 1 ? 'Present' : 'Missing',
        status: metaAudits['canonical']?.score === 1 ? 'pass' : 'warning',
        message: metaAudits['canonical']?.title || '',
        severity: metaAudits['canonical']?.score === 1 ? 'info' : 'warning'
      }
    };

    // Performance metrics
    const metrics = {
      fcp: lighthouse.audits['first-contentful-paint'],
      lcp: lighthouse.audits['largest-contentful-paint'],
      cls: lighthouse.audits['cumulative-layout-shift']
    };

    const performance = {
      loadTime: (metrics.fcp?.numericValue / 1000).toFixed(2),
      loadTimeStatus: metrics.fcp?.score > 0.8 ? 'pass' : metrics.fcp?.score > 0.5 ? 'warning' : 'fail',
      loadTimeMessage: metrics.fcp?.title || '',
      imagesOptimized: Math.round((lighthouse.audits['uses-optimized-images']?.score || 0) * 100),
      imagesStatus: lighthouse.audits['uses-optimized-images']?.score > 0.8 ? 'pass' : 'warning',
      imagesMessage: lighthouse.audits['uses-optimized-images']?.title || '',
      minified: lighthouse.audits['unminified-css']?.score === 1 && lighthouse.audits['unminified-javascript']?.score === 1 ? 'Yes' : 'No',
      minifiedStatus: lighthouse.audits['unminified-css']?.score === 1 && lighthouse.audits['unminified-javascript']?.score === 1 ? 'pass' : 'warning',
      minifiedMessage: 'CSS and JavaScript minification'
    };

    // Content analysis
    const content = {
      h1: {
        value: lighthouse.audits['heading-order']?.score === 1 ? 'Present' : 'Missing/Invalid',
        status: lighthouse.audits['heading-order']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['heading-order']?.title || '',
        severity: lighthouse.audits['heading-order']?.score === 1 ? 'info' : 'warning'
      },
      headings: {
        value: lighthouse.audits['heading-order']?.score === 1 ? 'Valid' : 'Invalid',
        status: lighthouse.audits['heading-order']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['heading-order']?.title || ''
      },
      wordCount: {
        value: 'N/A',
        status: 'warning',
        message: 'Word count not available from Lighthouse'
      },
      internalLinks: {
        value: lighthouse.audits['crawlable-anchors']?.score === 1 ? 'Good' : 'Issues found',
        status: lighthouse.audits['crawlable-anchors']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['crawlable-anchors']?.title || ''
      }
    };

    // Technical SEO
    const technical = {
      https: {
        value: lighthouse.audits['is-on-https']?.score === 1 ? 'Yes' : 'No',
        status: lighthouse.audits['is-on-https']?.score === 1 ? 'pass' : 'fail',
        message: lighthouse.audits['is-on-https']?.title || '',
        severity: lighthouse.audits['is-on-https']?.score === 1 ? 'info' : 'critical'
      },
      robots: {
        value: lighthouse.audits['robots-txt']?.score === 1 ? 'Valid' : 'Missing/Invalid',
        status: lighthouse.audits['robots-txt']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['robots-txt']?.title || '',
        severity: lighthouse.audits['robots-txt']?.score === 1 ? 'info' : 'warning'
      },
      sitemap: {
        value: 'N/A',
        status: 'warning',
        message: 'Sitemap not checked by Lighthouse',
        severity: 'warning'
      },
      structuredData: {
        value: lighthouse.audits['structured-data']?.score === 1 ? 'Valid' : 'Missing/Invalid',
        status: lighthouse.audits['structured-data']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['structured-data']?.title || 'Structured data not found',
        severity: lighthouse.audits['structured-data']?.score === 1 ? 'info' : 'warning'
      }
    };

    // Mobile & Accessibility
    const mobile = {
      viewport: {
        value: metaAudits['viewport']?.score === 1 ? 'Present' : 'Missing',
        status: metaAudits['viewport']?.score === 1 ? 'pass' : 'fail',
        message: metaAudits['viewport']?.title || '',
        severity: metaAudits['viewport']?.score === 1 ? 'info' : 'critical'
      },
      friendly: {
        value: lighthouse.audits['font-size']?.score === 1 ? 'Yes' : 'Issues found',
        status: lighthouse.audits['font-size']?.score === 1 ? 'pass' : 'warning',
        message: lighthouse.audits['font-size']?.title || ''
      },
      altTags: {
        value: Math.round((lighthouse.audits['image-alt']?.score || 0) * 100),
        status: lighthouse.audits['image-alt']?.score > 0.8 ? 'pass' : 'warning',
        message: lighthouse.audits['image-alt']?.title || '',
        severity: lighthouse.audits['image-alt']?.score > 0.8 ? 'info' : 'warning'
      }
    };

    // Collect action items from failed audits
    const actionItems = [];
    const seoAudits = lighthouse.categories.seo.auditRefs;

    for (const auditRef of seoAudits) {
      const audit = lighthouse.audits[auditRef.id];
      if (audit.score !== null && audit.score < 1) {
        const priority = audit.score === 0 ? 'high' : audit.score < 0.5 ? 'medium' : 'low';
        actionItems.push({
          title: audit.title,
          description: audit.description,
          priority,
          severity: audit.score === 0 ? 'critical' : audit.score < 0.5 ? 'warning' : 'info'
        });
      }
    }

    // Sort by priority (high -> medium -> low)
    actionItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Build result
    const result = {
      url: lighthouse.finalUrl,
      overallScore,
      categoryScores,
      meta,
      performance,
      content,
      technical,
      mobile,
      actionItems: actionItems.slice(0, 10), // Top 10 action items
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      }
    );

  } catch (error) {
    console.error('SEO Audit error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to run SEO audit'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
