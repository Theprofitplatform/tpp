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
 * These create more contextually appropriate images
 */
const INDUSTRY_KEYWORDS = {
  // Professions
  'plumber': 'plumber working on pipes',
  'plumbers': 'plumber working on pipes',
  'plumbing': 'plumbing tools and pipes',
  'lawyer': 'lawyer in office',
  'lawyers': 'lawyer in office',
  'legal': 'legal office courthouse',
  'attorney': 'lawyer in courtroom',
  'dentist': 'dental clinic',
  'dentists': 'dental office',
  'doctor': 'medical professional',
  'doctors': 'medical office',
  'accountant': 'accountant with calculator',
  'accountants': 'accounting office',
  'electrician': 'electrician working',
  'electricians': 'electrical work',
  'builder': 'construction site',
  'builders': 'construction workers',
  'real estate': 'real estate agent showing house',
  'realtor': 'real estate property',
  'photographer': 'professional photographer',
  'restaurant': 'restaurant dining',
  'cafe': 'coffee shop cafe',
  'bakery': 'bakery bread',
  'gym': 'fitness gym',
  'fitness': 'fitness training',

  // Services
  'ecommerce': 'online shopping website',
  'shopping': 'online shopping',
  'retail': 'retail store',
  'hospitality': 'hotel service',
  'automotive': 'car mechanic',
  'mechanic': 'auto repair',
  'landscaping': 'garden landscaping',
  'cleaning': 'professional cleaning',
  'moving': 'moving boxes truck',
  'storage': 'warehouse storage',
  'roofing': 'roofing construction',
  'painting': 'house painting',
  'flooring': 'floor installation',

  // Business types
  'startup': 'startup office team',
  'enterprise': 'corporate office',
  'b2b': 'business meeting',
  'saas': 'software dashboard',
  'agency': 'creative agency team',
  'consulting': 'business consultant',
  'coaching': 'business coaching',
  'training': 'professional training',

  // Marketing concepts
  'analytics': 'data analytics dashboard',
  'reporting': 'business report charts',
  'conversion': 'sales conversion funnel',
  'optimization': 'website optimization',
  'strategy': 'business strategy planning',
  'campaign': 'marketing campaign',
  'advertising': 'digital advertising',
  'branding': 'brand design',
  'content': 'content creation writing',
  'social media': 'social media phone',
  'email': 'email marketing laptop',
  'mobile': 'mobile phone apps',
  'website': 'website design laptop',
  'landing': 'landing page design',
  'funnel': 'sales funnel diagram',
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
