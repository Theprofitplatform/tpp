/**
 * Global Test Setup
 * Runs before all tests to configure environment
 */

import { beforeAll, afterAll } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { config } from '@/lib/config';

beforeAll(async () => {
  console.log('='.repeat(60));
  console.log('🧪 n8n Test Harness - Starting Test Suite');
  console.log('='.repeat(60));
  console.log(`n8n Instance: ${config.n8n.apiBase}`);
  console.log(`Workflows to test: ${config.workflows.ids.join(', ')}`);
  console.log(`Test timeout: ${config.test.timeout}ms`);
  console.log(`Poll interval: ${config.test.pollInterval}ms`);
  console.log('='.repeat(60));

  // Verify n8n instance is accessible
  console.log('🔍 Checking n8n health...');
  try {
    const isHealthy = await n8nAPI.healthCheck();
    if (!isHealthy) {
      throw new Error('n8n health check failed');
    }
    console.log('✅ n8n instance is healthy');
  } catch (error) {
    console.error('❌ n8n health check failed:', error);
    throw new Error(
      'Cannot connect to n8n instance. Check N8N_API_BASE and N8N_API_TOKEN in .env'
    );
  }

  // Verify workflows exist and are active
  if (config.workflows.ids.length > 0) {
    console.log('🔍 Verifying workflows...');
    for (const workflowId of config.workflows.ids) {
      try {
        const workflow = await n8nAPI.getWorkflow(workflowId.toString());
        console.log(
          `  ✅ Workflow ${workflowId}: "${workflow.name}" (${workflow.active ? 'active' : 'inactive'})`
        );

        if (!workflow.active) {
          console.warn(
            `  ⚠️  Warning: Workflow ${workflowId} is not active. Tests may fail.`
          );
        }
      } catch (error) {
        console.error(`  ❌ Workflow ${workflowId} not found or inaccessible`);
        throw new Error(`Workflow ${workflowId} does not exist or is not accessible`);
      }
    }
  }

  console.log('='.repeat(60));
  console.log('✅ Setup complete - starting tests...');
  console.log('='.repeat(60));
});

afterAll(() => {
  console.log('='.repeat(60));
  console.log('🏁 Test suite completed');
  console.log('='.repeat(60));
});
