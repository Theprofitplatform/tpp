/**
 * Environment Configuration
 * Loads and validates environment variables for n8n API testing
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const envSchema = z.object({
  // n8n API Configuration
  N8N_API_BASE: z.string().url('N8N_API_BASE must be a valid URL'),
  N8N_API_TOKEN: z.string().min(1, 'N8N_API_TOKEN is required'),

  // Workflow Configuration
  WORKFLOW_IDS: z.string().optional().default(''),

  // Test Configuration
  TEST_TIMEOUT: z.string().optional().default('30000'),
  POLL_INTERVAL: z.string().optional().default('1000'),
  POLL_MAX_ATTEMPTS: z.string().optional().default('30'),

  // VPS Configuration
  VPS_HOST: z.string().optional(),
  VPS_USER: z.string().optional().default('root'),
  VPS_DEPLOY_PATH: z.string().optional().default('/opt/n8n-qa'),

  // Reporting
  REPORT_OUTPUT: z.string().optional().default('docs/TEST-REPORT.md'),
  SLACK_WEBHOOK_URL: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export typed configuration
export const config = {
  n8n: {
    apiBase: env.N8N_API_BASE,
    apiToken: env.N8N_API_TOKEN,
  },
  workflows: {
    ids: env.WORKFLOW_IDS.split(',').filter(Boolean).map(id => id.trim()),
  },
  test: {
    timeout: parseInt(env.TEST_TIMEOUT),
    pollInterval: parseInt(env.POLL_INTERVAL),
    pollMaxAttempts: parseInt(env.POLL_MAX_ATTEMPTS),
  },
  vps: {
    host: env.VPS_HOST,
    user: env.VPS_USER,
    deployPath: env.VPS_DEPLOY_PATH,
  },
  reporting: {
    output: env.REPORT_OUTPUT,
    slackWebhook: env.SLACK_WEBHOOK_URL,
  },
} as const;

/**
 * Get webhook test URL by slug
 * Reads from environment variable WEBHOOK_TEST_URL_<SLUG>
 */
export function getWebhookTestUrl(slug: string): string {
  const envKey = `WEBHOOK_TEST_URL_${slug.toUpperCase().replace(/-/g, '_')}`;
  const url = process.env[envKey];

  if (!url) {
    throw new Error(
      `Webhook test URL not found for slug '${slug}'. ` +
      `Set environment variable: ${envKey}`
    );
  }

  if (url.includes('/webhook/') && !url.includes('/webhook-test/')) {
    throw new Error(
      `SECURITY: Production webhook URL detected for '${slug}'. ` +
      `Only test URLs (/webhook-test/) are allowed in tests!`
    );
  }

  return url;
}

/**
 * Get workflow ID by slug or index
 */
export function getWorkflowId(slugOrIndex: string | number): number {
  if (typeof slugOrIndex === 'number') {
    return config.workflows.ids[slugOrIndex];
  }

  const envKey = `WORKFLOW_ID_${slugOrIndex.toUpperCase().replace(/-/g, '_')}`;
  const id = process.env[envKey];

  if (!id) {
    throw new Error(
      `Workflow ID not found for '${slugOrIndex}'. ` +
      `Set environment variable: ${envKey}`
    );
  }

  return parseInt(id);
}

export default config;
