#!/usr/bin/env node
/**
 * Auto-Insights Generator
 * Analyzes blog performance data and generates actionable recommendations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function generateInsights() {
  console.log('\n🔍 Analyzing Blog Performance Data...\n');
  console.log('━'.repeat(60));

  // Load performance report
  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));

  const insights = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPosts: report.summary.totalPosts,
      totalPageviews: report.analytics?.totalPageviews || 0,
      avgEngagementRate: report.analytics?.avgEngagementRate || 0,
      totalClicks: report.searchConsole?.totalClicks || 0,
      totalImpressions: report.searchConsole?.totalImpressions || 0
    },
    criticalActions: [],
    quickWins: [],
    contentOpportunities: [],
    technicalIssues: [],
    growthStrategies: []
  };

  // 1. CRITICAL ACTIONS - Issues that need immediate attention
  console.log('\n🚨 CRITICAL ACTIONS\n');

  // Check for low word count posts
  const lowWordCountPosts = report.posts.filter(p => p.wordCount < 1500);
  if (lowWordCountPosts.length > 0) {
    const action = {
      priority: 'HIGH',
      category: 'Content Quality',
      issue: `${lowWordCountPosts.length} posts have <1500 words`,
      impact: 'Low word count hurts SEO rankings and user engagement',
      action: 'Expand these posts to 1500+ words with more detailed content',
      posts: lowWordCountPosts.map(p => p.slug).slice(0, 3)
    };
    insights.criticalActions.push(action);
    console.log(`   ⚠️  ${action.issue}`);
    console.log(`      Impact: ${action.impact}`);
    console.log(`      Action: ${action.action}`);
    if (action.posts.length > 0) {
      console.log(`      Posts: ${action.posts.join(', ')}`);
    }
    console.log('');
  }

  // Check for posts with no internal links
  const noInternalLinks = report.posts.filter(p => p.quality.internalLinks === 0);
  if (noInternalLinks.length > 0) {
    const action = {
      priority: 'HIGH',
      category: 'Internal Linking',
      issue: `${noInternalLinks.length} posts have NO internal links`,
      impact: 'Missing internal links reduces time on site and SEO authority flow',
      action: 'Add 3-5 relevant internal links to each post',
      posts: noInternalLinks.map(p => p.slug).slice(0, 3)
    };
    insights.criticalActions.push(action);
    console.log(`   ⚠️  ${action.issue}`);
    console.log(`      Impact: ${action.impact}`);
    console.log(`      Action: ${action.action}`);
    if (action.posts.length > 0) {
      console.log(`      Posts: ${action.posts.join(', ')}`);
    }
    console.log('');
  }

  // Check for posts with no external links
  const noExternalLinks = report.posts.filter(p => p.quality.externalLinks === 0);
  if (noExternalLinks.length > 0) {
    const action = {
      priority: 'MEDIUM',
      category: 'Content Authority',
      issue: `${noExternalLinks.length} posts have NO external links`,
      impact: 'External links to authority sites improve content credibility and SEO',
      action: 'Add 2-3 external links to authoritative sources (e.g., Google, industry studies)',
      posts: noExternalLinks.map(p => p.slug).slice(0, 3)
    };
    insights.criticalActions.push(action);
    console.log(`   ⚠️  ${action.issue}`);
    console.log(`      Impact: ${action.impact}`);
    console.log(`      Action: ${action.action}`);
    if (action.posts.length > 0) {
      console.log(`      Posts: ${action.posts.join(', ')}`);
    }
    console.log('');
  }

  // 2. QUICK WINS - Easy optimizations with high impact
  console.log('━'.repeat(60));
  console.log('\n⚡ QUICK WINS (30-60 min)\n');

  // Find high traffic posts with high bounce rate
  const highTrafficHighBounce = report.posts.filter(p =>
    p.analytics?.pageviews > 5 && p.analytics?.bounceRate > 50
  );
  if (highTrafficHighBounce.length > 0) {
    const win = {
      opportunity: 'Reduce bounce rate on high-traffic posts',
      currentState: `${highTrafficHighBounce.length} posts have >5 views but >50% bounce rate`,
      action: 'Add internal links, CTAs, and related content sections to keep users engaged',
      expectedImpact: 'Could improve time on site by 30-50%',
      posts: highTrafficHighBounce.map(p => ({
        slug: p.slug,
        pageviews: p.analytics.pageviews,
        bounceRate: p.analytics.bounceRate
      }))
    };
    insights.quickWins.push(win);
    console.log(`   💡 ${win.opportunity}`);
    console.log(`      Current: ${win.currentState}`);
    console.log(`      Action: ${win.action}`);
    console.log(`      Impact: ${win.expectedImpact}\n`);
  }

  // Find posts with no images
  const noImages = report.posts.filter(p => !p.quality.hasImage);
  if (noImages.length > 0) {
    const win = {
      opportunity: 'Add images to text-only posts',
      currentState: `${noImages.length} posts have no images`,
      action: 'Add hero image, infographics, or screenshots to improve engagement',
      expectedImpact: '30-40% improvement in engagement rate',
      posts: noImages.map(p => p.slug).slice(0, 3)
    };
    insights.quickWins.push(win);
    console.log(`   💡 ${win.opportunity}`);
    console.log(`      Current: ${win.currentState}`);
    console.log(`      Action: ${win.action}`);
    console.log(`      Impact: ${win.expectedImpact}\n`);
  }

  // 3. CONTENT OPPORTUNITIES - New content ideas based on performance
  console.log('━'.repeat(60));
  console.log('\n📝 CONTENT OPPORTUNITIES\n');

  // Find top performing categories
  const categoryPerformance = {};
  report.posts.forEach(post => {
    if (!categoryPerformance[post.category]) {
      categoryPerformance[post.category] = {
        posts: 0,
        totalViews: 0,
        avgEngagement: 0
      };
    }
    categoryPerformance[post.category].posts++;
    categoryPerformance[post.category].totalViews += post.analytics?.pageviews || 0;
    categoryPerformance[post.category].avgEngagement += post.analytics?.engagementRate || 0;
  });

  const topCategories = Object.entries(categoryPerformance)
    .map(([cat, data]) => ({
      category: cat,
      avgViews: Math.round(data.totalViews / data.posts),
      avgEngagement: Math.round(data.avgEngagement / data.posts),
      posts: data.posts
    }))
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 3);

  if (topCategories.length > 0) {
    const opp = {
      opportunity: 'Double down on top-performing categories',
      topCategories: topCategories.map(c => c.category),
      action: `Create 2-3 more posts in: ${topCategories.map(c => c.category).join(', ')}`,
      reasoning: 'These categories show highest engagement and traffic potential',
      expectedImpact: 'Could increase total traffic by 40-60%'
    };
    insights.contentOpportunities.push(opp);
    console.log(`   📈 ${opp.opportunity}`);
    console.log(`      Top: ${opp.topCategories.join(', ')}`);
    console.log(`      Action: ${opp.action}`);
    console.log(`      Impact: ${opp.expectedImpact}\n`);
  }

  // Find content gaps
  const recentPosts = report.posts.filter(p => p.daysSince < 90);
  const oldPosts = report.posts.filter(p => p.daysSince >= 90);
  if (oldPosts.length > 0) {
    const opp = {
      opportunity: 'Update old content for freshness',
      oldPosts: oldPosts.length,
      action: `Update ${Math.min(oldPosts.length, 5)} oldest posts with 2025 data, new stats, and current best practices`,
      reasoning: 'Fresh content ranks better and shows expertise',
      expectedImpact: 'Could improve rankings by 10-20 positions',
      posts: oldPosts.sort((a, b) => b.daysSince - a.daysSince).slice(0, 5).map(p => ({
        slug: p.slug,
        daysOld: p.daysSince
      }))
    };
    insights.contentOpportunities.push(opp);
    console.log(`   🔄 ${opp.opportunity}`);
    console.log(`      Old posts: ${opp.oldPosts}`);
    console.log(`      Action: ${opp.action}`);
    console.log(`      Impact: ${opp.expectedImpact}\n`);
  }

  // 4. GROWTH STRATEGIES - Long-term growth opportunities
  console.log('━'.repeat(60));
  console.log('\n🚀 GROWTH STRATEGIES\n');

  // Content velocity strategy
  const recentPostsCount = report.posts.filter(p => p.daysSince < 30).length;
  const strategy = {
    strategy: 'Increase content velocity',
    currentState: `${recentPostsCount} posts in last 30 days`,
    recommendation: recentPostsCount < 4 ?
      'Publish 2-3 posts per week for 90 days to build momentum' :
      'Maintain current publishing pace, focus on quality and promotion',
    expectedImpact: 'Consistent publishing improves domain authority and organic traffic growth',
    timeline: '90 days'
  };
  insights.growthStrategies.push(strategy);
  console.log(`   🎯 ${strategy.strategy}`);
  console.log(`      Current: ${strategy.currentState}`);
  console.log(`      Action: ${strategy.recommendation}`);
  console.log(`      Impact: ${strategy.expectedImpact}\n`);

  // Engagement optimization
  const avgEngagement = report.analytics?.avgEngagementRate || 0;
  if (avgEngagement < 60) {
    const strategy = {
      strategy: 'Improve engagement rate',
      currentState: `${avgEngagement.toFixed(1)}% average engagement rate`,
      recommendation: 'Add interactive elements, CTAs, internal links, and related content sections',
      expectedImpact: 'Target 70%+ engagement rate to improve SEO signals',
      timeline: '60 days'
    };
    insights.growthStrategies.push(strategy);
    console.log(`   🎯 ${strategy.strategy}`);
    console.log(`      Current: ${strategy.currentState}`);
    console.log(`      Action: ${strategy.recommendation}`);
    console.log(`      Impact: ${strategy.expectedImpact}\n`);
  }

  // Save insights
  const insightsPath = path.join(projectRoot, 'automation/insights-report.json');
  await fs.writeFile(insightsPath, JSON.stringify(insights, null, 2));

  console.log('━'.repeat(60));
  console.log(`\n✅ Insights report saved to: automation/insights-report.json\n`);

  // Generate action plan
  console.log('━'.repeat(60));
  console.log('\n📋 IMMEDIATE ACTION PLAN\n');
  console.log('Week 1:');
  if (insights.criticalActions.length > 0) {
    insights.criticalActions.slice(0, 2).forEach((action, i) => {
      console.log(`  ${i + 1}. ${action.action}`);
    });
  }
  console.log('\nWeek 2-3:');
  if (insights.quickWins.length > 0) {
    insights.quickWins.slice(0, 2).forEach((win, i) => {
      console.log(`  ${i + 1}. ${win.action}`);
    });
  }
  console.log('\nMonth 2-3:');
  if (insights.contentOpportunities.length > 0) {
    insights.contentOpportunities.slice(0, 2).forEach((opp, i) => {
      console.log(`  ${i + 1}. ${opp.action}`);
    });
  }
  console.log('\n━'.repeat(60) + '\n');

  return insights;
}

generateInsights().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
