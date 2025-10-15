/**
 * Revenue Impact Calculator
 * Calculates financial impact of poor SEO, speed, and rankings
 */

export interface BusinessMetrics {
  monthlyVisitors?: number;
  currentConversionRate?: number;
  averageOrderValue?: number;
  industry?: string;
}

export interface RevenueImpact {
  monthlyLoss: number;
  yearlyLoss: number;
  lostConversions: number;
  lostVisitors?: number;
  conversionLossPercent?: number;
  estimatedSearches?: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendations: string[];
}

export class RevenueImpactCalculator {
  // Industry benchmarks based on Australian market data
  private static INDUSTRY_BENCHMARKS: Record<string, { avgConversion: number; avgOrderValue: number }> = {
    'ecommerce': { avgConversion: 2.5, avgOrderValue: 150 },
    'saas': { avgConversion: 3.0, avgOrderValue: 500 },
    'services': { avgConversion: 5.0, avgOrderValue: 2000 },
    'local-business': { avgConversion: 4.0, avgOrderValue: 350 },
    'professional-services': { avgConversion: 6.0, avgOrderValue: 3500 },
    'trades': { avgConversion: 8.0, avgOrderValue: 800 },
    'default': { avgConversion: 3.5, avgOrderValue: 400 }
  };

  /**
   * Calculate revenue loss from slow website speed
   * Research: 1 second delay = 7% conversion drop (Google/Amazon studies)
   */
  static calculateSpeedImpact(speedScore: number, metrics: BusinessMetrics = {}): RevenueImpact {
    const visitors = metrics.monthlyVisitors || 5000; // Conservative estimate
    const industry = metrics.industry || 'local-business';
    const benchmark = this.INDUSTRY_BENCHMARKS[industry] || this.INDUSTRY_BENCHMARKS.default;

    // Speed score to seconds delay conversion
    // Score 90-100 = optimal (0-1s)
    // Score 50-89 = moderate (1-5s)
    // Score 0-49 = critical (5-10s)
    const secondsDelay = speedScore >= 90 ? 0.5 : (100 - speedScore) / 10;

    // Conversion impact: 7% loss per second of delay
    const conversionLossPercent = Math.min(secondsDelay * 7, 70); // Cap at 70%

    const baseConversionRate = benchmark.avgConversion / 100;
    const actualConversionRate = baseConversionRate * (1 - conversionLossPercent / 100);
    const optimalConversionRate = baseConversionRate;

    const lostConversions = visitors * (optimalConversionRate - actualConversionRate);
    const monthlyLoss = lostConversions * benchmark.avgOrderValue;

    const severity: 'critical' | 'warning' | 'info' =
      speedScore < 50 ? 'critical' :
      speedScore < 75 ? 'warning' : 'info';

    return {
      monthlyLoss: Math.round(monthlyLoss),
      yearlyLoss: Math.round(monthlyLoss * 12),
      lostConversions: Math.round(lostConversions),
      conversionLossPercent: Math.round(conversionLossPercent),
      severity,
      message: this.getSpeedMessage(speedScore, monthlyLoss, secondsDelay),
      recommendations: this.getSpeedRecommendations(speedScore)
    };
  }

  /**
   * Calculate revenue impact from Google ranking position
   * Based on 2024 CTR studies (Backlinko/Advanced Web Ranking data)
   */
  static calculateRankingImpact(currentRank: number, keyword: string, metrics: BusinessMetrics = {}): RevenueImpact {
    const industry = metrics.industry || 'local-business';
    const benchmark = this.INDUSTRY_BENCHMARKS[industry] || this.INDUSTRY_BENCHMARKS.default;

    // Updated CTR by position (2024 data)
    const ctrByPosition: Record<number, number> = {
      1: 0.396,  // #1 gets 39.6% of clicks
      2: 0.181,  // #2 gets 18.1%
      3: 0.104,  // #3 gets 10.4%
      4: 0.069,
      5: 0.055,
      6: 0.045,
      7: 0.039,
      8: 0.033,
      9: 0.029,
      10: 0.025,
      11: 0.015  // Page 2+
    };

    const currentCTR = ctrByPosition[currentRank] || (currentRank > 10 ? 0.01 : 0.02);
    const targetCTR = ctrByPosition[1]; // Position #1 benchmark

    // Estimate monthly searches based on keyword characteristics
    const estimatedSearches = this.estimateSearchVolume(keyword);

    const currentVisitors = estimatedSearches * currentCTR;
    const potentialVisitors = estimatedSearches * targetCTR;
    const lostVisitors = potentialVisitors - currentVisitors;

    const conversionRate = benchmark.avgConversion / 100;
    const lostConversions = lostVisitors * conversionRate;
    const monthlyLoss = lostConversions * benchmark.avgOrderValue;

    const severity: 'critical' | 'warning' | 'info' =
      currentRank > 10 ? 'critical' :
      currentRank > 3 ? 'warning' : 'info';

    return {
      monthlyLoss: Math.round(monthlyLoss),
      yearlyLoss: Math.round(monthlyLoss * 12),
      lostVisitors: Math.round(lostVisitors),
      lostConversions: Math.round(lostConversions),
      estimatedSearches: Math.round(estimatedSearches),
      severity,
      message: this.getRankingMessage(currentRank, monthlyLoss, lostVisitors),
      recommendations: this.getRankingRecommendations(currentRank)
    };
  }

  /**
   * Calculate SEO audit impact based on issues found
   */
  static calculateSEOImpact(
    auditScore: number,
    issues: Array<{severity: string}>,
    metrics: BusinessMetrics = {}
  ): RevenueImpact {
    const visitors = metrics.monthlyVisitors || 5000;
    const industry = metrics.industry || 'local-business';
    const benchmark = this.INDUSTRY_BENCHMARKS[industry] || this.INDUSTRY_BENCHMARKS.default;

    // Weight issues by severity
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    const infoIssues = issues.filter(i => i.severity === 'info').length;

    // Impact calculation: Critical = 5%, Warning = 2%, Info = 0.5%
    const trafficImpactPercent = (criticalIssues * 5 + warningIssues * 2 + infoIssues * 0.5) / 100;
    const trafficLoss = visitors * trafficImpactPercent;

    const conversionRate = benchmark.avgConversion / 100;
    const lostConversions = trafficLoss * conversionRate;
    const monthlyLoss = lostConversions * benchmark.avgOrderValue;

    const severity: 'critical' | 'warning' | 'info' =
      criticalIssues > 5 ? 'critical' :
      criticalIssues > 0 || auditScore < 70 ? 'warning' : 'info';

    return {
      monthlyLoss: Math.round(monthlyLoss),
      yearlyLoss: Math.round(monthlyLoss * 12),
      lostVisitors: Math.round(trafficLoss),
      lostConversions: Math.round(lostConversions),
      severity,
      message: this.getSEOMessage(auditScore, criticalIssues, monthlyLoss),
      recommendations: this.getSEORecommendations(criticalIssues, warningIssues)
    };
  }

  /**
   * Estimate monthly search volume for a keyword
   * Simplified heuristic - in production, use Google Keyword Planner API
   */
  private static estimateSearchVolume(keyword: string): number {
    const words = keyword.trim().split(/\s+/).length;
    const hasLocation = /sydney|melbourne|brisbane|perth|adelaide|australia/i.test(keyword);
    const hasIntent = /buy|price|cost|cheap|best|near|service/i.test(keyword);

    // Base volume by keyword length
    let baseVolume = 1000;
    if (words === 1) baseVolume = 8000;        // "plumber" - high volume
    else if (words === 2) baseVolume = 3000;   // "plumber sydney" - medium
    else if (words === 3) baseVolume = 1200;   // "emergency plumber sydney" - lower
    else baseVolume = 500;                      // Long-tail - lowest

    // Location modifier (local searches have lower volume but higher intent)
    if (hasLocation) baseVolume *= 0.4;

    // Commercial intent boost
    if (hasIntent) baseVolume *= 1.3;

    return Math.round(baseVolume);
  }

  // Message generators
  private static getSpeedMessage(score: number, loss: number, delay: number): string {
    if (score < 50) {
      return `🚨 CRITICAL: Your site loads in ~${delay.toFixed(1)} seconds. You're hemorrhaging $${loss.toLocaleString()}/month in lost sales. ${Math.round((delay - 2) * 20)}% of mobile users are abandoning before they even see your content.`;
    } else if (score < 75) {
      return `⚠️ Your ${delay.toFixed(1)}s load time is costing you $${loss.toLocaleString()}/month. Research shows a 1-second improvement can recover 50% of this loss.`;
    } else if (score < 90) {
      return `Your site is reasonably fast, but you're still leaving $${loss.toLocaleString()}/month on the table. Small optimizations can boost conversions by 10-15%.`;
    } else {
      return `✅ Excellent! Your fast site is protecting you from losing $${loss.toLocaleString()}/month in revenue. Maintain this speed as your site grows.`;
    }
  }

  private static getRankingMessage(rank: number, loss: number, visitors: number): string {
    if (rank > 10) {
      return `📉 Page 2+ ranking costs you $${loss.toLocaleString()}/month. You're losing ${Math.round(visitors)} potential visitors monthly. 75% of users never scroll past page 1 - you're invisible to most customers.`;
    } else if (rank > 5) {
      return `Moving from #${rank} to top 3 could generate $${loss.toLocaleString()}/month more revenue. You're losing ${Math.round(visitors)} visitors to competitors above you.`;
    } else if (rank > 3) {
      return `You're close! Moving from #${rank} to #1 could add $${loss.toLocaleString()}/month. Position #1 gets 2.5x more clicks than #4.`;
    } else {
      return `🎉 Top 3 ranking! You're capturing maximum traffic. Maintaining this position protects $${loss.toLocaleString()}/month from competitors.`;
    }
  }

  private static getSEOMessage(score: number, critical: number, loss: number): string {
    if (critical > 5) {
      return `🚨 ${critical} critical SEO issues are costing you $${loss.toLocaleString()}/month. These prevent Google from properly indexing and ranking your site.`;
    } else if (critical > 0) {
      return `⚠️ ${critical} critical issues found. Fixing these could recover $${Math.round(loss * 0.7).toLocaleString()}/month in lost organic traffic.`;
    } else if (score < 70) {
      return `Your SEO has room for improvement. Optimization could unlock $${loss.toLocaleString()}/month in additional organic traffic.`;
    } else {
      return `✅ Strong SEO foundation! Continue monitoring to protect $${loss.toLocaleString()}/month in potential revenue from algorithm changes.`;
    }
  }

  private static getSpeedRecommendations(score: number): string[] {
    if (score < 50) {
      return [
        'Enable image compression and WebP format',
        'Implement lazy loading for images below the fold',
        'Minify and combine CSS/JavaScript files',
        'Set up CDN for global content delivery',
        'Reduce server response time (< 200ms)',
        'Remove render-blocking resources',
        'Consider upgrading hosting plan'
      ];
    } else if (score < 75) {
      return [
        'Optimize largest contentful paint (LCP)',
        'Reduce cumulative layout shift (CLS)',
        'Implement browser caching',
        'Compress text files with Gzip/Brotli',
        'Defer non-critical JavaScript'
      ];
    } else {
      return [
        'Monitor Core Web Vitals monthly',
        'Keep plugins/dependencies updated',
        'Consider HTTP/3 implementation',
        'Fine-tune image lazy loading'
      ];
    }
  }

  private static getRankingRecommendations(rank: number): string[] {
    if (rank > 10) {
      return [
        'Conduct comprehensive SEO audit',
        'Build high-quality backlinks from relevant sites',
        'Optimize on-page content for target keywords',
        'Improve site speed and mobile experience',
        'Create supporting content cluster',
        'Fix technical SEO issues'
      ];
    } else if (rank > 3) {
      return [
        'Strengthen backlink profile with authority sites',
        'Improve content depth and quality',
        'Optimize for featured snippets',
        'Enhance user engagement metrics',
        'Build topical authority with content clusters'
      ];
    } else {
      return [
        'Maintain content freshness',
        'Monitor competitors for SERP changes',
        'Continue building quality backlinks',
        'Optimize for voice search and People Also Ask',
        'Expand into related long-tail keywords'
      ];
    }
  }

  private static getSEORecommendations(critical: number, warnings: number): string[] {
    const recommendations: string[] = [];

    if (critical > 0) {
      recommendations.push(
        'Fix missing or duplicate title tags immediately',
        'Ensure all pages have unique meta descriptions',
        'Resolve broken links and 404 errors',
        'Fix crawl errors in Google Search Console'
      );
    }

    if (warnings > 0) {
      recommendations.push(
        'Optimize images with alt tags',
        'Improve internal linking structure',
        'Add schema markup for rich snippets',
        'Ensure mobile-friendliness'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Maintain current SEO best practices',
        'Monitor for algorithm updates',
        'Continue creating quality content',
        'Build authoritative backlinks'
      );
    }

    return recommendations;
  }
}

export default RevenueImpactCalculator;
