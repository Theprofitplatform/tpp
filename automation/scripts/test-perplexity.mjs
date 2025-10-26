#!/usr/bin/env node

/**
 * Quick Perplexity API Test
 * Tests the new 'sonar' model
 */

import dotenv from 'dotenv';
import Perplexity from '@perplexity-ai/perplexity_ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

if (!perplexityApiKey) {
  console.error('❌ PERPLEXITY_API_KEY not found in environment');
  process.exit(1);
}

const perplexity = new Perplexity({ apiKey: perplexityApiKey });

async function testPerplexity() {
  console.log('🔍 Testing Perplexity API with "sonar" model...\n');

  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: 'What are the latest SEO trends for 2025? Give me a brief summary in 2-3 sentences.'
      }],
      max_tokens: 500,
      temperature: 0.7,
      return_related_questions: true
    });

    console.log('✅ Perplexity API Test SUCCESSFUL\n');
    console.log('Response:');
    console.log('─'.repeat(60));
    console.log(response.choices[0].message.content);
    console.log('─'.repeat(60));

    if (response.related_questions && response.related_questions.length > 0) {
      console.log('\n📝 Related Questions:');
      response.related_questions.forEach((q, i) => {
        console.log(`   ${i + 1}. ${q}`);
      });
    }

    console.log('\n✅ Test completed successfully!');
    console.log('   Model: sonar');
    console.log('   Status: Working correctly');

    process.exit(0);

  } catch (error) {
    console.error('❌ Perplexity API Test FAILED\n');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testPerplexity();
