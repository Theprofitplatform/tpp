import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local
dotenv.config({ path: path.join(projectRoot, '.env.local') });

/**
 * Test image integration by simulating blog post generation
 */
async function testImageIntegration() {
  console.log('🧪 Testing Image Integration for Blog Posts\n');

  // Simulate a blog topic
  const testTopic = {
    title: "7 Google Ads Mistakes Costing Sydney Businesses Thousands Every Month",
    targetKeyword: "google ads mistakes sydney",
    category: "Google Ads",
    tags: ["PPC", "Google Ads", "Cost Optimization", "Sydney"]
  };

  console.log(`📝 Testing with topic: "${testTopic.title}"`);
  console.log(`🎯 Keyword: "${testTopic.targetKeyword}"`);
  console.log(`📁 Category: ${testTopic.category}\n`);

  // Generate slug
  const slug = testTopic.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`🔗 Generated slug: ${slug}\n`);

  // Fetch image
  const imageData = await fetchAndSaveFeaturedImage(
    testTopic.targetKeyword,
    testTopic.category,
    slug
  );

  if (!imageData) {
    console.error('\n❌ Failed to fetch image data');
    process.exit(1);
  }

  console.log('\n✅ Image data retrieved successfully!\n');

  // Create sample frontmatter with image data
  const frontmatter = `---
title: "${testTopic.title}"
description: "Learn the 7 most common Google Ads mistakes that Sydney businesses make and how to fix them."
author: "Avi"
publishDate: 2025-10-05
category: "${testTopic.category}"
tags: ${JSON.stringify(testTopic.tags)}
featured: false
draft: true
readTime: "8 min"
coverImage: "${imageData.coverImage}"
coverImageAlt: "${imageData.coverImageAlt}"
coverImageCredit:
  name: "${imageData.coverImageCredit.name}"
  link: "${imageData.coverImageCredit.link}"
seo:
  title: "${testTopic.title} | The Profit Platform"
  description: "Learn the 7 most common Google Ads mistakes that Sydney businesses make and how to fix them."
  keywords: ${JSON.stringify([testTopic.targetKeyword, ...testTopic.tags.slice(0, 3)])}
---

## Introduction

This is where the blog content would go...

The image above was automatically fetched from Unsplash based on the keyword "${testTopic.targetKeyword}".
`;

  console.log('📄 Sample Blog Post Frontmatter with Image:\n');
  console.log(frontmatter);

  console.log('\n✅ Image Integration Test Complete!\n');
  console.log('📊 Summary:');
  console.log(`   ✓ Image URL: ${imageData.coverImage.substring(0, 60)}...`);
  console.log(`   ✓ Alt Text: "${imageData.coverImageAlt}"`);
  console.log(`   ✓ Photographer: ${imageData.coverImageCredit.name}`);
  console.log(`   ✓ Credit Link: ${imageData.coverImageCredit.link}`);
  console.log('\n🎉 The image integration is working correctly!');
  console.log('   Blog posts will now automatically include featured images from Unsplash.');
}

testImageIntegration().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
