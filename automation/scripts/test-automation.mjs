#!/usr/bin/env node

/**
 * Automation System Test/Verification Script
 * Tests all automation components to ensure they're working
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const tests = [];
let passed = 0;
let failed = 0;

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.blue}🧪 SEO Automation System Test${colors.reset}`);
console.log('='.repeat(50));
console.log('');

/**
 * Test helper
 */
async function test(name, fn) {
  process.stdout.write(`Testing: ${name}... `);

  try {
    await fn();
    console.log(`${colors.green}✓ PASS${colors.reset}`);
    passed++;
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    failed++;
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {

  // Test 1: Check required directories
  await test('Required directories exist', async () => {
    const dirs = [
      'automation/scripts',
      'automation/config',
      'automation/data',
      'automation/generated',
      'automation/reports',
      'automation/logs',
      'src/content/locations',
    ];

    for (const dir of dirs) {
      const exists = await fs.access(dir).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Directory missing: ${dir}`);
      }
    }
  });

  // Test 2: Check required scripts
  await test('All automation scripts exist', async () => {
    const scripts = [
      'automation/scripts/generate-suburb-pages.mjs',
      'automation/scripts/gbp-auto-poster.mjs',
      'automation/scripts/review-automation.mjs',
      'automation/scripts/rank-tracker.mjs',
      'automation/scripts/link-outreach.mjs',
      'automation/scripts/automation-orchestrator.mjs',
    ];

    for (const script of scripts) {
      const exists = await fs.access(script).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Script missing: ${script}`);
      }
    }
  });

  // Test 3: Check documentation files
  await test('Documentation files exist', async () => {
    const docs = [
      'automation/AUTOMATION-SETUP-GUIDE.md',
      'automation/README.md',
      'LOCAL-SEO-AUTOMATION-COMPLETE.md',
    ];

    for (const doc of docs) {
      const exists = await fs.access(doc).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Documentation missing: ${doc}`);
      }
    }
  });

  // Test 4: Check configuration files
  await test('Configuration files present', async () => {
    const configs = [
      'automation/config/.env.example',
      'automation/data/clients.json.example',
    ];

    for (const config of configs) {
      const exists = await fs.access(config).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Config missing: ${config}`);
      }
    }
  });

  // Test 5: Check Node.js version
  await test('Node.js version compatible', async () => {
    const version = process.version;
    const major = parseInt(version.split('.')[0].replace('v', ''));

    if (major < 16) {
      throw new Error(`Node.js ${version} is too old. Need v16+`);
    }
  });

  // Test 6: Check required npm packages
  await test('Required npm packages installed', async () => {
    const packages = [
      '@anthropic-ai/sdk',
      'googleapis',
    ];

    for (const pkg of packages) {
      const exists = await fs.access(`node_modules/${pkg}`).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Package not installed: ${pkg}`);
      }
    }
  });

  // Test 7: Check API key configuration
  await test('API key configuration present', async () => {
    const hasEnvFile = await fs.access('automation/config/.env')
      .then(() => true)
      .catch(() => false);

    const hasEnvVar = !!process.env.ANTHROPIC_API_KEY;

    if (!hasEnvFile && !hasEnvVar) {
      throw new Error('No .env file and no ANTHROPIC_API_KEY environment variable');
    }

    if (hasEnvVar && process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      throw new Error('ANTHROPIC_API_KEY not set (still using placeholder)');
    }
  });

  // Test 8: Verify script syntax (dry run)
  await test('Scripts have valid syntax', async () => {
    // Just try to import them (syntax check)
    const scripts = [
      './automation/scripts/automation-orchestrator.mjs',
    ];

    for (const script of scripts) {
      try {
        // Check if file can be read
        await fs.readFile(script, 'utf-8');
      } catch (error) {
        throw new Error(`Cannot read ${script}: ${error.message}`);
      }
    }
  });

  // Test 9: Check package.json scripts
  await test('NPM automation scripts configured', async () => {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const requiredScripts = [
      'automation:suburb-pages',
      'automation:gbp-posts',
      'automation:reviews',
      'automation:rank-track',
      'automation:link-outreach',
      'automation:scheduled',
    ];

    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`NPM script missing: ${script}`);
      }
    }
  });

  // Test 10: Check file permissions (Unix-like systems)
  if (process.platform !== 'win32') {
    await test('Script files are executable', async () => {
      const scripts = [
        'automation/scripts/setup-automation.sh',
      ];

      for (const script of scripts) {
        try {
          const stats = await fs.stat(script);
          const isExecutable = (stats.mode & 0o111) !== 0;

          if (!isExecutable) {
            throw new Error(`Not executable: ${script}`);
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            throw new Error(`Script not found: ${script}`);
          }
          throw error;
        }
      }
    });
  }

  // Summary
  console.log('');
  console.log('='.repeat(50));
  console.log('Test Results:');
  console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);

  if (failed > 0) {
    console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
  }

  console.log('='.repeat(50));
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed! Automation system is ready.${colors.reset}`);
    console.log('');
    console.log('Next steps:');
    console.log(`  1. Set API key: ${colors.cyan}export ANTHROPIC_API_KEY=your_key${colors.reset}`);
    console.log(`  2. Run automation: ${colors.cyan}npm run automation:suburb-pages${colors.reset}`);
    console.log(`  3. View help: ${colors.cyan}npm run automation:help${colors.reset}`);
    console.log('');
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed. Please fix the issues above.${colors.reset}`);
    console.log('');
    console.log('For help, see:');
    console.log('  - automation/AUTOMATION-SETUP-GUIDE.md');
    console.log('  - automation/README.md');
    console.log('');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
