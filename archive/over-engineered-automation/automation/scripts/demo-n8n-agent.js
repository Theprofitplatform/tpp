#!/usr/bin/env node

/**
 * n8n Workflow Agent Demo
 * Demonstrates the complete workflow review process
 */

import fs from 'fs';
import path from 'path';

const WORKFLOW_PATH = '../workflows/manual-blog-automation-fixed.json';

console.log('🚀 n8n Workflow Agent Demo\n');

// 1. Load and analyze workflow
console.log('1. 📊 Loading workflow...');
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf8'));

console.log(`   Workflow: ${workflow.name}`);
console.log(`   Nodes: ${workflow.nodes.length}`);
console.log(`   Trigger: ${workflow.nodes.find(n => n.type.includes('Trigger'))?.type}`);

// 2. Analyze node types
console.log('\n2. 🔍 Analyzing node types...');
const nodeTypes = {};
workflow.nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
});

Object.entries(nodeTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
});

// 3. Check for common issues
console.log('\n3. ⚠️  Checking for common issues...');

// Check for expressions
const workflowJson = JSON.stringify(workflow);
if (workflowJson.includes('{{ $json,')) {
    console.log('   ❌ Found expression syntax error: {{ $json,field }} should be {{ $json.field }}');
} else {
    console.log('   ✅ Expression syntax looks good');
}

// Check for credentials
const hasCredentials = workflow.nodes.some(node => node.credentials);
if (!hasCredentials) {
    console.log('   ⚠️  No credentials configured (using API keys directly)');
} else {
    console.log('   ✅ Credentials configured');
}

// Check for error handling
const hasErrorHandling = workflow.nodes.some(node =>
    node.name?.toLowerCase().includes('error')
);
if (!hasErrorHandling) {
    console.log('   ⚠️  No explicit error handling nodes');
} else {
    console.log('   ✅ Error handling configured');
}

// 4. Connection analysis
console.log('\n4. 🔗 Analyzing connections...');
if (workflow.connections) {
    const connectionCount = Object.keys(workflow.connections).length;
    console.log(`   Total connection groups: ${connectionCount}`);

    // Check for unreachable nodes
    const reachable = new Set();
    const triggerNodes = workflow.nodes.filter(n => n.type.includes('Trigger'));

    triggerNodes.forEach(trigger => {
        reachable.add(trigger.name);
        traverseConnections(trigger.name, reachable, workflow.connections);
    });

    const unreachable = workflow.nodes.filter(n => !reachable.has(n.name));
    if (unreachable.length > 0) {
        console.log(`   ⚠️  ${unreachable.length} unreachable nodes: ${unreachable.map(n => n.name).join(', ')}`);
    } else {
        console.log('   ✅ All nodes are reachable');
    }
} else {
    console.log('   ⚠️  No connections defined');
}

// 5. Recommendations
console.log('\n5. 💡 Recommendations:');
console.log('   - Add timeout to HTTP Request nodes');
console.log('   - Use credentials instead of hardcoded API keys');
console.log('   - Add explicit error handling for API failures');
console.log('   - Consider adding retry logic for external APIs');

// 6. Next Steps
console.log('\n6. 📋 Next Steps:');
console.log('   - Run full validation: node validate-workflow.js ' + WORKFLOW_PATH);
console.log('   - Test workflow: bash test-n8n-workflow.sh ' + WORKFLOW_PATH);
console.log('   - Generate full report: node workflow-reviewer.js ' + WORKFLOW_PATH);

console.log('\n🎉 Demo complete! The n8n Workflow Agent is ready to use.');

// Helper function
function traverseConnections(nodeName, visited, connections) {
    const nodeConnections = connections[nodeName];
    if (!nodeConnections) return;

    if (nodeConnections.main) {
        nodeConnections.main.forEach(connectionGroup => {
            connectionGroup.forEach(connection => {
                if (!visited.has(connection.node)) {
                    visited.add(connection.node);
                    traverseConnections(connection.node, visited, connections);
                }
            });
        });
    }
}