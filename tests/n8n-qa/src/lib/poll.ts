/**
 * Execution Polling Utilities
 * Poll n8n executions until completion or timeout
 */

import { n8nAPI, N8nExecution } from './api.js';
import { config } from './config.js';

export interface PollOptions {
  interval?: number;
  maxAttempts?: number;
  sinceTimestamp?: string;
}

export interface PollResult {
  execution: N8nExecution;
  attempts: number;
  duration: number;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll for execution by ID until it completes
 */
export async function pollExecutionById(
  executionId: string,
  options: PollOptions = {}
): Promise<PollResult> {
  const interval = options.interval ?? config.test.pollInterval;
  const maxAttempts = options.maxAttempts ?? config.test.pollMaxAttempts;

  const startTime = Date.now();
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const execution = await n8nAPI.getExecution(executionId);

      // Check if execution is complete
      if (execution.status === 'success' || execution.status === 'error') {
        return {
          execution,
          attempts,
          duration: Date.now() - startTime,
        };
      }

      console.log(
        `[Poll] Execution ${executionId} status: ${execution.status} (attempt ${attempts}/${maxAttempts})`
      );
    } catch (error) {
      console.warn(`[Poll] Failed to fetch execution ${executionId}:`, error);
    }

    await sleep(interval);
  }

  throw new Error(
    `Polling timeout: Execution ${executionId} did not complete after ${maxAttempts} attempts`
  );
}

/**
 * Poll for most recent execution of a workflow
 * Useful for webhook-triggered workflows where execution ID is returned in response
 */
export async function pollLatestExecution(
  workflowId: string,
  options: PollOptions = {}
): Promise<PollResult> {
  const interval = options.interval ?? config.test.pollInterval;
  const maxAttempts = options.maxAttempts ?? config.test.pollMaxAttempts;
  const sinceTimestamp = options.sinceTimestamp ?? new Date().toISOString();

  const startTime = Date.now();
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      // Fetch recent executions for this workflow
      const executions = await n8nAPI.listExecutions({
        workflowId,
        limit: 10,
        startedAfter: sinceTimestamp,
      });

      // Filter executions that started after our threshold
      const recentExecutions = executions.filter(
        (exec) => new Date(exec.startedAt) >= new Date(sinceTimestamp)
      );

      if (recentExecutions.length > 0) {
        // Sort by startedAt descending (most recent first)
        recentExecutions.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        const latestExecution = recentExecutions[0];

        // Check if execution is complete
        if (
          latestExecution.status === 'success' ||
          latestExecution.status === 'error'
        ) {
          return {
            execution: latestExecution,
            attempts,
            duration: Date.now() - startTime,
          };
        }

        console.log(
          `[Poll] Latest execution ${latestExecution.id} status: ${latestExecution.status} (attempt ${attempts}/${maxAttempts})`
        );
      } else {
        console.log(
          `[Poll] No executions found for workflow ${workflowId} since ${sinceTimestamp} (attempt ${attempts}/${maxAttempts})`
        );
      }
    } catch (error) {
      console.warn(`[Poll] Failed to fetch executions for workflow ${workflowId}:`, error);
    }

    await sleep(interval);
  }

  throw new Error(
    `Polling timeout: No completed execution found for workflow ${workflowId} after ${maxAttempts} attempts`
  );
}

/**
 * Poll for scheduled workflow execution freshness
 * Validates that a scheduled workflow has run recently
 */
export async function pollScheduledExecution(
  workflowId: string,
  maxAgeMinutes: number = 5,
  options: PollOptions = {}
): Promise<PollResult> {
  const interval = options.interval ?? config.test.pollInterval;
  const maxAttempts = options.maxAttempts ?? config.test.pollMaxAttempts;

  const startTime = Date.now();
  const thresholdTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const executions = await n8nAPI.listExecutions({
        workflowId,
        limit: 5,
      });

      // Find most recent successful execution
      const recentSuccessful = executions.find(
        (exec) =>
          exec.status === 'success' &&
          new Date(exec.startedAt) >= thresholdTime
      );

      if (recentSuccessful) {
        return {
          execution: recentSuccessful,
          attempts,
          duration: Date.now() - startTime,
        };
      }

      console.log(
        `[Poll] No recent successful execution for workflow ${workflowId} (attempt ${attempts}/${maxAttempts})`
      );
    } catch (error) {
      console.warn(
        `[Poll] Failed to check scheduled execution for workflow ${workflowId}:`,
        error
      );
    }

    await sleep(interval);
  }

  throw new Error(
    `Polling timeout: No successful execution found for workflow ${workflowId} within ${maxAgeMinutes} minutes`
  );
}

/**
 * Wait for multiple executions to complete
 */
export async function pollMultipleExecutions(
  executionIds: string[],
  options: PollOptions = {}
): Promise<PollResult[]> {
  const promises = executionIds.map((id) => pollExecutionById(id, options));
  return Promise.all(promises);
}
