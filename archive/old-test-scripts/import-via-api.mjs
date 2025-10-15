#!/usr/bin/env node
/**
 * Import n8n workflow via REST API
 * Uses basic auth or creates workflows directly
 */

import fs from 'fs';
import https from 'https';
import http from 'http';

const N8N_URL = process.env.N8N_URL || 'https://n8n.theprofitplatform.com.au';
const WORKFLOW_FILE = '/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json';

// Load workflow
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf8'));

console.log('🚀 n8n Workflow Import via API');
console.log('===============================\n');
console.log(`Workflow: ${workflow.name}`);
console.log(`Nodes: ${workflow.nodes.length}`);
console.log(`Target: ${N8N_URL}\n`);

// Try to import without auth first (for public instances)
async function importWorkflow() {
    const url = new URL(`/api/v1/workflows`, N8N_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const data = JSON.stringify(workflow);

    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
        rejectUnauthorized: false // For self-signed certs
    };

    return new Promise((resolve, reject) => {
        const req = lib.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        statusCode: res.statusCode,
                        body: parsed
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Alternative: Use n8n CLI if available
async function importViaCLI() {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
        const cmd = `n8n import:workflow --input="${WORKFLOW_FILE}"`;
        const { stdout, stderr } = await execAsync(cmd);
        return { success: true, output: stdout || stderr };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Main execution
try {
    console.log('📤 Attempting API import...\n');

    const response = await importWorkflow();

    if (response.statusCode === 200 || response.statusCode === 201) {
        console.log('✅ Workflow imported successfully!');
        console.log(`   ID: ${response.body.id}`);
        console.log(`   Name: ${response.body.name}`);
        console.log(`   Active: ${response.body.active}`);
        console.log();

        if (response.body.id) {
            console.log(`🔗 Workflow URL:`);
            console.log(`   ${N8N_URL}/workflow/${response.body.id}`);
            console.log();
        }

        console.log('📋 Next: Configure credentials in n8n UI');
        process.exit(0);

    } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log('⚠️  API requires authentication\n');
        console.log('Trying alternative: n8n CLI...\n');

        const cliResult = await importViaCLI();

        if (cliResult.success) {
            console.log('✅ Imported via CLI');
            console.log(cliResult.output);
            process.exit(0);
        } else {
            console.log('❌ CLI import failed:', cliResult.error);
            console.log();
            printManualInstructions();
            process.exit(1);
        }

    } else {
        console.log(`❌ Import failed: HTTP ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
        console.log();
        printManualInstructions();
        process.exit(1);
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log();
    printManualInstructions();
    process.exit(1);
}

function printManualInstructions() {
    console.log('📋 Manual Import Instructions:');
    console.log('==============================\n');
    console.log(`1. Open: ${N8N_URL}`);
    console.log(`2. Click "+" → "Import from File"`);
    console.log(`3. Select: ${WORKFLOW_FILE}`);
    console.log(`4. Configure credentials (PostgreSQL + SMTP)`);
    console.log(`5. Activate workflow`);
    console.log();
    console.log('Then run tests:');
    console.log('   node scripts/test-seo-workflow.cjs');
    console.log();
}
