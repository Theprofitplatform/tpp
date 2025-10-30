#!/usr/bin/env node

/**
 * Error Handler with Structured Logging and Recovery
 *
 * Provides consistent error handling across all scripts
 * Features:
 * - Structured error logging
 * - Error classification
 * - Recovery suggestions
 * - Alert integration
 * - Stack trace capture
 *
 * Usage:
 *   import { ErrorHandler } from './automation/lib/error-handler.mjs';
 *
 *   const errorHandler = new ErrorHandler('suburb-pages');
 *
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     await errorHandler.handle(error, { context: 'suburb-generation' });
 *   }
 */

import { Logger } from './logger.mjs';

export class ErrorHandler {
  constructor(scriptName, options = {}) {
    this.scriptName = scriptName;
    this.logger = new Logger(scriptName);
    this.alertOnCritical = options.alertOnCritical !== false;
    this.exitOnCritical = options.exitOnCritical || false;
  }

  /**
   * Classify error severity
   */
  classifyError(error) {
    // Critical errors (should alert and possibly exit)
    if (error.message?.includes('EACCES') ||
        error.message?.includes('ENOSPC') ||
        error.code === 'EACCES' ||
        error.code === 'ENOSPC') {
      return 'critical';
    }

    // Auth/API key errors
    if (error.status === 401 ||
        error.status === 403 ||
        error.message?.includes('API key') ||
        error.message?.includes('authentication')) {
      return 'critical';
    }

    // Rate limit errors (recoverable)
    if (error.status === 429 ||
        error.message?.includes('rate limit')) {
      return 'warning';
    }

    // Server errors (possibly temporary)
    if (error.status >= 500) {
      return 'warning';
    }

    // Network errors (recoverable)
    if (error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND') {
      return 'warning';
    }

    // Validation errors (informational)
    if (error.message?.includes('validation') ||
        error.message?.includes('invalid')) {
      return 'info';
    }

    // Default
    return 'error';
  }

  /**
   * Get recovery suggestion based on error type
   */
  getRecoverySuggestion(error) {
    if (error.status === 401 || error.status === 403) {
      return 'Check API key configuration in .env.local';
    }

    if (error.status === 429) {
      return 'Rate limit hit. Retry with exponential backoff or reduce request frequency';
    }

    if (error.code === 'EACCES') {
      return 'Permission denied. Check file/directory permissions';
    }

    if (error.code === 'ENOSPC') {
      return 'No space left on device. Free up disk space';
    }

    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return 'Network error. Check internet connection and retry';
    }

    if (error.code === 'ENOTFOUND') {
      return 'DNS lookup failed. Check internet connection and hostname';
    }

    if (error.message?.includes('API key')) {
      return 'Invalid or missing API key. Check ANTHROPIC_API_KEY in .env.local';
    }

    return 'Review error details and check logs for more information';
  }

  /**
   * Format error for logging
   */
  formatError(error, context = {}) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.constructor.name,
      severity: this.classifyError(error),
      stack: error.stack,
      context,
      suggestion: this.getRecoverySuggestion(error),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle error with appropriate logging and actions
   */
  async handle(error, context = {}) {
    const formatted = this.formatError(error, context);
    const severity = formatted.severity;

    // Log based on severity
    if (severity === 'critical') {
      this.logger.error(`CRITICAL ERROR: ${error.message}`, formatted);
      console.error('\n❌ CRITICAL ERROR DETAILS:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Suggestion: ${formatted.suggestion}`);
      console.error(`   Context:`, context);

      if (this.alertOnCritical) {
        await this.sendAlert(formatted);
      }

      if (this.exitOnCritical) {
        console.error('\n   Exiting due to critical error...\n');
        process.exit(1);
      }

    } else if (severity === 'warning') {
      this.logger.warn(`${error.message}`, formatted);

    } else if (severity === 'info') {
      this.logger.info(`${error.message}`, formatted);

    } else {
      this.logger.error(`${error.message}`, formatted);
    }

    return formatted;
  }

  /**
   * Send alert for critical errors
   */
  async sendAlert(errorInfo) {
    // Check if Slack webhook is configured
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhook) {
      return; // No alerting configured
    }

    try {
      const { default: https } = await import('https');
      const url = new URL(slackWebhook);

      const payload = {
        text: `🚨 Critical Error in ${this.scriptName}`,
        attachments: [{
          color: 'danger',
          fields: [
            {
              title: 'Error',
              value: errorInfo.message,
              short: false,
            },
            {
              title: 'Severity',
              value: errorInfo.severity,
              short: true,
            },
            {
              title: 'Script',
              value: this.scriptName,
              short: true,
            },
            {
              title: 'Suggestion',
              value: errorInfo.suggestion,
              short: false,
            },
          ],
          footer: 'TPP Automation',
          ts: Math.floor(Date.now() / 1000),
        }],
      };

      return new Promise((resolve, reject) => {
        const req = https.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Slack API returned ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
      });

    } catch (error) {
      console.error('Failed to send alert:', error.message);
    }
  }

  /**
   * Wrap async function with error handling
   */
  async wrap(fn, context = {}) {
    try {
      return await fn();
    } catch (error) {
      await this.handle(error, context);
      throw error; // Re-throw after handling
    }
  }

  /**
   * Wrap async function with error handling and return value
   * Returns [error, result] tuple
   */
  async try(fn, context = {}) {
    try {
      const result = await fn();
      return [null, result];
    } catch (error) {
      await this.handle(error, context);
      return [error, null];
    }
  }
}

/**
 * Create global unhandled error handlers
 */
export function setupGlobalErrorHandlers(scriptName) {
  const errorHandler = new ErrorHandler(scriptName, {
    alertOnCritical: true,
    exitOnCritical: true,
  });

  process.on('uncaughtException', async (error) => {
    console.error('\n💥 UNCAUGHT EXCEPTION:');
    await errorHandler.handle(error, { type: 'uncaughtException' });
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('\n💥 UNHANDLED PROMISE REJECTION:');
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await errorHandler.handle(error, { type: 'unhandledRejection', promise });
    process.exit(1);
  });

  return errorHandler;
}

export default ErrorHandler;
