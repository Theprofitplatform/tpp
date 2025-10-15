#!/usr/bin/env node
/**
 * SEO Opportunity Finder
 * Identifies keywords ranking 5-20 with optimization potential
 */

import { getKeywordOpportunities } from '../utils/search-console-helper.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function findOpportunities() {
  console.log('\n🔍 Finding SEO Opportunities...\n');
  console.log('━'.repeat(60));

  try {
    // Get keyword opportunities from Search Console
    const opportunities = await getKeywordOpportunities(90);

    if (!opportunities || opportunities.length === 0) {
      console.log('\n📊 No keyword opportunities found yet.');
      console.log('   This could mean:');
      console.log('   - Your site is too new (needs 30-90 days of data)');
      console.log('   - You\'re already ranking well for all keywords');
      console.log('   - You need more content to rank for more keywords\n');
      console.log('━'.repeat(60) + '\n');
      return;
    }

    // Categorize opportunities by priority
    const highPriority = opportunities.filter(o =>
      o.position >= 5 && o.position <= 10 && o.impressions >= 100
    );
    const mediumPriority = opportunities.filter(o =>
      o.position >= 11 && o.position <= 15 && o.impressions >= 50
    );
    const lowPriority = opportunities.filter(o =>
      o.position >= 16 && o.position <= 20 && o.impressions >= 20
    );

    // Display high priority opportunities
    if (highPriority.length > 0) {
      console.log('\n🔥 HIGH PRIORITY - Rankings 5-10 (Quick Wins)\n');
      console.log('   These keywords are SO CLOSE to page 1! Small optimizations could 2-5x your traffic.\n');

      highPriority.slice(0, 10).forEach((opp, i) => {
        console.log(`   ${i + 1}. "${opp.keyword}"`);
        console.log(`      Position: #${Math.round(opp.position)} | Impressions: ${opp.impressions} | CTR: ${(opp.ctr * 100).toFixed(1)}%`);
        console.log(`      Action: Optimize title tag, add internal links, improve content depth`);
        console.log(`      Potential: Moving to #3 could get ${Math.round(opp.impressions * 2.5)} more impressions/month\n`);
      });
    }

    // Display medium priority opportunities
    if (mediumPriority.length > 0) {
      console.log('━'.repeat(60));
      console.log('\n⚡ MEDIUM PRIORITY - Rankings 11-15\n');
      console.log('   These keywords need some work but have good potential.\n');

      mediumPriority.slice(0, 5).forEach((opp, i) => {
        console.log(`   ${i + 1}. "${opp.keyword}"`);
        console.log(`      Position: #${Math.round(opp.position)} | Impressions: ${opp.impressions} | CTR: ${(opp.ctr * 100).toFixed(1)}%`);
        console.log(`      Action: Add comprehensive content, build backlinks, optimize for user intent\n`);
      });
    }

    // Display low priority opportunities
    if (lowPriority.length > 0) {
      console.log('━'.repeat(60));
      console.log('\n💡 WATCH LIST - Rankings 16-20\n');
      console.log('   Long-term opportunities. Consider creating dedicated content.\n');

      lowPriority.slice(0, 5).forEach((opp, i) => {
        console.log(`   ${i + 1}. "${opp.keyword}"`);
        console.log(`      Position: #${Math.round(opp.position)} | Impressions: ${opp.impressions}`);
        console.log(`      Action: Create dedicated pillar content or comprehensive guide\n`);
      });
    }

    // Generate action plan
    console.log('━'.repeat(60));
    console.log('\n📋 OPTIMIZATION ACTION PLAN\n');

    if (highPriority.length > 0) {
      console.log('This Week (High ROI):');
      highPriority.slice(0, 3).forEach((opp, i) => {
        console.log(`  ${i + 1}. Optimize content for "${opp.keyword}"`);
        console.log(`     - Improve title tag to include keyword naturally`);
        console.log(`     - Add 2-3 internal links from related posts`);
        console.log(`     - Expand content section about this topic by 300+ words\n`);
      });
    }

    if (mediumPriority.length > 0) {
      console.log('Next 2 Weeks:');
      mediumPriority.slice(0, 2).forEach((opp, i) => {
        console.log(`  ${i + 1}. Strengthen "${opp.keyword}" content`);
        console.log(`     - Add FAQ section addressing user questions`);
        console.log(`     - Get 1-2 backlinks from industry sites`);
        console.log(`     - Add schema markup for rich snippets\n`);
      });
    }

    // Calculate potential traffic impact
    const totalPotentialImpressions = highPriority.reduce((sum, opp) =>
      sum + (opp.impressions * 2.5), 0
    );
    const totalPotentialClicks = Math.round(totalPotentialImpressions * 0.1); // Assume 10% CTR on page 1

    console.log('━'.repeat(60));
    console.log('\n💰 POTENTIAL IMPACT\n');
    console.log(`   If you optimize the top ${Math.min(highPriority.length, 10)} high-priority keywords:`);
    console.log(`   - Potential additional impressions: ${Math.round(totalPotentialImpressions)}/month`);
    console.log(`   - Potential additional clicks: ${totalPotentialClicks}/month`);
    console.log(`   - That's ${Math.round(totalPotentialClicks / 30)} more visitors per day!\n`);

    // Save opportunities report
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalOpportunities: opportunities.length,
        highPriority: highPriority.length,
        mediumPriority: mediumPriority.length,
        lowPriority: lowPriority.length,
        potentialMonthlyImpressions: Math.round(totalPotentialImpressions),
        potentialMonthlyClicks: totalPotentialClicks
      },
      opportunities: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority
      }
    };

    const reportPath = path.join(projectRoot, 'automation/seo-opportunities.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('━'.repeat(60));
    console.log(`\n✅ SEO opportunities report saved to: automation/seo-opportunities.json\n`);
    console.log('━'.repeat(60) + '\n');

  } catch (err) {
    console.error('❌ Error finding opportunities:', err.message);
    if (err.message.includes('No data available')) {
      console.log('\n💡 Tip: Run this script again after your site has 30+ days of search data\n');
    }
  }
}

findOpportunities();
