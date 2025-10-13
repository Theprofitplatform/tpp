#!/usr/bin/env node
/**
 * n8n Workflow Validator
 * Checks workflows for common issues before deployment
 */

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol} ${message}${colors.reset}`);
}

function validateWorkflow(workflowPath) {
  log('blue', '🔍', `Validating: ${workflowPath}`);
  console.log('');

  let workflow;
  let hasErrors = false;
  let hasWarnings = false;

  // Check file exists
  if (!fs.existsSync(workflowPath)) {
    log('red', '❌', `File not found: ${workflowPath}`);
    process.exit(1);
  }

  // Check JSON validity
  try {
    const content = fs.readFileSync(workflowPath, 'utf8');
    workflow = JSON.parse(content);
    log('green', '✅', 'Valid JSON structure');
  } catch (error) {
    log('red', '❌', `Invalid JSON: ${error.message}`);
    process.exit(1);
  }

  // Validate workflow structure
  if (!workflow.name) {
    log('red', '❌', 'Missing workflow name');
    hasErrors = true;
  } else {
    log('green', '✅', `Workflow name: ${workflow.name}`);
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    log('red', '❌', 'Missing or invalid nodes array');
    hasErrors = true;
  } else {
    log('green', '✅', `Found ${workflow.nodes.length} nodes`);
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    log('yellow', '⚠️ ', 'Missing or invalid connections object');
    hasWarnings = true;
  }

  console.log('');
  log('blue', '🔎', 'Checking for common issues...');
  console.log('');

  // Check each node
  if (workflow.nodes) {
    workflow.nodes.forEach((node, index) => {
      const nodeLabel = `Node ${index + 1}: ${node.name} (${node.type})`;

      // Discord node checks
      if (node.type === 'n8n-nodes-base.discord') {
        log('blue', '📱', `Checking Discord node: ${node.name}`);

        // Check for old {{ }} syntax
        if (node.parameters?.message) {
          const message = JSON.stringify(node.parameters.message);

          if (message.includes('{{') || message.includes('}}')) {
            log('red', '❌', `${nodeLabel}: Found {{ }} syntax in message parameter`);
            log('yellow', '   ', 'Discord nodes should use n8n expressions like: {{ $json.field }}');
            log('yellow', '   ', 'Or use the expression editor with $json notation');
            hasErrors = true;
          }

          // Check for malformed expressions
          if (message.includes('=${{') || message.includes('}}=')) {
            log('red', '❌', `${nodeLabel}: Malformed expression syntax`);
            hasErrors = true;
          }
        }

        // Check webhook URL
        if (!node.parameters?.webhookUrl && !node.parameters?.webhook) {
          log('yellow', '⚠️ ', `${nodeLabel}: Missing webhook URL`);
          hasWarnings = true;
        }
      }

      // HTTP Request node checks
      if (node.type === 'n8n-nodes-base.httpRequest') {
        log('blue', '🌐', `Checking HTTP Request node: ${node.name}`);

        if (!node.parameters?.url) {
          log('red', '❌', `${nodeLabel}: Missing URL parameter`);
          hasErrors = true;
        }

        // Check for hardcoded credentials
        const params = JSON.stringify(node.parameters);
        if (params.includes('password') || params.includes('api_key') || params.includes('token')) {
          log('yellow', '⚠️ ', `${nodeLabel}: May contain hardcoded credentials - review manually`);
          hasWarnings = true;
        }
      }

      // Webhook node checks
      if (node.type === 'n8n-nodes-base.webhook') {
        log('blue', '🔗', `Checking Webhook node: ${node.name}`);

        if (!node.parameters?.path) {
          log('yellow', '⚠️ ', `${nodeLabel}: Missing webhook path`);
          hasWarnings = true;
        }
      }

      // Code node checks
      if (node.type === 'n8n-nodes-base.code') {
        log('blue', '💻', `Checking Code node: ${node.name}`);

        if (node.parameters?.jsCode) {
          const code = node.parameters.jsCode;

          // Check for common mistakes
          if (code.includes('console.log')) {
            log('yellow', '⚠️ ', `${nodeLabel}: Contains console.log (won't show in n8n logs)`);
            hasWarnings = true;
          }

          if (!code.includes('return')) {
            log('yellow', '⚠️ ', `${nodeLabel}: Code doesn't return data`);
            hasWarnings = true;
          }
        }
      }

      // Check for missing credentials
      if (node.credentials && Object.keys(node.credentials).length > 0) {
        Object.keys(node.credentials).forEach(credType => {
          if (!node.credentials[credType].id) {
            log('red', '❌', `${nodeLabel}: Missing credential ID for ${credType}`);
            hasErrors = true;
          }
        });
      }

      // Check disabled nodes
      if (node.disabled === true) {
        log('yellow', '⚠️ ', `${nodeLabel}: Node is disabled`);
        hasWarnings = true;
      }
    });
  }

  // Check connections
  if (workflow.connections) {
    const nodeNames = workflow.nodes.map(n => n.name);
    Object.keys(workflow.connections).forEach(nodeName => {
      if (!nodeNames.includes(nodeName)) {
        log('yellow', '⚠️ ', `Connection references non-existent node: ${nodeName}`);
        hasWarnings = true;
      }
    });
  }

  // Summary
  console.log('');
  console.log('━'.repeat(60));
  if (hasErrors) {
    log('red', '❌', 'VALIDATION FAILED - Fix errors before deploying');
    console.log('━'.repeat(60));
    process.exit(1);
  } else if (hasWarnings) {
    log('yellow', '⚠️ ', 'VALIDATION PASSED with warnings');
    log('yellow', '   ', 'Review warnings before deploying to production');
    console.log('━'.repeat(60));
    process.exit(0);
  } else {
    log('green', '✅', 'VALIDATION PASSED - Workflow looks good!');
    console.log('━'.repeat(60));
    process.exit(0);
  }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node validate-n8n-workflow.js <workflow-file.json>');
  process.exit(1);
}

validateWorkflow(args[0]);
