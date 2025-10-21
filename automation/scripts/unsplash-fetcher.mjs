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
 * Industry/profession-specific keywords for visual relevance
 * Using PROVEN Unsplash terms that actually return relevant business images
 */
const INDUSTRY_KEYWORDS = {
  // Professions - using broader professional service terms
  'plumber': 'professional tradesman tools',
  'plumbers': 'service professional working',
  'plumbing': 'home repair service',
  'lawyer': 'professional office desk',
  'lawyers': 'business professional meeting',
  'legal': 'professional consultation office',
  'attorney': 'lawyer documents office',
  'dentist': 'medical professional clinic',
  'dentists': 'healthcare professional',
  'doctor': 'medical professional',
  'doctors': 'healthcare clinic',
  'accountant': 'finance professional calculator',
  'accountants': 'business finance office',
  'electrician': 'professional technician',
  'electricians': 'service technician working',
  'builder': 'construction professional',
  'builders': 'construction team',
  'real estate': 'house property agent',
  'realtor': 'real estate professional',
  'photographer': 'camera professional',
  'restaurant': 'restaurant business',
  'cafe': 'coffee shop business',
  'bakery': 'bakery business',
  'gym': 'fitness center',
  'fitness': 'gym training',

  // Services - using proven Unsplash terms
  'ecommerce': 'online shopping',
  'shopping': 'retail shopping',
  'retail': 'store business',
  'hospitality': 'hotel business',
  'automotive': 'car service',
  'mechanic': 'car repair',
  'landscaping': 'garden outdoor',
  'cleaning': 'clean professional',
  'moving': 'moving boxes',
  'storage': 'warehouse business',
  'roofing': 'construction building',
  'painting': 'home improvement',
  'flooring': 'interior design',

  // Business types - proven terms
  'startup': 'startup team office',
  'enterprise': 'corporate business',
  'b2b': 'business meeting',
  'saas': 'software computer',
  'agency': 'creative team office',
  'consulting': 'business meeting professional',
  'coaching': 'mentor meeting',
  'training': 'workshop training',

  // Marketing concepts - using visual terms that exist on Unsplash
  'analytics': 'data analysis chart',
  'reporting': 'business charts graph',
  'conversion': 'business growth chart',
  'optimization': 'laptop business work',
  'strategy': 'business planning strategy',
  'campaign': 'marketing team',
  'advertising': 'advertising creative',
  'branding': 'design creative',
  'content': 'content writing',
  'social media': 'social media marketing',
  'email': 'email marketing',
  'mobile': 'smartphone apps',
  'website': 'web design development',
  'landing': 'website design',
  'funnel': 'business growth',
};

/**
 * Fallback keywords by category (only used if no specific industry found)
 */
const CATEGORY_FALLBACKS = {
  'SEO': 'search engine results analytics',
  'Google Ads': 'digital advertising dashboard',
  'Web Design': 'web design laptop',
  'Digital Marketing': 'digital marketing strategy',
  'Content Marketing': 'content writing',
  'Marketing Strategy': 'business strategy meeting',
  'Local SEO': 'local business storefront',
  'default': 'professional business office'
};

/**
 * Get search keywords based on title content (prioritizes specific topics)
 */
function getSearchKeywords(category, title) {
  const titleLower = title.toLowerCase();

  // Step 1: Check for industry/profession-specific keywords in title
  for (const [keyword, searchTerm] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (titleLower.includes(keyword)) {
      console.log(`   📌 Found specific topic: "${keyword}" → searching for "${searchTerm}"`);
      return searchTerm;
    }
  }

  // Step 2: Extract meaningful words from title (excluding common words)
  const excludeWords = ['guide', 'complete', 'sydney', 'australia', '2025', 'best',
    'how', 'why', 'what', 'when', 'your', 'the', 'for', 'and', 'with'];

  const titleWords = titleLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !excludeWords.includes(word))
    .slice(0, 3);

  if (titleWords.length > 0) {
    const searchTerm = titleWords.join(' ');
    console.log(`   📌 Using title keywords: "${searchTerm}"`);
    return searchTerm;
  }

  // Step 3: Fallback to category
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['default'];
  console.log(`   📌 Using category fallback: "${fallback}"`);
  return fallback;
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
      // Return null for rate limits (403) so we can try Pexels
      if (response.status === 403) {
        return null;
      }
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
      downloadLocation: data.links.download_location,
      source: 'unsplash'
    };
  } catch (error) {
    console.error('Failed to fetch from Unsplash:', error.message);
    return null;
  }
}

/**
 * Fetch image from Pexels API (fallback source)
 */
async function fetchFromPexels(query, apiKey) {
  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.append('query', query);
    url.searchParams.append('orientation', 'landscape');
    url.searchParams.append('per_page', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      return null;
    }

    const photo = data.photos[0];

    return {
      id: photo.id.toString(),
      url: photo.src.large,
      thumb: photo.src.small,
      alt: photo.alt || query,
      photographer: {
        name: photo.photographer,
        link: photo.photographer_url,
        username: photo.photographer
      },
      downloadLocation: photo.url, // Pexels requires visiting photo page
      source: 'pexels'
    };
  } catch (error) {
    console.error('Failed to fetch from Pexels:', error.message);
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
 * Main function to get unique image for blog post (dual-source with fallback)
 */
export async function getUniqueImage(category, title, unsplashKey, pexelsKey) {
  const usedImages = await loadUsedImages();
  const query = getSearchKeywords(category, title);

  // Try Unsplash first (if key provided)
  if (unsplashKey) {
    console.log(`🔍 Searching Unsplash for: "${query}"`);

    for (let attempt = 0; attempt < 3; attempt++) {
      const imageData = await fetchFromUnsplash(query, unsplashKey);

      if (!imageData) {
        // If rate limited on first attempt, break to try Pexels
        if (attempt === 0) {
          console.log('⚠️  Unsplash rate limited, trying Pexels...');
          break;
        }
        continue;
      }

      // Check if image was used recently
      if (!isImageRecentlyUsed(imageData.id, usedImages)) {
        // Trigger download as per Unsplash guidelines
        await triggerDownload(imageData.downloadLocation, unsplashKey);

        // Save to used images
        await saveUsedImage(imageData);

        console.log(`✅ Found unique image by ${imageData.photographer.name} (Unsplash)`);
        return imageData;
      }

      console.log(`⏭️  Image already used recently, retrying... (${attempt + 1}/3)`);
    }
  }

  // Fallback to Pexels if Unsplash failed or rate limited
  if (pexelsKey) {
    console.log(`🔍 Searching Pexels for: "${query}"`);

    for (let attempt = 0; attempt < 3; attempt++) {
      const imageData = await fetchFromPexels(query, pexelsKey);

      if (!imageData) {
        continue;
      }

      // Check if image was used recently
      if (!isImageRecentlyUsed(imageData.id, usedImages)) {
        // Save to used images
        await saveUsedImage(imageData);

        console.log(`✅ Found unique image by ${imageData.photographer.name} (Pexels)`);
        return imageData;
      }

      console.log(`⏭️  Image already used recently, retrying... (${attempt + 1}/3)`);
    }
  }

  console.warn('⚠️  Could not find unique image from any source - using default');
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
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  const imageData = await getUniqueImage(category, title, unsplashKey, pexelsKey);
  if (imageData) {
    console.log(JSON.stringify(formatImageForFrontmatter(imageData), null, 2));
  }
}
