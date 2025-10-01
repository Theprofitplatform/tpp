/**
 * Playwright Configuration for Visual Check Monitoring
 *
 * Optimized for production monitoring with:
 * - Fast execution
 * - Screenshot capture on failure
 * - JSON reporter for automation
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Run tests in parallel for speed
  fullyParallel: true,

  // Retry on failure
  retries: 1,

  // Use 5 workers for parallel execution
  workers: 5,

  // Reporter configuration
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { outputFolder: 'test-results/html', open: 'never' }]
  ],

  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: 'https://theprofitplatform.com.au',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Ignore HTTPS errors (for staging/dev)
    ignoreHTTPSErrors: false,

    // Network idle timeout
    actionTimeout: 10000
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // Output directory
  outputDir: 'test-results/artifacts',

  // Web server (disabled - testing production)
  // webServer: undefined
});
