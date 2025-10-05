#!/usr/bin/env tsx
/**
 * Postman Collection Generator
 * Generates Postman collection from test fixtures
 */

import fs from 'fs/promises';
import path from 'path';
import { getWebhookTestUrl } from '../src/lib/config.js';

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    body: {
      mode: string;
      raw: string;
    };
    url: {
      raw: string;
      protocol: string;
      host: string[];
      path: string[];
    };
  };
}

interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanRequest[];
}

async function generatePostmanCollection() {
  console.log('📮 Generating Postman collection...\n');

  const collection: PostmanCollection = {
    info: {
      name: 'n8n QA Test Suite',
      description: 'Automated test collection for n8n workflows',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
  };

  // Scan fixtures directory
  const fixturesDir = path.join(process.cwd(), 'fixtures');
  const workflows = await fs.readdir(fixturesDir);

  for (const workflow of workflows) {
    const workflowDir = path.join(fixturesDir, workflow);
    const stat = await fs.stat(workflowDir);

    if (!stat.isDirectory()) continue;

    console.log(`📁 Processing workflow: ${workflow}`);

    try {
      // Get webhook URL for this workflow
      const webhookUrl = getWebhookTestUrl(workflow);
      const url = new URL(webhookUrl);

      // Read fixture files
      const fixtureFiles = await fs.readdir(workflowDir);

      for (const file of fixtureFiles) {
        if (!file.endsWith('.json')) continue;

        const fixturePath = path.join(workflowDir, file);
        const fixtureContent = await fs.readFile(fixturePath, 'utf-8');
        const fixtureName = path.basename(file, '.json');

        const request: PostmanRequest = {
          name: `${workflow} - ${fixtureName}`,
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
            ],
            body: {
              mode: 'raw',
              raw: fixtureContent,
            },
            url: {
              raw: webhookUrl,
              protocol: url.protocol.replace(':', ''),
              host: url.hostname.split('.'),
              path: url.pathname.split('/').filter(Boolean),
            },
          },
        };

        collection.item.push(request);
        console.log(`  ✅ Added: ${fixtureName}`);
      }
    } catch (error) {
      console.warn(`  ⚠️  Skipping ${workflow}: ${error}`);
    }
  }

  // Write collection to file
  const outputPath = path.join(process.cwd(), 'exports', 'n8n-qa-postman-collection.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(collection, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Postman collection generated');
  console.log('='.repeat(60));
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📮 Requests: ${collection.item.length}`);
  console.log('\nImport this file into Postman to run tests manually.');
}

generatePostmanCollection().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});
