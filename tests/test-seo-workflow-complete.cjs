#!/usr/bin/env node

/**
 * Complete SEO Workflow Test Script
 * Tests the entire SEO optimization workflow with Claude Code
 *
 * Usage: node tests/test-seo-workflow-complete.js
 */

const https = require('https');
const http = require('http');

// Test data
const testContent = {
  content_id: "test-seo-" + Date.now(),
  title: "Best Digital Marketing Services for Australian Small Businesses in Sydney 2025",
  content: `Are you a small business owner in Sydney looking to grow your online presence? Our comprehensive digital marketing services are specifically designed for Australian businesses. We understand the unique challenges of the Australian market and have helped over 200 local businesses increase their online visibility.

Our services include: SEO optimization for Australian search engines, Local SEO targeting Sydney suburbs, Content marketing with Australian English, Social media management for Australian audiences, Google My Business optimization, Email marketing campaigns, and Pay-per-click advertising.

With over 10 years of experience in the Australian digital marketing landscape, our team knows what works for local businesses. We've helped businesses achieve:
- 150% increase in organic traffic
- 85% improvement in local search rankings
- 200+ successful campaigns delivered
- Average ROI of 320%

Whether you're in Parramatta, Bondi, or the CBD, we provide tailored solutions that deliver real results for Australian small businesses.`,
  keywords: ["digital marketing Australia", "SEO Sydney", "small business marketing", "local SEO", "Australian business growth"],
  competitor_urls: ["https://example.com/competitor1", "https://example.com/competitor2"],
  target_location: "Australia"
};

console.log('🧪 SEO Workflow Complete Test\n');
console.log('=' .repeat(60));

// Helper function for HTTP POST requests
function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Test functions
async function testClaudeProxy() {
  console.log('\n📡 Step 1: Testing Claude Code Proxy Endpoints\n');

  // Test health endpoint
  console.log('  ✓ Health check: http://127.0.0.1:3100/health');
  try {
    const health = await httpPost('http://127.0.0.1:3100/health', {});
    console.log('    Status:', health.status === 200 ? '✅ OK' : '❌ FAILED');
  } catch(e) {
    console.log('    Status: ❌ ERROR -', e.message);
    return false;
  }

  // Test SEO Analysis endpoint
  console.log('\n  ✓ SEO Analysis: http://127.0.0.1:3100/v1/seo/analyze');
  const seoPayload = {
    title: testContent.title,
    content: testContent.content,
    keywords: testContent.keywords,
    target_location: testContent.target_location
  };

  const seoResult = await httpPost('http://127.0.0.1:3100/v1/seo/analyze', seoPayload);
  if (seoResult.status === 200 && seoResult.data.response) {
    console.log('    Status: ✅ OK');
    console.log('    Response:', JSON.stringify(seoResult.data.response, null, 2).substring(0, 200) + '...');
  } else {
    console.log('    Status: ❌ FAILED');
    console.log('    Response:', seoResult.data);
    return false;
  }

  // Test Keyword Research endpoint
  console.log('\n  ✓ Keyword Research: http://127.0.0.1:3100/v1/seo/keywords');
  const keywordPayload = {
    title: testContent.title,
    content: testContent.content,
    current_keywords: testContent.keywords,
    target_location: testContent.target_location
  };

  const keywordResult = await httpPost('http://127.0.0.1:3100/v1/seo/keywords', keywordPayload);
  if (keywordResult.status === 200 && keywordResult.data.response) {
    console.log('    Status: ✅ OK');
    console.log('    Response:', JSON.stringify(keywordResult.data.response, null, 2).substring(0, 200) + '...');
  } else {
    console.log('    Status: ❌ FAILED');
    console.log('    Response:', keywordResult.data);
    return false;
  }

  return { seoAnalysis: seoResult.data.response, keywordResearch: keywordResult.data.response };
}

async function testN8nWebhook() {
  console.log('\n📡 Step 2: Testing n8n SEO Webhook\n');

  console.log('  ✓ Testing: POST https://n8n.theprofitplatform.com.au/webhook/seo-optimization');

  try {
    const result = await httpPost('https://n8n.theprofitplatform.com.au/webhook/seo-optimization', testContent);

    if (result.status === 200) {
      console.log('    Status: ✅ WEBHOOK ACTIVE');
      console.log('    Response:', JSON.stringify(result.data, null, 2).substring(0, 300) + '...');
      return result.data;
    } else if (result.status === 404) {
      console.log('    Status: ⏳ WEBHOOK NOT REGISTERED');
      console.log('    Note: Workflow needs to be activated in n8n UI');
      console.log('    URL: https://n8n.theprofitplatform.com.au/workflow/[workflow-id]');
      return null;
    } else {
      console.log('    Status: ❌ ERROR -', result.status);
      console.log('    Response:', result.data);
      return null;
    }
  } catch(e) {
    console.log('    Status: ❌ ERROR -', e.message);
    return null;
  }
}

function calculateSEOScore(seoAnalysis, keywordResearch, content) {
  let score = 0;

  // Keyword analysis (25 points)
  const keywordCount = content.keywords?.length || 0;
  const hasLongTail = keywordResearch.long_tail_keywords?.length > 0;
  score += Math.min(keywordCount * 5, 15);
  if (hasLongTail) score += 10;

  // Title optimization (20 points)
  const titleScore = seoAnalysis.title_optimization?.score || 0;
  score += titleScore * 0.2;

  // Content quality (20 points)
  const contentLength = content.content?.length || 0;
  const readabilityScore = seoAnalysis.readability_score || 0;
  score += Math.min(contentLength / 50, 10);
  score += readabilityScore * 0.1;

  // Structure (15 points)
  const headingValid = seoAnalysis.heading_structure?.hierarchy_valid;
  if (headingValid) score += 15;

  // Australian SEO (10 points)
  const hasAustralianKeywords = keywordResearch.australian_keywords?.length > 0;
  const isAustralianTarget = content.target_location?.toLowerCase().includes('austral');
  if (hasAustralianKeywords) score += 5;
  if (isAustralianTarget) score += 5;

  // Mobile optimization (10 points)
  const isMobileFriendly = contentLength < 3000 && contentLength > 300;
  if (isMobileFriendly) score += 10;

  return Math.min(Math.round(score), 100);
}

function generateRecommendations(seoAnalysis, keywordResearch, score) {
  const recommendations = [];

  const titleScore = seoAnalysis.title_optimization?.score || 0;
  const keywordCount = testContent.keywords?.length || 0;
  const hasAustralianKeywords = keywordResearch.australian_keywords?.length > 0;
  const contentLength = testContent.content?.length || 0;
  const hasLongTail = keywordResearch.long_tail_keywords?.length > 0;

  if (titleScore < 80) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Title Optimization',
      issue: 'Title tag score below 80',
      action: 'Optimize title tag for better CTR',
      impact: 'Could improve click-through rate by 25-40%'
    });
  }

  if (keywordCount < 3) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Keyword Strategy',
      issue: 'Limited keyword targeting',
      action: 'Add more relevant keywords (aim for 3-5 primary keywords)',
      impact: 'Broader search visibility and traffic opportunities'
    });
  }

  if (!hasAustralianKeywords) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Local SEO',
      issue: 'Missing Australian-specific keywords',
      action: 'Include Australian-specific keywords and location terms',
      impact: 'Better local search rankings and relevance'
    });
  }

  if (contentLength < 500) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Content Length',
      issue: 'Content length below recommended minimum',
      action: 'Increase content length to 500+ words',
      impact: 'Better rankings and user engagement'
    });
  }

  if (!seoAnalysis.heading_structure?.h1_count) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Structure',
      issue: 'Missing H1 heading',
      action: 'Add H1 heading with primary keyword',
      impact: 'Essential for SEO and accessibility'
    });
  }

  if (!hasLongTail) {
    recommendations.push({
      priority: 'LOW',
      category: 'Keyword Strategy',
      issue: 'No long-tail keywords detected',
      action: 'Include long-tail keywords for niche targeting',
      impact: 'Better conversion rates and less competition'
    });
  }

  return recommendations;
}

function generateReport(seoAnalysis, keywordResearch) {
  console.log('\n📊 Step 3: Generating SEO Report\n');

  const score = calculateSEOScore(seoAnalysis, keywordResearch, testContent);
  const recommendations = generateRecommendations(seoAnalysis, keywordResearch, score);

  console.log('  📈 SEO Score:', score, '/100');
  console.log('  🎯 Status:', score >= 80 ? '✅ Good' : score >= 60 ? '⚠️ Needs Improvement' : '❌ Poor');

  console.log('\n  📋 Analysis Summary:');
  console.log('    - Keyword Density:', seoAnalysis.keyword_density?.density_percentage + '%');
  console.log('    - Title Score:', seoAnalysis.title_optimization?.score + '/100');
  console.log('    - Readability:', seoAnalysis.readability_score + '/100');
  console.log('    - H1 Count:', seoAnalysis.heading_structure?.h1_count || 0);
  console.log('    - Long-tail Keywords:', keywordResearch.long_tail_keywords?.length || 0);
  console.log('    - Australian Keywords:', keywordResearch.australian_keywords?.length || 0);

  console.log('\n  🔍 Keyword Research:');
  console.log('    - Long-tail:', keywordResearch.long_tail_keywords?.join(', ').substring(0, 80) + '...');
  console.log('    - Australian:', keywordResearch.australian_keywords?.join(', '));
  console.log('    - Search Intent:', keywordResearch.search_intent);

  console.log('\n  💡 Recommendations (' + recommendations.length + '):');
  recommendations.forEach((rec, i) => {
    const emoji = rec.priority === 'CRITICAL' ? '🚨' : rec.priority === 'HIGH' ? '⚠️' : rec.priority === 'MEDIUM' ? '📋' : '💡';
    console.log(`    ${i+1}. ${emoji} [${rec.priority}] ${rec.category}`);
    console.log(`       Issue: ${rec.issue}`);
    console.log(`       Action: ${rec.action}`);
    console.log(`       Impact: ${rec.impact}\n`);
  });

  return {
    content_id: testContent.content_id,
    seo_score: score,
    needs_optimization: score < 80,
    analysis: {
      keyword_density: seoAnalysis.keyword_density,
      title_optimization: seoAnalysis.title_optimization,
      heading_structure: seoAnalysis.heading_structure,
      readability_score: seoAnalysis.readability_score,
      long_tail_keywords: keywordResearch.long_tail_keywords || [],
      australian_seo: {
        local_keywords: keywordResearch.australian_keywords || [],
        local_relevance_score: keywordResearch.australian_keywords?.length > 0 ? 85 : 40
      }
    },
    recommendations,
    timestamp: new Date().toISOString()
  };
}

// Main execution
async function main() {
  console.log('📋 Test Content:');
  console.log('  - Title:', testContent.title);
  console.log('  - Content Length:', testContent.content.length, 'chars');
  console.log('  - Keywords:', testContent.keywords.join(', '));
  console.log('  - Target:', testContent.target_location);

  // Test Claude proxy
  const proxyResult = await testClaudeProxy();
  if (!proxyResult) {
    console.log('\n❌ Claude proxy test failed. Exiting.\n');
    process.exit(1);
  }

  // Test n8n webhook
  const webhookResult = await testN8nWebhook();

  // Generate report
  const report = generateReport(proxyResult.seoAnalysis, proxyResult.keywordResearch);

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test Complete!\n');

  console.log('📝 Summary:');
  console.log('  - Claude Code Proxy: ✅ Working');
  console.log('  - SEO Analysis API: ✅ Working');
  console.log('  - Keyword Research API: ✅ Working');
  console.log('  - n8n Webhook:', webhookResult ? '✅ Active' : '⏳ Needs Activation');
  console.log('  - Final SEO Score:', report.seo_score + '/100');

  if (!webhookResult) {
    console.log('\n⚠️  Action Required:');
    console.log('  1. Open: https://n8n.theprofitplatform.com.au');
    console.log('  2. Find workflow: "SEO Optimization with Claude Code"');
    console.log('  3. Click Save + Toggle Active');
    console.log('  4. Re-run this test');
  }

  console.log('\n📄 Full report saved to: /tmp/seo-test-report.json\n');

  // Save report
  const fs = require('fs');
  fs.writeFileSync('/tmp/seo-test-report.json', JSON.stringify(report, null, 2));
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
