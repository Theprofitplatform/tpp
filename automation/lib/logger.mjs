#!/usr/bin/env node

/**
 * Structured Logger
 *
 * Provides consistent logging across all automation scripts
 * Features:
 * - Multiple log levels (debug, info, warn, error, success)
 * - File and console output
 * - Structured JSON logs
 * - Log rotation by date
 * - Colorized console output
 *
 * Usage:
 *   import { Logger } from './automation/lib/logger.mjs';
 *
 *   const logger = new Logger('suburb-pages');
 *   logger.info('Starting generation', { count: 10 });
 *   logger.success('Generated page', { suburb: 'Bondi', wordCount: 750 });
 *   logger.error('API failed', { error: err.message });
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Log level hierarchy
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 1, // Same as info
};

export class Logger {
  constructor(scriptName, options = {}) {
    this.scriptName = scriptName;
    this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
    this.logDir = options.logDir || path.resolve(__dirname, '../logs');
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.includeTimestamp = options.includeTimestamp !== false;

    // Create log directory
    if (this.enableFile) {
      this.ensureLogDirectory();
    }

    // Set log file path (daily rotation)
    this.logFile = this.getLogFilePath();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get log file path with date-based rotation
   */
  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `${this.scriptName}-${date}.log`);
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    const currentLevel = LOG_LEVELS[this.logLevel] || LOG_LEVELS.info;
    const messageLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
    return messageLevel >= currentLevel;
  }

  /**
   * Format log entry
   */
  formatEntry(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      script: this.scriptName,
      message,
      ...data,
    };

    return entry;
  }

  /**
   * Get console color for log level
   */
  getLevelColor(level) {
    const levelColors = {
      debug: 'gray',
      info: 'cyan',
      warn: 'yellow',
      error: 'red',
      success: 'green',
    };
    return levelColors[level] || 'white';
  }

  /**
   * Get icon for log level
   */
  getLevelIcon(level) {
    const icons = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
      success: '✅',
    };
    return icons[level] || 'ℹ️ ';
  }

  /**
   * Write to console
   */
  writeConsole(entry) {
    if (!this.enableConsole) return;

    const color = this.getLevelColor(entry.level);
    const icon = this.getLevelIcon(entry.level);
    const timestamp = this.includeTimestamp
      ? colors.gray + new Date(entry.timestamp).toLocaleTimeString() + ' '
      : '';

    let message = `${timestamp}${icon} ${colors[color]}${entry.message}${colors.reset}`;

    // Add data if present
    const dataKeys = Object.keys(entry).filter(
      k => !['timestamp', 'level', 'script', 'message'].includes(k)
    );

    if (dataKeys.length > 0) {
      const dataStr = dataKeys
        .map(key => `${key}=${JSON.stringify(entry[key])}`)
        .join(' ');
      message += colors.dim + ` (${dataStr})` + colors.reset;
    }

    console.log(message);
  }

  /**
   * Write to file
   */
  writeFile(entry) {
    if (!this.enableFile) return;

    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Main log function
   */
  log(level, message, data = {}) {
    if (!this.shouldLog(level)) return;

    const entry = this.formatEntry(level, message, data);

    this.writeConsole(entry);
    this.writeFile(entry);

    return entry;
  }

  /**
   * Convenience methods
   */

  debug(message, data) {
    return this.log('debug', message, data);
  }

  info(message, data) {
    return this.log('info', message, data);
  }

  warn(message, data) {
    return this.log('warn', message, data);
  }

  error(message, data) {
    return this.log('error', message, data);
  }

  success(message, data) {
    return this.log('success', message, data);
  }

  /**
   * Special methods for timing operations
   */

  time(label) {
    this._timers = this._timers || {};
    this._timers[label] = Date.now();
    this.debug(`Timer started: ${label}`);
  }

  timeEnd(label) {
    this._timers = this._timers || {};

    if (!this._timers[label]) {
      this.warn(`Timer not found: ${label}`);
      return null;
    }

    const duration = Date.now() - this._timers[label];
    delete this._timers[label];

    this.info(`Timer ${label}`, { duration: `${duration}ms` });
    return duration;
  }

  /**
   * Group related logs
   */

  group(title) {
    console.log('');
    console.log(colors.bright + colors.cyan + '╔══════════════════════════════════════╗' + colors.reset);
    console.log(colors.bright + colors.cyan + `║ ${title.padEnd(36)} ║` + colors.reset);
    console.log(colors.bright + colors.cyan + '╚══════════════════════════════════════╝' + colors.reset);
    console.log('');
  }

  groupEnd() {
    console.log('');
  }

  /**
   * Progress indicator for loops
   */

  progress(current, total, message = 'Processing') {
    const percent = ((current / total) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));

    process.stdout.write(`\r${message}: [${bar}] ${percent}% (${current}/${total})`);

    if (current === total) {
      console.log(''); // New line when complete
    }
  }

  /**
   * Clean old log files (keep last N days)
   */

  static cleanOldLogs(logDir, daysToKeep = 30) {
    try {
      const files = fs.readdirSync(logDir);
      const now = Date.now();
      const cutoff = daysToKeep * 24 * 60 * 60 * 1000;

      let cleaned = 0;

      files.forEach(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > cutoff && file.endsWith('.log')) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} old log files`);
      }
    } catch (error) {
      console.error('Error cleaning logs:', error.message);
    }
  }

  /**
   * Get recent logs for a script
   */

  static getRecentLogs(scriptName, logDir, days = 7) {
    const logs = [];
    const files = fs.readdirSync(logDir);

    files
      .filter(f => f.startsWith(scriptName) && f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, days)
      .forEach(file => {
        const content = fs.readFileSync(path.join(logDir, file), 'utf-8');
        const entries = content
          .trim()
          .split('\n')
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        logs.push(...entries);
      });

    return logs;
  }

  /**
   * Analyze logs for errors and warnings
   */

  static analyzeLogs(scriptName, logDir, days = 7) {
    const logs = Logger.getRecentLogs(scriptName, logDir, days);

    const analysis = {
      total: logs.length,
      errors: logs.filter(l => l.level === 'error').length,
      warnings: logs.filter(l => l.level === 'warn').length,
      success: logs.filter(l => l.level === 'success').length,
      recentErrors: logs
        .filter(l => l.level === 'error')
        .slice(-5)
        .map(l => ({ message: l.message, timestamp: l.timestamp })),
    };

    return analysis;
  }
}

/**
 * Create a default logger for quick usage
 */
export function createLogger(scriptName, options = {}) {
  return new Logger(scriptName, options);
}

export default Logger;
