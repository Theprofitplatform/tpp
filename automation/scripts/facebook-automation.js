/**
 * Facebook Automation Orchestrator
 * Complete automation system for Facebook posting with scheduling and monitoring
 *
 * Features:
 * - Content generation and optimization
 * - Automated scheduling
 * - API posting with retry logic
 * - Performance monitoring
 * - Analytics tracking
 * - Error handling and recovery
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFacebookPost, formatFacebookPost } from './facebook-generator.js';
import { postToFacebookAPI } from './facebook-poster.js';
import { sendFacebookNotifications } from './facebook-discord-notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Facebook Automation Configuration
 */
const CONFIG = {
  // Posting schedule (days of week)
  schedule: [
    { day: 'monday', time: '09:30', timezone: 'Australia/Sydney' },
    { day: 'wednesday', time: '14:00', timezone: 'Australia/Sydney' },
    { day: 'friday', time: '11:00', timezone: 'Australia/Sydney' }
  ],

  // Content preferences
  content: {
    maxPostsPerWeek: 3,
    minDaysBetweenPosts: 2,
    preferredCategories: ['SEO', 'Marketing', 'Business', 'Technology'],
    avoidDuplicates: true
  },

  // API settings
  api: {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    timeout: 30000 // 30 seconds
  },

  // Analytics
  analytics: {
    trackEngagement: true,
    trackReach: true,
    trackClicks: true,
    weeklyReports: true
  }
};

/**
 * Facebook Automation State
 */
class FacebookAutomation {
  constructor() {
    this.state = {
      lastPostDate: null,
      postsThisWeek: 0,
      scheduledPosts: [],
      analytics: {}
    };
    this.loadState();
  }

  /**
   * Load automation state from file
   */
  async loadState() {
    try {
      const statePath = path.join(projectRoot, 'automation/data/facebook-state.json');
      const stateData = await fs.readFile(statePath, 'utf-8');
      this.state = { ...this.state, ...JSON.parse(stateData) };
      console.log('✅ Loaded Facebook automation state');
    } catch (error) {
      console.log('ℹ️  No existing Facebook state found, starting fresh');
    }
  }

  /**
   * Save automation state to file
   */
  async saveState() {
    try {
      const dataDir = path.join(projectRoot, 'automation/data');
      await fs.mkdir(dataDir, { recursive: true });

      const statePath = path.join(dataDir, 'facebook-state.json');
      await fs.writeFile(statePath, JSON.stringify(this.state, null, 2), 'utf-8');
      console.log('💾 Saved Facebook automation state');
    } catch (error) {
      console.error('❌ Failed to save Facebook state:', error.message);
    }
  }

  /**
   * Check if we can post based on schedule and limits
   */
  canPostNow() {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Check weekly limit
    if (this.state.postsThisWeek >= CONFIG.content.maxPostsPerWeek) {
      console.log(`⚠️  Weekly limit reached (${this.state.postsThisWeek}/${CONFIG.content.maxPostsPerWeek})`);
      return false;
    }

    // Check minimum days between posts
    if (this.state.lastPostDate) {
      const daysSinceLastPost = Math.floor((now - new Date(this.state.lastPostDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastPost < CONFIG.content.minDaysBetweenPosts) {
        console.log(`⚠️  Too soon since last post (${daysSinceLastPost} days)`);
        return false;
      }
    }

    // Check schedule
    const scheduledTime = CONFIG.schedule.find(slot =>
      slot.day === dayOfWeek && slot.time === time
    );

    return !!scheduledTime;
  }

  /**
   * Find next available blog post for Facebook
   */
  async findNextBlogPost() {
    try {
      const blogDir = path.join(projectRoot, 'src/content/blog');
      const files = await fs.readdir(blogDir);

      // Filter markdown files and sort by date (newest first)
      const blogFiles = files
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => b.localeCompare(a)); // Newest first

      // Check for posts not yet posted to Facebook
      for (const file of blogFiles) {
        const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
        const variantsDir = path.join(projectRoot, 'automation/content-variants', slug);

        try {
          await fs.access(variantsDir);
          const metadataPath = path.join(variantsDir, 'metadata.json');
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);

          // Check if Facebook variant exists and hasn't been posted
          if (metadata.variants.facebook && !metadata.variants.facebook.posted) {
            return { slug, metadata };
          }
        } catch (error) {
          // Variants don't exist yet, this post is available
          return { slug };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding blog posts:', error.message);
      return null;
    }
  }

  /**
   * Generate and post Facebook content
   */
  async generateAndPost(blogSlug, options = {}) {
    console.log(`\n🚀 Starting Facebook automation for: ${blogSlug}`);

    try {
      // Load blog post
      const blogPost = await this.loadBlogPost(blogSlug);
      if (!blogPost.success) {
        throw new Error(`Failed to load blog post: ${blogPost.error}`);
      }

      // Generate Facebook content
      console.log('📘 Generating Facebook post...');
      const facebookResult = await generateFacebookPost(blogPost.content, blogPost.metadata);

      if (!facebookResult.success) {
        throw new Error(`Facebook generation failed: ${facebookResult.error}`);
      }

      // Format with actual URL
      const formattedPost = formatFacebookPost(facebookResult, blogPost.metadata.url);

      // Save to variants
      await this.saveFacebookVariant(blogSlug, facebookResult, formattedPost, blogPost.metadata);

      // Post to Facebook (if API credentials available)
      if (options.useAPI && process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_ACCESS_TOKEN) {
        console.log('📤 Posting to Facebook via API...');
        const postResult = await this.postWithRetry(blogSlug, formattedPost);

        if (postResult.success) {
          // Update state
          this.state.lastPostDate = new Date().toISOString();
          this.state.postsThisWeek += 1;
          await this.saveState();

          // Mark as posted in metadata
          await this.markAsPosted(blogSlug, postResult.postId);

          return {
            success: true,
            postId: postResult.postId,
            message: formattedPost,
            analytics: this.trackPost(postResult.postId)
          };
        } else {
          console.warn('⚠️  API posting failed, but content generated successfully');
          console.log('💡 Use manual posting method:');
          console.log('='.repeat(50));
          console.log(formattedPost);
          console.log('='.repeat(50));

          return {
            success: true,
            manual: true,
            message: formattedPost,
            filePath: path.join(projectRoot, 'automation/content-variants', blogSlug, 'facebook.txt')
          };
        }
      } else {
        // Manual posting method
        console.log('📋 Ready for manual posting:');
        console.log('='.repeat(50));
        console.log(formattedPost);
        console.log('='.repeat(50));

        return {
          success: true,
          manual: true,
          message: formattedPost,
          filePath: path.join(projectRoot, 'automation/content-variants', blogSlug, 'facebook.txt')
        };
      }

    } catch (error) {
      console.error('❌ Facebook automation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post with retry logic
   */
  async postWithRetry(blogSlug, message, retryCount = 0) {
    try {
      return await postToFacebookAPI(blogSlug, { message });
    } catch (error) {
      if (retryCount < CONFIG.api.maxRetries) {
        console.log(`🔄 Retry ${retryCount + 1}/${CONFIG.api.maxRetries} in ${CONFIG.api.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.api.retryDelay));
        return this.postWithRetry(blogSlug, message, retryCount + 1);
      } else {
        throw error;
      }
    }
  }

  /**
   * Load blog post from file system
   */
  async loadBlogPost(slug) {
    try {
      const blogDir = path.join(projectRoot, 'src/content/blog');
      const files = await fs.readdir(blogDir);

      const matchingFile = files.find(file =>
        file.endsWith(`${slug}.md`) || file.includes(slug)
      );

      if (!matchingFile) {
        return { success: false, error: `Blog post not found: ${slug}` };
      }

      const filePath = path.join(blogDir, matchingFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');

      const frontmatterMatch = fileContent.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);
      if (!frontmatterMatch) {
        return { success: false, error: 'Invalid blog post format' };
      }

      const frontmatter = frontmatterMatch[1];
      const content = frontmatterMatch[2];

      const titleMatch = frontmatter.match(/title:\s*"(.+?)"/);
      const categoryMatch = frontmatter.match(/category:\s*"(.+?)"/);
      const authorMatch = frontmatter.match(/author:\s*"(.+?)"/);
      const tagsMatch = frontmatter.match(/tags:\s*\[(.+?)\]/);

      const title = titleMatch ? titleMatch[1] : slug;
      const category = categoryMatch ? categoryMatch[1] : 'General';
      const author = authorMatch ? authorMatch[1] : 'Avi';
      const tags = tagsMatch
        ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, ''))
        : [];

      const cleanSlug = matchingFile.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      const url = `https://theprofitplatform.com.au/blog/${cleanSlug}`;

      return {
        success: true,
        content,
        wordCount: content.split(/\s+/).length,
        metadata: {
          title,
          category,
          author,
          tags,
          slug: cleanSlug,
          url
        }
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save Facebook variant to file system
   */
  async saveFacebookVariant(slug, facebookResult, formattedPost, metadata) {
    try {
      const variantsDir = path.join(projectRoot, 'automation/content-variants', slug);
      await fs.mkdir(variantsDir, { recursive: true });

      // Save Facebook post
      await fs.writeFile(
        path.join(variantsDir, 'facebook.txt'),
        formattedPost,
        'utf-8'
      );

      // Update metadata
      const metadataPath = path.join(variantsDir, 'metadata.json');
      let existingMetadata = { variants: {} };

      try {
        const existingContent = await fs.readFile(metadataPath, 'utf-8');
        existingMetadata = JSON.parse(existingContent);
      } catch (error) {
        // File doesn't exist or is invalid, create new
      }

      existingMetadata.blog = {
        title: metadata.title,
        slug: metadata.slug,
        url: metadata.url,
        wordCount: metadata.wordCount
      };

      existingMetadata.variants.facebook = {
        ...facebookResult,
        formatted: formattedPost,
        posted: false
      };

      existingMetadata.summary = {
        total: 4,
        successful: Object.values(existingMetadata.variants).filter(v => v.success).length,
        failed: Object.values(existingMetadata.variants).filter(v => !v.success).length
      };

      await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2), 'utf-8');
      console.log(`💾 Saved Facebook variant: automation/content-variants/${slug}/facebook.txt`);

    } catch (error) {
      console.error('❌ Failed to save Facebook variant:', error.message);
    }
  }

  /**
   * Mark post as posted in metadata
   */
  async markAsPosted(slug, postId) {
    try {
      const metadataPath = path.join(projectRoot, 'automation/content-variants', slug, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      if (metadata.variants.facebook) {
        metadata.variants.facebook.posted = true;
        metadata.variants.facebook.postId = postId;
        metadata.variants.facebook.postedAt = new Date().toISOString();

        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        console.log(`✅ Marked Facebook post as posted: ${postId}`);
      }
    } catch (error) {
      console.error('❌ Failed to mark post as posted:', error.message);
    }
  }

  /**
   * Track post for analytics
   */
  trackPost(postId) {
    const analytics = {
      postId,
      timestamp: new Date().toISOString(),
      platform: 'facebook',
      scheduled: false
    };

    this.state.analytics[postId] = analytics;
    return analytics;
  }

  /**
   * Run automated posting check
   */
  async runAutomatedCheck() {
    console.log('\n🤖 Running Facebook automation check...');

    if (this.canPostNow()) {
      console.log('✅ Scheduled posting time reached');

      const nextPost = await this.findNextBlogPost();
      if (nextPost) {
        console.log(`📝 Found blog post: ${nextPost.slug}`);
        return await this.generateAndPost(nextPost.slug, { useAPI: true });
      } else {
        console.log('⚠️  No suitable blog posts found for Facebook');
        return { success: false, error: 'No suitable posts' };
      }
    } else {
      console.log('⏰ Not scheduled for posting at this time');
      return { success: false, error: 'Not scheduled' };
    }
  }

  /**
   * Get automation status
   */
  getStatus() {
    return {
      state: this.state,
      config: CONFIG,
      canPost: this.canPostNow(),
      postsThisWeek: this.state.postsThisWeek,
      maxPostsPerWeek: CONFIG.content.maxPostsPerWeek
    };
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  const automation = new FacebookAutomation();

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📘 FACEBOOK AUTOMATION SYSTEM
==================================================

Commands:
  node facebook-automation.js <blog-slug>    Generate and post specific blog
  node facebook-automation.js --auto         Run automated check
  node facebook-automation.js --status       Show automation status
  node facebook-automation.js --help         Show this help

Examples:
  node facebook-automation.js 15-free-seo-tools-every-sydney-small-business-should-use-in-2025
  node facebook-automation.js --auto
  node facebook-automation.js --status

Configuration:
  Posts per week: ${CONFIG.content.maxPostsPerWeek}
  Schedule: ${CONFIG.schedule.map(s => `${s.day} ${s.time}`).join(', ')}
  Timezone: ${CONFIG.schedule[0].timezone}

==================================================
    `);
    return;
  }

  if (args.includes('--status')) {
    const status = automation.getStatus();
    console.log('\n📊 Facebook Automation Status');
    console.log('='.repeat(40));
    console.log(`Posts this week: ${status.postsThisWeek}/${status.maxPostsPerWeek}`);
    console.log(`Can post now: ${status.canPost ? '✅ Yes' : '❌ No'}`);
    console.log(`Last post: ${status.state.lastPostDate || 'Never'}`);
    console.log('='.repeat(40));
    return;
  }

  if (args.includes('--auto')) {
    await automation.runAutomatedCheck();
    return;
  }

  // Manual posting for specific blog
  const blogSlug = args.find(arg => !arg.startsWith('--'));
  if (!blogSlug) {
    console.error('❌ Usage: node facebook-automation.js <blog-slug> [--api]');
    process.exit(1);
  }

  const useAPI = args.includes('--api');
  await automation.generateAndPost(blogSlug, { useAPI });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { FacebookAutomation, CONFIG };
export default FacebookAutomation;