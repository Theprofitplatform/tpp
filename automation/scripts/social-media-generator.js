/**
 * Social Media Content Generator - Main Orchestrator
 * Generates all social media variants from a blog post
 *
 * Week 3: Multi-Channel Distribution
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLinkedInPost, formatLinkedInPost } from './linkedin-generator.js';
import { generateTwitterThread, formatThreadForCopy } from './twitter-generator.js';
import { generateEmailNewsletter, generatePlainTextVersion } from './email-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Generate all social media content variants for a blog post
 * @param {string} blogSlug - Blog post slug (filename without date prefix)
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} All generated variants
 */
export async function generateAllVariants(blogSlug, options = {}) {
  console.log('\n🚀 Generating social media content variants...');
  console.log(`📝 Blog post: ${blogSlug}\n`);

  try {
    // 1. Load blog post
    const blogPost = await loadBlogPost(blogSlug);

    if (!blogPost.success) {
      throw new Error(`Failed to load blog post: ${blogPost.error}`);
    }

    console.log(`✅ Loaded blog post: ${blogPost.metadata.title}`);
    console.log(`   Word count: ${blogPost.wordCount}`);
    console.log(`   Category: ${blogPost.metadata.category}\n`);

    // 2. Generate all variants in parallel
    console.log('🎨 Generating content variants...');

    const [linkedIn, twitter, email] = await Promise.all([
      generateLinkedInPost(blogPost.content, blogPost.metadata),
      generateTwitterThread(blogPost.content, blogPost.metadata),
      generateEmailNewsletter(blogPost.content, blogPost.metadata)
    ]);

    // 3. Format with actual blog URL
    const blogUrl = blogPost.metadata.url;

    const formattedLinkedIn = linkedIn.success
      ? formatLinkedInPost(linkedIn, blogUrl)
      : null;

    const formattedTwitter = twitter.success
      ? formatThreadForCopy(twitter, blogUrl)
      : null;

    const formattedEmail = email.success
      ? generatePlainTextVersion(email, blogUrl)
      : null;

    // 4. Compile results
    const results = {
      blog: {
        title: blogPost.metadata.title,
        slug: blogSlug,
        url: blogUrl,
        wordCount: blogPost.wordCount
      },
      variants: {
        linkedIn: linkedIn.success ? {
          ...linkedIn,
          formatted: formattedLinkedIn
        } : { success: false, error: linkedIn.error },

        twitter: twitter.success ? {
          ...twitter,
          formatted: formattedTwitter
        } : { success: false, error: twitter.error },

        email: email.success ? {
          ...email,
          formatted: formattedEmail
        } : { success: false, error: email.error }
      },
      summary: {
        total: 3,
        successful: [linkedIn.success, twitter.success, email.success].filter(Boolean).length,
        failed: [linkedIn.success, twitter.success, email.success].filter(s => !s).length
      }
    };

    // 5. Save variants to files
    if (!options.skipSave) {
      await saveVariants(blogSlug, results);
    }

    // 6. Print summary
    printSummary(results);

    return results;

  } catch (error) {
    console.error('\n❌ Variant generation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Load blog post from file system
 */
async function loadBlogPost(slug) {
  try {
    // Find blog post file (with or without date prefix)
    const blogDir = path.join(projectRoot, 'src/content/blog');
    const files = await fs.readdir(blogDir);

    // Look for file matching slug
    const matchingFile = files.find(file =>
      file.endsWith(`${slug}.md`) || file.includes(slug)
    );

    if (!matchingFile) {
      return {
        success: false,
        error: `Blog post not found: ${slug}`
      };
    }

    // Read file
    const filePath = path.join(blogDir, matchingFile);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Parse frontmatter and content
    const frontmatterMatch = fileContent.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);

    if (!frontmatterMatch) {
      return {
        success: false,
        error: 'Invalid blog post format (no frontmatter)'
      };
    }

    const frontmatter = frontmatterMatch[1];
    const content = frontmatterMatch[2];

    // Extract metadata
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

    // Generate URL (remove date prefix)
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
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save variants to file system
 */
async function saveVariants(slug, results) {
  try {
    const variantsDir = path.join(projectRoot, 'automation/content-variants');
    await fs.mkdir(variantsDir, { recursive: true });

    const outputDir = path.join(variantsDir, slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Save LinkedIn
    if (results.variants.linkedIn.success) {
      await fs.writeFile(
        path.join(outputDir, 'linkedin.txt'),
        results.variants.linkedIn.formatted,
        'utf-8'
      );
    }

    // Save Twitter
    if (results.variants.twitter.success) {
      await fs.writeFile(
        path.join(outputDir, 'twitter.txt'),
        results.variants.twitter.formatted,
        'utf-8'
      );
    }

    // Save Email
    if (results.variants.email.success) {
      await fs.writeFile(
        path.join(outputDir, 'email.txt'),
        `SUBJECT: ${results.variants.email.subject}\n\n---\n\n${results.variants.email.formatted}`,
        'utf-8'
      );
    }

    // Save metadata
    await fs.writeFile(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(results, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Variants saved to: automation/content-variants/${slug}/`);

  } catch (error) {
    console.warn('\n⚠️  Failed to save variants:', error.message);
  }
}

/**
 * Print summary of generated variants
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SOCIAL MEDIA VARIANTS SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ Generated ${results.summary.successful}/${results.summary.total} variants\n`);

  // LinkedIn
  if (results.variants.linkedIn.success) {
    console.log('📱 LinkedIn:');
    console.log(`   ${results.variants.linkedIn.wordCount} words`);
    console.log(`   ${results.variants.linkedIn.charCount} characters`);
    console.log(`   ${results.variants.linkedIn.hashtags.length} hashtags: ${results.variants.linkedIn.hashtags.join(', ')}`);
  } else {
    console.log('❌ LinkedIn: Failed');
  }

  // Twitter
  if (results.variants.twitter.success) {
    console.log('\n🐦 Twitter:');
    console.log(`   ${results.variants.twitter.tweetCount} tweets`);
    console.log(`   ${results.variants.twitter.avgChars} avg chars/tweet`);
    console.log(`   ${results.variants.twitter.totalChars} total characters`);
  } else {
    console.log('\n❌ Twitter: Failed');
  }

  // Email
  if (results.variants.email.success) {
    console.log('\n📧 Email:');
    console.log(`   Subject: "${results.variants.email.subject}"`);
    console.log(`   ${results.variants.email.wordCount} words`);
    console.log(`   ${results.variants.email.charCount} characters`);
  } else {
    console.log('\n❌ Email: Failed');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📄 Blog URL: ${results.blog.url}`);
  console.log('\n✅ Content variants ready for distribution!\n');
}

/**
 * CLI execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];

  if (!slug) {
    console.error('❌ Usage: node social-media-generator.js <blog-slug>');
    console.error('   Example: node social-media-generator.js google-ads-extensions-complete-guide-to-maximising-click-through-rates');
    process.exit(1);
  }

  generateAllVariants(slug)
    .then(results => {
      if (!results.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default { generateAllVariants };
