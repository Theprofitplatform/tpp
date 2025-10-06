/**
 * Performance Tracking Module
 * Track blog and social media performance metrics
 *
 * Week 4: Measurement & Optimization
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Initialize Google Analytics 4 client
 */
async function initializeGA4() {
  try {
    const keyPath = process.env.GA4_SERVICE_ACCOUNT_KEY;
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!keyPath || !propertyId) {
      console.warn('⚠️  GA4 credentials not configured');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const analyticsData = google.analyticsdata('v1beta');

    return {
      analyticsData,
      auth,
      propertyId
    };
  } catch (error) {
    console.warn('⚠️  GA4 initialization failed:', error.message);
    return null;
  }
}

/**
 * Get blog post performance from GA4
 * @param {string} blogSlug - Blog post slug
 * @param {Object} options - Query options (dateRange, metrics)
 * @returns {Promise<Object>} Performance metrics
 */
export async function getBlogPerformance(blogSlug, options = {}) {
  console.log(`\n📊 Fetching performance for: ${blogSlug}...`);

  try {
    const ga4 = await initializeGA4();

    if (!ga4) {
      return {
        success: false,
        error: 'GA4 not configured',
        metrics: getDefaultMetrics()
      };
    }

    const { analyticsData, auth, propertyId } = ga4;

    // Build page path
    const pagePath = `/blog/${blogSlug}`;

    // Date range (default: last 30 days)
    const startDate = options.startDate || '30daysAgo';
    const endDate = options.endDate || 'today';

    // Query GA4
    const response = await analyticsData.properties.runReport({
      auth,
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'conversions' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'CONTAINS',
              value: pagePath
            }
          }
        }
      }
    });

    // Parse results
    const rows = response.data.rows || [];

    if (rows.length === 0) {
      console.log('   ⚠️  No data found (post may be too new)');
      return {
        success: true,
        metrics: getDefaultMetrics(),
        message: 'No data available yet'
      };
    }

    const metrics = {
      pageViews: parseInt(rows[0].metricValues[0].value) || 0,
      sessions: parseInt(rows[0].metricValues[1].value) || 0,
      engagedSessions: parseInt(rows[0].metricValues[2].value) || 0,
      avgSessionDuration: parseFloat(rows[0].metricValues[3].value) || 0,
      bounceRate: parseFloat(rows[0].metricValues[4].value) || 0,
      conversions: parseInt(rows[0].metricValues[5].value) || 0
    };

    // Calculate derived metrics
    metrics.engagementRate = metrics.sessions > 0
      ? (metrics.engagedSessions / metrics.sessions * 100).toFixed(2)
      : 0;

    metrics.conversionRate = metrics.sessions > 0
      ? (metrics.conversions / metrics.sessions * 100).toFixed(2)
      : 0;

    console.log(`   ✅ Page Views: ${metrics.pageViews}`);
    console.log(`   ✅ Sessions: ${metrics.sessions}`);
    console.log(`   ✅ Engagement Rate: ${metrics.engagementRate}%`);
    console.log(`   ✅ Conversions: ${metrics.conversions}`);

    return {
      success: true,
      metrics,
      dateRange: { startDate, endDate }
    };

  } catch (error) {
    console.error('   ❌ Failed to fetch GA4 data:', error.message);
    return {
      success: false,
      error: error.message,
      metrics: getDefaultMetrics()
    };
  }
}

/**
 * Get social media performance (placeholder for API integrations)
 */
export async function getSocialPerformance(slug, platform) {
  console.log(`\n📱 Fetching ${platform} performance...`);

  // Placeholder - integrate with platform APIs later
  const platformMetrics = {
    linkedin: {
      impressions: 0,
      clicks: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0
    },
    twitter: {
      impressions: 0,
      clicks: 0,
      retweets: 0,
      likes: 0,
      replies: 0,
      engagementRate: 0
    },
    email: {
      sent: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      openRate: 0,
      clickRate: 0
    }
  };

  console.log(`   ⚠️  ${platform} tracking not yet integrated (manual tracking recommended)`);

  return {
    success: true,
    platform,
    metrics: platformMetrics[platform] || {},
    message: 'Manual tracking required'
  };
}

/**
 * Get comprehensive performance report for a blog post
 */
export async function getFullPerformanceReport(slug, options = {}) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE REPORT');
  console.log('='.repeat(60));
  console.log(`\nBlog Post: ${slug}`);
  console.log(`Date Range: ${options.startDate || 'Last 30 days'}\n`);

  // Fetch all metrics
  const [blog, linkedin, twitter, email] = await Promise.all([
    getBlogPerformance(slug, options),
    getSocialPerformance(slug, 'linkedin'),
    getSocialPerformance(slug, 'twitter'),
    getSocialPerformance(slug, 'email')
  ]);

  const report = {
    slug,
    dateRange: blog.dateRange || { startDate: '30daysAgo', endDate: 'today' },
    blog: blog.metrics,
    social: {
      linkedin: linkedin.metrics,
      twitter: twitter.metrics,
      email: email.metrics
    },
    summary: {
      totalPageViews: blog.metrics.pageViews,
      totalSessions: blog.metrics.sessions,
      totalConversions: blog.metrics.conversions,
      avgEngagementRate: blog.metrics.engagementRate,
      estimatedLeads: blog.metrics.conversions +
        (linkedin.metrics.clicks || 0) * 0.04 +
        (twitter.metrics.clicks || 0) * 0.03 +
        (email.metrics.opens || 0) * 0.05
    }
  };

  // Print summary
  printPerformanceSummary(report);

  return report;
}

/**
 * Print performance summary
 */
function printPerformanceSummary(report) {
  console.log('\n📈 BLOG PERFORMANCE:');
  console.log(`   Page Views: ${report.blog.pageViews}`);
  console.log(`   Sessions: ${report.blog.sessions}`);
  console.log(`   Engagement Rate: ${report.blog.engagementRate}%`);
  console.log(`   Bounce Rate: ${(report.blog.bounceRate * 100).toFixed(1)}%`);
  console.log(`   Conversions: ${report.blog.conversions}`);

  console.log('\n📱 SOCIAL MEDIA:');
  console.log(`   LinkedIn: ${report.social.linkedin.impressions || 'Not tracked'} impressions`);
  console.log(`   Twitter: ${report.social.twitter.impressions || 'Not tracked'} impressions`);
  console.log(`   Email: ${report.social.email.opens || 'Not tracked'} opens`);

  console.log('\n💰 ESTIMATED IMPACT:');
  console.log(`   Total Leads: ${Math.round(report.summary.estimatedLeads)}`);
  console.log(`   Avg Engagement: ${report.summary.avgEngagementRate}%`);

  console.log('\n' + '='.repeat(60));
}

/**
 * Save performance report to file
 */
export async function savePerformanceReport(report, slug) {
  try {
    const reportsDir = path.join(projectRoot, 'automation/performance-reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${slug}-${timestamp}.json`;
    const filepath = path.join(reportsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`\n💾 Report saved: automation/performance-reports/${filename}`);

    return {
      success: true,
      filepath
    };
  } catch (error) {
    console.error('\n❌ Failed to save report:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get default metrics (when data unavailable)
 */
function getDefaultMetrics() {
  return {
    pageViews: 0,
    sessions: 0,
    engagedSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversions: 0,
    engagementRate: 0,
    conversionRate: 0
  };
}

/**
 * Compare performance across multiple posts
 */
export async function comparePostPerformance(slugs, options = {}) {
  console.log('\n📊 COMPARING PERFORMANCE ACROSS POSTS\n');

  const reports = [];

  for (const slug of slugs) {
    const report = await getFullPerformanceReport(slug, options);
    reports.push(report);
  }

  // Sort by page views
  reports.sort((a, b) => b.blog.pageViews - a.blog.pageViews);

  console.log('\n🏆 TOP PERFORMERS:\n');
  reports.slice(0, 5).forEach((report, index) => {
    console.log(`${index + 1}. ${report.slug}`);
    console.log(`   Views: ${report.blog.pageViews} | Conversions: ${report.blog.conversions}`);
  });

  return reports;
}

/**
 * CLI execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];

  if (!slug) {
    console.error('❌ Usage: node performance-tracker.js <blog-slug>');
    console.error('   Example: node performance-tracker.js google-ads-extensions-complete-guide-to-maximising-click-through-rates');
    process.exit(1);
  }

  getFullPerformanceReport(slug)
    .then(report => {
      savePerformanceReport(report, slug);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default {
  getBlogPerformance,
  getSocialPerformance,
  getFullPerformanceReport,
  savePerformanceReport,
  comparePostPerformance
};
