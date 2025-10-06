/**
 * Unsplash Image Fetcher
 * Fetches relevant, high-quality images for blog posts from Unsplash API
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { withCache, retryWithBackoff } from '../utils/api-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local for local development
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Cache for Unsplash searches (1 hour TTL)
const imageSearchCache = {};

if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY not found in environment variables');
  process.exit(1);
}

/**
 * Internal search function (with retry logic)
 */
async function _searchImagesInternal(query, perPage = 10) {
  return await retryWithBackoff(
    async () => {
      const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', perPage);
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('content_filter', 'high');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 15000,
      backoffMultiplier: 2
    }
  );
}

/**
 * Search for images on Unsplash (cached)
 * @param {string} query - Search query
 * @param {number} perPage - Number of results (default: 10)
 * @returns {Promise<Array>} Array of image objects
 */
export const searchImages = withCache(
  _searchImagesInternal,
  imageSearchCache,
  (query, perPage = 10) => `${query}-${perPage}`, // Cache key
  3600000 // 1 hour TTL
);

/**
 * Convert abstract marketing keywords to concrete visual concepts
 * @param {string} keyword - Abstract keyword or topic
 * @param {string} category - Blog category
 * @returns {Array<string>} Array of visual search queries
 */
function getVisualSearchQueries(keyword, category) {
  const lowerKeyword = keyword.toLowerCase();

  // Map abstract concepts to concrete visuals
  const visualMappings = {
    'seo': ['laptop analytics dashboard', 'business growth chart', 'marketing analytics screen'],
    'local seo': ['business map location pins', 'local business storefront', 'city business district'],
    'multi-location': ['franchise business map', 'multiple store locations', 'business expansion cities'],
    'scale': ['business growth graph', 'team collaboration office', 'expanding business network'],
    'google ads': ['digital advertising laptop', 'marketing campaign dashboard', 'online advertising workspace'],
    'ranking': ['search results screen', 'analytics dashboard growth', 'first place podium business'],
    'marketing tools': ['workspace laptop tools', 'digital marketing office', 'creative workspace desk'],
    'case study': ['business success meeting', 'professional team presentation', 'growth chart presentation'],
    'strategy': ['business planning whiteboard', 'team strategy meeting', 'office collaboration brainstorm'],
    'business growth': ['upward business chart', 'successful team meeting', 'startup office workspace']
  };

  // Find matching visual concepts
  let visualQueries = [];
  for (const [concept, visuals] of Object.entries(visualMappings)) {
    if (lowerKeyword.includes(concept)) {
      visualQueries.push(...visuals);
    }
  }

  // Fallback to category-based visuals
  if (visualQueries.length === 0) {
    const categoryVisuals = {
      'seo': ['laptop analytics workspace', 'business data visualization', 'professional office desk'],
      'google ads': ['digital marketing office', 'advertising workspace laptop', 'marketing team meeting'],
      'marketing': ['creative workspace office', 'business strategy meeting', 'professional team collaboration'],
      'business': ['modern office workspace', 'business meeting professional', 'startup office environment']
    };

    const categoryLower = category.toLowerCase();
    for (const [cat, visuals] of Object.entries(categoryVisuals)) {
      if (categoryLower.includes(cat)) {
        visualQueries.push(...visuals);
      }
    }
  }

  // Always add general business fallbacks
  visualQueries.push(
    'professional business workspace',
    'modern office environment',
    'business team collaboration'
  );

  return [...new Set(visualQueries)]; // Remove duplicates
}

/**
 * Get the best image for a blog post
 * @param {string} keyword - Target keyword or topic
 * @param {string} category - Blog category (e.g., "SEO", "Google Ads")
 * @returns {Promise<Object>} Image metadata object
 */
export async function getBlogFeaturedImage(keyword, category) {
  console.log(`🖼️  Searching Unsplash for: "${keyword}"`);

  try {
    // Get visual search queries
    const visualQueries = getVisualSearchQueries(keyword, category);

    console.log(`   Trying ${visualQueries.length} visual search strategies...`);

    for (const query of visualQueries) {
      const results = await searchImages(query, 10);

      if (results.length > 0) {
        // Pick the best high-quality result
        const bestImage = results.find(img =>
          img.width >= 1200 && img.height >= 600 &&
          img.likes > 100
        ) || results.find(img =>
          img.width >= 1200 && img.height >= 600
        ) || results[0];

        if (bestImage) {
          console.log(`✓ Found image by ${bestImage.user.name} (${bestImage.likes} likes)`);
          console.log(`   Query: "${query}"`);

          return {
            url: bestImage.urls.regular,
            downloadUrl: bestImage.links.download_location,
            alt: bestImage.alt_description || bestImage.description || `${keyword} - featured image`,
            credit: {
              name: bestImage.user.name,
              link: bestImage.user.links.html
            },
            width: bestImage.width,
            height: bestImage.height,
            color: bestImage.color
          };
        }
      }
    }

    // Fallback: return null if no suitable image found
    console.warn('⚠️  No suitable image found, will use fallback');
    return null;
  } catch (error) {
    console.error('❌ Error fetching blog image:', error.message);
    return null;
  }
}

/**
 * Download an image from URL and save it locally
 * @param {string} imageUrl - URL of the image to download
 * @param {string} outputPath - Where to save the image
 * @returns {Promise<string>} Path to the saved image
 */
export async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(outputPath, Buffer.from(buffer));

    console.log(`✓ Image saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
    throw error;
  }
}

/**
 * Trigger a download event on Unsplash (required by API guidelines)
 * @param {string} downloadLocation - The download_location URL from the API
 */
export async function triggerDownload(downloadLocation) {
  try {
    await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    console.log('✓ Download tracked');
  } catch (error) {
    console.warn('⚠️  Failed to track download:', error.message);
  }
}

/**
 * Get a featured image for a blog post and save it
 * @param {string} keyword - Target keyword
 * @param {string} category - Blog category
 * @param {string} slug - Blog post slug for filename
 * @returns {Promise<Object>} Image metadata for frontmatter
 */
export async function fetchAndSaveFeaturedImage(keyword, category, slug) {
  console.log(`\n🖼️  Fetching featured image for: ${slug}`);

  try {
    const imageData = await getBlogFeaturedImage(keyword, category);

    if (!imageData) {
      return null;
    }

    // For now, just return the Unsplash URL (we'll download later if needed)
    // This saves bandwidth and storage

    // Trigger download tracking
    if (imageData.downloadUrl) {
      await triggerDownload(imageData.downloadUrl);
    }

    return {
      coverImage: imageData.url,
      coverImageAlt: imageData.alt,
      coverImageCredit: imageData.credit
    };
  } catch (error) {
    console.error('❌ Error in fetchAndSaveFeaturedImage:', error.message);
    return null;
  }
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Unsplash Fetcher...\n');

  const testKeyword = 'digital marketing sydney';
  const testCategory = 'SEO';
  const testSlug = 'test-blog-post';

  fetchAndSaveFeaturedImage(testKeyword, testCategory, testSlug)
    .then(result => {
      console.log('\n✅ Test complete!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
