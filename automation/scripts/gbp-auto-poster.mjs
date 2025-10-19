#!/usr/bin/env node

/**
 * Automated Google Business Profile Post Generator
 * Generates and schedules GBP posts using Claude AI
 * Can integrate with GBP API or output for manual posting
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './automation/generated/gbp-posts',
  postsPerWeek: 3,
  weeksToGenerate: 4, // Generate 1 month at a time

  // Post types rotation
  postTypes: [
    { type: 'tip', topic: 'Local SEO tips for Sydney businesses', cta: 'Learn more' },
    { type: 'case-study', topic: 'Client success story (Sydney-based)', cta: 'Get similar results' },
    { type: 'offer', topic: 'Limited-time promotion or free audit', cta: 'Claim offer' },
    { type: 'update', topic: 'Company news or industry update', cta: 'Read more' },
    { type: 'question', topic: 'Engage with question about their business', cta: 'Tell us' },
  ],

  // Your business info
  businessInfo: {
    name: 'The Profit Platform',
    services: ['SEO', 'Google Ads', 'Web Design', 'Digital Marketing'],
    location: 'Sydney, NSW',
    phone: '0487 286 451',
    url: 'https://theprofitplatform.com.au',
    focusAreas: ['Bondi', 'Parramatta', 'North Shore', 'Inner West', 'Western Sydney'],
  }
};

const anthropic = new Anthropic({
  apiKey: CONFIG.anthropicApiKey,
});

/**
 * Generate a single GBP post using Claude
 */
async function generatePost(postConfig, weekNumber, postNumber) {
  const { type, topic, cta } = postConfig;

  const prompt = `Create a Google Business Profile post for a digital marketing agency in Sydney.

POST TYPE: ${type}
TOPIC: ${topic}
BUSINESS: The Profit Platform (SEO, Google Ads, Web Design for Sydney small businesses)
WEEK: ${weekNumber}, Post #${postNumber}

REQUIREMENTS:
- 150-300 characters (GBP limit is ~1,500 but shorter performs better)
- Engaging, conversational tone
- Include specific Sydney suburb/area if relevant
- Add 1-2 relevant emojis (not excessive)
- Include a clear call-to-action
- For case studies: Use realistic but impressive metrics (e.g., "142% increase in calls")
- For tips: Make it actionable and specific
- For offers: Create urgency but don't sound scammy
- End with relevant hashtag (1-2 max)

CTA OPTIONS: "${cta}", "Call 0487 286 451", "Visit [URL]", "Book consultation"

AVOID:
- Generic corporate speak
- Keyword stuffing
- Too many hashtags
- Excessive emojis
- Unrealistic claims

Return ONLY the post text, no quotes, no explanation.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return message.content[0].text.trim();
}

/**
 * Generate image suggestion for post
 */
function suggestImage(postType) {
  const suggestions = {
    'tip': 'Screenshot of tip as infographic, or laptop with analytics',
    'case-study': 'Graph showing results, or dashboard screenshot',
    'offer': 'Eye-catching graphic with offer details',
    'update': 'Team photo or relevant stock image',
    'question': 'Question mark graphic or engaged business owner',
  };

  return suggestions[postType] || 'Relevant branded image';
}

/**
 * Generate posting schedule
 */
function generateSchedule(totalPosts) {
  const schedule = [];
  const startDate = new Date();
  const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday

  let postIndex = 0;
  let weekOffset = 0;

  while (postIndex < totalPosts) {
    const dayOffset = daysOfWeek[postIndex % daysOfWeek.length];
    const postDate = new Date(startDate);
    postDate.setDate(startDate.getDate() + (weekOffset * 7) + dayOffset);

    schedule.push({
      date: postDate.toISOString().split('T')[0],
      dayName: postDate.toLocaleDateString('en-US', { weekday: 'long' }),
      time: '09:00 AM' // Optimal posting time
    });

    postIndex++;
    if (postIndex % daysOfWeek.length === 0) {
      weekOffset++;
    }
  }

  return schedule;
}

/**
 * Generate all posts
 */
async function generateAllPosts() {
  console.log('🚀 Starting GBP Post Generation\n');

  if (!CONFIG.anthropicApiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  const totalPosts = CONFIG.postsPerWeek * CONFIG.weeksToGenerate;
  const schedule = generateSchedule(totalPosts);
  const posts = [];

  console.log(`📅 Generating ${totalPosts} posts for ${CONFIG.weeksToGenerate} weeks\n`);

  for (let i = 0; i < totalPosts; i++) {
    const weekNumber = Math.floor(i / CONFIG.postsPerWeek) + 1;
    const postNumber = (i % CONFIG.postsPerWeek) + 1;
    const postType = CONFIG.postTypes[i % CONFIG.postTypes.length];

    console.log(`📝 Generating Post ${i + 1}/${totalPosts} (Week ${weekNumber}, ${postType.type})...`);

    try {
      const content = await generatePost(postType, weekNumber, postNumber);
      const imageSuggestion = suggestImage(postType.type);

      posts.push({
        postNumber: i + 1,
        week: weekNumber,
        type: postType.type,
        scheduledDate: schedule[i].date,
        scheduledDay: schedule[i].dayName,
        scheduledTime: schedule[i].time,
        content: content,
        imageSuggestion: imageSuggestion,
        actionButton: postType.cta,
        actionUrl: CONFIG.businessInfo.url + '/contact',
        status: 'draft'
      });

      // Rate limiting
      if (i < totalPosts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

    } catch (error) {
      console.error(`❌ Error generating post ${i + 1}:`, error.message);
    }
  }

  return posts;
}

/**
 * Save posts in multiple formats
 */
async function savePosts(posts) {
  // Save as JSON
  const jsonPath = path.join(CONFIG.outputDir, `gbp-posts-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(posts, null, 2));
  console.log(`\n💾 Saved JSON: ${jsonPath}`);

  // Save as CSV for easy import
  const csvHeaders = 'Post #,Week,Type,Date,Day,Time,Content,Image Suggestion,CTA,URL,Status\n';
  const csvRows = posts.map(p =>
    `${p.postNumber},${p.week},"${p.type}","${p.scheduledDate}","${p.scheduledDay}","${p.scheduledTime}","${p.content.replace(/"/g, '""')}","${p.imageSuggestion}","${p.actionButton}","${p.actionUrl}","${p.status}"`
  ).join('\n');

  const csvPath = path.join(CONFIG.outputDir, `gbp-posts-${new Date().toISOString().split('T')[0]}.csv`);
  await fs.writeFile(csvPath, csvHeaders + csvRows);
  console.log(`💾 Saved CSV: ${csvPath}`);

  // Save as readable Markdown checklist
  let markdown = `# Google Business Profile Posts - ${new Date().toLocaleDateString()}\n\n`;
  markdown += `**Total Posts:** ${posts.length}\n`;
  markdown += `**Duration:** ${CONFIG.weeksToGenerate} weeks\n\n`;
  markdown += `---\n\n`;

  posts.forEach((post, idx) => {
    markdown += `## Post ${post.postNumber} - ${post.scheduledDay}, ${post.scheduledDate}\n\n`;
    markdown += `**Type:** ${post.type}\n`;
    markdown += `**Time:** ${post.scheduledTime}\n\n`;
    markdown += `**Content:**\n`;
    markdown += `\`\`\`\n${post.content}\n\`\`\`\n\n`;
    markdown += `**Image:** ${post.imageSuggestion}\n\n`;
    markdown += `**Action Button:** "${post.actionButton}" → ${post.actionUrl}\n\n`;
    markdown += `**Status:** [ ] Posted\n\n`;
    markdown += `---\n\n`;
  });

  const mdPath = path.join(CONFIG.outputDir, `gbp-posts-${new Date().toISOString().split('T')[0]}.md`);
  await fs.writeFile(mdPath, markdown);
  console.log(`💾 Saved Markdown: ${mdPath}`);

  return { jsonPath, csvPath, mdPath };
}

/**
 * Print posting instructions
 */
function printInstructions(files) {
  console.log('\n📋 POSTING INSTRUCTIONS:\n');
  console.log('OPTION 1: Manual Posting');
  console.log('1. Open the generated Markdown file for easy reading');
  console.log('2. Log into your Google Business Profile');
  console.log('3. Copy each post on its scheduled date');
  console.log('4. Add suggested image (create in Canva if needed)');
  console.log('5. Add action button with URL');
  console.log('6. Check off in the markdown file when posted\n');

  console.log('OPTION 2: Automated with Zapier/Make.com');
  console.log('1. Upload the CSV to Google Sheets');
  console.log('2. Connect Google Sheets → GBP via Zapier');
  console.log('3. Set up automation to post based on date/time');
  console.log('4. Monitor and adjust as needed\n');

  console.log('OPTION 3: Use GBP Scheduling (if available)');
  console.log('1. GBP interface may allow scheduling');
  console.log('2. Bulk upload posts with dates');
  console.log('3. Let them post automatically\n');

  console.log('📂 Your files:');
  console.log(`   JSON: ${files.jsonPath}`);
  console.log(`   CSV: ${files.csvPath}`);
  console.log(`   Markdown: ${files.mdPath}`);
}

/**
 * Main execution
 */
async function main() {
  const posts = await generateAllPosts();
  const files = await savePosts(posts);
  printInstructions(files);

  console.log('\n📊 SUMMARY:');
  console.log(`✅ Generated ${posts.length} posts`);
  console.log(`📅 Covering ${CONFIG.weeksToGenerate} weeks`);
  console.log(`📝 Posting frequency: ${CONFIG.postsPerWeek}x per week`);

  const typeBreakdown = posts.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Post Types:');
  Object.entries(typeBreakdown).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} posts`);
  });

  console.log('\n🎉 Automation complete!');
}

main().catch(console.error);
