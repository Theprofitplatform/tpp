/**
 * Facebook Poster - Automated Facebook Publishing
 *
 * Two posting methods available:
 * 1. Manual (Recommended): Copy/paste from generated files
 * 2. API (Advanced): Direct Graph API integration
 *
 * Facebook Graph API requires:
 * - Facebook Business Account
 * - Facebook App with permissions
 * - Page Access Token
 * - Page ID
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Manual Facebook Posting Method (Recommended)
 * Generates ready-to-copy Facebook posts
 */
export async function generateFacebookPostForCopy(blogSlug) {
  console.log('\n📘 Generating Facebook post for manual posting...');

  try {
    // Load existing social media variants
    const variantsDir = path.join(projectRoot, 'automation/content-variants', blogSlug);

    // Check if variants exist
    try {
      await fs.access(variantsDir);
    } catch (error) {
      console.log('   ❌ No social media variants found for this blog post');
      console.log('   💡 Run social media generator first: node automation/scripts/social-media-generator.js ' + blogSlug);
      return { success: false, error: 'No variants found' };
    }

    // Load metadata
    const metadataPath = path.join(variantsDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    // Generate Facebook-specific post
    const { generateFacebookPost, formatFacebookPost } = await import('./facebook-generator.js');
    const facebookResult = await generateFacebookPost(
      metadata.blog.content || '', // Use blog content if available
      metadata.blog
    );

    if (!facebookResult.success) {
      return facebookResult;
    }

    // Format with actual URL
    const formattedPost = formatFacebookPost(facebookResult, metadata.blog.url);

    // Save Facebook post
    const facebookPath = path.join(variantsDir, 'facebook.txt');
    await fs.writeFile(facebookPath, formattedPost, 'utf-8');

    // Update metadata to include Facebook
    if (!metadata.variants.facebook) {
      metadata.variants.facebook = facebookResult;
      metadata.variants.facebook.formatted = formattedPost;
      metadata.summary.total = 4;
      metadata.summary.successful += 1;
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    console.log(`   ✅ Facebook post saved to: automation/content-variants/${blogSlug}/facebook.txt`);
    console.log('\n📋 Ready to copy/paste to Facebook:');
    console.log('='.repeat(50));
    console.log(formattedPost);
    console.log('='.repeat(50));

    return {
      success: true,
      post: formattedPost,
      filePath: facebookPath,
      metadata: facebookResult
    };

  } catch (error) {
    console.error('   ❌ Facebook posting failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Facebook Graph API Posting Method (Advanced)
 * Requires Facebook App setup and access tokens
 */
export async function postToFacebookAPI(blogSlug, options = {}) {
  console.log('\n📘 Posting to Facebook via Graph API...');

  const {
    pageId = process.env.FACEBOOK_PAGE_ID,
    accessToken = process.env.FACEBOOK_ACCESS_TOKEN,
    message = null
  } = options;

  // Check required environment variables
  if (!pageId || !accessToken) {
    console.log('   ❌ Facebook API credentials missing');
    console.log('   💡 Add to .env.local:');
    console.log('      FACEBOOK_PAGE_ID=your_page_id');
    console.log('      FACEBOOK_ACCESS_TOKEN=your_access_token');
    return { success: false, error: 'Missing Facebook credentials' };
  }

  try {
    // Load or generate Facebook post
    let postMessage = message;
    if (!postMessage) {
      const manualResult = await generateFacebookPostForCopy(blogSlug);
      if (!manualResult.success) {
        return manualResult;
      }
      postMessage = manualResult.post;
    }

    // Post to Facebook Graph API
    const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: postMessage,
        access_token: accessToken
      })
    });

    const result = await response.json();

    if (result.error) {
      console.error('   ❌ Facebook API error:', result.error.message);
      return { success: false, error: result.error.message };
    }

    console.log('   ✅ Successfully posted to Facebook!');
    console.log(`   📊 Post ID: ${result.id}`);
    console.log(`   🔗 View post: https://facebook.com/${result.id}`);

    return {
      success: true,
      postId: result.id,
      message: postMessage,
      apiResponse: result
    };

  } catch (error) {
    console.error('   ❌ Facebook API posting failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Facebook Setup Instructions
 */
export function printFacebookSetupInstructions() {
  console.log('\n📘 FACEBOOK AUTOMATION SETUP');
  console.log('='.repeat(50));
  console.log('\nMethod 1: Manual Posting (Recommended)');
  console.log('   ✅ No setup required');
  console.log('   ✅ Generate posts: node automation/scripts/facebook-poster.js <blog-slug>');
  console.log('   ✅ Copy/paste from facebook.txt files');

  console.log('\nMethod 2: API Posting (Advanced)');
  console.log('\nStep 1: Create Facebook App');
  console.log('   🔗 https://developers.facebook.com/apps/');
  console.log('   📝 App Type: Business');

  console.log('\nStep 2: Add Permissions');
  console.log('   ✅ pages_manage_posts');
  console.log('   ✅ pages_read_engagement');
  console.log('   ✅ pages_show_list');

  console.log('\nStep 3: Get Page Access Token');
  console.log('   🔗 https://developers.facebook.com/tools/explorer/');
  console.log('   📝 Select your page, generate long-lived token');

  console.log('\nStep 4: Add to .env.local');
  console.log('   FACEBOOK_PAGE_ID=your_page_id_here');
  console.log('   FACEBOOK_ACCESS_TOKEN=your_access_token_here');

  console.log('\nStep 5: Test API Posting');
  console.log('   node automation/scripts/facebook-poster.js --api <blog-slug>');
  console.log('\n' + '='.repeat(50));
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printFacebookSetupInstructions();
    return;
  }

  const blogSlug = args.find(arg => !arg.startsWith('--'));
  const useAPI = args.includes('--api');

  if (!blogSlug) {
    console.error('❌ Usage: node facebook-poster.js <blog-slug> [--api]');
    console.error('   Example: node facebook-poster.js 15-free-seo-tools-every-sydney-small-business-should-use-in-2025');
    console.error('   For API: node facebook-poster.js <blog-slug> --api');
    process.exit(1);
  }

  if (useAPI) {
    await postToFacebookAPI(blogSlug);
  } else {
    await generateFacebookPostForCopy(blogSlug);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default {
  generateFacebookPostForCopy,
  postToFacebookAPI,
  printFacebookSetupInstructions
};