/**
 * Test Script for Claude Code API Server
 * Tests all endpoints to ensure they work correctly
 */

async function testEndpoint(name, url, body) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: url.includes('health') || url.includes('status') ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
    } else {
      console.log(`   ❌ Failed (${response.status})`);
      console.log(`   Error:`, data);
    }

    return data;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  const BASE_URL = 'http://localhost:3000';

  console.log('='.repeat(60));
  console.log('🚀 Claude Code API Server - Test Suite');
  console.log('='.repeat(60));

  // Test 1: Health Check
  await testEndpoint(
    'Health Check',
    `${BASE_URL}/health`
  );

  // Test 2: Status
  await testEndpoint(
    'Server Status',
    `${BASE_URL}/status`
  );

  // Test 3: Simple Claude Request
  await testEndpoint(
    'Simple AI Request',
    `${BASE_URL}/api/claude`,
    {
      prompt: 'Write a short poem about automation in 2 lines'
    }
  );

  // Test 4: Code Analysis
  await testEndpoint(
    'Code Analysis',
    `${BASE_URL}/api/claude/analyze`,
    {
      code: 'function add(a, b) { return a + b; }',
      language: 'javascript',
      task: 'review'
    }
  );

  // Test 5: Content Generation
  await testEndpoint(
    'Content Generation',
    `${BASE_URL}/api/claude/generate`,
    {
      type: 'blog post',
      topic: 'Benefits of workflow automation',
      length: 'short',
      tone: 'professional'
    }
  );

  // Test 6: SEO Analysis
  await testEndpoint(
    'SEO Analysis',
    `${BASE_URL}/api/claude/seo`,
    {
      content: 'Sample blog post about automation',
      keywords: ['automation', 'workflow', 'efficiency']
    }
  );

  // Test 7: Data Analysis
  await testEndpoint(
    'Data Analysis',
    `${BASE_URL}/api/claude/analyze-data`,
    {
      data: { sales: [100, 150, 200, 180], months: ['Jan', 'Feb', 'Mar', 'Apr'] },
      question: 'What is the trend in sales?'
    }
  );

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test suite complete!');
  console.log('='.repeat(60));
}

// Check if server is running
fetch('http://localhost:3000/health')
  .then(() => {
    console.log('✅ Server is running\n');
    runTests();
  })
  .catch(() => {
    console.error('❌ Server is not running!');
    console.log('\nStart the server first:');
    console.log('  cd claude-code-api');
    console.log('  npm start\n');
    process.exit(1);
  });
