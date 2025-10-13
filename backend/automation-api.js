import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const execAsync = promisify(exec);

/**
 * Blog Automation API Controller
 * Provides endpoints for manual triggering of VPS automation workflows
 */

/**
 * Execute automation script with proper error handling
 */
async function executeAutomationScript(scriptPath, timeoutMs = 3600000) { // 1 hour default timeout
  try {
    const fullPath = path.join(projectRoot, scriptPath);

    // Verify script exists
    await fs.access(fullPath);

    const { stdout, stderr } = await execAsync(`cd "${projectRoot}" && timeout ${timeoutMs / 1000} "${fullPath}"`, {
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    return {
      success: true,
      stdout: stdout,
      stderr: stderr,
      exitCode: 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
      timedOut: error.killed || false
    };
  }
}

/**
 * Trigger blog staging workflow
 */
export async function triggerBlogStaging(options = {}) {
  const {
    force = false,
    timeout = 3600000, // 1 hour
    topicId = null
  } = options;

  try {
    let command = 'automation/scripts/vps-blog-staging.sh';

    if (force) {
      command += ' --force';
    }

    if (topicId) {
      command += ` --topic-id ${topicId}`;
    }

    const result = await executeAutomationScript(command, timeout);

    return {
      workflow: 'blog-staging',
      timestamp: new Date().toISOString(),
      options,
      ...result
    };
  } catch (error) {
    throw new Error(`Failed to trigger blog staging: ${error.message}`);
  }
}

/**
 * Trigger full blog automation workflow
 */
export async function triggerBlogAutomation(options = {}) {
  const {
    force = false,
    timeout = 7200000, // 2 hours
    enableGitCommit = true,
    enableDeployment = true,
    topicId = null
  } = options;

  try {
    let command = 'automation/scripts/vps-blog-automation.sh';

    if (force) {
      command += ' --force';
    }

    if (topicId) {
      command += ` --topic-id ${topicId}`;
    }

    // Set environment variables for the script
    process.env.ENABLE_GIT_COMMIT = enableGitCommit.toString();
    process.env.ENABLE_DEPLOYMENT = enableDeployment.toString();

    const result = await executeAutomationScript(command, timeout);

    return {
      workflow: 'blog-automation',
      timestamp: new Date().toISOString(),
      options,
      ...result
    };
  } catch (error) {
    throw new Error(`Failed to trigger blog automation: ${error.message}`);
  }
}

/**
 * Trigger health monitoring
 */
export async function triggerHealthCheck() {
  try {
    const result = await executeAutomationScript('automation/scripts/vps-monitor.sh', 300000); // 5 minutes

    return {
      workflow: 'health-check',
      timestamp: new Date().toISOString(),
      ...result
    };
  } catch (error) {
    throw new Error(`Failed to trigger health check: ${error.message}`);
  }
}

/**
 * Get automation status
 */
export async function getAutomationStatus() {
  try {
    // Check if any automation is currently running
    const lockFiles = [
      '/tmp/tpp-blog-automation.lock',
      '/tmp/tpp-blog-staging.lock'
    ];

    const runningWorkflows = [];

    for (const lockFile of lockFiles) {
      try {
        await fs.access(lockFile);
        runningWorkflows.push(path.basename(lockFile, '.lock'));
      } catch {
        // Lock file doesn't exist
      }
    }

    // Check recent logs
    const logDir = path.join(projectRoot, 'automation/logs');
    let recentLogs = [];

    try {
      const files = await fs.readdir(logDir);
      const logFiles = files.filter(f => f.endsWith('.log')).slice(-5); // Last 5 logs

      for (const logFile of logFiles) {
        const stats = await fs.stat(path.join(logDir, logFile));
        recentLogs.push({
          name: logFile,
          size: stats.size,
          modified: stats.mtime
        });
      }
    } catch {
      // Log directory might not exist
    }

    return {
      status: 'operational',
      runningWorkflows,
      recentLogs,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to get automation status: ${error.message}`);
  }
}

/**
 * Validate API key for automation triggers
 */
export function validateApiKey(apiKey) {
  const validKeys = process.env.AUTOMATION_API_KEYS?.split(',') || [];
  return validKeys.includes(apiKey);
}

export default {
  triggerBlogStaging,
  triggerBlogAutomation,
  triggerHealthCheck,
  getAutomationStatus,
  validateApiKey
};