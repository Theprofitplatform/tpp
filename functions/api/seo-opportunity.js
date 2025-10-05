/**
 * Cloudflare Pages Function for SEO Opportunity Calculator
 */

export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  return handlePost({ request, env });
}

async function handlePost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { website, industry, serviceArea, avgDealValue, primaryGoal } = await request.json();

    if (!website || !industry || !serviceArea || !avgDealValue) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let domain;
    try {
      const url = new URL(website);
      domain = url.hostname.replace('www.', '');
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get basic SEO metrics
    const lighthouseData = await getBasicSEOMetrics(domain);

    // Get industry benchmarks
    const industryBenchmarks = getIndustryBenchmarks(industry, serviceArea);

    // Estimate keyword opportunities
    const keywordOpportunities = estimateKeywordOpportunities(
      domain,
      industry,
      serviceArea,
      lighthouseData,
      industryBenchmarks
    );

    // Calculate revenue opportunity
    const revenueOpportunity = calculateRevenueOpportunity(
      keywordOpportunities,
      industryBenchmarks,
      parseInt(avgDealValue),
      primaryGoal
    );

    // Generate action plan
    const actionPlan = generateActionPlan(
      revenueOpportunity,
      lighthouseData,
      keywordOpportunities,
      primaryGoal
    );

    // Qualify the lead
    const leadQualification = qualifyLead(revenueOpportunity, avgDealValue, industry);

    // Build response
    const result = {
      success: true,
      domain,
      industry,
      analysis: {
        currentState: {
          seoScore: lighthouseData.seoScore || 65,
          performanceScore: lighthouseData.performanceScore || 70,
          visibility: calculateVisibilityScore(lighthouseData, industryBenchmarks),
          estimatedTraffic: keywordOpportunities.currentMonthlyTraffic || 0,
        },
        opportunity: {
          totalAnnualValue: revenueOpportunity.totalAnnualValue,
          monthlyValue: revenueOpportunity.monthlyValue,
          quickWinValue: revenueOpportunity.quickWinValue,
          strategicValue: revenueOpportunity.strategicValue,
          timeToROI: revenueOpportunity.timeToROI,
          newLeadsPerMonth: revenueOpportunity.newLeadsPerMonth,
        },
        benchmarks: {
          industryAverage: industryBenchmarks.avgMonthlyTraffic,
          topPerformers: industryBenchmarks.topPerformerTraffic,
          yourPosition: calculatePercentile(
            keywordOpportunities.currentMonthlyTraffic,
            industryBenchmarks.avgMonthlyTraffic,
            industryBenchmarks.topPerformerTraffic
          ),
        },
        gaps: {
          keywords: keywordOpportunities.totalMissing,
          quickWins: keywordOpportunities.quickWins.length,
          strategicOpportunities: keywordOpportunities.strategic.length,
          competitorAdvantage: keywordOpportunities.competitorAdvantage,
        },
        actionPlan: actionPlan,
      },
      qualification: leadQualification,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      }
    );

  } catch (error) {
    console.error('SEO Opportunity Calculator error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to calculate opportunity'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getBasicSEOMetrics(domain) {
  try {
    const apiKey = 'AIzaSyA308cZv0hNvZdC8VAM15v8CE12HEsHzCQ';
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&category=seo&category=performance&strategy=mobile&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return {
        seoScore: null,
        performanceScore: null,
        hasTitle: true,
        hasDescription: true,
        mobileOptimized: true,
      };
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;

    return {
      seoScore: Math.round(lighthouse.categories.seo.score * 100),
      performanceScore: Math.round(lighthouse.categories.performance.score * 100),
      hasTitle: lighthouse.audits['document-title']?.score === 1,
      hasDescription: lighthouse.audits['meta-description']?.score === 1,
      mobileOptimized: lighthouse.audits['viewport']?.score === 1,
      indexable: lighthouse.audits['is-crawlable']?.score === 1,
    };
  } catch (error) {
    console.error('Lighthouse error:', error);
    return {
      seoScore: null,
      performanceScore: null,
      hasTitle: true,
      hasDescription: true,
      mobileOptimized: true,
    };
  }
}

function getIndustryBenchmarks(industry, serviceArea) {
  const industryData = {
    'legal': { avgMonthlyTraffic: 850, topPerformerTraffic: 4500, avgConversionRate: 0.03, avgCTR: 0.04 },
    'accounting': { avgMonthlyTraffic: 650, topPerformerTraffic: 3200, avgConversionRate: 0.04, avgCTR: 0.05 },
    'real-estate': { avgMonthlyTraffic: 1200, topPerformerTraffic: 6000, avgConversionRate: 0.02, avgCTR: 0.06 },
    'healthcare': { avgMonthlyTraffic: 900, topPerformerTraffic: 4000, avgConversionRate: 0.05, avgCTR: 0.07 },
    'home-services': { avgMonthlyTraffic: 550, topPerformerTraffic: 2800, avgConversionRate: 0.06, avgCTR: 0.08 },
    'dental': { avgMonthlyTraffic: 750, topPerformerTraffic: 3500, avgConversionRate: 0.05, avgCTR: 0.06 },
    'automotive': { avgMonthlyTraffic: 680, topPerformerTraffic: 3100, avgConversionRate: 0.03, avgCTR: 0.05 },
    'ecommerce': { avgMonthlyTraffic: 2500, topPerformerTraffic: 15000, avgConversionRate: 0.02, avgCTR: 0.04 },
    'hospitality': { avgMonthlyTraffic: 1100, topPerformerTraffic: 5500, avgConversionRate: 0.04, avgCTR: 0.06 },
    'fitness': { avgMonthlyTraffic: 480, topPerformerTraffic: 2200, avgConversionRate: 0.07, avgCTR: 0.05 },
    'education': { avgMonthlyTraffic: 820, topPerformerTraffic: 3800, avgConversionRate: 0.04, avgCTR: 0.05 },
    'b2b-services': { avgMonthlyTraffic: 420, topPerformerTraffic: 1900, avgConversionRate: 0.05, avgCTR: 0.04 },
    'other': { avgMonthlyTraffic: 600, topPerformerTraffic: 2800, avgConversionRate: 0.04, avgCTR: 0.05 },
  };

  const areaMultipliers = {
    'sydney-cbd': 1.4,
    'sydney-metro': 1.0,
    'nsw': 0.8,
    'australia': 0.6,
    'global': 0.4,
  };

  const baseData = industryData[industry] || industryData['other'];
  const multiplier = areaMultipliers[serviceArea] || 1.0;

  return {
    avgMonthlyTraffic: Math.round(baseData.avgMonthlyTraffic * multiplier),
    topPerformerTraffic: Math.round(baseData.topPerformerTraffic * multiplier),
    avgConversionRate: baseData.avgConversionRate,
    avgCTR: baseData.avgCTR,
  };
}

function estimateKeywordOpportunities(domain, industry, serviceArea, lighthouseData, industryBenchmarks) {
  const seoScore = lighthouseData.seoScore || 65;
  const seoMultiplier = seoScore / 100;
  const currentMonthlyTraffic = Math.round(industryBenchmarks.avgMonthlyTraffic * seoMultiplier * 0.7);

  const trafficGap = industryBenchmarks.avgMonthlyTraffic - currentMonthlyTraffic;
  const topPerformerGap = industryBenchmarks.topPerformerTraffic - currentMonthlyTraffic;
  const totalMissingKeywords = Math.round(trafficGap / 30);
  const quickWinCount = Math.round(totalMissingKeywords * 0.3);
  const strategicCount = Math.round(totalMissingKeywords * 0.5);

  return {
    currentMonthlyTraffic,
    potentialMonthlyTraffic: industryBenchmarks.avgMonthlyTraffic,
    maxPotentialTraffic: industryBenchmarks.topPerformerTraffic,
    totalMissing: totalMissingKeywords,
    quickWins: Array(Math.min(quickWinCount, 5)).fill({}),
    strategic: Array(Math.min(strategicCount, 5)).fill({}),
    competitorAdvantage: Math.round((topPerformerGap / Math.max(currentMonthlyTraffic, 1)) * 100) + '%',
  };
}

function calculateVisibilityScore(lighthouseData, industryBenchmarks) {
  const seoScore = lighthouseData.seoScore || 65;
  const performanceScore = lighthouseData.performanceScore || 70;
  return Math.round(seoScore * 0.7 + performanceScore * 0.3);
}

function calculatePercentile(current, average, top) {
  if (current >= top) return 'Top 10%';
  if (current >= average * 1.2) return 'Top 25%';
  if (current >= average) return 'Top 50%';
  if (current >= average * 0.7) return 'Below Average';
  return 'Bottom 25%';
}

function calculateRevenueOpportunity(keywordOpportunities, industryBenchmarks, avgDealValue, primaryGoal) {
  const trafficGap = keywordOpportunities.potentialMonthlyTraffic - keywordOpportunities.currentMonthlyTraffic;
  const avgConversionRate = industryBenchmarks.avgConversionRate;

  const quickWinTraffic = Math.round(trafficGap * 0.3);
  const quickWinLeads = Math.round(quickWinTraffic * avgConversionRate);
  const quickWinValue = quickWinLeads * avgDealValue;

  const strategicTraffic = Math.round(trafficGap * 0.7);
  const strategicLeads = Math.round(strategicTraffic * avgConversionRate);
  const strategicValue = strategicLeads * avgDealValue;

  const totalMonthlyValue = quickWinValue + strategicValue;
  const totalAnnualValue = totalMonthlyValue * 12;

  return {
    quickWinValue: Math.round(quickWinValue),
    strategicValue: Math.round(strategicValue),
    monthlyValue: Math.round(totalMonthlyValue),
    totalAnnualValue: Math.round(totalAnnualValue),
    newLeadsPerMonth: quickWinLeads + strategicLeads,
    timeToROI: quickWinValue > 5000 ? '90 days' : '6 months',
  };
}

function generateActionPlan(revenueOpportunity, lighthouseData, keywordOpportunities, primaryGoal) {
  const plan = [];

  if (!lighthouseData.hasTitle) {
    plan.push({
      priority: 'critical',
      category: 'Technical SEO',
      action: 'Add optimized title tags to all pages',
      impact: 'High',
      timeframe: '1 week',
      estimatedValue: Math.round(revenueOpportunity.quickWinValue * 0.15),
    });
  }

  if (!lighthouseData.mobileOptimized) {
    plan.push({
      priority: 'critical',
      category: 'Mobile SEO',
      action: 'Fix mobile usability issues',
      impact: 'High',
      timeframe: '2 weeks',
      estimatedValue: Math.round(revenueOpportunity.quickWinValue * 0.2),
    });
  }

  if (keywordOpportunities.quickWins.length > 0) {
    plan.push({
      priority: 'high',
      category: 'Content',
      action: `Create content for ${keywordOpportunities.quickWins.length} quick-win keywords`,
      impact: 'Very High',
      timeframe: '4-8 weeks',
      estimatedValue: revenueOpportunity.quickWinValue,
    });
  }

  if (keywordOpportunities.strategic.length > 0) {
    plan.push({
      priority: 'medium',
      category: 'Content Strategy',
      action: `Develop content strategy for ${keywordOpportunities.strategic.length} high-value keywords`,
      impact: 'Very High',
      timeframe: '3-6 months',
      estimatedValue: revenueOpportunity.strategicValue,
    });
  }

  return plan.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function qualifyLead(revenueOpportunity, avgDealValue, industry) {
  const annualOpportunity = revenueOpportunity.totalAnnualValue;
  let tier, score, cta;

  if (annualOpportunity >= 100000) {
    tier = 'hot';
    score = 95;
    cta = 'emergency';
  } else if (annualOpportunity >= 50000) {
    tier = 'warm';
    score = 75;
    cta = 'strategic';
  } else if (annualOpportunity >= 20000) {
    tier = 'qualified';
    score = 55;
    cta = 'standard';
  } else {
    tier = 'low';
    score = 30;
    cta = 'nurture';
  }

  if (parseInt(avgDealValue) >= 10000) {
    score += 10;
  }

  const highValueIndustries = ['legal', 'accounting', 'real-estate', 'b2b-services'];
  if (highValueIndustries.includes(industry)) {
    score += 5;
  }

  return {
    tier,
    score: Math.min(score, 100),
    cta,
    isTarget: tier === 'hot' || tier === 'warm',
  };
}
