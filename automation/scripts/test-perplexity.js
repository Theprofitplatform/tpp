/**
 * Test Perplexity API Connection
 * Quick test to verify API key and model name
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPerplexityClient } from './perplexity-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local
dotenv.config({ path: path.join(projectRoot, '.env.local') });

console.log('🧪 Testing Perplexity API connection...\n');

const client = getPerplexityClient();

if (!client) {
  console.error('❌ Failed to initialize Perplexity client');
  process.exit(1);
}

// Test 1: Simple query
console.log('Test 1: Simple query with sonar-pro model');
try {
  const result = await client.query(
    'What is the average click-through rate for Google Ads in 2024?',
    { model: 'sonar-pro' }
  );

  if (result.success) {
    console.log('✅ Success!');
    console.log(`Content: ${result.content.substring(0, 200)}...`);
    console.log(`Citations: ${result.citations.length}`);
  } else {
    console.log('❌ Failed:', result.error);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n---\n');

// Test 2: Try sonar model
console.log('Test 2: Testing sonar model');
try {
  const result = await client.query(
    'What is the average CTR for Google Ads?',
    { model: 'sonar' }
  );

  if (result.success) {
    console.log('✅ Success!');
    console.log(`Content: ${result.content.substring(0, 200)}...`);
    console.log(`Citations: ${result.citations.length}`);
  } else {
    console.log('❌ Failed:', result.error);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n✅ Test complete');
