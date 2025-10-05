/**
 * Custom Test Assertions
 * n8n-specific assertions for workflow testing
 */

import { expect } from 'vitest';
import { N8nExecution } from './api.js';
import { PollResult } from './poll.js';

/**
 * Assert that an execution completed successfully
 */
export function assertExecutionSuccess(execution: N8nExecution): void {
  expect(execution.status).toBe('success');
  expect(execution.error).toBeUndefined();
  expect(execution.stoppedAt).toBeDefined();
}

/**
 * Assert that an execution failed with an error
 */
export function assertExecutionError(execution: N8nExecution): void {
  expect(execution.status).toBe('error');
  expect(execution.error).toBeDefined();
  expect(execution.error?.message).toBeTruthy();
}

/**
 * Assert that poll result completed within time limit
 */
export function assertPollDuration(
  pollResult: PollResult,
  maxDurationMs: number
): void {
  expect(pollResult.duration).toBeLessThan(maxDurationMs);
}

/**
 * Assert that poll result completed within attempt limit
 */
export function assertPollAttempts(
  pollResult: PollResult,
  maxAttempts: number
): void {
  expect(pollResult.attempts).toBeLessThanOrEqual(maxAttempts);
}

/**
 * Assert that execution started after a specific timestamp
 */
export function assertExecutionAfter(
  execution: N8nExecution,
  afterTimestamp: string | Date
): void {
  const executionTime = new Date(execution.startedAt);
  const thresholdTime = new Date(afterTimestamp);

  expect(executionTime.getTime()).toBeGreaterThanOrEqual(thresholdTime.getTime());
}

/**
 * Assert that execution data contains specific keys
 */
export function assertExecutionDataContains(
  execution: N8nExecution,
  keys: string[]
): void {
  const data = execution.data;
  expect(data).toBeDefined();

  keys.forEach((key) => {
    expect(data).toHaveProperty(key);
  });
}

/**
 * Assert that webhook response is successful
 */
export function assertWebhookSuccess(status: number, data: any): void {
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(300);
  expect(data).toBeDefined();
}

/**
 * Assert that webhook response is an error
 */
export function assertWebhookError(status: number): void {
  expect(status).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(600);
}

/**
 * Assert that execution completed within reasonable time
 * Default: 30 seconds
 */
export function assertReasonableExecutionTime(
  execution: N8nExecution,
  maxSeconds: number = 30
): void {
  const startTime = new Date(execution.startedAt);
  const endTime = new Date(execution.stoppedAt ?? new Date());
  const durationMs = endTime.getTime() - startTime.getTime();

  expect(durationMs).toBeLessThan(maxSeconds * 1000);
}

/**
 * Assert that scheduled workflow ran recently
 */
export function assertScheduledWorkflowFreshness(
  execution: N8nExecution,
  maxAgeMinutes: number = 5
): void {
  const executionTime = new Date(execution.startedAt);
  const now = new Date();
  const ageMs = now.getTime() - executionTime.getTime();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  expect(ageMs).toBeLessThan(maxAgeMs);
}

/**
 * Assert that webhook URL is a test URL (not production)
 */
export function assertTestWebhookUrl(url: string): void {
  expect(url).toMatch(/\/webhook-test\//);
  expect(url).not.toMatch(/\/webhook\/[^-]/); // Not production webhook
}

/**
 * Assert that execution mode is expected type
 */
export function assertExecutionMode(
  execution: N8nExecution,
  expectedMode: 'manual' | 'trigger' | 'webhook'
): void {
  expect(execution.mode).toBe(expectedMode);
}
