#!/usr/bin/env node

/**
 * Unsplash Image Fetcher for Blog Posts
 * Fetches unique, relevant images from Unsplash API
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const USED_IMAGES_PATH = path.join(projectRoot, 'automation/used-images.json');

/**
 * Keywords mapping for different blog categories/topics
 */
const CATEGORY_KEYWORDS = {
  'SEO': ['seo', 'search engine', 'analytics', 'website optimization', 'digital marketing'],
  'Google Ads': ['google ads', 'ppc', 'advertising', 'marketing campaign', 'digital advertising'],
  'Web Design': ['web design', 'website', 'ui design', 'user interface', 'digital design'],
  'Digital Marketing': ['digital marketing', 'social media', 'marketing strategy', 'online marketing'],
  'Content Marketing': ['content marketing', 'blogging', 'writing', 'content creation'],
  'Marketing Strategy': ['business strategy', 'marketing plan', 'business growth', 'planning'],
  'Local SEO': ['local business', 'small business', 'shop', 'local store'],
  'default': ['business', 'technology', 'office', 'laptop', 'workspace']
};

/**
 * Get search keywords based on category and title
 */
function getSearchKeywords(category, title) {
  const categoryKeys = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['default'];

  // Extract potential keywords from title
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4 && !['guide', 'complete', 'sydney', '2025'].includes(word));

  // Combine and prioritize
  const allKeywords = [...categoryKeys, ...titleWords.slice(0, 2)];

  // Return random selection to get variety
  return allKeywords[Math.floor(Math.random() * allKeywords.length)];
}

/**
 * Load used images to prevent duplicates
 */
async function loadUsedImages() {
  try {
    const data = await fs.readFile(USED_IMAGES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { images: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Save used image to tracking file
 */
async function saveUsedImage(imageData) {
  const usedImages = await loadUsedImages();
  usedImages.images.push({
    ...imageData,
    usedAt: new Date().toISOString()
  });
  usedImages.lastUpdated = new Date().toISOString();

  await fs.writeFile(USED_IMAGES_PATH, JSON.stringify(usedImages, null, 2));
}

/**
 * Check if image has been used recently (within last 20 posts)
 */
function isImageRecentlyUsed(imageId, usedImages) {
  const recentImages = usedImages.images.slice(-20);
  return recentImages.some(img => img.id === imageId);
}

/**
 * Fetch image from Unsplash API
 */
async function fetchFromUnsplash(query, accessKey) {
  try {
    const url = new URL('https://api.unsplash.com/photos/random');
    url.searchParams.append('query', query);
    url.searchParams.append('orientation', 'landscape');
    url.searchParams.append('content_filter', 'high');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      url: data.urls.regular,
      thumb: data.urls.small,
      alt: data.alt_description || data.description || query,
      photographer: {
        name: data.user.name,
        link: data.user.links.html,
        username: data.user.username
      },
      downloadLocation: data.links.download_location
    };
  } catch (error) {
    console.error('Failed to fetch from Unsplash:', error.message);
    return null;
  }
}

/**
 * Trigger download (required by Unsplash API terms)
 */
async function triggerDownload(downloadLocation, accessKey) {
  try {
    await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });
  } catch (error) {
    console.error('Failed to trigger download:', error.message);
  }
}

/**
 * Main function to get unique image for blog post
 */
export async function getUniqueImage(category, title, accessKey) {
  if (!accessKey) {
    console.warn('⚠️  No Unsplash access key provided - using default image');
    return null;
  }

  const usedImages = await loadUsedImages();
  const query = getSearchKeywords(category, title);

  console.log(`🔍 Searching Unsplash for: "${query}"`);

  // Try up to 3 times to get a unique image
  for (let attempt = 0; attempt < 3; attempt++) {
    const imageData = await fetchFromUnsplash(query, accessKey);

    if (!imageData) {
      continue;
    }

    // Check if image was used recently
    if (!isImageRecentlyUsed(imageData.id, usedImages)) {
      // Trigger download as per Unsplash guidelines
      await triggerDownload(imageData.downloadLocation, accessKey);

      // Save to used images
      await saveUsedImage(imageData);

      console.log(`✅ Found unique image by ${imageData.photographer.name}`);
      return imageData;
    }

    console.log(`⏭️  Image already used recently, retrying... (${attempt + 1}/3)`);
  }

  console.warn('⚠️  Could not find unique image after 3 attempts - using default');
  return null;
}

/**
 * Format image data for frontmatter
 */
export function formatImageForFrontmatter(imageData) {
  if (!imageData) {
    return null;
  }

  return {
    coverImage: imageData.url,
    coverImageAlt: imageData.alt,
    coverImageCredit: {
      name: imageData.photographer.name,
      link: imageData.photographer.link
    }
  };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const category = process.argv[2] || 'SEO';
  const title = process.argv[3] || 'Test Blog Post';
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  const imageData = await getUniqueImage(category, title, accessKey);
  if (imageData) {
    console.log(JSON.stringify(formatImageForFrontmatter(imageData), null, 2));
  }
}
