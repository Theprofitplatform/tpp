#!/usr/bin/env node

/**
 * Topic Queue Checker
 * Checks the topic queue and alerts if running low
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TOPIC_QUEUE_PATH = path.join(PROJECT_ROOT, 'automation/topic-queue.json');

// Alert thresholds
const WARN_THRESHOLD = 10;  // Warning when < 10 topics
const CRITICAL_THRESHOLD = 5;  // Critical when < 5 topics

function checkQueue() {
  const queueData = JSON.parse(fs.readFileSync(TOPIC_QUEUE_PATH, 'utf-8'));
  const pendingCount = queueData.queue.filter(t => t.status === 'pending').length;
  const totalCount = queueData.queue.length;

  console.log('📊 Topic Queue Status');
  console.log('='.repeat(50));
  console.log(`Total topics: ${totalCount}`);
  console.log(`Pending topics: ${pendingCount}`);
  console.log(`Completed topics: ${totalCount - pendingCount}`);
  console.log('');

  // Status check
  if (pendingCount === 0) {
    console.log('🚨 CRITICAL: No pending topics!');
    console.log('   Blog automation will stop generating posts.');
    console.log('   Run: npm run topics:generate');
    return 'critical';
  } else if (pendingCount < CRITICAL_THRESHOLD) {
    console.log(`🚨 CRITICAL: Only ${pendingCount} topics remaining!`);
    console.log('   You have less than a week of content.');
    console.log('   Run: npm run topics:generate');
    return 'critical';
  } else if (pendingCount < WARN_THRESHOLD) {
    console.log(`⚠️  WARNING: Only ${pendingCount} topics remaining`);
    console.log('   Consider generating more topics soon.');
    console.log('   Run: npm run topics:generate');
    return 'warning';
  } else {
    console.log(`✅ HEALTHY: ${pendingCount} topics remaining`);
    console.log(`   Approximately ${pendingCount} days of content.`);
    return 'healthy';
  }
}

function listPendingTopics(limit = 10) {
  const queueData = JSON.parse(fs.readFileSync(TOPIC_QUEUE_PATH, 'utf-8'));
  const pending = queueData.queue.filter(t => t.status === 'pending');

  console.log('');
  console.log('📝 Next Pending Topics:');
  console.log('='.repeat(50));

  pending.slice(0, limit).forEach((topic, i) => {
    console.log(`${i + 1}. ${topic.title}`);
    console.log(`   Category: ${topic.category} | Keyword: ${topic.targetKeyword}`);
  });

  if (pending.length > limit) {
    console.log(`\n   ... and ${pending.length - limit} more`);
  }
}

// Main execution
const args = process.argv.slice(2);
const status = checkQueue();

if (!args.includes('--status-only')) {
  listPendingTopics();
}

// Exit with appropriate code
if (status === 'critical') {
  process.exit(2);
} else if (status === 'warning') {
  process.exit(1);
} else {
  process.exit(0);
}
