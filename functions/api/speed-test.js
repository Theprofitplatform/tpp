/**
 * Cloudflare Pages Function for Website Speed Test
 * Enhanced with detailed insights, recommendations, and competitive analysis
 */

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, strategy = 'mobile' } = await request.json();

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

    // Run tests for both mobile and desktop in parallel
    const apiKey = 'AIzaSyA308cZv0hNvZdC8VAM15v8CE12HEsHzCQ';

    const [mobileData, desktopData] = await Promise.all([
      fetchPageSpeedData(url, 'mobile', apiKey),
      fetchPageSpeedData(url, 'desktop', apiKey)
    ]);

    const lighthouse = strategy === 'mobile' ? mobileData.lighthouseResult : desktopData.lighthouseResult;

    // Extract performance score
    const performanceScore = Math.round(lighthouse.categories.performance.score * 100);

    // Get performance grade with details
    const getPerformanceGrade = (score) => {
      if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#10b981' };
      if (score >= 75) return { grade: 'B', label: 'Good', color: '#3b82f6' };
      if (score >= 60) return { grade: 'C', label: 'Fair', color: '#f59e0b' };
      if (score >= 40) return { grade: 'D', label: 'Poor', color: '#ef4444' };
      return { grade: 'F', label: 'Critical', color: '#991b1b' };
    };

    // Extract metrics with numeric values
    const metrics = {
      fcp: lighthouse.audits['first-contentful-paint'],
      lcp: lighthouse.audits['largest-contentful-paint'],
      cls: lighthouse.audits['cumulative-layout-shift'],
      si: lighthouse.audits['speed-index'],
      tbt: lighthouse.audits['total-blocking-time'],
      tti: lighthouse.audits['interactive'],
      // Add numeric values for calculations
      firstContentfulPaint: lighthouse.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: lighthouse.audits['largest-contentful-paint'].numericValue,
      cumulativeLayoutShift: lighthouse.audits['cumulative-layout-shift'].numericValue,
      speedIndex: lighthouse.audits['speed-index'].numericValue,
      totalBlockingTime: lighthouse.audits['total-blocking-time'].numericValue,
      timeToInteractive: lighthouse.audits['interactive'].numericValue
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

    // Enhanced opportunities with actionable code examples
    const enhancedOpportunities = topOpportunities.map(opp => ({
      ...opp,
      codeExample: getCodeExample(opp.title),
      priority: opp.savingsMs > 1000 ? 'high' : opp.savingsMs > 500 ? 'medium' : 'low'
    }));

    // Get industry benchmarks
    const benchmarks = getIndustryBenchmarks(performanceScore);

    // Compare mobile vs desktop
    const mobileScore = Math.round(mobileData.lighthouseResult.categories.performance.score * 100);
    const desktopScore = Math.round(desktopData.lighthouseResult.categories.performance.score * 100);

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
      coreWebVitals: {
        lcp: {
          value: metrics.lcp.numericValue,
          displayValue: metrics.lcp.displayValue,
          score: metrics.lcp.score,
          rating: metrics.lcp.numericValue <= 2500 ? 'good' : metrics.lcp.numericValue <= 4000 ? 'needs-improvement' : 'poor'
        },
        fid: {
          value: metrics.tbt.numericValue,
          displayValue: metrics.tbt.displayValue,
          score: metrics.tbt.score,
          rating: metrics.tbt.numericValue <= 200 ? 'good' : metrics.tbt.numericValue <= 600 ? 'needs-improvement' : 'poor'
        },
        cls: {
          value: metrics.cls.numericValue,
          displayValue: metrics.cls.displayValue,
          score: metrics.cls.score,
          rating: metrics.cls.numericValue <= 0.1 ? 'good' : metrics.cls.numericValue <= 0.25 ? 'needs-improvement' : 'poor'
        }
      },
      deviceComparison: {
        mobile: mobileScore,
        desktop: desktopScore,
        difference: desktopScore - mobileScore,
        recommendation: mobileScore < desktopScore - 10 ? 'Focus on mobile optimization' : 'Performance is balanced'
      },
      opportunities: enhancedOpportunities,
      benchmarks,
      performanceGrade: getPerformanceGrade(performanceScore),
      recommendations: generateRecommendations(performanceScore, enhancedOpportunities),
      shareUrl: `${url}#speed-test-${Date.now()}`
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

// Helper function to fetch PageSpeed data
async function fetchPageSpeedData(url, strategy, apiKey) {
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=${strategy}&key=${apiKey}`;
  const response = await fetch(psiUrl);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(errorData.error?.message || 'PageSpeed Insights API failed');
  }

  return response.json();
}

// Get code examples for common optimization opportunities
function getCodeExample(title) {
  const examples = {
    'Eliminate render-blocking resources': `<!-- Defer non-critical CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>

<!-- Defer JavaScript -->
<script src="script.js" defer></script>`,

    'Properly size images': `<!-- Use responsive images -->
<img src="image.jpg"
     srcset="image-320.jpg 320w, image-640.jpg 640w, image-1024.jpg 1024w"
     sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1024px"
     alt="Description">`,

    'Serve images in next-gen formats': `<!-- Use WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description">
</picture>`,

    'Minify JavaScript': `// Before build, use a bundler like Webpack or Vite
// npm install --save-dev terser-webpack-plugin

// Or use online tools:
// https://javascript-minifier.com/`,

    'Enable text compression': `# Add to .htaccess
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>`,

    'Reduce unused JavaScript': `// Use dynamic imports for code splitting
const module = await import('./heavy-module.js');

// Or with React
const Component = lazy(() => import('./Component'));`
  };

  for (const [key, value] of Object.entries(examples)) {
    if (title.includes(key) || key.includes(title)) {
      return value;
    }
  }

  return '// Contact us for specific implementation guidance';
}

// Get industry benchmarks
function getIndustryBenchmarks(score) {
  return {
    yourScore: score,
    industryAverage: 65,
    topPerformers: 90,
    percentile: score >= 90 ? 'Top 10%' : score >= 75 ? 'Top 25%' : score >= 50 ? 'Average' : 'Below Average',
    competitive: score >= 75
  };
}

// Generate personalized recommendations
function generateRecommendations(score, opportunities) {
  const recs = [];

  if (score < 50) {
    recs.push({
      title: 'Critical: Immediate Action Required',
      description: 'Your site is significantly slower than competitors. Start with high-priority fixes.',
      action: 'emergency-optimization'
    });
  }

  if (opportunities.some(o => o.title.includes('image'))) {
    recs.push({
      title: 'Optimize Images',
      description: 'Images are your biggest performance bottleneck. Compress and use modern formats.',
      action: 'image-optimization'
    });
  }

  if (opportunities.some(o => o.title.includes('JavaScript'))) {
    recs.push({
      title: 'Reduce JavaScript Execution',
      description: 'Heavy JavaScript is slowing down your site. Consider code splitting and lazy loading.',
      action: 'js-optimization'
    });
  }

  recs.push({
    title: 'Monitor Performance',
    description: 'Set up ongoing monitoring to catch regressions early and maintain speed.',
    action: 'monitoring'
  });

  return recs;
}
