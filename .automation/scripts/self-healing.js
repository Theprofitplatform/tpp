#!/usr/bin/env node

/**
 * Self-Healing Automation System
 * Automatically detects and fixes common issues
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');

class SelfHealingSystem {
  constructor() {
    this.configPath = path.join(__dirname, '../config/healing-rules.yaml');
    this.statePath = path.join(__dirname, '../state/healing-state.json');
    this.rules = new Map();
    this.lastHeals = new Map();
    this.thresholds = {
      maxDailyHeals: 10,
      healCooldownMinutes: 30
    };
  }

  async initialize() {
    console.log('🔧 Initializing Self-Healing System...');
    
    await this.loadHealingRules();
    await this.loadHealingState();
    
    // Run healing checks every 2 minutes
    setInterval(() => this.runHealingCycle(), 120000);
    
    console.log('✅ Self-Healing System activated');
  }

  async loadHealingRules() {
    // Define healing rules
    const rules = {
      'high-disk-usage': {
        condition: 'disk_usage > 85',
        action: 'cleanup_disk',
        description: 'High disk usage detected - running cleanup',
        cooldown: 30,
        maxDaily: 5
      },
      'backend-down': {
        condition: 'backend_status = down',
        action: 'restart_backend',
        description: 'Backend service down - restarting',
        cooldown: 5,
        maxDaily: 10
      },
      'orchestrator-down': {
        condition: 'orchestrator_status = down',
        action: 'restart_orchestrator',
        description: 'Orchestrator down - restarting',
        cooldown: 10,
        maxDaily: 5
      },
      'workflow-failures': {
        condition: 'workflow_failure_rate > 3',
        action: 'reset_workflow',
        description: 'High workflow failure rate - resetting workflows',
        cooldown: 15,
        maxDaily: 3
      },
      'memory-pressure': {
        condition: 'memory_usage > 90',
        action: 'optimize_memory',
        description: 'High memory usage - optimizing',
        cooldown: 20,
        maxDaily: 5
      }
    };

    for (const [id, rule] of Object.entries(rules)) {
      this.rules.set(id, {
        id,
        ...rule,
        healCount: 0,
        lastHeal: null
      });
    }
  }

  async loadHealingState() {
    try {
      const stateData = await fs.readFile(this.statePath, 'utf8');
      const state = JSON.parse(stateData);
      
      for (const [id, lastHeal] of Object.entries(state.lastHeals || {})) {
        this.lastHeals.set(id, new Date(lastHeal));
      }
      
    } catch (error) {
      console.log('No existing healing state found');
    }
  }

  async runHealingCycle() {
    try {
      const diagnostics = await this.runDiagnostics();
      const issues = await this.detectIssues(diagnostics);
      
      for (const issue of issues) {
        await this.atheal(issue);
      }
      
      await this.saveHealingState();
      
    } catch (error) {
      console.error('❌ Healing cycle failed:', error.message);
    }
  }

  async runDiagnostics() {
    const diagnostics = {};

    // Disk usage
    const diskUsage = await this.getDiskUsage();
    diagnostics.disk_usage = diskUsage;

    // Memory usage
    const memoryUsage = await this.getMemoryUsage();
    diagnostics.memory_usage = memoryUsage;

    // Backend status
    const backendStatus = await this.checkBackendStatus();
    diagnostics.backend_status = backendStatus;

    // Orchestrator status
    const orchestratorStatus = await this.checkOrchestratorStatus();
    diagnostics.orchestrator_status = orchestratorStatus;

    // Workflow failure rate
    const workflowFailureRate = await this.getWorkflowFailureRate();
    diagnostics.workflow_failure_rate = workflowFailureRate;

    return diagnostics;
  }

  async getDiskUsage() {
    return new Promise((resolve) => {
      exec('df -h / | awk \'NR==2 {print $5}\' | sed \'s/%//\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async getMemoryUsage() {
    return new Promise((resolve) => {
      exec('free | awk \'/Mem/{printf "%.0f", $3/$2 * 100.0}\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async checkBackendStatus() {
    return new Promise((resolve) => {
      exec('curl -s http://localhost:4321/api/health', (error) => {
        resolve(error ? 'down' : 'up');
      });
    });
  }

  async checkOrchestratorStatus() {
    return new Promise((resolve) => {
      exec('curl -s http://localhost:4322/health', (error) => {
        resolve(error ? 'down' : 'up');
      });
    });
  }

  async getWorkflowFailureRate() {
    return new Promise((resolve) => {
      exec("curl -s http://localhost:4322/metrics | grep 'automation_workflow_failures_total' | awk '{sum += $NF} END {print sum}'", (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async detectIssues(diagnostics) {
    const issues = [];

    for (const [ruleId, rule] of this.rules) {
      if (this.evaluateCondition(rule.condition, diagnostics)) {
        issues.push({
          ruleId,
          rule,
          diagnostics,
          severity: this.getSeverity(ruleId, diagnostics)
        });
      }
    }

    return issues.sort((a, b) => b.severity - a.severity);
  }

  evaluateCondition(condition, diagnostics) {
    try {
      // Simple condition evaluation
      const [metric, operator, value] = condition.split(' ');
      const metricValue = diagnostics[metric.replace(/_status$/, '_status')];
      
      if (!metricValue) return false;

      switch (operator) {
        case '>':
          return metricValue > parseInt(value);
        case '=':
          return metricValue === value.toLowerCase();
        case '<':
          return metricValue < parseInt(value);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  getSeverity(ruleId, diagnostics) {
    const baseSeverity = {
      'backend-down': 100,
      'orchestrator-down': 90,
      'high-disk-usage': 80,
      'memory-pressure': 70,
      'workflow-failures': 60
    };
    return baseSeverity[ruleId] || 50;
  }

  async attemptHeal(issue) {
    const { ruleId, rule, diagnostics } = issue;

    // Check cooldown
    const lastHeal = this.lastHeals.get(ruleId);
    if (lastHeal) {
      const minutesSinceLastHeal = (Date.now() - lastHeal.getTime()) / (1000 * 60);
      if (minutesSinceLastHeal < rule.cooldown) {
        console.log(`⏳ Skipping ${ruleId} - cooldown active (${Math.round(minutesSinceLastHeal)}m ago)`);
        return false;
      }
    }

    // Check daily limit
    if (rule.healCount >= rule.maxDaily) {
      console.log(`❌ Skipping ${ruleId} - daily limit reached (${rule.healCount}/${rule.maxDaily})`);
      return false;
    }

    console.log(`🔧 Attempting heal: ${rule.description}`);

    try {
      const success = await this.executeHealAction(rule.action, diagnostics);
      
      if (success) {
        rule.healCount++;
        rule.lastHeal = new Date();
        this.lastHeals.set(ruleId, new Date());
        
        console.log(`✅ Heal successful: ${ruleId}`);
        await this.sendNotification(`${rule.description} - FIXED`, 'success');
        return true;
      } else {
        console.log(`❌ Heal failed: ${ruleId}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Heal error for ${ruleId}:`, error.message);
      await this.sendNotification(`${rule.description} - FAILED: ${error.message}`, 'error');
      return false;
    }
  }

  async executeHealAction(action, diagnostics) {
    const actions = {
      'cleanup_disk': () => this.cleanupDisk(),
      'restart_backend': () => this.restartBackend(),
      'restart_orchestrator': () => this.restartOrchestrator(),
      'reset_workflow': () => this.resetWorkflow(),
      'optimize_memory': () => this.optimizeMemory()
    };

    const healAction = actions[action];
    if (!healAction) {
      throw new Error(`Unknown healing action: ${action}`);
    }

    return await healAction();
  }

  async cleanupDisk() {
    return new Promise((resolve) => {
      const commands = [
        'find /tmp -type f -atime +7 -delete',
        'find /var/tmp -type f -atime +7 -delete',
        'docker system prune -f',
        'npm cache clean --force',
        'rm -rf /home/avi/projects/tpp/node_modules/.cache'
      ];

      const execCommand = ' && '.join(commands);
      
      exec(execCommand, (error, stdout, stderr) => {
        !error ? resolve(true) : resolve(false);
      });
    });
  }

  async restartBackend() {
    return new Promise((resolve) => {
      exec('pkill -f "node server.js" && sleep 2 && cd ~/projects/tpp/backend && PORT=4321 nohup node server.js > backend-restart.log 2>&1 &', (error) => {
        setTimeout(() => {
          resolve(!error);
        }, 5000);
      });
    });
  }

  async restartOrchestrator() {
    return new Promise((resolve) => {
      exec('pkill -f orchestrator.cjs && sleep 2 && cd ~/projects/tpp && nohup node .automation/scripts/orchestrator.cjs > orchestrator-restart.log 2>&1 &', (error) => {
        setTimeout(() => {
          resolve(!error);
        }, 3000);
      });
    });
  }

  async resetWorkflow() {
    return new Promise((resolve) => {
      exec('curl -X POST http://localhost:4322/webhook/workflow -H "Content-Type: application/json" -d \'{"status":"reset"}\'', (error) => {
        resolve(!error);
      });
    });
  }

  async optimizeMemory() {
    return new Promise((resolve) => {
      exec('echo 1 > /proc/sys/vm/drop_caches && docker system prune -f && pkill -9 -f defunct', (error) => {
        resolve(!error);
      });
    });
  }

  async sendNotification(message, level = 'info') {
    console.log(`🔔 Self-Healing Notification: ${message}`);
    // Discord webhook integration would go here
  }

  async saveHealingState() {
    const state = {
      lastHeals: Object.fromEntries(this.lastHeals),
      rules: Object.fromEntries(this.rules),
      lastUpdate: new Date().toISOString()
    };

    await fs.writeFile(this.statePath, JSON.stringify(state, null, 2));
  }

  // Public API
  async forceHeal(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Unknown rule: ${ruleId}`);
    }

    const diagnostics = await this.runDiagnostics();
    return await this.attemptHeal({
      ruleId,
      rule,
      diagnostics,
      severity: 100
    });
  }

  async getHealingStatus() {
    return {
      rules: Object.fromEntries(this.rules),
      lastHeals: Object.fromEntries(this.lastHeals),
      totalHeals: Array.from(this.rules.values()).reduce((sum, rule) => sum + rule.healCount, 0)
    };
  }
}

// CLI interface
if (require.main === module) {
  const healingSystem = new SelfHealingSystem();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      healingSystem.getHealingStatus().then(console.log);
      break;
      
    case 'force':
      const ruleId = process.argv[3];
      healingSystem.forceHeal(ruleId).then(success => {
        console.log(success ? '✅ Heal triggered' : '❌ Heal failed');
      });
      break;
      
    default:
      healingSystem.initialize().catch(console.error);
      console.log('🔧 Self-Healing System running');
      console.log('Commands: status, force <rule-id>');
  }
}

module.exports = SelfHealingSystem;
