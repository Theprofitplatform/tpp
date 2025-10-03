/**
 * Cloudflare Pages Function for Website Speed Test
 * Uses Google PageSpeed Insights API
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

    // Extract performance score
    const performanceScore = Math.round(lighthouse.categories.performance.score * 100);

    // Get performance grade
    const getPerformanceGrade = (score) => {
      if (score >= 90) return 'A';
      if (score >= 75) return 'B';
      if (score >= 50) return 'C';
      if (score >= 25) return 'D';
      return 'F';
    };

    // Extract metrics
    const metrics = {
      fcp: lighthouse.audits['first-contentful-paint'],
      lcp: lighthouse.audits['largest-contentful-paint'],
      cls: lighthouse.audits['cumulative-layout-shift'],
      si: lighthouse.audits['speed-index'],
      tbt: lighthouse.audits['total-blocking-time'],
      tti: lighthouse.audits['interactive']
    };

    // Extract opportunities
    const opportunities = [];
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript',
      'prioritize-lcp-image',
      'total-byte-weight',
      'uses-long-cache-ttl'
    ];

    for (const auditId of opportunityAudits) {
      const audit = lighthouse.audits[auditId];
      if (audit && audit.details && (audit.details.overallSavingsMs > 100 || audit.score < 0.9)) {
        opportunities.push({
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs
            ? `${Math.round(audit.details.overallSavingsMs / 100) / 10}s`
            : audit.displayValue || 'Optimize',
          savingsMs: audit.details.overallSavingsMs || 0,
          score: audit.score
        });
      }
    }

    // Sort by savings and take top 5
    opportunities.sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0));
    const topOpportunities = opportunities.slice(0, 5);

    // Build result
    const result = {
      url: lighthouse.finalUrl,
      fetchTime: lighthouse.fetchTime,
      scores: {
        performance: performanceScore,
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100)
      },
      metrics: {
        fcp: { value: metrics.fcp.displayValue, score: metrics.fcp.score },
        lcp: { value: metrics.lcp.displayValue, score: metrics.lcp.score },
        cls: { value: metrics.cls.displayValue, score: metrics.cls.score },
        si: { value: metrics.si.displayValue, score: metrics.si.score },
        tbt: { value: metrics.tbt.displayValue, score: metrics.tbt.score },
        tti: { value: metrics.tti.displayValue, score: metrics.tti.score }
      },
      opportunities: topOpportunities,
      performanceGrade: getPerformanceGrade(performanceScore)
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }),
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
    console.error('Speed test error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to run speed test'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
