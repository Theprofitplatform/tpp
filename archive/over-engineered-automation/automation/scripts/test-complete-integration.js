import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local
dotenv.config({ path: path.join(projectRoot, '.env.local') });

/**
 * Complete integration test - creates a sample blog post with image
 */
async function testCompleteIntegration() {
  console.log('🧪 Complete Blog Post Integration Test\n');

  // Simulate a blog topic from the queue
  const topic = {
    title: "7 Google Ads Mistakes Costing Sydney Businesses Thousands Every Month",
    targetKeyword: "google ads mistakes sydney",
    category: "Google Ads",
    tags: ["PPC", "Google Ads", "Cost Optimization", "Sydney"]
  };

  console.log(`📝 Creating blog post: "${topic.title}"`);
  console.log(`🎯 Keyword: "${topic.targetKeyword}"`);
  console.log(`📁 Category: ${topic.category}\n`);

  // Generate slug
  const slug = topic.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Fetch featured image
  console.log('🖼️  Fetching featured image...');
  const imageData = await fetchAndSaveFeaturedImage(
    topic.targetKeyword,
    topic.category,
    slug
  );

  if (!imageData) {
    throw new Error('Failed to fetch image data');
  }

  // Create sample blog content
  const today = new Date().toISOString().split('T')[0];
  const author = 'Avi';
  const metaDescription = "Discover the 7 most expensive Google Ads mistakes Sydney businesses make and learn how to fix them to save thousands every month.";
  const readTime = "8 min";

  // Build frontmatter with image data
  let frontmatter = `---
title: "${topic.title}"
description: "${metaDescription}"
author: "${author}"
publishDate: ${today}
category: "${topic.category}"
tags: ${JSON.stringify(topic.tags)}
featured: false
draft: true
readTime: "${readTime}"
coverImage: "${imageData.coverImage}"
coverImageAlt: "${imageData.coverImageAlt}"
coverImageCredit:
  name: "${imageData.coverImageCredit.name}"
  link: "${imageData.coverImageCredit.link}"
seo:
  title: "${topic.title} | The Profit Platform"
  description: "${metaDescription}"
  keywords: ${JSON.stringify([topic.targetKeyword, ...topic.tags.slice(0, 3)])}
---

`;

  // Sample blog content
  const content = `## The Cost of Google Ads Mistakes

If you're running Google Ads for your Sydney business, even small mistakes can cost you thousands of dollars every month. After managing hundreds of campaigns, we've identified the 7 most common and expensive errors.

## 1. Not Using Negative Keywords

Without negative keywords, your ads appear for irrelevant searches, wasting your budget on clicks that never convert.

## 2. Ignoring Quality Score

Low quality scores mean you pay more per click than competitors. Most Sydney businesses don't even know what their quality score is.

## 3. Poor Landing Page Experience

Sending all traffic to your homepage instead of dedicated landing pages kills conversion rates.

## 4. Not Tracking Conversions Properly

If you can't measure ROI accurately, you can't optimize effectively. Many businesses are flying blind.

## 5. Using Broad Match Too Liberally

Broad match keywords can drain budgets quickly if not managed carefully with proper negative keywords.

## 6. Setting and Forgetting

Google Ads requires constant monitoring and optimization. Set-and-forget campaigns waste money.

## 7. Bidding on Branded Terms Only

While branded terms are important, you're missing out on new customer acquisition if that's all you bid on.

## Take Action Now

Ready to fix these mistakes and improve your Google Ads ROI? Contact The Profit Platform for a free Google Ads audit.
`;

  const fullContent = frontmatter + content;

  // Save to test file
  const filename = `${today}-${slug}-TEST.md`;
  const filepath = path.join(projectRoot, 'src/content/blog', filename);

  await fs.writeFile(filepath, fullContent, 'utf-8');

  console.log('\n✅ Test blog post created successfully!\n');
  console.log('📄 File Details:');
  console.log(`   Location: src/content/blog/${filename}`);
  console.log(`   Author: ${author}`);
  console.log(`   Read Time: ${readTime}`);
  console.log(`   Word Count: ${content.split(/\s+/).length} words\n`);

  console.log('🖼️  Image Details:');
  console.log(`   URL: ${imageData.coverImage.substring(0, 80)}...`);
  console.log(`   Alt Text: "${imageData.coverImageAlt}"`);
  console.log(`   Photographer: ${imageData.coverImageCredit.name}`);
  console.log(`   Credit: ${imageData.coverImageCredit.link}\n`);

  console.log('🎉 Complete Integration Test Successful!\n');
  console.log('✓ Image fetched from Unsplash');
  console.log('✓ Frontmatter generated with image data');
  console.log('✓ Blog post file created');
  console.log('✓ Ready for Astro to build\n');

  console.log('🚀 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log(`   2. Visit: http://localhost:3001/blog/${slug}`);
  console.log('   3. See the featured image displayed at the top of the post');

  return { filepath, slug, imageData };
}

testCompleteIntegration().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
