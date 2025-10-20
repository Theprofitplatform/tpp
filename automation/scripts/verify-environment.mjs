#!/usr/bin/env node

/**
 * Environment Verification Script
 *
 * Comprehensive check of all system requirements
 * Run: npm run automation:verify-env
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Track results
const results = {
  passed: [],
  warnings: [],
  failed: [],
  info: []
};

async function checkNodeVersion() {
  const check = { name: 'Node.js Version', category: 'runtime' };

  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    check.actual = version;
    check.required = 'v18.0.0+';

    if (majorVersion >= 18) {
      check.status = 'pass';
      check.message = `${version} ✓`;
      results.passed.push(check);
    } else if (majorVersion >= 16) {
      check.status = 'warning';
      check.message = `${version} (v18+ recommended)`;
      results.warnings.push(check);
    } else {
      check.status = 'fail';
      check.message = `${version} is too old`;
      check.fix = 'Install Node.js v18 or higher from nodejs.org';
      results.failed.push(check);
    }
  } catch (error) {
    check.status = 'fail';
    check.message = 'Could not determine Node.js version';
    results.failed.push(check);
  }
}

async function checkNpmVersion() {
  const check = { name: 'npm Version', category: 'runtime' };

  try {
    const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(version.split('.')[0]);

    check.actual = version;
    check.required = 'v8.0.0+';

    if (majorVersion >= 8) {
      check.status = 'pass';
      check.message = `${version} ✓`;
      results.passed.push(check);
    } else {
      check.status = 'warning';
      check.message = `${version} (v8+ recommended)`;
      results.warnings.push(check);
    }
  } catch (error) {
    check.status = 'fail';
    check.message = 'npm not found';
    check.fix = 'Install npm (comes with Node.js)';
    results.failed.push(check);
  }
}

async function checkAnthropicApiKey() {
  const check = { name: 'Anthropic API Key', category: 'configuration' };

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    if (apiKey.startsWith('sk-ant-')) {
      check.status = 'pass';
      check.message = `Configured (${apiKey.slice(0, 15)}...)`;
      results.passed.push(check);
    } else {
      check.status = 'fail';
      check.message = 'Invalid format (should start with sk-ant-)';
      check.fix = 'Check your API key at console.anthropic.com';
      results.failed.push(check);
    }
  } else {
    check.status = 'fail';
    check.message = 'Not set';
    check.fix = 'export ANTHROPIC_API_KEY=sk-ant-your-key-here';
    results.failed.push(check);
  }
}

async function checkRequiredDependencies() {
  const check = { name: 'NPM Dependencies', category: 'dependencies' };

  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    const required = [
      '@anthropic-ai/sdk',
      'dotenv'
    ];

    const missing = [];
    for (const dep of required) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missing.push(dep);
      }
    }

    if (missing.length === 0) {
      check.status = 'pass';
      check.message = 'All required dependencies installed';
      results.passed.push(check);
    } else {
      check.status = 'fail';
      check.message = `Missing: ${missing.join(', ')}`;
      check.fix = 'Run: npm install';
      results.failed.push(check);
    }
  } catch (error) {
    check.status = 'fail';
    check.message = 'Could not read package.json';
    results.failed.push(check);
  }
}

async function checkRequiredDirectories() {
  const check = { name: 'Required Directories', category: 'filesystem' };

  const requiredDirs = [
    'automation/scripts',
    'automation/data',
    'automation/config',
    'automation/generated',
    'automation/logs',
    'automation/reports',
    'src/content/locations'
  ];

  const missing = [];

  for (const dir of requiredDirs) {
    const dirPath = path.join(PROJECT_ROOT, dir);
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        missing.push(dir);
      }
    } catch {
      missing.push(dir);
    }
  }

  if (missing.length === 0) {
    check.status = 'pass';
    check.message = `All ${requiredDirs.length} directories present`;
    results.passed.push(check);
  } else {
    check.status = 'fail';
    check.message = `Missing: ${missing.join(', ')}`;
    check.fix = 'Run: npm run automation:setup';
    results.failed.push(check);
  }
}

async function checkRequiredFiles() {
  const check = { name: 'Required Files', category: 'filesystem' };

  const requiredFiles = [
    'automation/scripts/generate-suburb-pages.mjs',
    'automation/scripts/gbp-auto-poster.mjs',
    'automation/scripts/automation-orchestrator.mjs',
    'automation/scripts/vps-monitor.sh',
    'automation/scripts/health-dashboard.mjs'
  ];

  const missing = [];

  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    try {
      await fs.access(filePath);
    } catch {
      missing.push(file);
    }
  }

  if (missing.length === 0) {
    check.status = 'pass';
    check.message = `All ${requiredFiles.length} core scripts present`;
    results.passed.push(check);
  } else {
    check.status = 'fail';
    check.message = `Missing: ${missing.join(', ')}`;
    check.fix = 'Restore from backup or reinstall system';
    results.failed.push(check);
  }
}

async function checkDiskSpace() {
  const check = { name: 'Disk Space', category: 'system' };

  try {
    const output = execSync(`df -h "${PROJECT_ROOT}"`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    const dataLine = lines[1];
    const parts = dataLine.split(/\s+/);
    const usagePercent = parseInt(parts[4]);

    check.actual = `${usagePercent}% used`;
    check.required = '< 80%';

    if (usagePercent < 80) {
      check.status = 'pass';
      check.message = `${usagePercent}% used ✓`;
      results.passed.push(check);
    } else if (usagePercent < 90) {
      check.status = 'warning';
      check.message = `${usagePercent}% used (consider cleanup)`;
      check.fix = 'Run: npm run automation:backup then clean old files';
      results.warnings.push(check);
    } else {
      check.status = 'fail';
      check.message = `${usagePercent}% used (critical)`;
      check.fix = 'Clean up old files immediately';
      results.failed.push(check);
    }
  } catch (error) {
    check.status = 'info';
    check.message = 'Could not check (Windows or non-Unix system)';
    results.info.push(check);
  }
}

async function checkMemory() {
  const check = { name: 'Available Memory', category: 'system' };

  try {
    const output = execSync('free -m', { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    const memLine = lines[1];
    const parts = memLine.split(/\s+/);
    const total = parseInt(parts[1]);
    const used = parseInt(parts[2]);
    const usagePercent = Math.round((used / total) * 100);

    check.actual = `${usagePercent}% used (${used}MB / ${total}MB)`;
    check.required = '< 85%';

    if (usagePercent < 85) {
      check.status = 'pass';
      check.message = `${usagePercent}% used ✓`;
      results.passed.push(check);
    } else {
      check.status = 'warning';
      check.message = `${usagePercent}% used (high memory usage)`;
      check.fix = 'Consider restarting system or closing applications';
      results.warnings.push(check);
    }
  } catch (error) {
    check.status = 'info';
    check.message = 'Could not check (Windows or non-Unix system)';
    results.info.push(check);
  }
}

async function checkGitInstalled() {
  const check = { name: 'Git', category: 'optional' };

  try {
    const version = execSync('git --version', { encoding: 'utf-8' }).trim();
    check.status = 'pass';
    check.message = `${version} ✓`;
    results.passed.push(check);
  } catch {
    check.status = 'info';
    check.message = 'Not installed (optional but recommended)';
    check.fix = 'Install Git for version control';
    results.info.push(check);
  }
}

async function checkDocumentation() {
  const check = { name: 'Documentation Files', category: 'documentation' };

  const importantDocs = [
    '🚀-START-AUTOMATION.md',
    'automation/README-START-HERE.md',
    'automation/INDEX.md',
    'automation/QUICK-REFERENCE.md',
    'automation/SYSTEM-OVERVIEW.md'
  ];

  const missing = [];

  for (const doc of importantDocs) {
    const docPath = path.join(PROJECT_ROOT, doc);
    try {
      await fs.access(docPath);
    } catch {
      missing.push(doc);
    }
  }

  if (missing.length === 0) {
    check.status = 'pass';
    check.message = `All ${importantDocs.length} key docs present`;
    results.passed.push(check);
  } else {
    check.status = 'warning';
    check.message = `Missing: ${missing.join(', ')}`;
    check.fix = 'Documentation may be incomplete';
    results.warnings.push(check);
  }
}

async function checkDataFiles() {
  const check = { name: 'Data Files', category: 'configuration' };

  const statusFile = path.join(PROJECT_ROOT, 'automation/data/automation-status.json');
  const clientsFile = path.join(PROJECT_ROOT, 'automation/data/clients.json');

  const issues = [];

  try {
    await fs.access(statusFile);
  } catch {
    issues.push('automation-status.json missing');
  }

  try {
    await fs.access(clientsFile);
  } catch {
    issues.push('clients.json missing (optional)');
  }

  if (issues.length === 0) {
    check.status = 'pass';
    check.message = 'Data files present';
    results.passed.push(check);
  } else {
    check.status = 'info';
    check.message = issues.join(', ');
    check.fix = 'Run automations to create status.json; copy clients.json.example for reviews';
    results.info.push(check);
  }
}

async function displayResults() {
  console.log('\n' + colorize('═'.repeat(70), 'blue'));
  console.log(colorize('  🔍 ENVIRONMENT VERIFICATION REPORT', 'bold'));
  console.log(colorize('═'.repeat(70), 'blue') + '\n');

  // Summary
  const total = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = Math.round((results.passed.length / total) * 100);

  console.log(colorize('📊 Summary:', 'cyan'));
  console.log(`  ${colorize('✓', 'green')} Passed: ${results.passed.length}`);
  console.log(`  ${colorize('⚠', 'yellow')} Warnings: ${results.warnings.length}`);
  console.log(`  ${colorize('✗', 'red')} Failed: ${results.failed.length}`);
  console.log(`  ${colorize('ℹ', 'blue')} Info: ${results.info.length}`);
  console.log(`  ${colorize('Score:', 'bold')} ${passRate}%\n`);

  // Display by category
  const categories = {
    runtime: 'Runtime Environment',
    dependencies: 'Dependencies',
    configuration: 'Configuration',
    filesystem: 'File System',
    system: 'System Resources',
    optional: 'Optional Tools',
    documentation: 'Documentation'
  };

  for (const [key, title] of Object.entries(categories)) {
    const categoryChecks = [
      ...results.passed.filter(c => c.category === key),
      ...results.warnings.filter(c => c.category === key),
      ...results.failed.filter(c => c.category === key),
      ...results.info.filter(c => c.category === key)
    ];

    if (categoryChecks.length > 0) {
      console.log(colorize(`${title}:`, 'cyan'));
      console.log(colorize('─'.repeat(70), 'gray'));

      for (const check of categoryChecks) {
        const icon = check.status === 'pass' ? colorize('✓', 'green') :
                     check.status === 'warning' ? colorize('⚠', 'yellow') :
                     check.status === 'fail' ? colorize('✗', 'red') :
                     colorize('ℹ', 'blue');

        console.log(`  ${icon} ${check.name}: ${check.message}`);

        if (check.fix) {
          console.log(`    ${colorize('Fix:', 'yellow')} ${check.fix}`);
        }
      }

      console.log('');
    }
  }

  // Action items
  if (results.failed.length > 0) {
    console.log(colorize('⚠️  ACTION REQUIRED:', 'red'));
    console.log(colorize('─'.repeat(70), 'gray'));
    results.failed.forEach((check, i) => {
      console.log(`  ${i + 1}. ${check.name}: ${check.fix || check.message}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0 && results.failed.length === 0) {
    console.log(colorize('💡 Recommendations:', 'yellow'));
    console.log(colorize('─'.repeat(70), 'gray'));
    results.warnings.forEach((check, i) => {
      console.log(`  ${i + 1}. ${check.name}: ${check.fix || check.message}`);
    });
    console.log('');
  }

  // Next steps
  console.log(colorize('🚀 Next Steps:', 'cyan'));
  console.log(colorize('─'.repeat(70), 'gray'));

  if (results.failed.length > 0) {
    console.log('  1. Fix failed checks listed above');
    console.log('  2. Run verification again: npm run automation:verify-env');
    console.log('  3. Then run tests: npm run automation:test');
  } else if (results.warnings.length > 0) {
    console.log('  1. Review warnings (optional improvements)');
    console.log('  2. Run tests: npm run automation:test');
    console.log('  3. Start using: npm run automation:wizard');
  } else {
    console.log(colorize('  ✅ Environment is ready!', 'green'));
    console.log('  1. Run tests: npm run automation:test');
    console.log('  2. Generate content: npm run automation:wizard');
    console.log('  3. Check status: npm run automation:status:quick');
  }

  console.log('\n' + colorize('═'.repeat(70), 'blue') + '\n');

  // Exit code
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

async function runVerification() {
  console.log(colorize('\nRunning environment verification...', 'blue'));
  console.log(colorize('This may take a few seconds.\n', 'gray'));

  // Run all checks
  await checkNodeVersion();
  await checkNpmVersion();
  await checkAnthropicApiKey();
  await checkRequiredDependencies();
  await checkRequiredDirectories();
  await checkRequiredFiles();
  await checkDiskSpace();
  await checkMemory();
  await checkGitInstalled();
  await checkDocumentation();
  await checkDataFiles();

  // Display results
  await displayResults();
}

runVerification().catch(error => {
  console.error(colorize('\nVerification error:', 'red'), error.message);
  process.exit(1);
});
