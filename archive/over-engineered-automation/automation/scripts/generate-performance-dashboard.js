/**
 * Performance Dashboard Generator
 * Creates comprehensive performance reports for all blog posts
 *
 * Week 4: Measurement & Optimization
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBlogPerformance } from './performance-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Load all published blog posts
 */
async function loadAllPublishedPosts() {
  try {
    const queuePath = path.join(projectRoot, 'automation/topic-queue.json');
    const queue = JSON.parse(await fs.readFile(queuePath, 'utf-8'));

    return queue.published || [];
  } catch (error) {
    console.error('Failed to load published posts:', error.message);
    return [];
  }
}

/**
 * Generate comprehensive dashboard
 */
export async function generateDashboard(options = {}) {
  console.log('\n🎯 GENERATING PERFORMANCE DASHBOARD\n');
  console.log('📊 Fetching data for all published posts...\n');

  const posts = await loadAllPublishedPosts();

  if (posts.length === 0) {
    console.log('⚠️  No published posts found');
    return {
      success: false,
      message: 'No data available'
    };
  }

  console.log(`Found ${posts.length} published posts\n`);

  // Fetch performance for each post
  const performanceData = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] ${post.title}...`);

    const performance = await getBlogPerformance(post.publishedSlug, options);

    performanceData.push({
      title: post.title,
      slug: post.publishedSlug,
      publishedDate: post.publishedDate,
      category: post.category,
      wordCount: post.wordCount,
      author: post.author,
      metrics: performance.metrics
    });

    // Rate limiting
    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Calculate aggregate metrics
  const aggregate = calculateAggregateMetrics(performanceData);

  // Generate dashboard
  const dashboard = {
    generatedAt: new Date().toISOString(),
    dateRange: options.startDate || 'Last 30 days',
    totalPosts: posts.length,
    aggregate,
    posts: performanceData,
    topPerformers: getTopPerformers(performanceData),
    insights: generateInsights(performanceData, aggregate)
  };

  // Print dashboard
  printDashboard(dashboard);

  // Save dashboard
  await saveDashboard(dashboard);

  return dashboard;
}

/**
 * Calculate aggregate metrics across all posts
 */
function calculateAggregateMetrics(performanceData) {
  const total = performanceData.reduce((acc, post) => {
    return {
      pageViews: acc.pageViews + (post.metrics.pageViews || 0),
      sessions: acc.sessions + (post.metrics.sessions || 0),
      conversions: acc.conversions + (post.metrics.conversions || 0),
      engagedSessions: acc.engagedSessions + (post.metrics.engagedSessions || 0)
    };
  }, { pageViews: 0, sessions: 0, conversions: 0, engagedSessions: 0 });

  const avgEngagementRate = performanceData.length > 0
    ? performanceData.reduce((sum, p) => sum + parseFloat(p.metrics.engagementRate || 0), 0) / performanceData.length
    : 0;

  const avgBounceRate = performanceData.length > 0
    ? performanceData.reduce((sum, p) => sum + parseFloat(p.metrics.bounceRate || 0), 0) / performanceData.length
    : 0;

  return {
    totalPageViews: total.pageViews,
    totalSessions: total.sessions,
    totalConversions: total.conversions,
    avgPageViewsPerPost: Math.round(total.pageViews / performanceData.length),
    avgSessionsPerPost: Math.round(total.sessions / performanceData.length),
    avgConversionsPerPost: Math.round(total.conversions / performanceData.length),
    avgEngagementRate: avgEngagementRate.toFixed(2),
    avgBounceRate: (avgBounceRate * 100).toFixed(1),
    conversionRate: total.sessions > 0
      ? (total.conversions / total.sessions * 100).toFixed(2)
      : 0
  };
}

/**
 * Get top performing posts
 */
function getTopPerformers(performanceData) {
  // Top by page views
  const byPageViews = [...performanceData]
    .sort((a, b) => (b.metrics.pageViews || 0) - (a.metrics.pageViews || 0))
    .slice(0, 5);

  // Top by conversions
  const byConversions = [...performanceData]
    .sort((a, b) => (b.metrics.conversions || 0) - (a.metrics.conversions || 0))
    .slice(0, 5);

  // Top by engagement
  const byEngagement = [...performanceData]
    .sort((a, b) => (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0))
    .slice(0, 5);

  return {
    byPageViews,
    byConversions,
    byEngagement
  };
}

/**
 * Generate insights from performance data
 */
function generateInsights(performanceData, aggregate) {
  const insights = [];

  // Insight 1: Content quality
  if (parseFloat(aggregate.avgEngagementRate) > 50) {
    insights.push({
      type: 'success',
      message: `Strong engagement rate of ${aggregate.avgEngagementRate}% indicates high-quality content`
    });
  } else if (parseFloat(aggregate.avgEngagementRate) < 30) {
    insights.push({
      type: 'warning',
      message: `Low engagement rate (${aggregate.avgEngagementRate}%) - consider improving content relevance`
    });
  }

  // Insight 2: Conversion performance
  if (parseFloat(aggregate.conversionRate) > 3) {
    insights.push({
      type: 'success',
      message: `Excellent conversion rate of ${aggregate.conversionRate}% - above industry average`
    });
  } else if (parseFloat(aggregate.conversionRate) < 1) {
    insights.push({
      type: 'warning',
      message: `Low conversion rate (${aggregate.conversionRate}%) - optimize CTAs and lead magnets`
    });
  }

  // Insight 3: Bounce rate
  if (parseFloat(aggregate.avgBounceRate) < 40) {
    insights.push({
      type: 'success',
      message: `Low bounce rate (${aggregate.avgBounceRate}%) shows content matches user intent`
    });
  } else if (parseFloat(aggregate.avgBounceRate) > 70) {
    insights.push({
      type: 'warning',
      message: `High bounce rate (${aggregate.avgBounceRate}%) - improve content relevance and internal linking`
    });
  }

  // Insight 4: Top categories
  const categoryPerformance = {};
  performanceData.forEach(post => {
    if (!categoryPerformance[post.category]) {
      categoryPerformance[post.category] = { views: 0, conversions: 0, count: 0 };
    }
    categoryPerformance[post.category].views += post.metrics.pageViews || 0;
    categoryPerformance[post.category].conversions += post.metrics.conversions || 0;
    categoryPerformance[post.category].count++;
  });

  const topCategory = Object.entries(categoryPerformance)
    .sort((a, b) => b[1].views - a[1].views)[0];

  if (topCategory) {
    insights.push({
      type: 'insight',
      message: `${topCategory[0]} is your top performing category (${topCategory[1].views} total views)`
    });
  }

  return insights;
}

/**
 * Print dashboard to console
 */
function printDashboard(dashboard) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 BLOG PERFORMANCE DASHBOARD');
  console.log('='.repeat(70));

  console.log(`\n📅 Period: ${dashboard.dateRange}`);
  console.log(`📝 Total Posts: ${dashboard.totalPosts}`);
  console.log(`🕒 Generated: ${new Date(dashboard.generatedAt).toLocaleString()}\n`);

  // Aggregate metrics
  console.log('📈 AGGREGATE METRICS:');
  console.log(`   Total Page Views: ${dashboard.aggregate.totalPageViews.toLocaleString()}`);
  console.log(`   Total Sessions: ${dashboard.aggregate.totalSessions.toLocaleString()}`);
  console.log(`   Total Conversions: ${dashboard.aggregate.totalConversions.toLocaleString()}`);
  console.log(`   Avg Views/Post: ${dashboard.aggregate.avgPageViewsPerPost.toLocaleString()}`);
  console.log(`   Avg Conversions/Post: ${dashboard.aggregate.avgConversionsPerPost}`);
  console.log(`   Avg Engagement Rate: ${dashboard.aggregate.avgEngagementRate}%`);
  console.log(`   Avg Bounce Rate: ${dashboard.aggregate.avgBounceRate}%`);
  console.log(`   Overall Conversion Rate: ${dashboard.aggregate.conversionRate}%`);

  // Top performers
  console.log('\n🏆 TOP 5 BY PAGE VIEWS:');
  dashboard.topPerformers.byPageViews.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title}`);
    console.log(`      ${post.metrics.pageViews} views | ${post.metrics.conversions} conversions`);
  });

  console.log('\n💰 TOP 5 BY CONVERSIONS:');
  dashboard.topPerformers.byConversions.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title}`);
    console.log(`      ${post.metrics.conversions} conversions | ${post.metrics.pageViews} views`);
  });

  // Insights
  console.log('\n💡 KEY INSIGHTS:');
  dashboard.insights.forEach(insight => {
    const icon = insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '💡';
    console.log(`   ${icon} ${insight.message}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

/**
 * Save dashboard to file
 */
async function saveDashboard(dashboard) {
  try {
    const dashboardDir = path.join(projectRoot, 'automation/dashboards');
    await fs.mkdir(dashboardDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `dashboard-${timestamp}.json`;
    const filepath = path.join(dashboardDir, filename);

    await fs.writeFile(filepath, JSON.stringify(dashboard, null, 2), 'utf-8');

    console.log(`💾 Dashboard saved: automation/dashboards/${filename}\n`);

    // Also save as latest
    await fs.writeFile(
      path.join(dashboardDir, 'latest.json'),
      JSON.stringify(dashboard, null, 2),
      'utf-8'
    );

    return {
      success: true,
      filepath
    };
  } catch (error) {
    console.error('❌ Failed to save dashboard:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate markdown report
 */
export async function generateMarkdownReport(dashboard) {
  const md = `# Blog Performance Report

**Generated**: ${new Date(dashboard.generatedAt).toLocaleString()}
**Period**: ${dashboard.dateRange}
**Total Posts**: ${dashboard.totalPosts}

---

## Aggregate Metrics

| Metric | Value |
|--------|-------|
| Total Page Views | ${dashboard.aggregate.totalPageViews.toLocaleString()} |
| Total Sessions | ${dashboard.aggregate.totalSessions.toLocaleString()} |
| Total Conversions | ${dashboard.aggregate.totalConversions.toLocaleString()} |
| Avg Views per Post | ${dashboard.aggregate.avgPageViewsPerPost.toLocaleString()} |
| Avg Conversions per Post | ${dashboard.aggregate.avgConversionsPerPost} |
| Avg Engagement Rate | ${dashboard.aggregate.avgEngagementRate}% |
| Avg Bounce Rate | ${dashboard.aggregate.avgBounceRate}% |
| Overall Conversion Rate | ${dashboard.aggregate.conversionRate}% |

---

## Top Performers

### By Page Views

${dashboard.topPerformers.byPageViews.map((post, i) =>
  `${i + 1}. **${post.title}** - ${post.metrics.pageViews} views, ${post.metrics.conversions} conversions`
).join('\n')}

### By Conversions

${dashboard.topPerformers.byConversions.map((post, i) =>
  `${i + 1}. **${post.title}** - ${post.metrics.conversions} conversions, ${post.metrics.pageViews} views`
).join('\n')}

---

## Key Insights

${dashboard.insights.map(insight => {
  const icon = insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '💡';
  return `${icon} ${insight.message}`;
}).join('\n\n')}

---

## All Posts

${dashboard.posts.map(post =>
  `### ${post.title}
- **Published**: ${post.publishedDate}
- **Category**: ${post.category}
- **Page Views**: ${post.metrics.pageViews}
- **Sessions**: ${post.metrics.sessions}
- **Conversions**: ${post.metrics.conversions}
- **Engagement Rate**: ${post.metrics.engagementRate}%
`
).join('\n')}
`;

  return md;
}

/**
 * CLI execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    startDate: process.argv[2] || '30daysAgo',
    endDate: process.argv[3] || 'today'
  };

  generateDashboard(options)
    .then(async dashboard => {
      if (dashboard.success !== false) {
        // Generate markdown report
        const markdown = await generateMarkdownReport(dashboard);
        const reportPath = path.join(projectRoot, 'automation/dashboards', 'latest-report.md');
        await fs.writeFile(reportPath, markdown, 'utf-8');
        console.log(`📝 Markdown report: automation/dashboards/latest-report.md\n`);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default { generateDashboard, generateMarkdownReport };
