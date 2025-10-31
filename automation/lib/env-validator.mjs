#!/usr/bin/env node

/**
 * Environment Variable Validator
 *
 * Validates all required environment variables at startup
 * Provides clear error messages and sets sensible defaults
 *
 * Usage:
 *   import { EnvValidator } from './automation/lib/env-validator.mjs';
 *
 *   const env = new EnvValidator()
 *     .require('ANTHROPIC_API_KEY', 'Claude API key', (v) => v.startsWith('sk-'))
 *     .optional('SMTP_HOST', 'Email server', 'smtp.gmail.com')
 *     .validate();
 */

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

export class EnvValidator {
  constructor(options = {}) {
    this.requiredVars = [];
    this.optionalVars = [];
    this.validated = false;
    this.silent = options.silent || false;
  }

  /**
   * Add required environment variable
   *
   * @param {string} key - Environment variable name
   * @param {string} description - Human-readable description
   * @param {Function} validator - Optional validation function
   * @returns {EnvValidator} - For chaining
   */
  require(key, description, validator = null) {
    this.requiredVars.push({
      key,
      description,
      validator,
      example: this.getExample(key),
    });
    return this;
  }

  /**
   * Add optional environment variable with default
   *
   * @param {string} key - Environment variable name
   * @param {string} description - Human-readable description
   * @param {string} defaultValue - Default value if not set
   * @returns {EnvValidator} - For chaining
   */
  optional(key, description, defaultValue) {
    this.optionalVars.push({
      key,
      description,
      defaultValue,
      example: this.getExample(key),
    });
    return this;
  }

  /**
   * Get example value for common env vars
   */
  getExample(key) {
    const examples = {
      ANTHROPIC_API_KEY: 'sk-ant-api03-...',
      CLAUDE_API_KEY: 'sk-ant-api03-...',
      UNSPLASH_ACCESS_KEY: 'your_unsplash_access_key',
      GOOGLE_REVIEW_URL: 'https://g.page/r/YOUR_PLACE_ID/review',
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'your-email@gmail.com',
      SMTP_PASS: 'your-app-password',
      SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/...',
      MONTHLY_API_BUDGET: '100',
      GBP_CREDENTIALS_PATH: './automation/config/gbc-credentials.json',
      GBP_ACCOUNT_NAME: 'accounts/{account_id}/locations/{location_id}',
    };
    return examples[key] || 'value';
  }

  /**
   * Validate all environment variables
   * Exits process with code 1 if validation fails
   */
  validate() {
    if (!this.silent) {
      console.log('');
      console.log(colorize('═'.repeat(60), 'cyan'));
      console.log(colorize('  🔍 ENVIRONMENT VALIDATION', 'bold'));
      console.log(colorize('═'.repeat(60), 'cyan'));
      console.log('');
    }

    const errors = [];
    const warnings = [];
    const info = [];

    // Check required variables
    for (const { key, description, validator, example } of this.requiredVars) {
      const value = process.env[key];

      if (!value) {
        errors.push({
          key,
          message: `Missing required: ${key}`,
          description,
          example,
        });
      } else if (validator && !validator(value)) {
        errors.push({
          key,
          message: `Invalid value for ${key}`,
          description,
          example,
          hint: 'Value format validation failed',
        });
      } else {
        if (!this.silent) {
          console.log(colorize(`  ✅ ${key}`, 'green') + ': Set');
        }
        info.push({ key, status: 'set' });
      }
    }

    // Check optional variables
    for (const { key, description, defaultValue, example } of this.optionalVars) {
      if (!process.env[key]) {
        warnings.push({
          key,
          message: `Optional ${key} not set, using default`,
          defaultValue,
        });
        process.env[key] = defaultValue;
        if (!this.silent) {
          console.log(colorize(`  ⚠️  ${key}`, 'yellow') + `: Using default (${defaultValue})`);
        }
      } else {
        if (!this.silent) {
          console.log(colorize(`  ✅ ${key}`, 'green') + `: ${this.maskValue(key, process.env[key])}`);
        }
        info.push({ key, status: 'set' });
      }
    }

    // Print results
    console.log('');

    if (errors.length > 0) {
      console.error(colorize('❌ VALIDATION FAILED', 'red'));
      console.error('');

      errors.forEach(error => {
        console.error(colorize(`  • ${error.message}`, 'red'));
        console.error(`    ${error.description}`);
        console.error(colorize(`    Example: ${error.example}`, 'cyan'));
        if (error.hint) {
          console.error(colorize(`    Hint: ${error.hint}`, 'yellow'));
        }
        console.error('');
      });

      console.error(colorize('Fix these issues and try again:', 'yellow'));
      console.error('');
      console.error('  1. Create .env.local file in project root');
      console.error('  2. Add the required variables:');
      console.error('');
      errors.forEach(error => {
        console.error(colorize(`     ${error.key}=${error.example}`, 'cyan'));
      });
      console.error('');
      console.error('  3. Run the script again');
      console.error('');

      process.exit(1);
    }

    if (warnings.length > 0 && !this.silent) {
      console.log(colorize('⚠️  WARNINGS:', 'yellow'));
      console.log('');
      warnings.forEach(warning => {
        console.log(colorize(`  • ${warning.message}`, 'yellow'));
      });
      console.log('');
    }

    if (!this.silent) {
      console.log(colorize('✅ VALIDATION PASSED', 'green'));
      console.log('');
      console.log(colorize('═'.repeat(60), 'cyan'));
      console.log('');
    }

    this.validated = true;
    return this;
  }

  /**
   * Mask sensitive values in logs
   */
  maskValue(key, value) {
    const sensitiveKeys = ['KEY', 'SECRET', 'PASS', 'TOKEN', 'WEBHOOK'];

    if (sensitiveKeys.some(k => key.includes(k))) {
      return value.substring(0, 8) + '...';
    }

    return value;
  }

  /**
   * Get validation status
   */
  isValid() {
    return this.validated && this.requiredVars.every(r => !!process.env[r.key]);
  }

  /**
   * Get all environment variables being validated
   */
  getVariables() {
    return {
      required: this.requiredVars.map(r => r.key),
      optional: this.optionalVars.map(o => o.key),
    };
  }
}

/**
 * Pre-configured validators for common automation scenarios
 */

export const automationValidator = new EnvValidator()
  .require(
    'ANTHROPIC_API_KEY',
    'Claude API key from https://console.anthropic.com',
    (v) => v.startsWith('sk-ant-')
  )
  .optional('MONTHLY_API_BUDGET', 'Maximum monthly API spend in USD', '100')
  .optional('NODE_ENV', 'Environment (development/production)', 'development');

export const emailValidator = new EnvValidator()
  .require('SMTP_HOST', 'Email server hostname (e.g., smtp.gmail.com)')
  .require('SMTP_PORT', 'Email server port (usually 587 or 465)', (v) => !isNaN(parseInt(v)))
  .require('SMTP_USER', 'Email account username/email')
  .require('SMTP_PASS', 'Email account password or app password')
  .optional('EMAIL_FROM', 'From address for outgoing emails', process.env.SMTP_USER);

export const gbpValidator = new EnvValidator()
  .require('GBP_CREDENTIALS_PATH', 'Path to Google Business Profile service account JSON')
  .require('GBP_ACCOUNT_NAME', 'GBP account resource name (accounts/{id}/locations/{id})')
  .optional('GBP_LANGUAGE', 'Language code for posts', 'en-AU');

export const reviewValidator = new EnvValidator()
  .require(
    'GOOGLE_REVIEW_URL',
    'Your Google Business Profile review link',
    (v) => v.startsWith('https://') && !v.includes('YOUR_PLACE_ID')
  );

export const monitoringValidator = new EnvValidator()
  .optional('SLACK_WEBHOOK_URL', 'Slack webhook for alerts', '')
  .optional('ALERT_EMAIL', 'Email address for alerts', '')
  .optional('LOG_LEVEL', 'Logging level (debug/info/warn/error)', 'info');

export default EnvValidator;
