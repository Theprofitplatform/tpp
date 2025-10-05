#!/usr/bin/env tsx
/**
 * Workflow Validation Script
 * Validates exported workflow JSON structure and integrity
 */

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Workflow JSON schema
const workflowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  active: z.boolean(),
  nodes: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.string(),
    position: z.array(z.number()).length(2),
    parameters: z.record(z.any()),
  })).min(1),
  connections: z.record(z.any()),
  settings: z.record(z.any()).optional(),
  staticData: z.any().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

async function validateWorkflows() {
  console.log('🔍 Validating workflow JSON files...\n');

  const exportsDir = path.join(process.cwd(), 'exports', 'workflows');

  // Check if exports directory exists
  try {
    await fs.access(exportsDir);
  } catch {
    console.error('❌ Exports directory not found:', exportsDir);
    console.log('   Run `npm run export:workflows` first');
    process.exit(1);
  }

  // Read all JSON files
  const files = await fs.readdir(exportsDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.log('⚠️  No workflow JSON files found');
    console.log('   Run `npm run export:workflows` first');
    return;
  }

  const validFiles: string[] = [];
  const invalidFiles: Array<{ file: string; error: string }> = [];

  for (const file of jsonFiles) {
    const filepath = path.join(exportsDir, file);

    try {
      console.log(`🔍 Validating ${file}...`);

      // Read and parse JSON
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);

      // Validate against schema
      const result = workflowSchema.safeParse(data);

      if (!result.success) {
        const errors = result.error.issues.map((issue) =>
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');

        throw new Error(`Schema validation failed: ${errors}`);
      }

      // Additional validations
      if (data.nodes.length === 0) {
        throw new Error('Workflow has no nodes');
      }

      // Check for webhook nodes
      const webhookNodes = data.nodes.filter((node: any) =>
        node.type === 'n8n-nodes-base.webhook'
      );

      if (webhookNodes.length > 0) {
        console.log(`   ℹ️  Found ${webhookNodes.length} webhook node(s)`);
      }

      // Check for error workflow
      if (data.settings?.errorWorkflow) {
        console.log(`   ℹ️  Has error workflow: ${data.settings.errorWorkflow}`);
      }

      console.log(`   ✅ Valid - ${data.nodes.length} nodes, active: ${data.active}\n`);
      validFiles.push(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Invalid: ${errorMessage}\n`);
      invalidFiles.push({ file, error: errorMessage });
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Valid:   ${validFiles.length}`);
  console.log(`❌ Invalid: ${invalidFiles.length}`);
  console.log(`📁 Total:   ${jsonFiles.length}`);
  console.log('='.repeat(60));

  if (invalidFiles.length > 0) {
    console.log('\n❌ Invalid files:');
    invalidFiles.forEach(({ file, error }) => {
      console.log(`  - ${file}`);
      console.log(`    Error: ${error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All workflow files are valid!');
  }
}

validateWorkflows().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
