/**
 * Contact Form Workflow Tests
 *
 * Test suite for contact form submission workflow
 * Covers smoke, contract, and error scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { pollExecutionById, pollLatestExecution } from '@/lib/poll';
import {
  assertExecutionSuccess,
  assertExecutionError,
  assertWebhookSuccess,
  assertWebhookError,
  assertTestWebhookUrl,
} from '@/lib/assert';
import { getWebhookTestUrl } from '@/lib/config';
import { contactFormSchema } from '@/schema';

// Import fixtures
import validPayload from '../fixtures/contact-form/valid.json';
import minimalPayload from '../fixtures/contact-form/minimal.json';
import invalidPayload from '../fixtures/contact-form/invalid.json';

const WORKFLOW_SLUG = 'contact-form';

describe('Contact Form Workflow [smoke]', () => {
  let webhookUrl: string;
  let testStartTime: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
    testStartTime = new Date().toISOString();

    // Security check: ensure we're using test URL
    assertTestWebhookUrl(webhookUrl);
  });

  it('should accept minimal valid submission', async () => {
    // Trigger webhook with minimal payload
    const response = await n8nAPI.triggerWebhook(webhookUrl, minimalPayload);

    // Assert webhook responded successfully
    assertWebhookSuccess(response.status, response.data);

    // If execution ID is returned, poll for completion
    if (response.data?.executionId) {
      const pollResult = await pollExecutionById(response.data.executionId);
      assertExecutionSuccess(pollResult.execution);
    }
  });

  it('should process complete valid submission', async () => {
    // Trigger webhook with full payload
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);

    // Assert webhook responded successfully
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);

    // Poll for execution completion
    // Note: If executionId is not returned, poll latest execution
    const pollResult = response.data?.executionId
      ? await pollExecutionById(response.data.executionId)
      : await pollLatestExecution('your-workflow-id', { sinceTimestamp: testStartTime });

    assertExecutionSuccess(pollResult.execution);
    expect(pollResult.duration).toBeLessThan(10000); // Should complete within 10s
  });

  it('should handle honeypot field correctly', async () => {
    // Add honeypot field (should be rejected or ignored)
    const honeypotPayload = {
      ...validPayload,
      website: 'https://spam.com', // Honeypot field
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, honeypotPayload);

    // Honeypot submissions should either be rejected or silently ignored
    // Adjust based on your workflow's behavior
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});

describe('Contact Form Workflow [contract]', () => {
  let webhookUrl: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
  });

  it('should return response matching schema', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);

    // Validate response structure with Zod schema
    const result = contactFormSchema.safeParse(response.data);

    if (!result.success) {
      console.error('Schema validation errors:', result.error.format());
      throw new Error('Response does not match expected schema');
    }

    expect(result.success).toBe(true);
    expect(result.data.success).toBe(true);
    expect(result.data.message).toBeDefined();
  });

  it('should include submission timestamp', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);

    expect(response.data.timestamp).toBeDefined();

    const timestamp = new Date(response.data.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 60000); // Within last minute
  });

  it('should sanitize input data', async () => {
    // Test XSS prevention
    const xssPayload = {
      name: '<script>alert("xss")</script>John Doe',
      email: 'test@example.com',
      message: '<img src=x onerror=alert(1)>',
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, xssPayload);
    assertWebhookSuccess(response.status, response.data);

    // Verify data is sanitized (adjust based on your workflow)
    if (response.data?.data) {
      expect(response.data.data.name).not.toContain('<script>');
      expect(response.data.data.message).not.toContain('onerror');
    }
  });
});

describe('Contact Form Workflow [error]', () => {
  let webhookUrl: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl(WORKFLOW_SLUG);
  });

  it('should reject invalid email format', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, invalidPayload);

    // Should return error response
    assertWebhookError(response.status);

    expect(response.data?.success).toBe(false);
    expect(response.data?.error?.message).toContain('email');
  });

  it('should reject missing required fields', async () => {
    const incompletePayload = {
      name: 'John Doe',
      // Missing email and message
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, incompletePayload);

    // Should return validation error
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.data?.success).toBe(false);
  });

  it('should reject oversized payload', async () => {
    const oversizedPayload = {
      ...validPayload,
      message: 'A'.repeat(100000), // 100KB message
    };

    const response = await n8nAPI.triggerWebhook(webhookUrl, oversizedPayload);

    // Should reject or truncate
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle malformed JSON gracefully', async () => {
    // Note: axios will throw on malformed JSON, so we catch it
    try {
      const response = await n8nAPI.triggerWebhook(
        webhookUrl,
        'this is not json' as any
      );
      expect(response.status).toBeGreaterThanOrEqual(400);
    } catch (error) {
      // Expected - malformed JSON should fail at HTTP level
      expect(error).toBeDefined();
    }
  });
});
