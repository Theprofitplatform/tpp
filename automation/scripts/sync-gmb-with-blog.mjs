#!/usr/bin/env node

/**
 * Sync GMB Posts with Blog Content
 * 
 * Automatically creates GMB posts from new blog posts
 * Can run after blog post generation to create coordinated GMB content
 * 
 * Usage:
 *   node sync-gmb-with-blog.mjs                    # Check for new blog posts
 *   node sync-gmb-with-blog.mjs --blog-slug [slug] # Create GMB post for specific blog
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const BLOG_DIR = path.join(projectRoot, 'src/content/blog');
const GMB_OUTPUT_DIR = path.join(projectRoot, 'automation/generated/gbp-posts/blog-synced');
const SYNC_TRACKER = path.join(projectRoot, 'automation/data/gmb-blog-sync.json');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
});

/**
 * Load sync tracker (tracks which blog posts have GMB posts)
 */
async function loadSyncTracker() {
  try {
    const data = await fs.readFile(SYNC_TRACKER, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      synced: [],
      lastSync: null,
      totalSynced: 0
    };
  }
}

/**
 * Save sync tracker
 */
async function saveSyncTracker(tracker) {
  await fs.mkdir(path.dirname(SYNC_TRACKER), { recursive: true });
  await fs.writeFile(SYNC_TRACKER, JSON.stringify(tracker, null, 2));
}

/**
 * Get blog posts published in last 7 days without GMB posts
 */
async function getRecentBlogPosts(tracker) {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  const recentPosts = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  for (const file of mdFiles) {
    const filepath = path.join(BLOG_DIR, file);
    const stats = await fs.stat(filepath);
    
    // Check if file was created/modified recently
    if (stats.mtime > sevenDaysAgo || stats.birthtime > sevenDaysAgo) {
      const slug = file.replace('.md', '');
      
      // Check if already synced
      if (!tracker.synced.includes(slug)) {
        const content = await fs.readFile(filepath, 'utf-8');
        recentPosts.push({
          slug,
          file,
          filepath,
          content
        });
      }
    }
  }
  
  return recentPosts;
}

/**
 * Extract blog metadata
 */
function extractBlogMetadata(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  
  const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
  const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);
  const dateMatch = frontmatter.match(/pubDate:\s*(.+)/);
  
  // Extract first paragraph for context
  const bodyStart = content.indexOf('---', 4) + 3;
  const body = content.substring(bodyStart);
  const firstParagraph = body.split('\n\n')[0].replace(/[#*\[\]]/g, '').trim();
  
  return {
    title: titleMatch ? titleMatch[1] : null,
    description: descMatch ? descMatch[1] : null,
    pubDate: dateMatch ? dateMatch[1].trim() : null,
    excerpt: firstParagraph.substring(0, 300)
  };
}

/**
 * Generate GMB post from blog post
 */
async function generateGMBPost(blogPost) {
  const metadata = extractBlogMetadata(blogPost.content);
  
  if (!metadata || !metadata.title) {
    console.error(`❌ Could not extract metadata from ${blogPost.slug}`);
    return null;
  }
  
  console.log(`🤖 Generating GMB post for: ${metadata.title}`);
  
  const prompt = `Create a Google Business Profile post that promotes this new blog post.

BLOG POST:
Title: ${metadata.title}
Description: ${metadata.description || metadata.excerpt}
URL: https://theprofitplatform.com.au/blog/${blogPost.slug}/

BUSINESS INFO:
- Name: The Profit Platform
- Location: Sydney, NSW
- Services: SEO, Google Ads, Web Design, Digital Marketing

REQUIREMENTS:
- 150-300 characters (concise and punchy)
- Don't just repeat the title - make it engaging
- Focus on the VALUE/BENEFIT to the reader
- Include 1-2 relevant emojis (tasteful, not excessive)
- End with a clear call-to-action
- Conversational, helpful tone (not salesy)
- Mention it's a "new guide" or "just published"

EXAMPLES OF GOOD GMB POSTS:
"🚀 Just dropped: Our complete guide to local SEO for Sydney businesses. Learn the exact strategies we use to get clients ranking #1. Free, actionable, no fluff. Read now!"

"💡 Struggling with Google Ads costs? Our new article breaks down exactly what you should pay in Sydney (with real examples). Spoiler: You might be overpaying. Check it out!"

"📍 New post: How to actually optimize your Google Business Profile (not the generic tips everyone shares). Based on ranking 50+ Sydney businesses. Link in bio!"

Return ONLY the post text (no quotes, no explanation).`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return message.content[0].text.trim();
  } catch (error) {
    console.error(`❌ API Error:`, error.message);
    return null;
  }
}

/**
 * Create image suggestion based on blog topic
 */
function suggestImage(blogTitle) {
  const keywords = blogTitle.toLowerCase();
  
  if (keywords.includes('seo')) {
    return 'Graph showing SEO results or search rankings screenshot';
  } else if (keywords.includes('google ads') || keywords.includes('ppc')) {
    return 'Google Ads dashboard or performance metrics';
  } else if (keywords.includes('web design') || keywords.includes('website')) {
    return 'Beautiful website screenshot or design mockup';
  } else if (keywords.includes('local')) {
    return 'Sydney location or local business success';
  } else if (keywords.includes('guide') || keywords.includes('how to')) {
    return 'Checklist or step-by-step infographic';
  } else if (keywords.includes('case study')) {
    return 'Before/after results graph';
  }
  
  return 'Eye-catching branded graphic with blog title';
}

/**
 * Calculate optimal posting time
 */
function getOptimalPostTime() {
  // Post during business hours, avoid weekends
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // If it's weekend, schedule for Monday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    now.setDate(now.getDate() + daysUntilMonday);
  }
  
  // Set to 10 AM (optimal engagement time)
  now.setHours(10, 0, 0, 0);
  
  return {
    date: now.toISOString().split('T')[0],
    time: '10:00 AM',
    dayName: now.toLocaleDateString('en-US', { weekday: 'long' })
  };
}

/**
 * Save GMB post
 */
async function saveGMBPost(blogSlug, blogTitle, gmbContent, schedule) {
  await fs.mkdir(GMB_OUTPUT_DIR, { recursive: true });
  
  const postData = {
    blogSlug,
    blogTitle,
    blogUrl: `https://theprofitplatform.com.au/blog/${blogSlug}/`,
    gmbContent,
    scheduledDate: schedule.date,
    scheduledTime: schedule.time,
    scheduledDay: schedule.dayName,
    imageSuggestion: suggestImage(blogTitle),
    actionButton: 'Read article',
    actionUrl: `https://theprofitplatform.com.au/blog/${blogSlug}/`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Save individual file
  const filename = `${blogSlug}-gmb.json`;
  const filepath = path.join(GMB_OUTPUT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(postData, null, 2));
  
  // Also save markdown for easy viewing
  const mdContent = `# GMB Post for: ${blogTitle}

**Blog URL:** ${postData.blogUrl}
**Scheduled:** ${schedule.dayName}, ${schedule.date} @ ${schedule.time}

## Post Content

\`\`\`
${gmbContent}
\`\`\`

## Posting Instructions

1. Open Google Business Profile dashboard
2. Create new post
3. Copy content above
4. Add image: ${postData.imageSuggestion}
5. Add action button: "${postData.actionButton}" → ${postData.actionUrl}
6. Post immediately or schedule for ${schedule.date}

---

Status: [ ] Posted
`;
  
  await fs.writeFile(filepath.replace('.json', '.md'), mdContent);
  
  return filepath;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Syncing GMB posts with blog content...\n');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    process.exit(1);
  }
  
  const specificBlog = process.argv.find(arg => arg.startsWith('--blog-slug='))?.split('=')[1];
  
  const tracker = await loadSyncTracker();
  let postsToProcess = [];
  
  if (specificBlog) {
    // Process specific blog
    console.log(`📝 Processing specific blog: ${specificBlog}\n`);
    const filepath = path.join(BLOG_DIR, `${specificBlog}.md`);
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      postsToProcess = [{
        slug: specificBlog,
        file: `${specificBlog}.md`,
        filepath,
        content
      }];
    } catch {
      console.error(`❌ Blog post not found: ${specificBlog}`);
      process.exit(1);
    }
  } else {
    // Find recent blog posts without GMB posts
    console.log('🔍 Checking for recent blog posts...\n');
    postsToProcess = await getRecentBlogPosts(tracker);
    
    if (postsToProcess.length === 0) {
      console.log('✅ All recent blog posts already have GMB posts!');
      return;
    }
    
    console.log(`📄 Found ${postsToProcess.length} blog post(s) needing GMB posts:\n`);
    postsToProcess.forEach(post => console.log(`   - ${post.slug}`));
    console.log();
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const blogPost of postsToProcess) {
    const metadata = extractBlogMetadata(blogPost.content);
    
    if (!metadata) {
      console.log(`⏭️  Skipping ${blogPost.slug} (no metadata)\n`);
      errorCount++;
      continue;
    }
    
    // Generate GMB post
    const gmbContent = await generateGMBPost(blogPost);
    
    if (!gmbContent) {
      console.log(`❌ Failed to generate GMB post for ${blogPost.slug}\n`);
      errorCount++;
      continue;
    }
    
    // Calculate posting time
    const schedule = getOptimalPostTime();
    
    // Save post
    const savedPath = await saveGMBPost(blogPost.slug, metadata.title, gmbContent, schedule);
    
    // Update tracker
    tracker.synced.push(blogPost.slug);
    tracker.lastSync = new Date().toISOString();
    tracker.totalSynced = tracker.synced.length;
    
    console.log(`✅ ${metadata.title}`);
    console.log(`   Content: "${gmbContent.substring(0, 60)}..."`);
    console.log(`   Schedule: ${schedule.dayName}, ${schedule.date} @ ${schedule.time}`);
    console.log(`   Saved: ${path.basename(savedPath)}\n`);
    
    successCount++;
  }
  
  // Save tracker
  await saveSyncTracker(tracker);
  
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${successCount} GMB post(s)`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Location: ${GMB_OUTPUT_DIR}`);
  console.log(`   📋 Total synced (all time): ${tracker.totalSynced}`);
  
  if (successCount > 0) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Check the generated markdown files for easy posting');
    console.log('   2. Log into Google Business Profile');
    console.log('   3. Post according to the schedule');
    console.log('   4. Consider setting up automated posting with Buffer/Hootsuite');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
