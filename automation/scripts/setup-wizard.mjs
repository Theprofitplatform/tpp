#!/usr/bin/env node

/**
 * Interactive Setup Wizard
 * Guides users through automation system setup
 */

import fs from 'fs/promises';
import readline from 'readline';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const CONFIG = {
  envFile: './automation/config/.env',
  envExample: './automation/config/.env.example',
  clientsFile: './automation/data/clients.json',
  clientsExample: './automation/data/clients.json.example',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Print header
 */
function printHeader() {
  console.clear();
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║                                                ║');
  console.log('║      🤖 SEO Automation Setup Wizard            ║');
  console.log('║                                                ║');
  console.log('║      The Profit Platform                       ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(colors.reset);
  console.log('');
}

/**
 * Print step header
 */
function printStep(step, total, title) {
  console.log('');
  console.log(`${colors.bright}${colors.cyan}[Step ${step}/${total}] ${title}${colors.reset}`);
  console.log('─'.repeat(50));
}

/**
 * Print success
 */
function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Print info
 */
function printInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Print warning
 */
function printWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Print error
 */
function printError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

/**
 * Check if API key is already set
 */
async function checkExistingApiKey() {
  // Check environment variable
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // Check .env file
  try {
    const envContent = await fs.readFile(CONFIG.envFile, 'utf-8');
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match && match[1] && !match[1].includes('your_')) {
      return match[1].trim();
    }
  } catch (error) {
    // .env doesn't exist yet
  }

  return null;
}

/**
 * Step 1: API Key Setup
 */
async function setupApiKey() {
  printStep(1, 5, 'API Key Configuration');

  const existingKey = await checkExistingApiKey();

  if (existingKey) {
    printSuccess(`API key already configured: ${existingKey.substring(0, 15)}...`);
    const change = await question(`\n${colors.cyan}Do you want to update it? (y/N): ${colors.reset}`);

    if (change.toLowerCase() !== 'y') {
      return existingKey;
    }
  }

  console.log('');
  printInfo('You need an Anthropic API key to use Claude AI.');
  printInfo('Get your key at: https://console.anthropic.com/');
  console.log('');

  let apiKey = '';
  while (!apiKey || apiKey.length < 10) {
    apiKey = await question(`${colors.cyan}Enter your Anthropic API key: ${colors.reset}`);

    if (!apiKey || apiKey.length < 10) {
      printWarning('Please enter a valid API key (starts with sk-ant-)');
    }
  }

  // Save to .env file
  try {
    let envContent = '';
    try {
      envContent = await fs.readFile(CONFIG.envExample, 'utf-8');
    } catch (error) {
      envContent = `# Automation Environment Variables
# Copy this file to .env and fill in your values

# Anthropic API Key (Required)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Search Console (Optional - for rank tracking)
# Path to your service account credentials JSON
# GOOGLE_APPLICATION_CREDENTIALS=./automation/config/gsc-credentials.json

# Email Configuration (Optional - for automated sending)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your@email.com
# SMTP_PASS=your_password
`;
    }

    // Replace API key in template
    envContent = envContent.replace(/ANTHROPIC_API_KEY=.+/, `ANTHROPIC_API_KEY=${apiKey}`);

    await fs.writeFile(CONFIG.envFile, envContent);
    printSuccess('API key saved to automation/config/.env');

    // Also set in current environment
    process.env.ANTHROPIC_API_KEY = apiKey;
    printSuccess('API key set in current session');

    return apiKey;
  } catch (error) {
    printError(`Failed to save API key: ${error.message}`);
    printInfo('You can manually set it: export ANTHROPIC_API_KEY=your_key');
    return apiKey;
  }
}

/**
 * Step 2: Verify System
 */
async function verifySystem() {
  printStep(2, 5, 'System Verification');

  console.log('');
  printInfo('Running system tests...');
  console.log('');

  try {
    const { stdout } = await execAsync('npm run automation:test');
    console.log(stdout);
    printSuccess('All tests passed!');
    return true;
  } catch (error) {
    printError('Some tests failed. Please check the output above.');
    printWarning('You may continue, but some features might not work.');

    const continueSetup = await question(`\n${colors.cyan}Continue anyway? (y/N): ${colors.reset}`);
    return continueSetup.toLowerCase() === 'y';
  }
}

/**
 * Step 3: Configure Clients (Optional)
 */
async function configureClients() {
  printStep(3, 5, 'Client Configuration (Optional)');

  console.log('');
  printInfo('Client data is used for automated review requests.');
  printInfo('You can skip this and configure it later.');
  console.log('');

  const configure = await question(`${colors.cyan}Do you want to configure clients now? (y/N): ${colors.reset}`);

  if (configure.toLowerCase() !== 'y') {
    printInfo('Skipped. You can configure clients later in automation/data/clients.json');
    return false;
  }

  // Check if clients.json already exists
  try {
    await fs.access(CONFIG.clientsFile);
    printInfo('clients.json already exists.');

    const overwrite = await question(`${colors.cyan}Overwrite with example data? (y/N): ${colors.reset}`);
    if (overwrite.toLowerCase() !== 'y') {
      return false;
    }
  } catch (error) {
    // File doesn't exist, that's fine
  }

  // Copy example file
  try {
    const exampleContent = await fs.readFile(CONFIG.clientsExample, 'utf-8');
    await fs.writeFile(CONFIG.clientsFile, exampleContent);
    printSuccess('Created clients.json with example data');
    printInfo('Edit automation/data/clients.json to add your real clients');
    return true;
  } catch (error) {
    printError(`Failed to create clients.json: ${error.message}`);
    return false;
  }
}

/**
 * Step 4: Run First Automation
 */
async function runFirstAutomation() {
  printStep(4, 5, 'Test Run (Optional)');

  console.log('');
  printInfo('Would you like to test the automation by generating content?');
  console.log('');
  console.log('Options:');
  console.log('  1) Generate GBP posts (12 posts, ~30 seconds, ~$0.30)');
  console.log('  2) Generate 1 suburb page (1 page, ~5 seconds, ~$0.05)');
  console.log('  3) Skip for now');
  console.log('');

  const choice = await question(`${colors.cyan}Choose an option (1/2/3): ${colors.reset}`);

  if (choice === '1') {
    console.log('');
    printInfo('Generating 12 GBP posts...');
    console.log('');

    try {
      const { stdout } = await execAsync('npm run automation:gbp-posts');
      console.log(stdout);
      printSuccess('GBP posts generated! Check automation/generated/gbp-posts/');
      return true;
    } catch (error) {
      printError(`Generation failed: ${error.message}`);
      return false;
    }
  } else if (choice === '2') {
    console.log('');
    printInfo('Generating 1 test suburb page...');
    printInfo('Note: The script generates 10 by default, but you can stop after 1');
    console.log('');

    const confirm = await question(`${colors.cyan}Continue? (y/N): ${colors.reset}`);
    if (confirm.toLowerCase() !== 'y') {
      return false;
    }

    try {
      // Run in background and let user stop it
      printInfo('Starting generation... Press Ctrl+C after first page to stop');
      const { stdout } = await execAsync('npm run automation:suburb-pages', { timeout: 60000 });
      console.log(stdout);
      printSuccess('Suburb pages generated! Check src/content/locations/');
      return true;
    } catch (error) {
      if (error.killed) {
        printInfo('Generation stopped by user');
        return true;
      }
      printError(`Generation failed: ${error.message}`);
      return false;
    }
  } else {
    printInfo('Skipped. You can run automations later with npm run automation:list');
    return false;
  }
}

/**
 * Step 5: Next Steps
 */
async function showNextSteps() {
  printStep(5, 5, 'Setup Complete! 🎉');

  console.log('');
  printSuccess('Your automation system is ready to use!');
  console.log('');
  console.log(`${colors.bright}Quick Start Commands:${colors.reset}`);
  console.log('');
  console.log('  📊 Check system health:');
  console.log(`     ${colors.cyan}npm run automation:monitor${colors.reset}`);
  console.log('');
  console.log('  📈 Generate health dashboard:');
  console.log(`     ${colors.cyan}npm run automation:health${colors.reset}`);
  console.log('');
  console.log('  🏙️  Generate suburb pages:');
  console.log(`     ${colors.cyan}npm run automation:suburb-pages${colors.reset}`);
  console.log('');
  console.log('  📱 Generate GBP posts:');
  console.log(`     ${colors.cyan}npm run automation:gbp-posts${colors.reset}`);
  console.log('');
  console.log('  📋 List all automations:');
  console.log(`     ${colors.cyan}npm run automation:list${colors.reset}`);
  console.log('');
  console.log('  ❓ Get help:');
  console.log(`     ${colors.cyan}npm run automation:help${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}Documentation:${colors.reset}`);
  console.log('');
  console.log(`  ⚡ Quick Start Tutorial: ${colors.yellow}AUTOMATION-QUICK-START.md${colors.reset}`);
  console.log(`  📚 Complete Workflows: ${colors.yellow}automation/WORKFLOW-GUIDE.md${colors.reset}`);
  console.log(`  🏥 Monitoring Guide: ${colors.yellow}automation/MONITORING-GUIDE.md${colors.reset}`);
  console.log(`  📖 Master Index: ${colors.yellow}automation/INDEX.md${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}Recommended Next Steps:${colors.reset}`);
  console.log('');
  console.log('  1. Read the Quick Start Tutorial (10 minutes)');
  console.log('  2. Run a health check to verify everything');
  console.log('  3. Generate your first batch of content');
  console.log('  4. Set up cron job for automated scheduling');
  console.log('');

  const openDocs = await question(`${colors.cyan}Would you like to open the Quick Start guide? (y/N): ${colors.reset}`);

  if (openDocs.toLowerCase() === 'y') {
    try {
      // Try to open based on platform
      const platform = process.platform;
      let command;

      if (platform === 'darwin') {
        command = 'open AUTOMATION-QUICK-START.md';
      } else if (platform === 'win32') {
        command = 'start AUTOMATION-QUICK-START.md';
      } else {
        command = 'xdg-open AUTOMATION-QUICK-START.md';
      }

      await execAsync(command);
      printSuccess('Opening Quick Start guide...');
    } catch (error) {
      printInfo('Please manually open: AUTOMATION-QUICK-START.md');
    }
  }

  console.log('');
  printSuccess('Setup wizard complete! Happy automating! 🚀');
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  try {
    printHeader();

    console.log(`${colors.bright}Welcome to the SEO Automation Setup Wizard!${colors.reset}`);
    console.log('');
    console.log('This wizard will help you:');
    console.log('  • Configure your API key');
    console.log('  • Verify system requirements');
    console.log('  • Set up client data (optional)');
    console.log('  • Run your first automation (optional)');
    console.log('');

    const start = await question(`${colors.cyan}Ready to start? (Y/n): ${colors.reset}`);

    if (start.toLowerCase() === 'n') {
      console.log('');
      printInfo('Setup cancelled. Run again anytime with: npm run automation:wizard');
      process.exit(0);
    }

    // Step 1: API Key
    const apiKey = await setupApiKey();

    // Step 2: Verify System
    const systemOk = await verifySystem();

    if (!systemOk) {
      const forceStop = await question(`\n${colors.cyan}Setup failed. Exit? (Y/n): ${colors.reset}`);
      if (forceStop.toLowerCase() !== 'n') {
        printError('Setup incomplete. Please fix issues and try again.');
        process.exit(1);
      }
    }

    // Step 3: Configure Clients
    await configureClients();

    // Step 4: Test Run
    await runFirstAutomation();

    // Step 5: Next Steps
    await showNextSteps();

  } catch (error) {
    console.log('');
    printError(`Setup wizard error: ${error.message}`);
    console.log('');
    printInfo('You can still configure manually by following: AUTOMATION-QUICK-START.md');
  } finally {
    rl.close();
  }
}

// Run wizard
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
