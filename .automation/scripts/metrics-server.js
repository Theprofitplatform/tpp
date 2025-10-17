#!/usr/bin/env node

/**
 * Automation Metrics Server
 * Exposes automation metrics for Prometheus scraping
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { setInterval } = require('timers');

const app = express();
const PORT = 4322;

// Metrics storage
let metrics = {
  workflows: new Map(),
  system: {
    startTime: Date.now(),
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0
  }
};

// Prometheus metrics format
class PrometheusMetrics {
  constructor() {
    this.metrics = new Map();
  }

  counter(name, help) {
    return {
      inc: (value = 1, labels = {}) => {
        const key = `${name}${JSON.stringify(labels)}`;
        this.metrics.set(key, {
          name,
          help,
          type: 'counter',
          value: (this.metrics.get(key)?.value || 0) + value,
          labels
        });
      },
      get: () => this.getMetric(name)
    };
  }

  gauge(name, help) {
    return {
      set: (value, labels = {}) => {
        const key = `${name}${JSON.stringify(labels)}`;
        this.metrics.set(key, {
          name,
          help,
          type: 'gauge',
          value,
          labels
        });
      },
      get: () => this.getMetric(name)
    };
  }

  getMetric(name) {
    return Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.name === name)
      .reduce((sum, [_, metric]) => sum + metric.value, 0);
  }

  render() {
    let output = '';
    
    // Group metrics by name
    const grouped = {};
    for (const [_, metric] of this.metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    }

    // Render each metric
    for (const [name, instances] of Object.entries(grouped)) {
      output += `# HELP ${instances[0].help}\n`;
      output += `# TYPE ${instances[0].type} ${instances[0].name}\n`;
      
      for (const instance of instances) {
        const labels = Object.keys(instance.labels).length > 0 
          ? `{${Object.entries(instance.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
          : '';
        output += `${instance.name}${labels} ${instance.value}\n`;
      }
      output += '\n';
    }
    
    return output;
  }
}

const prometheus = new PrometheusMetrics();

// Initialize metrics
const workflowExecutionsTotal = prometheus.counter('automation_workflow_executions_total', 'Total number of workflow executions');
const workflowFailuresTotal = prometheus.counter('automation_workflow_failures_total', 'Total number of workflow failures');
const workflowDurationSeconds = prometheus.gauge('automation_workflow_duration_seconds', 'Duration of workflow execution in seconds');
const workflowLastSuccess = prometheus.gauge('automation_workflow_last_success_timestamp_seconds', 'Timestamp of last successful workflow execution');
const systemUptimeSeconds = prometheus.gauge('automation_system_uptime_seconds', 'System uptime in seconds');

// Load workflow state
async function loadWorkflowState() {
  try {
    const statePath = path.join(__dirname, '../state/active-workflows.json');
    const stateData = await fs.readFile(statePath, 'utf8');
    const state = JSON.parse(stateData);
    
    if (state.workflows) {
      for (const [id, workflow] of Object.entries(state.workflows)) {
        metrics.workflows.set(id, {
          ...workflow,
          lastUpdate: workflow.lastUpdate || new Date().toISOString()
        });
        
        // Update Prometheus metrics
        if (workflow.status === 'success') {
          workflowLastSuccess.set(Date.now() / 1000, { workflow: id });
        }
        
        if (workflow.failureCount > 0) {
          workflowFailuresTotal.inc(workflow.failureCount, { workflow: id });
        }
      }
    }
  } catch (error) {
    console.log('No existing workflow state found, starting fresh');
  }
}

// Update metrics periodically
async function updateMetrics() {
  // System uptime
  systemUptimeSeconds.set(Math.floor((Date.now() - metrics.system.startTime) / 1000));
  
  // Reload workflow state
  await loadWorkflowState();
  
  // Calculate totals
  let totalExecutions = 0;
  let successfulExecutions = 0;
  
  for (const workflow of metrics.workflows.values()) {
    if (workflow.lastRun) {
      totalExecutions++;
      if (workflow.status === 'success') {
        successfulExecutions++;
      }
      workflowExecutionsTotal.inc(1, { 
        workflow: workflow.id, 
        status: workflow.status 
      });
    }
  }
  
  metrics.system.totalExecutions = totalExecutions;
  metrics.system.successfulExecutions = successfulExecutions;
  metrics.system.failedExecutions = totalExecutions - successfulExecutions;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: Date.now() - metrics.system.startTime,
    workflows: metrics.workflows.size
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  await updateMetrics();
  res.set('Content-Type', 'text/plain');
  res.send(prometheus.render());
});

// Webhook for real-time updates
app.post('/webhook/workflow', express.json(), async (req, res) => {
  const { workflowId, status, duration, error } = req.body;
  
  if (!workflowId || !status) {
    return res.status(400).json({ error: 'Missing workflowId or status' });
  }
  
  // Update workflow state
  if (metrics.workflows.has(workflowId)) {
    const workflow = metrics.workflows.get(workflowId);
    workflow.status = status;
    workflow.lastRun = new Date().toISOString();
    
    if (status === 'success') {
      workflow.failureCount = 0;
      workflowLastSuccess.set(Date.now() / 1000, { workflow: workflowId });
    } else if (status === 'failed') {
      workflow.failureCount = (workflow.failureCount || 0) + 1;
      workflowFailuresTotal.inc(1, { workflow: workflowId });
    }
    
    if (duration) {
      workflowDurationSeconds.set(duration, { workflow: workflowId });
      workflowExecutionsTotal.inc(1, { workflow: workflowId, status });
    }
  }
  
  res.json({ received: true });
});

// API endpoints
app.get('/api/workflows', (req, res) => {
  const workflows = Array.from(metrics.workflows.entries()).map(([id, workflow]) => ({
    id,
    ...workflow
  }));
  res.json(workflows);
});

app.get('/api/system', (req, res) => {
  res.json({
    ...metrics.system,
    uptime: Date.now() - metrics.system.startTime
  });
});

// Start server
async function start() {
  console.log('🔧 Starting Automation Metrics Server...');
  
  await loadWorkflowState();
  
  // Update metrics every 30 seconds
  setInterval(updateMetrics, 30000);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Metrics server running on port ${PORT}`);
    console.log(`📊 Prometheus metrics: http://localhost:${PORT}/metrics`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

start().catch(console.error);

module.exports = { app, metrics };
