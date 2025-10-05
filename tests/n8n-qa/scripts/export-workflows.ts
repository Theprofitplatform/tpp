#!/usr/bin/env tsx
/**
 * Workflow Export Script
 * Exports all configured workflows as JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import { n8nAPI } from '../src/lib/api.js';
import { config } from '../src/lib/config.js';

async function exportWorkflows() {
  console.log('📦 Exporting n8n workflows...\n');

  const outputDir = path.join(process.cwd(), 'exports', 'workflows');
  await fs.mkdir(outputDir, { recursive: true });

  const workflowIds = config.workflows.ids;

  if (workflowIds.length === 0) {
    console.log('⚠️  No workflows configured in WORKFLOW_IDS');
    console.log('   Add workflow IDs to .env file');
    return;
  }

  const exported: string[] = [];
  const failed: string[] = [];

  for (const workflowId of workflowIds) {
    try {
      console.log(`📥 Exporting workflow ${workflowId}...`);

      // Get workflow details
      const workflow = await n8nAPI.getWorkflow(workflowId.toString());
      console.log(`   Name: "${workflow.name}"`);
      console.log(`   Active: ${workflow.active}`);

      // Export workflow JSON
      const exportData = await n8nAPI.exportWorkflow(workflowId.toString());

      // Sanitize filename
      const filename = `${workflowId}-${workflow.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      const filepath = path.join(outputDir, filename);

      // Write to file
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf-8');

      console.log(`   ✅ Exported to: ${filename}\n`);
      exported.push(filename);
    } catch (error) {
      console.error(`   ❌ Failed to export workflow ${workflowId}:`, error);
      failed.push(workflowId.toString());
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Export Summary');
  console.log('='.repeat(60));
  console.log(`✅ Exported: ${exported.length}`);
  console.log(`❌ Failed:   ${failed.length}`);
  console.log(`📁 Output:   ${outputDir}`);
  console.log('='.repeat(60));

  if (exported.length > 0) {
    console.log('\nExported files:');
    exported.forEach((file) => console.log(`  - ${file}`));
  }

  if (failed.length > 0) {
    console.log('\nFailed workflow IDs:');
    failed.forEach((id) => console.log(`  - ${id}`));
    process.exit(1);
  }
}

exportWorkflows().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
