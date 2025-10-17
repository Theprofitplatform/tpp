#!/bin/bash

# Deploy optimization systems to VPS

echo "🚀 Deploying optimization systems..."

# Deploy self-healing system
ssh tpp-vps "cd ~/projects/tpp && cat > .automation/scripts/self-healing.cjs << 'HEALING_EOF'
#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

class SelfHealingSystem {
  constructor() {
    this.lastHeals = new Map();
    this.rules = new Map();
  }

  async initialize() {
    console.log('🔧 Self-Healing System activated');
    
    // Simple healing rules
    this.rules.set('backend-down', {
      condition: () => this.checkService(4321),
      action: () => this.restartBackend(),
      cooldown: 300000 // 5 minutes
    });

    this.rules.set('high-disk', {
      condition: () => this.getDiskUsage() > 85,
      action: () => this.cleanupDisk(),
      cooldown: 1800000 // 30 minutes
    });

    // Run checks every 2 minutes
    setInterval(() => this.runHealingCycle(), 120000);
  }

  async runHealingCycle() {
    console.log('🔍 Running healing checks...');
    
    for (const [ruleId, rule] of this.rules) {
      if (await rule.condition()) {
        const lastHeal = this.lastHeals.get(ruleId);
        if (!lastHeal || Date.now() - lastHeal > rule.cooldown) {
          console.log(\`🔧 Healing action for \${ruleId}\`);
          await rule.action();
          this.lastHeals.set(ruleId, Date.now());
        }
      }
    }
  }

  async checkService(port) {
    return new Promise(resolve => {
      exec(\`curl -s http://localhost:\${port}/health\`, (error) => {
        resolve(!!error);
      });
    });
  }

  async getDiskUsage() {
    return new Promise(resolve => {
      exec('df -h / | awk \'NR==2 {print $5}\' | sed \'s/%//\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async restartBackend() {
    console.log('🔄 Restarting backend...');
    exec('pkill -f \"node server.js\" && sleep 2 && cd ~/projects/tpp/backend && PORT=4321 nohup node server.js > backend-heal.log 2>&1 &');
  }

  async cleanupDisk() {
    console.log('🧹 Cleaning disk...');
    exec('docker system prune -f && npm cache clean --force');
  }
}

if (require.main === module) {
  const healer = new SelfHealingSystem();
  healer.initialize();
}

module.exports = SelfHealingSystem;
HEALING_EOF
echo '✅ Self-healing system deployed'"

# Deploy workflow optimizer
ssh tpp-vps "cd ~/projects/tpp && cat > .automation/scripts/workflow-optimizer.cjs << 'OPTIMIZER_EOF'
#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

class WorkflowOptimizer {
  constructor() {
    this.metrics = new Map();
  }

  async initialize() {
    console.log('⚡ Workflow Optimizer activated');
    
    // Run optimization every hour
    setInterval(() => this.runOptimizationCycle(), 3600000);
  }

  async runOptimizationCycle() {
    console.log('🔄 Running optimization cycle...');
    
    const diskUsage = await this.getDiskUsage();
    const memoryUsage = await this.getMemoryUsage();
    
    console.log(\`📊 Current usage - Disk: \${diskUsage}%, Memory: \${memoryUsage}%\`);
    
    if (diskUsage > 80) {
      await this.optimizeSystem();
    }
    
    if (memoryUsage > 85) {
      await this.optimizeMemory();
    }
  }

  async getDiskUsage() {
    return new Promise(resolve => {
      exec('df -h / | awk \'NR==2 {print $5}\' | sed \'s/%//\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async getMemoryUsage() {
    return new Promise(resolve => {
      exec('free | awk \'/Mem/{printf \"%.0f\", $3/$2 * 100.0}\'', (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout.trim()));
      });
    });
  }

  async optimizeSystem() {
    console.log('🧹 Optimizing system...');
    exec('docker system prune -f && find /tmp -name \"*.tmp\" -delete');
  }

  async optimizeMemory() {
    console.log('🧠 Optimizing memory...');
    exec('echo 1 > /proc/sys/vm/drop_caches');
  }
}

if (require.main === module) {
  const optimizer = new WorkflowOptimizer();
  optimizer.initialize();
}

module.exports = WorkflowOptimizer;
OPTIMIZER_EOF
echo '✅ Workflow optimizer deployed'"

# Start optimization systems
ssh tpp-vps "cd ~/projects/tpp && echo '=== STARTING OPTIMIZATION SYSTEMS ===' && nohup node .automation/scripts/self-healing.cjs > .automation/healing.log 2>&1 & nohup node .automation/scripts/workflow-optimizer.cjs > .automation/optimizer.log 2>&1 & sleep 3 && echo '✅ Optimization systems started'"
