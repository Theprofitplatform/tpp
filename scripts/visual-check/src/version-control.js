/**
 * Version Control System
 *
 * Manages backups and rollbacks of web files
 * before applying automated fixes.
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

export class VersionControl {
  constructor(webRoot) {
    this.webRoot = webRoot;
    this.backupDir = path.join(webRoot, '.visual-agent-backups');
  }

  /**
   * Create backup of current state
   */
  async createBackup(label) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupName = `${label}-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    try {
      await fs.mkdir(this.backupDir, { recursive: true });

      // Check if git is available
      try {
        await execAsync('git --version', { cwd: this.webRoot });

        // Create git commit as backup
        await execAsync(`git add -A`, { cwd: this.webRoot });
        await execAsync(
          `git commit -m "Visual Agent Backup: ${label}" --allow-empty`,
          { cwd: this.webRoot }
        );

        console.log(chalk.gray(`  💾 Git backup created: ${label}`));

        return {
          type: 'git',
          label: backupName,
          timestamp
        };
      } catch (gitError) {
        // Git not available, use file copy
        await this.copyDirectory(this.webRoot, backupPath);

        console.log(chalk.gray(`  💾 File backup created: ${backupPath}`));

        return {
          type: 'file',
          label: backupName,
          path: backupPath,
          timestamp
        };
      }
    } catch (error) {
      console.error(chalk.red('  ❌ Backup failed:'), error.message);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restore(backupLabel) {
    try {
      // Try git restore first
      try {
        await execAsync(
          `git revert HEAD --no-edit`,
          { cwd: this.webRoot }
        );

        console.log(chalk.green('  ✅ Restored from git backup'));
        return true;
      } catch (gitError) {
        // Fall back to file restore
        const backupPath = path.join(this.backupDir, backupLabel);
        await this.copyDirectory(backupPath, this.webRoot);

        console.log(chalk.green('  ✅ Restored from file backup'));
        return true;
      }
    } catch (error) {
      console.error(chalk.red('  ❌ Restore failed:'), error.message);
      throw error;
    }
  }

  /**
   * List available backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      return files.map(file => ({
        label: file,
        path: path.join(this.backupDir, file)
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip node_modules, .git, and backup directories
      if (entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === '.visual-agent-backups') {
        continue;
      }

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}