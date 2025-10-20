#!/usr/bin/env node

/**
 * API Cost Calculator
 *
 * Estimates Anthropic API costs for automation runs
 * Run: npm run automation:cost-estimate
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Anthropic pricing (as of Jan 2025)
const PRICING = {
  inputTokens: 3,   // $3 per million
  outputTokens: 15  // $15 per million
};

// Average token usage per automation
const TOKEN_USAGE = {
  'suburb-pages': {
    name: 'Suburb Page Generation',
    inputPerItem: 2000,
    outputPerItem: 1200,
    description: '1 suburb page (600-800 words)'
  },
  'gbp-posts': {
    name: 'GBP Posts',
    inputPerItem: 1500,
    outputPerItem: 500,
    description: '1 GBP post (150-250 characters)'
  },
  'link-outreach': {
    name: 'Link Outreach Emails',
    inputPerItem: 1800,
    outputPerItem: 900,
    description: '1 personalized outreach email'
  },
  'blog-post': {
    name: 'Blog Post',
    inputPerItem: 2500,
    outputPerItem: 2000,
    description: '1 blog post (1,200-1,500 words)'
  },
  'social-captions': {
    name: 'Social Media Captions',
    inputPerItem: 1000,
    outputPerItem: 400,
    description: '1 social media caption'
  }
};

function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000000) * PRICING.inputTokens;
  const outputCost = (outputTokens / 1000000) * PRICING.outputTokens;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost
  };
}

function formatCurrency(amount) {
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  return `$${amount.toFixed(2)}`;
}

async function interactiveCalculator() {
  console.log('\n' + colorize('═'.repeat(60), 'blue'));
  console.log(colorize('  💰 API COST CALCULATOR', 'bold'));
  console.log(colorize('═'.repeat(60), 'blue'));
  console.log(colorize('\n  Anthropic Claude Pricing:', 'cyan'));
  console.log(colorize(`  • Input tokens:  $${PRICING.inputTokens}/million`, 'green'));
  console.log(colorize(`  • Output tokens: $${PRICING.outputTokens}/million`, 'green'));
  console.log(colorize('═'.repeat(60), 'blue') + '\n');

  // Show automation options
  console.log(colorize('Available Automations:', 'cyan'));
  console.log(colorize('─'.repeat(60), 'yellow'));

  Object.entries(TOKEN_USAGE).forEach(([key, data], index) => {
    console.log(`${index + 1}. ${colorize(data.name, 'green')} - ${data.description}`);
  });

  console.log('6. Custom calculation');
  console.log('7. Monthly cost estimate');
  console.log(colorize('─'.repeat(60), 'yellow'));

  const choice = await question('\nSelect option (1-7): ');

  if (choice === '7') {
    await monthlyEstimate();
    rl.close();
    return;
  }

  if (choice === '6') {
    await customCalculation();
    rl.close();
    return;
  }

  const automationKeys = Object.keys(TOKEN_USAGE);
  const selectedKey = automationKeys[parseInt(choice) - 1];

  if (!selectedKey) {
    console.log(colorize('\n❌ Invalid choice', 'red'));
    rl.close();
    return;
  }

  const automation = TOKEN_USAGE[selectedKey];

  const quantity = await question(`\nHow many ${automation.description}s to generate? `);
  const qty = parseInt(quantity);

  if (isNaN(qty) || qty <= 0) {
    console.log(colorize('\n❌ Invalid quantity', 'red'));
    rl.close();
    return;
  }

  const totalInputTokens = automation.inputPerItem * qty;
  const totalOutputTokens = automation.outputPerItem * qty;
  const costs = calculateCost(totalInputTokens, totalOutputTokens);

  console.log('\n' + colorize('═'.repeat(60), 'blue'));
  console.log(colorize(`  📊 COST ESTIMATE: ${automation.name}`, 'bold'));
  console.log(colorize('═'.repeat(60), 'blue'));
  console.log(colorize('\nToken Usage:', 'cyan'));
  console.log(`  Input tokens:  ${totalInputTokens.toLocaleString()}`);
  console.log(`  Output tokens: ${totalOutputTokens.toLocaleString()}`);
  console.log(`  Total tokens:  ${(totalInputTokens + totalOutputTokens).toLocaleString()}`);

  console.log(colorize('\nCost Breakdown:', 'cyan'));
  console.log(`  Input cost:   ${formatCurrency(costs.inputCost)}`);
  console.log(`  Output cost:  ${formatCurrency(costs.outputCost)}`);
  console.log(colorize(`  Total cost:   ${formatCurrency(costs.totalCost)}`, 'green'));

  console.log(colorize('\nPer Item:', 'cyan'));
  console.log(`  Cost per ${automation.description}: ${formatCurrency(costs.totalCost / qty)}`);

  // Show comparison to manual work
  const manualTime = getManualTime(selectedKey, qty);
  if (manualTime) {
    const manualCost = (manualTime.hours * 50); // $50/hr
    const savings = manualCost - costs.totalCost;
    const roi = ((savings / costs.totalCost) * 100).toFixed(0);

    console.log(colorize('\nROI Analysis:', 'cyan'));
    console.log(`  Manual time:     ${manualTime.hours} hours @ $50/hr`);
    console.log(`  Manual cost:     $${manualCost.toFixed(2)}`);
    console.log(`  Automation cost: ${formatCurrency(costs.totalCost)}`);
    console.log(colorize(`  Savings:         $${savings.toFixed(2)}`, 'green'));
    console.log(colorize(`  ROI:             ${roi}%`, 'green'));
  }

  console.log('\n' + colorize('═'.repeat(60), 'blue') + '\n');

  rl.close();
}

async function customCalculation() {
  console.log('\n' + colorize('Custom Calculation', 'cyan'));

  const inputTokens = parseInt(await question('Input tokens: '));
  const outputTokens = parseInt(await question('Output tokens: '));

  if (isNaN(inputTokens) || isNaN(outputTokens)) {
    console.log(colorize('\n❌ Invalid token amounts', 'red'));
    return;
  }

  const costs = calculateCost(inputTokens, outputTokens);

  console.log(colorize('\nCost Breakdown:', 'cyan'));
  console.log(`  Input cost:   ${formatCurrency(costs.inputCost)}`);
  console.log(`  Output cost:  ${formatCurrency(costs.outputCost)}`);
  console.log(colorize(`  Total cost:   ${formatCurrency(costs.totalCost)}`, 'green'));
  console.log('');
}

async function monthlyEstimate() {
  console.log('\n' + colorize('═'.repeat(60), 'blue'));
  console.log(colorize('  📅 MONTHLY COST ESTIMATE', 'bold'));
  console.log(colorize('═'.repeat(60), 'blue') + '\n');

  console.log(colorize('Enter monthly usage (press Enter for recommended):', 'cyan'));
  console.log(colorize('─'.repeat(60), 'yellow'));

  // Get quantities for each automation
  const usage = {};

  for (const [key, data] of Object.entries(TOKEN_USAGE)) {
    const recommended = getRecommendedMonthly(key);
    const qty = await question(`  ${data.name} [default: ${recommended}]: `);
    usage[key] = parseInt(qty) || recommended;
  }

  // Calculate total cost
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const breakdowns = [];

  for (const [key, qty] of Object.entries(usage)) {
    const automation = TOKEN_USAGE[key];
    const inputTokens = automation.inputPerItem * qty;
    const outputTokens = automation.outputPerItem * qty;

    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;

    const costs = calculateCost(inputTokens, outputTokens);
    breakdowns.push({
      name: automation.name,
      quantity: qty,
      cost: costs.totalCost
    });
  }

  const totalCosts = calculateCost(totalInputTokens, totalOutputTokens);

  console.log('\n' + colorize('═'.repeat(60), 'blue'));
  console.log(colorize('  📊 MONTHLY COST BREAKDOWN', 'bold'));
  console.log(colorize('═'.repeat(60), 'blue') + '\n');

  breakdowns.forEach(item => {
    const costStr = formatCurrency(item.cost).padStart(10);
    console.log(`  ${item.name.padEnd(30)} ${item.quantity.toString().padStart(3)} × ${costStr}`);
  });

  console.log(colorize('  ' + '─'.repeat(56), 'yellow'));
  console.log(colorize(`  ${'Monthly Total'.padEnd(40)} ${formatCurrency(totalCosts.totalCost).padStart(10)}`, 'green'));

  // Annual projection
  const annualCost = totalCosts.totalCost * 12;
  console.log(colorize(`  ${'Annual Projection'.padEnd(40)} ${formatCurrency(annualCost).padStart(10)}`, 'blue'));

  // ROI
  const manualHours = getMonthlyManualHours();
  const manualCost = manualHours * 50;
  const savings = manualCost - totalCosts.totalCost;
  const roi = ((savings / totalCosts.totalCost) * 100).toFixed(0);

  console.log(colorize('\n  💰 ROI ANALYSIS', 'cyan'));
  console.log(colorize('  ' + '─'.repeat(56), 'yellow'));
  console.log(`  ${'Manual time'.padEnd(40)} ${manualHours.toFixed(1)} hours/month`);
  console.log(`  ${'Manual cost @ $50/hr'.padEnd(40)} ${formatCurrency(manualCost).padStart(10)}`);
  console.log(`  ${'Automation cost'.padEnd(40)} ${formatCurrency(totalCosts.totalCost).padStart(10)}`);
  console.log(colorize(`  ${'Monthly savings'.padEnd(40)} ${formatCurrency(savings).padStart(10)}`, 'green'));
  console.log(colorize(`  ${'Annual savings'.padEnd(40)} ${formatCurrency(savings * 12).padStart(10)}`, 'green'));
  console.log(colorize(`  ${'ROI'.padEnd(40)} ${roi}%`.padStart(50), 'green'));

  console.log('\n' + colorize('═'.repeat(60), 'blue') + '\n');
}

function getRecommendedMonthly(automationType) {
  const recommendations = {
    'suburb-pages': 10,
    'gbp-posts': 48,     // 12 posts × 4 weeks
    'link-outreach': 10,
    'blog-post': 4,
    'social-captions': 20
  };
  return recommendations[automationType] || 0;
}

function getManualTime(automationType, quantity) {
  const timePerItem = {
    'suburb-pages': 12.5,      // hours
    'gbp-posts': 0.25,         // hours (15 min)
    'link-outreach': 0.5,      // hours (30 min)
    'blog-post': 2.5,          // hours
    'social-captions': 0.25    // hours (15 min)
  };

  const hours = (timePerItem[automationType] || 0) * quantity;

  return hours > 0 ? { hours } : null;
}

function getMonthlyManualHours() {
  // Based on recommended monthly usage
  return (
    10 * 12.5 +   // Suburb pages
    48 * 0.25 +   // GBP posts
    10 * 0.5 +    // Link outreach
    4 * 2.5 +     // Blog posts
    20 * 0.25     // Social captions
  ); // = ~148 hours
}

// Run the calculator
interactiveCalculator().catch(error => {
  console.error(colorize('Error:', 'red'), error.message);
  rl.close();
  process.exit(1);
});
