#!/bin/bash

# Deploy orchestrator to VPS

echo "🚀 Deploying centralized orchestrator to VPS..."

# Copy orchestrator files
ssh tpp-vps "cd ~/projects/tpp && cat > .automation/scripts/orchestrator.cjs << 'ORCHESTRATOR_EOF'
#!/usr/bin/env node

/**
 * TPP Automation Orchestrator
 * Central automation controller replacing scattered cron jobs
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const cron = require('node-cron');
const yaml = require('js-yaml');

class AutomationOrchestrator {
  constructor() {
    this.configPath = path.join(__dirname, '../config/workflows.yaml');
    this.workflows = new Map();
    this.scheduledJobs = new Map();
    this.runningProcesses = new Map();
    this.healthMonitor = null;
    
    this.processEnv = {
      ...process.env,
      DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK || 'https://discord.com/api/webhooks/your-webhook',
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: process.env.SMTP_PORT || 587,
      SMTP_USER: process.env.SMTP_USER || '',
      SMTP_PASS: process.env.SMTP_PASS || ''
    };
  }

  async initialize() {
    console.log('🚀 Initializing TPP Automation Orchestrator...');
    
    try {
      await this.loadConfiguration();
      await this.setupHealthMonitoring();
      await this.registerWorkflows();
      await this.startHealthMonitoring();
      await this.setupInterruptHandlers();
      
      console.log(\`✅ Orchestrator started with \${this.workflows.size} workflows\`);
      console.log('📊 Active workflows:', Array.from(this.workflows.keys()));
      
    } catch (error) {
      console.error('❌ Failed to initialize orchestrator:', error);
      process.exit(1);
    }
  }

  async loadConfiguration() {
    console.log('📋 Loading configuration...');
    
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      const config = yaml.load(configContent);
      
      // Load workflows
      if (config.workflows) {
        for (const [id, workflow] of Object.entries(config.workflows)) {
          this.workflows.set(id, {
            id,
            ...workflow,
            status: 'registered',
            lastRun: null,
            failureCount: 0
          });
        }
      }
      
      // Store config for reference
      this.config = config;
      
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      throw error;
    }
  }

  async registerWorkflows() {
    console.log('🔄 Registering workflows...');
    
    for (const [id, workflow] of this.workflows) {
      if (!workflow.enabled) {
        console.log(\`⏭️  Skipping disabled workflow: \${id}\`);
        continue;
      }
      
      if (!workflow.schedule) {
        console.log(\`⏭️  Skipping workflow without schedule: \${id}\`);
        continue;
      }
      
      try {
        const task = cron.schedule(workflow.schedule, () => {
          this.executeWorkflow(id);
        }, {
          scheduled: false,
          timezone: "Australia/Sydney"
        });
        
        this.scheduledJobs.set(id, task);
        task.start();
        
        console.log(\`✅ Registered workflow: \${id} (\${workflow.schedule})\`);
        
      } catch (error) {
        console.error(\`❌ Failed to register workflow \${id}:\`, error.message);
      }
    }
  }

  async executeWorkflow(id) {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      console.error(\`❌ Workflow not found: \${id}\`);
      return;
    }
    
    if (this.runningProcesses.has(id)) {
      console.log(\`⏳ Workflow \${id} already running, skipping...\`);
      return;
    }
    
    console.log(\`🚀 Executing workflow: \${id}\`);
    workflow.status = 'running';
    workflow.lastRun = new Date().toISOString();
    
    const startTime = Date.now();
    let success = false;
    
    try {
      success = await this.runProcess(workflow);
      workflow.failureCount = 0;
      workflow.status = 'success';
      
      console.log(\`✅ Workflow \${id} completed successfully in \${(Date.now() - startTime) / 1000}s\`);
      await this.sendNotification(\`\${workflow.name} completed successfully\`, 'success');
      
    } catch (error) {
      workflow.failureCount++;
      workflow.status = 'failed';
      
      console.error(\`❌ Workflow \${id} failed (\${workflow.failureCount}/\${workflow.retries}):\`, error.message);
      
      if (workflow.failureCount < workflow.retries) {
        console.log(\`🔄 Retrying workflow \${id} in 60 seconds...\`);
        setTimeout(() => this.executeWorkflow(id), 60000);
      } else {
        console.error(\`💀 Workflow \${id} exceeded retry limit\`);
        await this.sendNotification(\`\${workflow.name} failed after \${workflow.retries} attempts: \${error.message}\`, 'error');
      }
    } finally {
      this.runningProcesses.delete(id);
      workflow.lastRun = new Date().toISOString();
      await this.saveState();
    }
  }

  async runProcess(workflow) {
    return new Promise((resolve, reject) => {
      const env = { ...this.processEnv, ...workflow.env };
      let command, args;
      
      if (workflow.script.startsWith('npm run')) {
        command = 'npm';
        args = workflow.script.replace('npm run ', '').split(' ');
      } else if (workflow.script.startsWith('~/')) {
        // Handle absolute path scripts
        const [scriptPath, ...scriptArgs] = workflow.script.split(' ');
        command = 'bash';
        args = ['-c', \`cd \${scriptPath.split('/')[1]/workflow.script.split('/')[2]} && \${scriptArgs.join(' ')}\`];
      } else {
        [command, ...args] = workflow.script.split(' ');
      }
      
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
        cwd: process.cwd(),
        timeout: workflow.timeout * 1000
      });
      
      this.runningProcesses.set(workflow.id, child);
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(\`[\${workflow.id}] \${data.toString().trim()}\`);
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(\`[\${workflow.id}] ERROR: \${data.toString().trim()}\`);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(\`Process exited with code \${code}: \${stderr}\`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async setupHealthMonitoring() {
    this.healthMonitor = setInterval(() => {
      this.checkSystemHealth();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    console.log('🏥 Health monitoring enabled');
  }

  async checkSystemHealth() {
    try {
      const health = await this.getSystemHealth();
      
      const checks = [
        { name: 'disk', threshold: this.config.thresholds?.disk_usage || 85 },
        { name: 'memory', threshold: this.config.thresholds?.memory_usage || 90 }
      ];
      
      for (const check of checks) {
        const value = health[check.name];
        if (value >= check.threshold) {
          await this.sendNotification(
            \`🚨 \${check.name.toUpperCase()} USAGE CRITICAL: \${value}% (threshold: \${check.threshold}%)\`,
            'critical'
          );
        }
      }
      
      // Save health status
      await fs.writeFile(
        path.join(__dirname, '../state/health-status.json'),
        JSON.stringify(health, null, 2)
      );
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }

  async getSystemHealth() {
    const disk = await new Promise(resolve => {
      exec('df -h / | awk \'NR==2 {print $5}\' | sed \'s/%//\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
    
    const memory = await new Promise(resolve => {
      exec('free | awk \'/Mem/{printf "%.0f", $3/$2 * 100.0}\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
    
    return {
      disk,
      memory,
      runningWorkflows: this.runningProcesses.size,
      timestamp: new Date().toISOString()
    };
  }

  async sendNotification(message, level = 'info') {
    if (!this.config.notifications?.discord?.enabled) return;
    
    console.log(\`📢 Notification: \${message}\`);
    // Discord webhook implementation would go here
  }

  async setupInterruptHandlers() {
    const gracefulShutdown = async (signal) => {
      console.log(\`\n🛑 Received \${signal}, shutting down gracefully...\`);
      
      for (const [id, job] of this.scheduledJobs) {
        job.stop();
        console.log(\`⏹️  Stopped workflow: \${id}\`);
      }
      
      for (const [id, process] of this.runningProcesses) {
        process.kill('SIGTERM');
        console.log(\`🔪 Terminated process: \${id}\`);
      }
      
      await this.saveState();
      console.log('✅ Orchestrator shutdown complete');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  async saveState() {
    const state = {
      workflows: Object.fromEntries(this.workflows),
      lastUpdate: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(__dirname, '../state/active-workflows.json'),
      JSON.stringify(state, null, 2)
    );
  }

  async startHealthMonitoring() {
    await this.checkSystemHealth();
    console.log('🏥 Initial health check completed');
  }
}

// Start orchestrator
if (require.main === module) {
  const orchestrator = new AutomationOrchestrator();
  orchestrator.initialize().catch(console.error);
}

module.exports = AutomationOrchestrator;
ORCHESTRATOR_EOF
echo '✅ Orchestrator script deployed'"
