/**
 * Facebook Analytics & Monitoring
 * Performance tracking and analytics for Facebook posts
 *
 * Features:
 * - Engagement metrics tracking
 * - Performance analysis
 * - Weekly reporting
 * - Best-performing content identification
 * - Audience growth tracking
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Facebook Analytics Class
 */
class FacebookAnalytics {
  constructor() {
    this.analyticsData = {};
    this.loadAnalytics();
  }

  /**
   * Load analytics data from file
   */
  async loadAnalytics() {
    try {
      const analyticsPath = path.join(projectRoot, 'automation/data/facebook-analytics.json');
      const analyticsContent = await fs.readFile(analyticsPath, 'utf-8');
      this.analyticsData = JSON.parse(analyticsContent);

      // Ensure all required properties exist
      this.analyticsData.posts = this.analyticsData.posts || {};
      this.analyticsData.weeklyStats = this.analyticsData.weeklyStats || {};
      this.analyticsData.audienceGrowth = this.analyticsData.audienceGrowth || [];
      this.analyticsData.bestPerformers = this.analyticsData.bestPerformers || [];

      console.log('✅ Loaded Facebook analytics data');
    } catch (error) {
      console.log('ℹ️  No existing analytics data found, starting fresh');
      this.analyticsData = {
        posts: {},
        weeklyStats: {},
        audienceGrowth: [],
        bestPerformers: []
      };
    }
  }

  /**
   * Save analytics data to file
   */
  async saveAnalytics() {
    try {
      const dataDir = path.join(projectRoot, 'automation/data');
      await fs.mkdir(dataDir, { recursive: true });

      const analyticsPath = path.join(dataDir, 'facebook-analytics.json');
      await fs.writeFile(analyticsPath, JSON.stringify(this.analyticsData, null, 2), 'utf-8');
      console.log('💾 Saved Facebook analytics data');
    } catch (error) {
      console.error('❌ Failed to save analytics data:', error.message);
    }
  }

  /**
   * Record a new Facebook post
   */
  async recordPost(postData) {
    const postId = postData.postId || `manual_${Date.now()}`;
    const weekKey = this.getWeekKey();

    // Initialize weekly stats if needed
    if (!this.analyticsData.weeklyStats[weekKey]) {
      this.analyticsData.weeklyStats[weekKey] = {
        posts: 0,
        totalEngagement: 0,
        totalReach: 0,
        totalClicks: 0,
        startDate: this.getWeekStartDate().toISOString()
      };
    }

    // Record post
    this.analyticsData.posts[postId] = {
      ...postData,
      recordedAt: new Date().toISOString(),
      week: weekKey,
      engagement: 0,
      reach: 0,
      clicks: 0,
      comments: 0,
      shares: 0
    };

    // Update weekly stats
    this.analyticsData.weeklyStats[weekKey].posts += 1;

    await this.saveAnalytics();
    console.log(`📊 Recorded Facebook post: ${postId}`);

    return postId;
  }

  /**
   * Update post metrics (for API posts)
   */
  async updatePostMetrics(postId, metrics) {
    if (!this.analyticsData.posts[postId]) {
      console.warn(`⚠️  Post ${postId} not found in analytics`);
      return;
    }

    const post = this.analyticsData.posts[postId];
    const weekKey = post.week;

    // Update post metrics
    this.analyticsData.posts[postId] = {
      ...post,
      ...metrics,
      lastUpdated: new Date().toISOString()
    };

    // Update weekly stats
    if (this.analyticsData.weeklyStats[weekKey]) {
      const weekly = this.analyticsData.weeklyStats[weekKey];
      weekly.totalEngagement += (metrics.engagement || 0) - (post.engagement || 0);
      weekly.totalReach += (metrics.reach || 0) - (post.reach || 0);
      weekly.totalClicks += (metrics.clicks || 0) - (post.clicks || 0);
    }

    // Update best performers
    this.updateBestPerformers();

    await this.saveAnalytics();
    console.log(`📊 Updated metrics for post: ${postId}`);
  }

  /**
   * Update best performing posts list
   */
  updateBestPerformers() {
    const posts = Object.values(this.analyticsData.posts);

    // Sort by engagement rate (engagement / reach)
    const sortedPosts = posts
      .filter(post => post.reach > 0)
      .sort((a, b) => {
        const rateA = (a.engagement || 0) / a.reach;
        const rateB = (b.engagement || 0) / b.reach;
        return rateB - rateA;
      })
      .slice(0, 10); // Top 10

    this.analyticsData.bestPerformers = sortedPosts.map(post => ({
      postId: post.postId,
      title: post.title,
      engagementRate: ((post.engagement || 0) / post.reach * 100).toFixed(2),
      reach: post.reach,
      engagement: post.engagement,
      publishedAt: post.publishedAt
    }));
  }

  /**
   * Record audience growth
   */
  async recordAudienceGrowth(followers, pageLikes) {
    const growthData = {
      timestamp: new Date().toISOString(),
      followers: followers,
      pageLikes: pageLikes
    };

    this.analyticsData.audienceGrowth.push(growthData);

    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.analyticsData.audienceGrowth = this.analyticsData.audienceGrowth.filter(
      data => new Date(data.timestamp) > thirtyDaysAgo
    );

    await this.saveAnalytics();
    console.log('📊 Recorded audience growth data');
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(weekKey = null) {
    const targetWeek = weekKey || this.getWeekKey();
    const weeklyStats = this.analyticsData.weeklyStats?.[targetWeek];

    if (!weeklyStats) {
      return {
        success: false,
        error: `No data for week ${targetWeek}`
      };
    }

    const posts = Object.values(this.analyticsData.posts).filter(
      post => post.week === targetWeek
    );

    const report = {
      week: targetWeek,
      summary: {
        totalPosts: weeklyStats.posts,
        totalEngagement: weeklyStats.totalEngagement,
        totalReach: weeklyStats.totalReach,
        totalClicks: weeklyStats.totalClicks,
        avgEngagementRate: weeklyStats.totalReach > 0
          ? ((weeklyStats.totalEngagement / weeklyStats.totalReach) * 100).toFixed(2)
          : 0
      },
      posts: posts.map(post => ({
        title: post.title,
        postId: post.postId,
        engagement: post.engagement,
        reach: post.reach,
        clicks: post.clicks,
        engagementRate: post.reach > 0 ? ((post.engagement / post.reach) * 100).toFixed(2) : 0
      })),
      bestPerformer: posts.length > 0 ? posts.reduce((best, current) =>
        (current.engagement || 0) > (best.engagement || 0) ? current : best
      ) : null
    };

    return {
      success: true,
      report
    };
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights() {
    const posts = Object.values(this.analyticsData.posts);
    if (posts.length === 0) {
      return { success: false, error: 'No posts data available' };
    }

    const postsWithReach = posts.filter(post => post.reach > 0);
    const totalEngagement = postsWithReach.reduce((sum, post) => sum + (post.engagement || 0), 0);
    const totalReach = postsWithReach.reduce((sum, post) => sum + post.reach, 0);

    const insights = {
      totalPosts: posts.length,
      avgEngagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : 0,
      bestPerformingCategory: this.getBestPerformingCategory(),
      optimalPostingTime: this.getOptimalPostingTime(),
      audienceGrowth: this.getAudienceGrowthTrend()
    };

    return {
      success: true,
      insights
    };
  }

  /**
   * Get best performing content category
   */
  getBestPerformingCategory() {
    const posts = Object.values(this.analyticsData.posts);
    const categoryPerformance = {};

    posts.forEach(post => {
      if (post.category && post.reach > 0) {
        const engagementRate = (post.engagement || 0) / post.reach;
        if (!categoryPerformance[post.category]) {
          categoryPerformance[post.category] = {
            totalPosts: 0,
            totalEngagementRate: 0
          };
        }
        categoryPerformance[post.category].totalPosts += 1;
        categoryPerformance[post.category].totalEngagementRate += engagementRate;
      }
    });

    let bestCategory = null;
    let bestAvgRate = 0;

    Object.entries(categoryPerformance).forEach(([category, data]) => {
      const avgRate = data.totalEngagementRate / data.totalPosts;
      if (avgRate > bestAvgRate) {
        bestCategory = category;
        bestAvgRate = avgRate;
      }
    });

    return bestCategory ? {
      category: bestCategory,
      avgEngagementRate: (bestAvgRate * 100).toFixed(2)
    } : null;
  }

  /**
   * Get optimal posting time
   */
  getOptimalPostingTime() {
    // This would require more detailed time data
    // For now, return the schedule from automation config
    return {
      monday: '09:30',
      wednesday: '14:00',
      friday: '11:00',
      timezone: 'Australia/Sydney'
    };
  }

  /**
   * Get audience growth trend
   */
  getAudienceGrowthTrend() {
    const growthData = this.analyticsData.audienceGrowth;
    if (growthData.length < 2) {
      return { trend: 'insufficient data' };
    }

    const first = growthData[0];
    const last = growthData[growthData.length - 1];
    const growth = last.followers - first.followers;
    const growthRate = ((growth / first.followers) * 100).toFixed(2);

    return {
      trend: growth > 0 ? 'growing' : 'declining',
      growth: growth,
      growthRate: growthRate + '%',
      period: `${growthData.length} days`
    };
  }

  /**
   * Helper: Get current week key (YYYY-WW)
   */
  getWeekKey(date = new Date()) {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Helper: Get week number
   */
  getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date - firstDay) / 86400000;
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }

  /**
   * Helper: Get week start date
   */
  getWeekStartDate(date = new Date()) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(date.setDate(diff));
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  const analytics = new FacebookAnalytics();

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📘 FACEBOOK ANALYTICS
==================================================

Commands:
  node facebook-analytics.js report          Generate weekly report
  node facebook-analytics.js insights        Get performance insights
  node facebook-analytics.js best            Show best performing posts
  node facebook-analytics.js status          Show analytics status
  node facebook-analytics.js --help          Show this help

Examples:
  node facebook-analytics.js report
  node facebook-analytics.js insights
  node facebook-analytics.js best

Features:
  ✅ Weekly performance reports
  ✅ Engagement rate tracking
  ✅ Best performing content analysis
  ✅ Audience growth monitoring
  ✅ Performance insights

==================================================
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'report':
      const report = analytics.generateWeeklyReport();
      if (report.success) {
        console.log('\n📊 Facebook Weekly Report');
        console.log('='.repeat(50));
        console.log(`Week: ${report.report.week}`);
        console.log(`Total Posts: ${report.report.summary.totalPosts}`);
        console.log(`Total Engagement: ${report.report.summary.totalEngagement}`);
        console.log(`Total Reach: ${report.report.summary.totalReach}`);
        console.log(`Avg Engagement Rate: ${report.report.summary.avgEngagementRate}%`);
        console.log('='.repeat(50));
      } else {
        console.error('❌', report.error);
      }
      break;

    case 'insights':
      const insights = analytics.getPerformanceInsights();
      if (insights.success) {
        console.log('\n💡 Facebook Performance Insights');
        console.log('='.repeat(50));
        console.log(`Total Posts: ${insights.insights.totalPosts}`);
        console.log(`Avg Engagement Rate: ${insights.insights.avgEngagementRate}%`);
        if (insights.insights.bestPerformingCategory) {
          console.log(`Best Category: ${insights.insights.bestPerformingCategory.category} (${insights.insights.bestPerformingCategory.avgEngagementRate}%)`);
        }
        console.log(`Audience Trend: ${insights.insights.audienceGrowth.trend}`);
        console.log('='.repeat(50));
      } else {
        console.error('❌', insights.error);
      }
      break;

    case 'best':
      analytics.updateBestPerformers();
      const bestPerformers = analytics.analyticsData.bestPerformers;
      console.log('\n🏆 Best Performing Facebook Posts');
      console.log('='.repeat(70));
      if (bestPerformers.length > 0) {
        bestPerformers.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
          console.log(`   Engagement Rate: ${post.engagementRate}% | Reach: ${post.reach} | Engagement: ${post.engagement}`);
          console.log('');
        });
      } else {
        console.log('No performance data available yet');
      }
      console.log('='.repeat(70));
      break;

    case 'status':
      console.log('\n📊 Facebook Analytics Status');
      console.log('='.repeat(40));
      console.log(`Total Posts Tracked: ${Object.keys(analytics.analyticsData?.posts || {}).length}`);
      console.log(`Weeks of Data: ${Object.keys(analytics.analyticsData?.weeklyStats || {}).length}`);
      console.log(`Best Performers: ${analytics.analyticsData?.bestPerformers?.length || 0}`);
      console.log(`Audience Data Points: ${analytics.analyticsData?.audienceGrowth?.length || 0}`);
      console.log('='.repeat(40));
      break;

    default:
      console.error('❌ Unknown command. Use --help for usage information.');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { FacebookAnalytics };
export default FacebookAnalytics;