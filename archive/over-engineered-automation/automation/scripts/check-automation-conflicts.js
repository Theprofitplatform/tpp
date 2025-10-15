#!/usr/bin/env node

/**
 * Conflict Detection Script for Blog Automation
 * Checks for potential conflicts between local and VPS environments
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

async function checkGitSync() {
  console.log('🔍 Checking Git Synchronization...');

  try {
    // Check if local is behind remote
    const localVsRemote = execSync('git log --oneline origin/main..HEAD', { encoding: 'utf8' }).trim();
    const remoteVsLocal = execSync('git log --oneline HEAD..origin/main', { encoding: 'utf8' }).trim();

    if (remoteVsLocal) {
      console.log('❌ Local is behind remote by commits:');
      console.log(remoteVsLocal);
      return false;
    }

    if (localVsRemote) {
      console.log('⚠️  Local has uncommitted changes:');
      console.log(localVsRemote);
    }

    console.log('✅ Git synchronization: OK');
    return true;
  } catch (error) {
    console.log('❌ Git sync check failed:', error.message);
    return false;
  }
}

async function checkDuplicatePosts() {
  console.log('\n📝 Checking for duplicate posts...');

  try {
    const today = new Date().toISOString().split('T')[0];
    const posts = await fs.readdir('src/content/blog');
    const todayPosts = posts.filter(post => post.startsWith(today));

    if (todayPosts.length > 1) {
      console.log(`❌ Multiple posts generated today: ${todayPosts.join(', ')}`);
      return false;
    }

    if (todayPosts.length === 1) {
      console.log(`✅ Single post today: ${todayPosts[0]}`);
    } else {
      console.log('✅ No posts generated today');
    }

    return true;
  } catch (error) {
    console.log('❌ Duplicate post check failed:', error.message);
    return false;
  }
}

async function checkTopicQueue() {
  console.log('\n📋 Checking topic queue consistency...');

  try {
    const queueData = JSON.parse(await fs.readFile('automation/topic-queue.json', 'utf8'));
    const pending = queueData.queue.filter(t => t.status === 'pending');
    const published = queueData.queue.filter(t => t.status === 'published');

    console.log(`📊 Queue status: ${pending.length} pending, ${published.length} published`);

    // Check for duplicate published dates
    const publishedDates = published.map(p => p.publishedDate);
    const duplicateDates = publishedDates.filter((date, index) => publishedDates.indexOf(date) !== index);

    if (duplicateDates.length > 0) {
      console.log(`❌ Duplicate published dates: ${duplicateDates.join(', ')}`);
      return false;
    }

    console.log('✅ Topic queue: OK');
    return true;
  } catch (error) {
    console.log('❌ Topic queue check failed:', error.message);
    return false;
  }
}

async function checkEnvironment() {
  console.log('\n🏠 Checking environment configuration...');

  try {
    const config = JSON.parse(await fs.readFile('automation/automation-config.json', 'utf8'));

    if (config.automation.primaryEnvironment !== 'vps') {
      console.log('❌ Primary environment should be VPS');
      return false;
    }

    if (config.automation.local.enabled) {
      console.log('⚠️  Local automation should be disabled');
    }

    console.log('✅ Environment configuration: OK');
    return true;
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Blog Automation Conflict Detection\n');

  const checks = [
    await checkGitSync(),
    await checkDuplicatePosts(),
    await checkTopicQueue(),
    await checkEnvironment()
  ];

  const allPassed = checks.every(check => check);

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - No conflicts detected');
  } else {
    console.log('❌ CONFLICTS DETECTED - Review the issues above');
    console.log('\n💡 Run these commands to resolve:');
    console.log('   git pull origin main');
    console.log('   git add . && git commit -m "Fix conflicts"');
    console.log('   git push origin main');
  }
  console.log('='.repeat(50));
}

main().catch(console.error);