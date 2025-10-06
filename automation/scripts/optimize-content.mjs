#!/usr/bin/env node
/**
 * Content Optimizer
 * Automatically improves underperforming blog posts
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function optimizeContent(slug) {
  console.log(`\n🔧 Optimizing content: ${slug}\n`);
  console.log('━'.repeat(60));

  // Load performance data
  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));

  // Find the post
  const post = report.posts.find(p => p.slug === slug);
  if (!post) {
    console.log(`❌ Post not found: ${slug}\n`);
    return;
  }

  // Load the post content
  const postPath = path.join(projectRoot, 'src/content/blog', `${slug}.md`);
  let postContent;
  try {
    postContent = await fs.readFile(postPath, 'utf-8');
  } catch (err) {
    console.log(`❌ Could not read post file: ${postPath}\n`);
    return;
  }

  const { data: frontmatter, content } = matter(postContent);

  // Analyze issues
  const issues = [];
  const recommendations = [];

  if (post.wordCount < 1500) {
    issues.push(`Low word count (${post.wordCount} words)`);
    recommendations.push('Expand content to 1500+ words');
  }

  if (post.quality.internalLinks < 3) {
    issues.push(`Few internal links (${post.quality.internalLinks})`);
    recommendations.push('Add 3-5 relevant internal links');
  }

  if (post.quality.externalLinks === 0) {
    issues.push('No external links');
    recommendations.push('Add 2-3 authoritative external links');
  }

  if (!post.quality.hasImage) {
    issues.push('No featured image');
    recommendations.push('Add a hero image');
  }

  if (post.analytics?.bounceRate > 50) {
    issues.push(`High bounce rate (${post.analytics.bounceRate}%)`);
    recommendations.push('Add CTAs and related content sections');
  }

  console.log('📊 Current Performance:\n');
  console.log(`   Word count: ${post.wordCount}`);
  console.log(`   Internal links: ${post.quality.internalLinks}`);
  console.log(`   External links: ${post.quality.externalLinks}`);
  console.log(`   Has image: ${post.quality.hasImage ? 'Yes' : 'No'}`);
  if (post.analytics?.hasData) {
    console.log(`   Pageviews: ${post.analytics.pageviews}`);
    console.log(`   Bounce rate: ${post.analytics.bounceRate}%`);
    console.log(`   Engagement: ${post.analytics.engagementRate}%`);
  }

  console.log('\n🔍 Issues Found:\n');
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });

  console.log('\n💡 Recommendations:\n');
  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Get all other posts for internal linking suggestions
  const allPosts = report.posts.map(p => ({
    slug: p.slug,
    title: p.title,
    category: p.category
  }));

  console.log('\n━'.repeat(60));
  console.log('\n🤖 Generating optimizations with Claude...\n');

  const prompt = `You are an expert SEO content optimizer. Analyze this blog post and suggest improvements.

POST TITLE: ${frontmatter.title}
CATEGORY: ${frontmatter.category}
CURRENT WORD COUNT: ${post.wordCount}

CURRENT CONTENT:
${content}

PERFORMANCE ISSUES:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

AVAILABLE POSTS FOR INTERNAL LINKING:
${allPosts.filter(p => p.slug !== slug).slice(0, 10).map(p => `- ${p.title} (${p.slug})`).join('\n')}

TASK: Provide specific, actionable optimizations:

1. CONTENT EXPANSION (if word count < 1500):
   - Identify 2-3 sections that need more depth
   - Suggest specific subtopics to add
   - Recommend word count for each new section

2. INTERNAL LINKING:
   - Suggest 3-5 specific places to add internal links
   - Specify which post to link to and the anchor text
   - Explain the relevance

3. EXTERNAL LINKING:
   - Suggest 2-3 authoritative sources to link to
   - Specify where in the content to add them
   - Provide the context/anchor text

4. ENGAGEMENT IMPROVEMENTS:
   - Suggest CTAs to add
   - Recommend interactive elements
   - Propose related content sections

Format your response as a structured action plan with specific line numbers or paragraphs to edit.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const optimization = response.content[0].text;

    console.log('✅ Optimization Plan Generated:\n');
    console.log(optimization);

    // Save optimization plan
    const planPath = path.join(projectRoot, `automation/optimization-plans/${slug}.md`);
    await fs.mkdir(path.join(projectRoot, 'automation/optimization-plans'), { recursive: true });

    const planContent = `# Optimization Plan: ${frontmatter.title}

Generated: ${new Date().toISOString()}

## Current Performance
- Word count: ${post.wordCount}
- Internal links: ${post.quality.internalLinks}
- External links: ${post.quality.externalLinks}
- Has image: ${post.quality.hasImage ? 'Yes' : 'No'}
${post.analytics?.hasData ? `- Pageviews: ${post.analytics.pageviews}
- Bounce rate: ${post.analytics.bounceRate}%
- Engagement: ${post.analytics.engagementRate}%` : ''}

## Issues
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## Optimization Plan

${optimization}

## Implementation Checklist
- [ ] Expand content sections as recommended
- [ ] Add internal links
- [ ] Add external links to authoritative sources
- [ ] Add CTAs and engagement elements
- [ ] Update meta description if needed
- [ ] Add/update images
- [ ] Test readability and flow
- [ ] Re-run performance check after 30 days
`;

    await fs.writeFile(planPath, planContent);

    console.log('\n━'.repeat(60));
    console.log(`\n✅ Optimization plan saved to: automation/optimization-plans/${slug}.md\n`);
    console.log('━'.repeat(60) + '\n');

  } catch (err) {
    console.error('❌ Error generating optimization:', err.message);
  }
}

// Get slug from command line or use default
const slug = process.argv[2];

if (!slug) {
  console.log('\n❌ Usage: npm run blog:optimize <post-slug>\n');
  console.log('Example: npm run blog:optimize how-to-scale-local-seo\n');
  process.exit(1);
}

optimizeContent(slug);
