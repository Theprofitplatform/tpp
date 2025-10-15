#!/usr/bin/env node

/**
 * Diagnostic script to identify blog automation issues
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment
console.log('🔍 Blog Automation Diagnostic Tool\n');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

async function checkEnvironment() {
  console.log('1. Checking Environment...');

  const checks = [
    {
      name: 'Project Directory',
      check: async () => {
        try {
          await fs.access(projectRoot);
          return { status: '✅', message: 'Exists' };
        } catch {
          return { status: '❌', message: 'Not found' };
        }
      }
    },
    {
      name: '.env.local File',
      check: async () => {
        const envPath = path.join(projectRoot, '.env.local');
        try {
          await fs.access(envPath);
          return { status: '✅', message: 'Exists' };
        } catch {
          return { status: '❌', message: 'Not found' };
        }
      }
    },
    {
      name: 'Claude API Key',
      check: async () => {
        const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        if (key && key.startsWith('sk-ant-')) {
          return { status: '✅', message: 'Valid format' };
        }
        return { status: '❌', message: 'Missing or invalid' };
      }
    },
    {
      name: 'Perplexity API Key',
      check: async () => {
        const key = process.env.PERPLEXITY_API_KEY;
        if (key && key.startsWith('pplx-')) {
          return { status: '✅', message: 'Valid format' };
        }
        return { status: '❌', message: 'Missing or invalid' };
      }
    },
    {
      name: 'Topic Queue',
      check: async () => {
        const queuePath = path.join(projectRoot, 'automation/topic-queue.json');
        try {
          const data = JSON.parse(await fs.readFile(queuePath, 'utf-8'));
          const pending = data.queue.filter(t => t.status === 'pending');
          return {
            status: pending.length > 0 ? '✅' : '⚠️',
            message: `${pending.length} pending topics`
          };
        } catch {
          return { status: '❌', message: 'Not found or invalid' };
        }
      }
    }
  ];

  for (const check of checks) {
    const result = await check.check();
    console.log(`   ${result.status} ${check.name}: ${result.message}`);
  }
}

async function testAPIConnectivity() {
  console.log('\n2. Testing API Connectivity...');

  const tests = [
    {
      name: 'Claude API',
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      })
    },
    {
      name: 'Perplexity API',
      url: 'https://api.perplexity.ai/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-small-online',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    }
  ];

  for (const test of tests) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        console.log(`   ❌ ${test.name}: Authentication failed (${response.status})`);
      } else if (response.status === 429) {
        console.log(`   ⚠️  ${test.name}: Rate limited (${response.status})`);
      } else if (response.ok) {
        console.log(`   ✅ ${test.name}: Connected (${response.status})`);
      } else {
        console.log(`   ❌ ${test.name}: Failed (${response.status})`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`   ❌ ${test.name}: Timeout after 10s`);
      } else {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
  }
}

async function checkFilePermissions() {
  console.log('\n3. Checking File Permissions...');

  const paths = [
    'src/content/blog',
    'automation/logs',
    'automation/visual-suggestions',
    'public/images'
  ];

  for (const relativePath of paths) {
    const fullPath = path.join(projectRoot, relativePath);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ ${relativePath}: Accessible`);
    } catch {
      console.log(`   ❌ ${relativePath}: Not accessible`);
    }
  }
}

async function testBlogGeneration() {
  console.log('\n4. Testing Blog Generation...');

  try {
    // Import the blog generation function
    const { generateBlogPost } = await import('./generate-blog-post.js');

    console.log('   Starting blog generation test...');

    // Set a timeout for the test
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Test timeout after 2 minutes')), 120000)
    );

    const generationPromise = generateBlogPost();

    const result = await Promise.race([generationPromise, timeoutPromise]);

    if (result && result.success) {
      console.log(`   ✅ Blog generation successful!`);
      console.log(`      Post: ${result.topic.title}`);
      console.log(`      File: ${result.filepath}`);
      console.log(`      Words: ${result.wordCount}`);
    } else {
      console.log(`   ❌ Blog generation failed`);
    }
  } catch (error) {
    console.log(`   ❌ Blog generation error: ${error.message}`);

    if (error.message.includes('timeout')) {
      console.log('   💡 Suggestion: API calls are taking too long. Check network connectivity.');
    } else if (error.message.includes('API key')) {
      console.log('   💡 Suggestion: Check your API keys in .env.local');
    } else if (error.message.includes('topic')) {
      console.log('   💡 Suggestion: Check topic queue configuration');
    }
  }
}

async function main() {
  try {
    await checkEnvironment();
    await testAPIConnectivity();
    await checkFilePermissions();
    await testBlogGeneration();

    console.log('\n🎯 DIAGNOSTIC COMPLETE');
    console.log('Check the results above and fix any ❌ issues.');

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
  }
}

main();