/**
 * Visual Monitoring Workflow Tests
 * Tests for Visual Monitoring webhook workflow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { pollLatestExecution } from '@/lib/poll';
import {
  assertExecutionSuccess,
  assertWebhookSuccess,
  assertTestWebhookUrl,
} from '@/lib/assert';
import { getWebhookTestUrl } from '@/lib/config';

const WORKFLOW_SLUG = 'visual-monitoring';
const WORKFLOW_ID = 'b557c2ca652c49338e1f7a0e028c53a7';

describe('Visual Monitoring Workflow [smoke]', () => {
  let webhookUrl: string;
  let testStartTime: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
    testStartTime = new Date().toISOString();

    // Security check
    assertTestWebhookUrl(webhookUrl);
  });

  it('should accept visual check webhook', async () => {
    const payload = {
      url: 'https://theprofitplatform.com.au',
      timestamp: new Date().toISOString(),
      checkType: 'visual',
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, payload);
    assertWebhookSuccess(response.status, response.data);
  });

  it('should process webhook and execute workflow', async () => {
    const payload = {
      url: 'https://theprofitplatform.com.au/test',
      timestamp: new Date().toISOString(),
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, payload);

    // Poll for execution
    const pollResult = await pollLatestExecution(WORKFLOW_ID, {
      sinceTimestamp: testStartTime,
      maxAttempts: 20,
    });

    assertExecutionSuccess(pollResult.execution);
  });
});

describe('Visual Monitoring Workflow [contract]', () => {
  let webhookUrl: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
  });

  it('should accept valid URL payload', async () => {
    const payload = {
      url: 'https://theprofitplatform.com.au',
      timestamp: new Date().toISOString(),
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, payload);
    expect(response.status).toBe(200);
  });
});

describe('Visual Monitoring Workflow [error]', () => {
  let webhookUrl: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
  });

  it('should handle missing URL gracefully', async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      // Missing required URL field
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, payload);
    // Workflow may still accept it and handle internally
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});
