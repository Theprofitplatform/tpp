/**
 * Scheduled Workflow Tests
 *
 * Test suite for cron/event-triggered workflows
 * Validates execution freshness and success rate
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { pollScheduledExecution } from '@/lib/poll';
import {
  assertExecutionSuccess,
  assertScheduledWorkflowFreshness,
  assertReasonableExecutionTime,
} from '@/lib/assert';
import { getWorkflowId } from '@/lib/config';

// Configure your scheduled workflow
const WORKFLOW_SLUG = 'daily-report'; // Example: daily report generation
const MAX_AGE_MINUTES = 1440; // 24 hours

describe('Scheduled Workflow [schedule]', () => {
  let workflowId: string;

  beforeAll(() => {
    // Get workflow ID from environment
    // If you don't have a scheduled workflow, skip this test suite
    try {
      workflowId = getWorkflowId(WORKFLOW_SLUG).toString();
    } catch (error) {
      console.warn(
        `Skipping scheduled workflow tests - ${WORKFLOW_SLUG} not configured`
      );
    }
  });

  it('should have executed recently', async () => {
    if (!workflowId) {
      console.log('Skipping: No scheduled workflow configured');
      return;
    }

    // Poll for recent execution
    const pollResult = await pollScheduledExecution(
      workflowId,
      MAX_AGE_MINUTES,
      { maxAttempts: 5 }
    );

    // Assert execution exists and is recent
    assertExecutionSuccess(pollResult.execution);
    assertScheduledWorkflowFreshness(pollResult.execution, MAX_AGE_MINUTES);
  });

  it('should complete within reasonable time', async () => {
    if (!workflowId) return;

    // Get most recent execution
    const executions = await n8nAPI.listExecutions({
      workflowId,
      status: 'success',
      limit: 1,
    });

    expect(executions.length).toBeGreaterThan(0);

    const latestExecution = executions[0];
    assertReasonableExecutionTime(latestExecution, 300); // 5 minutes max
  });

  it('should have high success rate', async () => {
    if (!workflowId) return;

    // Get last 10 executions
    const executions = await n8nAPI.listExecutions({
      workflowId,
      limit: 10,
    });

    expect(executions.length).toBeGreaterThan(0);

    // Calculate success rate
    const successCount = executions.filter((e) => e.status === 'success').length;
    const successRate = successCount / executions.length;

    expect(successRate).toBeGreaterThan(0.8); // 80% success rate minimum
  });

  it('should not have stuck executions', async () => {
    if (!workflowId) return;

    // Check for executions stuck in 'running' or 'waiting' state
    const stuckExecutions = await n8nAPI.listExecutions({
      workflowId,
      limit: 20,
    });

    const stuck = stuckExecutions.filter(
      (e) =>
        (e.status === 'running' || e.status === 'waiting') &&
        new Date(e.startedAt).getTime() < Date.now() - 3600000 // Older than 1 hour
    );

    expect(stuck.length).toBe(0);
  });
});
