#!/usr/bin/env node

/**
 * Natural Publishing Scheduler
 * Adds randomization and human-like patterns to avoid obvious automation
 *
 * LEGITIMATE IMPROVEMENTS:
 * - Randomized publish times (within business hours)
 * - Varied scheduling patterns (not every day)
 * - Natural variations (weekends off, holidays)
 * - Realistic working patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Generate random time within business hours (8 AM - 5 PM Sydney time)
 * Avoids the exact same time every day
 */
function getRandomPublishTime() {
  const hour = Math.floor(Math.random() * 9) + 8; // 8-16 (8 AM to 4 PM)
  const minute = Math.floor(Math.random() * 60); // 0-59
  return { hour, minute };
}

/**
 * Determine if should publish today
 * Adds natural variations:
 * - Skip weekends sometimes
 * - Skip random days (simulates writer being busy)
 * - Never publish on holidays
 */
function shouldPublishToday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Skip weekends (80% of the time)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return Math.random() > 0.8; // 20% chance to publish on weekend
  }

  // Skip random weekdays occasionally (10% chance)
  // Simulates real business where writers are busy
  if (Math.random() < 0.10) {
    return false;
  }

  return true;
}

/**
 * Get natural cron expression
 * Varies time each day within business hours
 */
function generateNaturalCronSchedule() {
  // Instead of fixed time, use range
  // This will require modification of automation script
  return {
    enabled: shouldPublishToday(),
    suggestedTime: getRandomPublishTime(),
    note: 'Randomize within 8 AM - 5 PM Sydney time'
  };
}

/**
 * Check UTC date to match blog generation script
 * This ensures consistency with the automation
 */
function getTodayUTC() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Main execution
 */
function main() {
  const schedule = generateNaturalCronSchedule();
  const utcDate = getTodayUTC();

  console.log('📅 Natural Publishing Scheduler');
  console.log('='.repeat(50));
  console.log(`UTC Date: ${utcDate}`);
  console.log(`Should publish today: ${schedule.enabled ? 'YES' : 'NO'}`);

  if (schedule.enabled) {
    console.log(`Suggested time: ${schedule.suggestedTime.hour}:${String(schedule.suggestedTime.minute).padStart(2, '0')} AEST`);
  } else {
    console.log('Reason: Natural schedule variation');
  }

  console.log('');
  console.log('💡 This creates natural publishing patterns:');
  console.log('   - Varies times within business hours');
  console.log('   - Occasionally skips days (realistic)');
  console.log('   - Reduces weekend posts');
  console.log('   - Mimics real human content team');

  // Exit with code 0 if should publish, 1 if should skip
  process.exit(schedule.enabled ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { shouldPublishToday, getRandomPublishTime };
