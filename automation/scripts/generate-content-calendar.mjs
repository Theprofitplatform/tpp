#!/usr/bin/env node
/**
 * AI-Powered Content Calendar Generator
 * Creates content calendar based on performance data, trends, and SEO opportunities
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateCalendar(weeks = 4) {
  console.log(`\n📅 Generating ${weeks}-Week Content Calendar...\n`);
  console.log('━'.repeat(60));

  // Load performance data
  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));

  // Load insights if available
  let insights = null;
  try {
    const insightsPath = path.join(projectRoot, 'automation/insights-report.json');
    insights = JSON.parse(await fs.readFile(insightsPath, 'utf-8'));
  } catch (err) {
    // Insights not available
  }

  // Load SEO opportunities if available
  let seoOpps = null;
  try {
    const oppsPath = path.join(projectRoot, 'automation/seo-opportunities.json');
    seoOpps = JSON.parse(await fs.readFile(oppsPath, 'utf-8'));
  } catch (err) {
    // SEO opportunities not available
  }

  // Analyze current content
  const topCategories = {};
  report.posts.forEach(p => {
    topCategories[p.category] = (topCategories[p.category] || 0) + (p.analytics?.pageviews || 0);
  });

  const categoryList = Object.entries(topCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  const recentTopics = report.posts
    .filter(p => p.daysSince < 30)
    .map(p => p.title);

  console.log('\n📊 Analysis:\n');
  console.log(`   Total posts: ${report.posts.length}`);
  console.log(`   Top categories: ${categoryList.join(', ')}`);
  console.log(`   Recent posts: ${recentTopics.length}`);
  if (insights) {
    console.log(`   Critical actions: ${insights.criticalActions.length}`);
    console.log(`   Quick wins: ${insights.quickWins.length}`);
  }
  if (seoOpps) {
    console.log(`   SEO opportunities: ${seoOpps.summary.totalOpportunities}`);
  }

  console.log('\n━'.repeat(60));
  console.log('\n🤖 Generating content calendar with Claude...\n');

  const prompt = `You are an expert content strategist for a Sydney-based digital marketing agency. Create a ${weeks}-week content calendar for our blog.

CURRENT BLOG STATE:
- Total posts: ${report.posts.length}
- Top performing categories: ${categoryList.join(', ')}
- Average engagement rate: ${report.analytics?.avgEngagementRate || 0}%

RECENT TOPICS COVERED:
${recentTopics.slice(0, 10).map(t => `- ${t}`).join('\n')}

${insights ? `INSIGHTS:
Critical Actions:
${insights.criticalActions.slice(0, 3).map(a => `- ${a.issue}: ${a.action}`).join('\n')}

Content Opportunities:
${insights.contentOpportunities.slice(0, 2).map(o => `- ${o.opportunity}: ${o.action}`).join('\n')}` : ''}

${seoOpps ? `SEO OPPORTUNITIES:
High Priority Keywords:
${seoOpps.opportunities.high.slice(0, 5).map(k => `- "${k.keyword}" (position ${Math.round(k.position)}, ${k.impressions} impressions)`).join('\n')}` : ''}

TARGET AUDIENCE:
- Sydney small business owners
- Marketing managers
- Entrepreneurs looking to grow online
- Service-based businesses (plumbers, lawyers, local shops)

CONTENT GOALS:
1. Address Sydney-specific digital marketing challenges
2. Provide actionable, practical advice
3. Build authority in local SEO, Google Ads, and marketing strategy
4. Drive organic traffic and lead generation

TASK: Create a ${weeks}-week content calendar with:

For each week, provide 2-3 blog post ideas with:
1. **Post Title** - Compelling, SEO-friendly, includes location/specificity
2. **Category** - One of: ${categoryList.join(', ')}, or suggest new category
3. **Target Keywords** - 3-5 keywords to target
4. **Brief Outline** - 4-6 main sections/headings
5. **Goal/Purpose** - What business objective it achieves
6. **Estimated Word Count** - Realistic target
7. **Priority** - High/Medium/Low based on impact potential
8. **Publishing Day** - Suggest optimal day of week

Format as a clear, actionable calendar. Focus on topics that:
- Haven't been covered recently
- Address current insights/opportunities
- Have strong SEO potential
- Solve real problems for Sydney businesses`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const calendar = response.content[0].text;

    console.log('✅ Content Calendar Generated:\n');
    console.log(calendar);

    // Save calendar
    const timestamp = new Date().toISOString().split('T')[0];
    const calendarPath = path.join(projectRoot, `automation/content-calendars/calendar-${timestamp}.md`);

    await fs.mkdir(path.join(projectRoot, 'automation/content-calendars'), { recursive: true });

    const calendarContent = `# Content Calendar - ${weeks} Weeks

Generated: ${new Date().toISOString()}

## Calendar Overview

${calendar}

## Implementation Checklist

### Before Writing:
- [ ] Review this calendar and prioritize posts
- [ ] Assign writers/deadlines for each post
- [ ] Prepare any required research/data
- [ ] Set up tracking for each post

### During Writing:
- [ ] Follow outline structure
- [ ] Hit target word count
- [ ] Include target keywords naturally
- [ ] Add 3-5 internal links
- [ ] Add 2-3 authoritative external links
- [ ] Add hero image and 2-3 supporting images

### After Publishing:
- [ ] Monitor performance in first 7 days
- [ ] Share on social media
- [ ] Add to email newsletter
- [ ] Track rankings for target keywords
- [ ] Update calendar with results

## Success Metrics

Track these for each post:
- Pageviews in first 30 days
- Engagement rate
- Ranking for target keywords
- Internal link clicks
- Conversions/leads generated

## Next Calendar Review: ${new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
`;

    await fs.writeFile(calendarPath, calendarContent);

    console.log('\n━'.repeat(60));
    console.log(`\n✅ Calendar saved to: automation/content-calendars/calendar-${timestamp}.md\n`);
    console.log('━'.repeat(60) + '\n');

    console.log('📋 Next Steps:\n');
    console.log('  1. Review calendar and adjust priorities');
    console.log('  2. Assign posts to writers with deadlines');
    console.log('  3. Use `npm run blog:generate` to create each post');
    console.log('  4. Track performance and iterate\n');

  } catch (err) {
    console.error('❌ Error generating calendar:', err.message);
  }
}

// Get weeks from command line or use default
const weeks = parseInt(process.argv[2]) || 4;

if (weeks < 1 || weeks > 12) {
  console.log('\n❌ Weeks must be between 1 and 12\n');
  process.exit(1);
}

generateCalendar(weeks);
