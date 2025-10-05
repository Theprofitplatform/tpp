/**
 * Cloudflare Pages Function: POST /api/keyword-gap-standalone
 * Standalone version with all logic embedded (no external backend)
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const body = await request.json();
    const { yourDomain, competitorDomain, email } = body;

    if (!yourDomain || !competitorDomain) {
      return new Response(JSON.stringify({
        error: 'Both yourDomain and competitorDomain are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform analysis
    const result = await analyzeKeywordGap(yourDomain, competitorDomain);

    const response = {
      success: true,
      yourDomain: result.yourDomain,
      competitorDomain: result.competitorDomain,
      yourDA: result.yourDA,
      competitorDA: result.competitorDA,
      totalGaps: result.totalGaps,
      easyWins: result.easyWins,
      totalMonthlyValue: result.totalMonthlyValue,
      industry: result.industry,
      servicesFound: result.servicesFound,
      opportunities: email ? result.full10 : result.top3,
      requiresEmail: !email,
      usingMockData: true
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to analyze keyword gap.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

async function analyzeKeywordGap(yourDomain, competitorDomain) {
  const [yourHTML, competitorHTML] = await Promise.all([
    fetchWebsite(yourDomain),
    fetchWebsite(competitorDomain)
  ]);

  const yourServices = extractServices(yourHTML);
  const competitorServices = extractServices(competitorHTML);
  const yourDA = calculateSimpleDA(yourHTML);
  const competitorDA = calculateSimpleDA(competitorHTML);
  const keywords = generateKeywords(yourServices, competitorServices);
  const serpResults = mockSERPResults(keywords, yourDomain, competitorDomain);
  const gaps = findGaps(serpResults, yourDA);

  return {
    yourDomain,
    competitorDomain,
    yourDA,
    competitorDA,
    totalGaps: gaps.length,
    easyWins: gaps.filter(g => g.isEasyWin).length,
    totalMonthlyValue: gaps.reduce((sum, g) => sum + g.estimatedMonthlyValue, 0),
    industry: detectIndustry(yourServices),
    servicesFound: yourServices,
    top3: gaps.slice(0, 3),
    full10: gaps.slice(0, 10)
  };
}

async function fetchWebsite(domain) {
  const mockServices = {
    'theprofitplatform.com.au': 'SEO services marketing digital marketing web design plumbing electrical building consulting',
    'searchenginepeople.com.au': 'SEO agency marketing services consulting digital solutions',
    'default': 'services solutions consulting agency professional'
  };

  const content = mockServices[domain] || mockServices['default'];
  return `<html><body><h1>Services</h1><p>${content}</p></body></html>`;
}

function extractServices(html) {
  const services = new Set();
  const serviceKeywords = [
    'plumbing', 'plumber', 'electrical', 'electrician',
    'seo', 'marketing', 'design', 'web', 'development',
    'consulting', 'services', 'solutions', 'agency',
    'building', 'construction', 'renovation', 'physio',
    'legal', 'lawyer', 'accounting', 'finance'
  ];

  const lowerHTML = html.toLowerCase();
  serviceKeywords.forEach(keyword => {
    if (lowerHTML.includes(keyword)) {
      services.add(keyword);
    }
  });

  return Array.from(services).slice(0, 10);
}

function calculateSimpleDA(html) {
  let score = 20;
  if (html.length > 50000) score += 15;
  else if (html.length > 20000) score += 10;
  else if (html.length > 10000) score += 5;
  if (html.includes('og:')) score += 10;
  if (html.includes('twitter:')) score += 5;
  if (html.includes('schema.org')) score += 10;
  if (html.includes('application/ld+json')) score += 5;
  score += 5;
  const linkCount = (html.match(/<a /g) || []).length;
  if (linkCount > 100) score += 10;
  else if (linkCount > 50) score += 5;
  return Math.min(100, score);
}

function generateKeywords(yourServices, competitorServices) {
  const keywords = [];
  const allServices = [...new Set([...yourServices, ...competitorServices])];
  const templates = [
    '{service} sydney',
    'best {service} sydney',
    '{service} near me',
    'sydney {service}',
    'professional {service}'
  ];

  allServices.forEach(service => {
    templates.forEach(template => {
      keywords.push(template.replace('{service}', service));
    });
  });

  return keywords.slice(0, 30);
}

function mockSERPResults(keywords, yourDomain, competitorDomain) {
  return keywords.map(keyword => {
    const volume = Math.floor(Math.random() * 800) + 100;
    const difficulty = Math.floor(Math.random() * 60) + 20;
    const cpc = (Math.random() * 10 + 1).toFixed(2);
    const yourPos = Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 1 : null;
    const compPos = Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : null;

    return {
      keyword,
      searchVolume: volume,
      difficulty,
      cpc,
      yourPosition: yourPos,
      competitorPosition: compPos
    };
  });
}

function findGaps(serpResults, yourDA) {
  const gaps = serpResults
    .filter(result => result.competitorPosition && !result.yourPosition)
    .map(result => {
      const value = Math.floor(result.searchVolume * parseFloat(result.cpc) * 0.15);
      const isEasyWin = result.difficulty < 40 && yourDA > result.difficulty;

      return {
        keyword: result.keyword,
        searchVolume: result.searchVolume,
        difficulty: result.difficulty,
        cpc: result.cpc,
        estimatedMonthlyValue: value,
        isEasyWin,
        competitorPosition: result.competitorPosition
      };
    })
    .sort((a, b) => b.estimatedMonthlyValue - a.estimatedMonthlyValue);

  return gaps;
}

function detectIndustry(services) {
  const industries = {
    'home_services': ['plumbing', 'electrical', 'building', 'construction'],
    'digital': ['seo', 'marketing', 'web', 'design', 'development'],
    'professional': ['legal', 'accounting', 'consulting'],
    'health': ['physio', 'medical', 'health']
  };

  for (const [industry, keywords] of Object.entries(industries)) {
    if (services.some(s => keywords.includes(s))) {
      return industry;
    }
  }

  return 'general';
}
