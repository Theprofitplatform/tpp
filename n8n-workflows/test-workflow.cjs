#!/usr/bin/env node

/**
 * Tool Improvement Agent - Manual Test
 * This script simulates the workflow execution
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Tool Improvement Agent workflow...\n');

// Tool rotation logic
const tools = [
  'rank-tracker',
  'revenue-leak-detector',
  'speed-test',
  'website-speed-test',
  'keyword-difficulty-checker',
  'local-rankings-map',
  'seo-audit-tool'
];

// Select first tool for test
const currentTool = tools[0];
const toolName = currentTool.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

console.log(`📊 Testing tool: ${toolName}`);
console.log(`   File: ${currentTool}.astro\n`);

// Read tool file
const toolPath = `/home/avi/projects/astro-site/src/pages/tools/${currentTool}.astro`;

let content = '';
let fileExists = false;

try {
  content = fs.readFileSync(toolPath, 'utf8');
  fileExists = true;
  console.log(`✅ File read successfully (${content.length} characters)\n`);
} catch (error) {
  console.log(`❌ Error reading file: ${error.message}\n`);
  console.log(`📍 Expected path: ${toolPath}\n`);

  // List available tools
  const toolsDir = '/home/avi/projects/astro-site/src/pages/tools';
  try {
    const files = fs.readdirSync(toolsDir);
    console.log(`📁 Available tool files:`);
    files.forEach(file => console.log(`   • ${file}`));
  } catch (e) {
    console.log(`⚠️  Cannot read tools directory: ${toolsDir}`);
  }
  process.exit(1);
}

// Analyze content (simplified)
const hasMockData = content.includes('mockData') || content.includes('// Mock') || content.includes('const data = [');
const hasCharts = content.includes('chart') || content.includes('history') || content.includes('trend');
const hasExport = content.includes('export') || content.includes('download') || content.includes('PDF');

console.log('🔍 Analysis Results:');
console.log(`   • Mock Data Found: ${hasMockData ? '✅ YES' : '❌ NO'}`);
console.log(`   • Charts/History: ${hasCharts ? '✅ YES' : '❌ NO'}`);
console.log(`   • Export Features: ${hasExport ? '✅ YES' : '❌ NO'}`);
console.log('');

// Count improvements needed
let improvementCount = 0;
if (hasMockData) improvementCount++;
if (!hasCharts) improvementCount++;
if (!hasExport) improvementCount++;

console.log(`💡 Improvements Suggested: ${improvementCount}`);
console.log('');

if (improvementCount === 0) {
  console.log('✨ No improvements needed! This tool is already well-built.');
  console.log('');
  console.log('⏭️  The workflow will skip this tool and try the next one.');
} else {
  console.log('📧 Email Report Preview:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Tool: ${toolName}`);
  console.log(`Improvements: ${improvementCount}`);

  if (hasMockData) {
    console.log('\n1. Replace Mock Data with Real API Integration');
    console.log('   Priority: CRITICAL');
    console.log('   Time: 6-8 hours');
  }

  if (!hasCharts) {
    console.log('\n2. Add Historical Tracking & Charts');
    console.log('   Priority: HIGH');
    console.log('   Time: 4-6 hours');
  }

  if (!hasExport) {
    console.log('\n3. Add Export/Download Functionality');
    console.log('   Priority: MEDIUM');
    console.log('   Time: 3-4 hours');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ This email would be sent to: abhishekmaharjan3737@gmail.com');
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Workflow test completed successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('🎯 The actual n8n workflow is running and will:');
console.log('   • Execute every 30 minutes automatically');
console.log('   • Rotate through all 7 tools');
console.log('   • Send HTML emails with detailed reports');
console.log('');
console.log('⏰ Next automatic execution: Within 30 minutes');
console.log('');
