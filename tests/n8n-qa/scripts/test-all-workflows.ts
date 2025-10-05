#!/usr/bin/env tsx
/**
 * Test All Workflows Script
 * Tests each workflow for basic functionality and reports issues
 */

import { n8nAPI } from '../src/lib/api.js';
import { config } from '../src/lib/config.js';

interface WorkflowTestResult {
  id: string;
  name: string;
  active: boolean;
  nodeCount: number;
  hasWebhook: boolean;
  hasAI: boolean;
  aiNodes: string[];
  lastExecution?: {
    status: string | null;
    startedAt: string;
  };
  issues: string[];
}

async function testAllWorkflows() {
  console.log('🧪 Testing All n8n Workflows\n');
  console.log('='.repeat(60));

  const results: WorkflowTestResult[] = [];

  for (const workflowId of config.workflows.ids) {
    console.log(`\n📋 Testing workflow: ${workflowId}`);

    try {
      // Get workflow details
      const workflow = await n8nAPI.getWorkflow(workflowId);

      const result: WorkflowTestResult = {
        id: workflowId,
        name: workflow.name,
        active: workflow.active,
        nodeCount: workflow.nodes.length,
        hasWebhook: false,
        hasAI: false,
        aiNodes: [],
        issues: [],
      };

      // Check for webhook nodes
      const webhookNodes = workflow.nodes.filter((node: any) =>
        node.type === 'n8n-nodes-base.webhook'
      );
      result.hasWebhook = webhookNodes.length > 0;

      // Check for AI nodes
      const aiNodeTypes = [
        'openai',
        'anthropic',
        '@n8n/n8n-nodes-langchain',
        'ai',
        'llm',
        'gpt',
        'claude'
      ];

      const aiNodes = workflow.nodes.filter((node: any) =>
        aiNodeTypes.some(type => node.type.toLowerCase().includes(type))
      );

      result.hasAI = aiNodes.length > 0;
      result.aiNodes = aiNodes.map((node: any) => `${node.name} (${node.type})`);

      // Get recent executions
      try {
        const executions = await n8nAPI.listExecutions({
          workflowId,
          limit: 1,
        });

        if (executions.length > 0) {
          result.lastExecution = {
            status: executions[0].status,
            startedAt: executions[0].startedAt,
          };
        }
      } catch (error) {
        result.issues.push('Failed to fetch executions');
      }

      // Validate workflow
      if (!result.active) {
        result.issues.push('Workflow is not active');
      }

      if (result.nodeCount === 0) {
        result.issues.push('Workflow has no nodes');
      }

      if (result.hasAI) {
        result.issues.push(`Uses AI nodes: ${result.aiNodes.join(', ')}`);
      }

      results.push(result);

      // Print result
      console.log(`  ✅ Name: ${result.name}`);
      console.log(`  📊 Nodes: ${result.nodeCount}`);
      console.log(`  🔗 Webhook: ${result.hasWebhook ? 'Yes' : 'No'}`);
      console.log(`  🤖 AI Nodes: ${result.hasAI ? 'Yes' : 'No'}`);

      if (result.aiNodes.length > 0) {
        console.log(`     AI: ${result.aiNodes.join(', ')}`);
      }

      if (result.lastExecution) {
        console.log(`  ⏱️  Last execution: ${result.lastExecution.startedAt} (${result.lastExecution.status || 'running'})`);
      }

      if (result.issues.length > 0) {
        console.log(`  ⚠️  Issues:`);
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }

    } catch (error) {
      console.error(`  ❌ Failed to test workflow: ${error}`);
      results.push({
        id: workflowId,
        name: 'Error',
        active: false,
        nodeCount: 0,
        hasWebhook: false,
        hasAI: false,
        aiNodes: [],
        issues: [`Failed to fetch: ${error}`],
      });
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');

  const activeCount = results.filter(r => r.active).length;
  const webhookCount = results.filter(r => r.hasWebhook).length;
  const aiCount = results.filter(r => r.hasAI).length;
  const issueCount = results.filter(r => r.issues.length > 0).length;

  console.log(`Total workflows: ${results.length}`);
  console.log(`Active: ${activeCount}`);
  console.log(`With webhooks: ${webhookCount}`);
  console.log(`With AI nodes: ${aiCount}`);
  console.log(`With issues: ${issueCount}`);

  console.log('\n🤖 AI NODES FOUND:\n');

  const aiWorkflows = results.filter(r => r.hasAI);
  if (aiWorkflows.length === 0) {
    console.log('  ✅ No AI nodes found - ready for Claude Code integration!');
  } else {
    aiWorkflows.forEach(wf => {
      console.log(`  📋 ${wf.name}:`);
      wf.aiNodes.forEach(node => console.log(`     - ${node}`));
    });

    console.log(`\n⚠️  ${aiCount} workflow(s) use paid AI APIs`);
    console.log('💡 These should be replaced with Claude Code on VPS');
  }

  console.log('\n' + '='.repeat(60));

  // Write results to JSON
  const outputPath = 'workflow-test-results.json';
  await import('fs/promises').then(fs =>
    fs.writeFile(outputPath, JSON.stringify(results, null, 2))
  );

  console.log(`\n📄 Results saved to: ${outputPath}`);
}

testAllWorkflows().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
