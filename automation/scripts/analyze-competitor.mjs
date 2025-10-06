#!/usr/bin/env node
/**
 * Competitor Content Analyzer
 * Analyzes competitor blogs and identifies content gaps
 */

import Anthropic from '@anthropic-ai/sdk';
import { load } from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function fetchCompetitorBlog(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Extract blog posts - adjust selectors based on competitor site structure
    const posts = [];

    // Common blog post selectors
    const selectors = [
      'article',
      '.blog-post',
      '.post',
      '[class*="post"]',
      '[class*="article"]'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        if (i >= 20) return false; // Limit to 20 posts

        const title = $(elem).find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
        const link = $(elem).find('a').first().attr('href');
        const excerpt = $(elem).find('p, .excerpt, [class*="excerpt"]').first().text().trim();

        if (title && link) {
          posts.push({
            title,
            url: link.startsWith('http') ? link : new URL(link, url).href,
            excerpt: excerpt.substring(0, 200)
          });
        }
      });

      if (posts.length > 0) break;
    }

    return posts;
  } catch (err) {
    throw new Error(`Failed to fetch competitor blog: ${err.message}`);
  }
}

async function analyzeCompetitor(competitorUrl) {
  console.log(`\n🔍 Analyzing Competitor: ${competitorUrl}\n`);
  console.log('━'.repeat(60));

  // Fetch competitor posts
  console.log('\n📥 Fetching competitor blog posts...\n');
  let competitorPosts;
  try {
    competitorPosts = await fetchCompetitorBlog(competitorUrl);
    console.log(`✅ Found ${competitorPosts.length} posts\n`);
  } catch (err) {
    console.log(`❌ ${err.message}\n`);
    return;
  }

  if (competitorPosts.length === 0) {
    console.log('❌ No posts found. The site structure might be different than expected.\n');
    return;
  }

  // Load our posts
  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
  const ourPosts = report.posts.map(p => ({
    title: p.title,
    category: p.category,
    wordCount: p.wordCount
  }));

  console.log('━'.repeat(60));
  console.log('\n🤖 Analyzing content gaps with Claude...\n');

  const prompt = `You are an expert content strategist. Analyze competitor blog content and identify gaps in our content strategy.

OUR BLOG POSTS:
${ourPosts.map(p => `- ${p.title} (${p.category}, ${p.wordCount} words)`).join('\n')}

COMPETITOR POSTS:
${competitorPosts.map(p => `- ${p.title}\n  ${p.excerpt}`).join('\n\n')}

ANALYSIS TASKS:

1. CONTENT GAPS:
   - What topics are they covering that we're not?
   - What angles or approaches are different?
   - Which gaps represent the biggest opportunities?

2. CONTENT IDEAS:
   - Generate 5-10 specific blog post ideas that:
     a) Fill identified gaps
     b) Would appeal to our Sydney small business audience
     c) Have SEO potential
   - For each idea, provide:
     - Suggested title
     - Target keywords
     - Why it's valuable
     - Estimated difficulty to rank

3. IMPROVEMENT OPPORTUNITIES:
   - What are they doing better than us?
   - What content types/formats should we adopt?
   - How can we differentiate ourselves?

4. COMPETITIVE ADVANTAGES:
   - What do we cover that they don't?
   - Where can we double down on our strengths?

Provide actionable, specific recommendations formatted clearly.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysis = response.content[0].text;

    console.log('✅ Analysis Complete:\n');
    console.log(analysis);

    // Save analysis
    const timestamp = new Date().toISOString().split('T')[0];
    const competitorDomain = new URL(competitorUrl).hostname.replace('www.', '');
    const analysisPath = path.join(
      projectRoot,
      `automation/competitor-analysis/${competitorDomain}-${timestamp}.md`
    );

    await fs.mkdir(path.join(projectRoot, 'automation/competitor-analysis'), { recursive: true });

    const analysisContent = `# Competitor Analysis: ${competitorDomain}

Generated: ${new Date().toISOString()}
Competitor URL: ${competitorUrl}

## Their Content (${competitorPosts.length} posts analyzed)

${competitorPosts.slice(0, 10).map(p => `- [${p.title}](${p.url})\n  ${p.excerpt}`).join('\n\n')}

## Analysis

${analysis}

## Action Items

Based on this analysis:

1. **Immediate (This Week):**
   - [ ] Review top 3 content gap opportunities
   - [ ] Outline first new post targeting identified gap
   - [ ] Update existing posts with competitive insights

2. **Short Term (This Month):**
   - [ ] Create 2-3 posts filling major content gaps
   - [ ] Implement format/style improvements identified
   - [ ] Monitor competitor for new content trends

3. **Long Term (Next Quarter):**
   - [ ] Build comprehensive coverage in gap areas
   - [ ] Develop unique content angles for differentiation
   - [ ] Establish authority in areas they're weak

## Next Analysis: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
`;

    await fs.writeFile(analysisPath, analysisContent);

    console.log('\n━'.repeat(60));
    console.log(`\n✅ Analysis saved to: automation/competitor-analysis/${competitorDomain}-${timestamp}.md\n`);
    console.log('━'.repeat(60) + '\n');

    // Save competitor URL for future tracking
    const trackingPath = path.join(projectRoot, 'automation/competitor-tracking.json');
    let tracking = { competitors: [] };
    try {
      tracking = JSON.parse(await fs.readFile(trackingPath, 'utf-8'));
    } catch (err) {
      // File doesn't exist yet
    }

    if (!tracking.competitors.find(c => c.url === competitorUrl)) {
      tracking.competitors.push({
        url: competitorUrl,
        domain: competitorDomain,
        firstAnalyzed: new Date().toISOString(),
        lastAnalyzed: new Date().toISOString(),
        postsFound: competitorPosts.length
      });
    } else {
      const comp = tracking.competitors.find(c => c.url === competitorUrl);
      comp.lastAnalyzed = new Date().toISOString();
      comp.postsFound = competitorPosts.length;
    }

    await fs.writeFile(trackingPath, JSON.stringify(tracking, null, 2));

  } catch (err) {
    console.error('❌ Error analyzing competitor:', err.message);
  }
}

// Get URL from command line
const url = process.argv[2];

if (!url) {
  console.log('\n❌ Usage: npm run blog:competitor <competitor-blog-url>\n');
  console.log('Example: npm run blog:competitor https://competitor.com/blog\n');
  process.exit(1);
}

analyzeCompetitor(url);
