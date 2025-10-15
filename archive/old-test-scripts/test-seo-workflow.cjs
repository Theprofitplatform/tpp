#!/usr/bin/env node

/**
 * Advanced SEO Optimization & Analysis Chain - Test Script
 * Tests the n8n workflow with comprehensive validation
 *
 * Usage: node scripts/test-seo-workflow.js [test-case-number]
 */

const https = require('https');
const http = require('http');

const WEBHOOK_URL = process.env.SEO_WEBHOOK_URL || 'https://n8n.theprofitplatform.com.au/webhook/seo-optimization';

// Test cases covering different scenarios
const testCases = [
  {
    name: 'Australian Business - High Quality Content (should score > 80)',
    payload: {
      content_id: 'test-001',
      title: 'Best Digital Marketing Services for Australian Small Businesses in Sydney 2025',
      content: `
        Are you looking for expert digital marketing services in Australia? Our comprehensive digital marketing solutions help Australian small businesses grow their online presence.

        Why Choose Our Australian Digital Marketing Services:
        - Local SEO expertise for Sydney, Melbourne, and Brisbane businesses
        - Australian market-specific strategies
        - Google My Business optimization for local searches
        - Mobile-first approach for Australian consumers

        Digital Marketing Services We Offer:
        1. Search Engine Optimization (SEO)
        2. Pay-Per-Click Advertising (PPC)
        3. Social Media Marketing
        4. Content Marketing Strategy
        5. Email Marketing Campaigns

        Our team understands the unique challenges Australian businesses face in the competitive digital landscape. Contact us today for a free consultation.
      `,
      keywords: ['digital marketing Australia', 'SEO Sydney', 'Australian small business marketing', 'local SEO Melbourne'],
      competitor_urls: [
        'https://example.com/digital-marketing',
        'https://competitor.com.au/seo-services'
      ],
      target_location: 'Australia'
    }
  },
  {
    name: 'Poor Content - Low Score (should trigger auto-optimization)',
    payload: {
      content_id: 'test-002',
      title: 'Marketing',
      content: 'We do marketing stuff. Call us for more info. Marketing is good.',
      keywords: ['marketing', 'business', 'services'],
      competitor_urls: [],
      target_location: 'Australia'
    }
  },
  {
    name: 'Medium Quality - Australian Financial Services',
    payload: {
      content_id: 'test-003',
      title: 'Financial Planning Services Australia',
      content: `
        Professional financial planning for Australians. We provide financial advice and investment strategies.

        Our services include retirement planning, tax strategies, and wealth management.
        Contact our Melbourne office for a consultation.
      `,
      keywords: ['financial planning Australia', 'investment advice', 'retirement planning'],
      competitor_urls: ['https://financialservices.com.au'],
      target_location: 'Australia'
    }
  },
  {
    name: 'E-commerce Content - Product Focus',
    payload: {
      content_id: 'test-004',
      title: 'Buy Premium Australian Made Products Online - Free Shipping Australia Wide',
      content: `
        Shop authentic Australian made products with free shipping across Australia. Our curated collection features:

        Premium Australian Products:
        - Organic skincare made in Australia
        - Handcrafted homewares from local artisans
        - Australian wine and gourmet foods
        - Eco-friendly products supporting Aussie businesses

        Why Shop With Us:
        ✓ 100% Australian owned and operated
        ✓ Free express shipping Sydney, Melbourne, Brisbane
        ✓ Support local Australian manufacturers
        ✓ Secure payment with AfterPay available

        Order now and get 15% off your first purchase. Australian made, Australian proud.
      `,
      keywords: ['Australian made products', 'buy online Australia', 'Australian gifts', 'free shipping Australia'],
      competitor_urls: [
        'https://australianmade.com.au',
        'https://localproducts.com.au'
      ],
      target_location: 'Australia'
    }
  },
  {
    name: 'Technical Content - No Keywords',
    payload: {
      content_id: 'test-005',
      title: 'Technical Documentation',
      content: 'This is technical content without SEO optimization. Lorem ipsum dolor sit amet.',
      keywords: [],
      competitor_urls: []
    }
  }
];

function makeRequest(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const data = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      // For testing with self-signed certs
      rejectUnauthorized: false
    };

    const req = lib.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(30000); // 30 second timeout

    req.write(data);
    req.end();
  });
}

function validateResponse(response, testCase) {
  const validations = [];

  // Check HTTP status
  if (response.statusCode === 200) {
    validations.push('✅ HTTP 200 OK');
  } else {
    validations.push(`❌ HTTP ${response.statusCode} (expected 200)`);
  }

  // Check response structure
  if (response.body && typeof response.body === 'object') {
    validations.push('✅ Valid JSON response');

    // Check for expected fields
    const expectedFields = ['seo_score', 'analysis', 'recommendations', 'optimized_content'];
    expectedFields.forEach(field => {
      if (response.body[field] !== undefined) {
        validations.push(`✅ Contains '${field}' field`);
      } else {
        validations.push(`⚠️  Missing '${field}' field`);
      }
    });

    // Validate SEO score
    if (response.body.seo_score !== undefined) {
      const score = parseFloat(response.body.seo_score);
      if (score >= 0 && score <= 100) {
        validations.push(`✅ SEO Score: ${score}/100 (valid range)`);

        // Check auto-optimization trigger
        if (score < 80 && response.body.optimized_content) {
          validations.push('✅ Auto-optimization triggered (score < 80)');
        } else if (score >= 80 && !response.body.auto_optimized) {
          validations.push('✅ No auto-optimization needed (score >= 80)');
        }
      } else {
        validations.push(`❌ SEO Score: ${score} (invalid range)`);
      }
    }

    // Check for Australian-specific keywords
    if (testCase.payload.target_location === 'Australia') {
      const responseText = JSON.stringify(response.body).toLowerCase();
      const australianTerms = ['australia', 'australian', 'sydney', 'melbourne', 'brisbane', 'au'];
      const foundTerms = australianTerms.filter(term => responseText.includes(term));

      if (foundTerms.length > 0) {
        validations.push(`✅ Australian focus detected: ${foundTerms.join(', ')}`);
      } else {
        validations.push('⚠️  No Australian-specific terms in response');
      }
    }

    // Check for recommendations array
    if (Array.isArray(response.body.recommendations)) {
      validations.push(`✅ Recommendations: ${response.body.recommendations.length} items`);
    }

    // Check analysis details
    if (response.body.analysis) {
      const analysis = response.body.analysis;
      if (analysis.keyword_density) validations.push('✅ Keyword density analysis present');
      if (analysis.title_optimization) validations.push('✅ Title optimization analysis present');
      if (analysis.heading_structure) validations.push('✅ Heading structure analysis present');
      if (analysis.long_tail_keywords) validations.push('✅ Long-tail keyword suggestions present');
    }

  } else {
    validations.push('❌ Invalid response format');
  }

  return validations;
}

async function runTest(testIndex) {
  const testCase = testCases[testIndex];

  console.log('\n' + '='.repeat(80));
  console.log(`TEST CASE ${testIndex + 1}: ${testCase.name}`);
  console.log('='.repeat(80));

  console.log('\n📤 REQUEST PAYLOAD:');
  console.log(JSON.stringify(testCase.payload, null, 2));

  console.log('\n⏳ Sending request to webhook...');
  console.log(`   URL: ${WEBHOOK_URL}`);

  try {
    const startTime = Date.now();
    const response = await makeRequest(testCase.payload);
    const duration = Date.now() - startTime;

    console.log(`\n⏱️  Response received in ${duration}ms`);

    console.log('\n📥 RESPONSE:');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${JSON.stringify(response.body, null, 2)}`);

    console.log('\n🔍 VALIDATION RESULTS:');
    const validations = validateResponse(response, testCase);
    validations.forEach(v => console.log(`   ${v}`));

    const passed = validations.filter(v => v.startsWith('✅')).length;
    const failed = validations.filter(v => v.startsWith('❌')).length;
    const warnings = validations.filter(v => v.startsWith('⚠️')).length;

    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);

    return { passed, failed, warnings, response };

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    return { passed: 0, failed: 1, warnings: 0, error };
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Advanced SEO Workflow Test Suite');
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  console.log(`   Total Test Cases: ${testCases.length}`);

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(i);
    results.push(result);

    // Wait between tests
    if (i < testCases.length - 1) {
      console.log('\n⏸️  Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 FINAL TEST SUMMARY');
  console.log('='.repeat(80));

  const totalPassed = results.reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.warnings || 0), 0);

  console.log(`\n   Total Validations:`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   ⚠️  Warnings: ${totalWarnings}`);

  const successRate = totalPassed / (totalPassed + totalFailed) * 100;
  console.log(`\n   Success Rate: ${successRate.toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n   🎉 ALL TESTS PASSED! ✨');
  } else {
    console.log('\n   ⚠️  Some tests failed. Review the output above.');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

// Main execution
const testIndex = parseInt(process.argv[2]);

if (isNaN(testIndex)) {
  runAllTests();
} else if (testIndex >= 0 && testIndex < testCases.length) {
  runTest(testIndex).then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
} else {
  console.error(`❌ Invalid test index. Choose 0-${testCases.length - 1} or run all tests.`);
  process.exit(1);
}
