#!/usr/bin/env node

/**
 * API Usage & Cost Tracker
 *
 * Tracks API usage and estimated costs
 * Features:
 * - Token consumption tracking
 * - Cost calculation
 * - Budget alerts
 * - Monthly reporting
 *
 * Usage:
 *   import { UsageTracker } from './automation/lib/usage-tracker.mjs';
 *
 *   const tracker = new UsageTracker();
 *   const response = await anthropic.messages.create({...});
 *   await tracker.track('suburb-pages', response.usage);
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USAGE_FILE = path.resolve(__dirname, '../data/api-usage.json');

// Anthropic pricing (as of Jan 2025)
const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3 / 1000000,   // $3 per million tokens
    output: 15 / 1000000,  // $15 per million tokens
  },
  'claude-3-5-sonnet-20241022': {
    input: 3 / 1000000,
    output: 15 / 1000000,
  },
  'claude-3-5-haiku-20241022': {
    input: 1 / 1000000,   // $1 per million tokens
    output: 5 / 1000000,   // $5 per million tokens
  },
};

export class UsageTracker {
  constructor(options = {}) {
    this.usageFile = options.usageFile || USAGE_FILE;
    this.budget = parseFloat(process.env.MONTHLY_API_BUDGET) || 100;
    this.alertThreshold = options.alertThreshold || 0.8; // Alert at 80%
  }

  /**
   * Calculate cost for API usage
   */
  calculateCost(inputTokens, outputTokens, model) {
    const pricing = PRICING[model] || PRICING['claude-sonnet-4-20250514'];

    const inputCost = inputTokens * pricing.input;
    const outputCost = outputTokens * pricing.output;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  /**
   * Track API usage
   */
  async track(scriptName, usage, model = 'claude-sonnet-4-20250514') {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;

    const costs = this.calculateCost(inputTokens, outputTokens, model);

    const entry = {
      timestamp: new Date().toISOString(),
      script: scriptName,
      model,
      ...costs,
    };

    // Load existing usage
    let history = [];
    try {
      const content = await fs.readFile(this.usageFile, 'utf-8');
      history = JSON.parse(content);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Failed to load usage file:', error.message);
      }
    }

    // Add new entry
    history.push(entry);

    // Save updated usage
    try {
      await fs.mkdir(path.dirname(this.usageFile), { recursive: true });
      await fs.writeFile(this.usageFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to save usage:', error.message);
    }

    // Check budget
    const monthlySpend = await this.getMonthlySpend(history);
    const percentUsed = (monthlySpend / this.budget) * 100;

    if (percentUsed >= this.alertThreshold * 100) {
      console.warn(`\n⚠️  WARNING: ${percentUsed.toFixed(1)}% of monthly API budget used ($${monthlySpend.toFixed(2)}/$${this.budget})`);

      if (percentUsed >= 100) {
        console.error(`🚨 BUDGET EXCEEDED! $${(monthlySpend - this.budget).toFixed(2)} over budget`);
      }
    }

    return entry;
  }

  /**
   * Get monthly spending
   */
  async getMonthlySpend(history = null) {
    if (!history) {
      try {
        const content = await fs.readFile(this.usageFile, 'utf-8');
        history = JSON.parse(content);
      } catch (error) {
        return 0;
      }
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return history
      .filter(entry => new Date(entry.timestamp) >= monthStart)
      .reduce((sum, entry) => sum + entry.totalCost, 0);
  }

  /**
   * Get usage statistics
   */
  async getStats(days = 30) {
    try {
      const content = await fs.readFile(this.usageFile, 'utf-8');
      const history = JSON.parse(content);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const recentUsage = history.filter(
        entry => new Date(entry.timestamp) >= cutoff
      );

      if (recentUsage.length === 0) {
        return {
          totalCost: 0,
          totalTokens: 0,
          requestCount: 0,
          avgCostPerRequest: 0,
          byScript: {},
          byModel: {},
        };
      }

      // Aggregate by script
      const byScript = {};
      recentUsage.forEach(entry => {
        if (!byScript[entry.script]) {
          byScript[entry.script] = {
            requests: 0,
            tokens: 0,
            cost: 0,
          };
        }
        byScript[entry.script].requests++;
        byScript[entry.script].tokens += entry.totalTokens;
        byScript[entry.script].cost += entry.totalCost;
      });

      // Aggregate by model
      const byModel = {};
      recentUsage.forEach(entry => {
        if (!byModel[entry.model]) {
          byModel[entry.model] = {
            requests: 0,
            tokens: 0,
            cost: 0,
          };
        }
        byModel[entry.model].requests++;
        byModel[entry.model].tokens += entry.totalTokens;
        byModel[entry.model].cost += entry.totalCost;
      });

      const totalCost = recentUsage.reduce((sum, e) => sum + e.totalCost, 0);
      const totalTokens = recentUsage.reduce((sum, e) => sum + e.totalTokens, 0);

      return {
        days,
        totalCost,
        totalTokens,
        requestCount: recentUsage.length,
        avgCostPerRequest: totalCost / recentUsage.length,
        avgTokensPerRequest: totalTokens / recentUsage.length,
        byScript,
        byModel,
      };

    } catch (error) {
      return {
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        avgCostPerRequest: 0,
        byScript: {},
        byModel: {},
      };
    }
  }

  /**
   * Generate usage report
   */
  async generateReport(days = 30) {
    const stats = await this.getStats(days);
    const monthlySpend = await this.getMonthlySpend();

    console.log('\n' + '═'.repeat(60));
    console.log('📊 API USAGE REPORT');
    console.log('═'.repeat(60));
    console.log(`\nPeriod: Last ${days} days`);
    console.log(`Total Cost: $${stats.totalCost.toFixed(4)}`);
    console.log(`Total Tokens: ${stats.totalTokens.toLocaleString()}`);
    console.log(`Total Requests: ${stats.requestCount}`);
    console.log(`Avg Cost/Request: $${stats.avgCostPerRequest?.toFixed(4) || '0.0000'}`);

    console.log('\n📈 Monthly Budget:');
    const percentUsed = (monthlySpend / this.budget) * 100;
    const barLength = 40;
    const filled = Math.floor((percentUsed / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(`[${bar}] ${percentUsed.toFixed(1)}%`);
    console.log(`Spent: $${monthlySpend.toFixed(2)} / $${this.budget.toFixed(2)}`);
    console.log(`Remaining: $${(this.budget - monthlySpend).toFixed(2)}`);

    if (Object.keys(stats.byScript).length > 0) {
      console.log('\n📝 By Script:');
      Object.entries(stats.byScript)
        .sort((a, b) => b[1].cost - a[1].cost)
        .forEach(([script, data]) => {
          console.log(`  ${script.padEnd(25)} $${data.cost.toFixed(4)} (${data.requests} requests)`);
        });
    }

    if (Object.keys(stats.byModel).length > 0) {
      console.log('\n🤖 By Model:');
      Object.entries(stats.byModel)
        .sort((a, b) => b[1].cost - a[1].cost)
        .forEach(([model, data]) => {
          const modelShort = model.replace('claude-', '').replace('-20250514', '');
          console.log(`  ${modelShort.padEnd(25)} $${data.cost.toFixed(4)} (${data.requests} requests)`);
        });
    }

    console.log('\n' + '═'.repeat(60) + '\n');

    return stats;
  }

  /**
   * Reset usage data (for testing)
   */
  async reset() {
    try {
      await fs.unlink(this.usageFile);
      console.log('✅ Usage data reset');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Failed to reset usage data:', error.message);
      }
    }
  }
}

export default UsageTracker;
