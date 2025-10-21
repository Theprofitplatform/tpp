#!/usr/bin/env node

/**
 * Test script - Generate single suburb page
 * Tests the suburb generator without running all 10
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './src/content/locations',

  // Test with a NEW suburb not in the existing list
  testSuburb: {
    name: 'Newtown',
    postcode: '2042',
    lat: '-33.8961',
    lng: '151.1789',
    region: 'Inner West'
  },

  nearbySuburbsMap: {
    'Newtown': ['Enmore', 'Stanmore', 'Erskineville', 'Marrickville']
  }
};

const anthropic = new Anthropic({
  apiKey: CONFIG.anthropicApiKey,
});

async function generateSuburbContent(suburb) {
  console.log(`🤖 Generating content for ${suburb.name}...`);

  const prompt = `You are an expert local SEO content writer creating a suburb landing page for a digital marketing agency in Sydney.

SUBURB: ${suburb.name}, ${suburb.region}
POSTCODE: ${suburb.postcode}
COMPANY: The Profit Platform (digital marketing agency - SEO, Google Ads, web design)

Write a unique, high-quality suburb landing page (600-800 words) that:
1. Opens with a compelling hook specific to ${suburb.name}'s business landscape
2. Addresses local business challenges unique to ${suburb.name}
3. Explains our services in context of ${suburb.name} market
4. Includes 1 brief case study (can be hypothetical if needed)
5. Lists relevant industries in ${suburb.name}
6. Adds 3 local FAQs
7. Uses natural language, avoids keyword stuffing
8. Sounds human, not AI-generated

IMPORTANT:
- Research actual characteristics of ${suburb.name} (demographics, business types, local culture)
- Be specific and local (mention landmarks, local challenges, community aspects)
- Write in active voice, conversational tone
- Include the suburb name naturally 5-7 times throughout
- NO generic templates or obvious AI patterns
- Make it sound like a local expert wrote it

Return ONLY the markdown content, starting with the H1 heading. No frontmatter, no metadata.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return message.content[0].text;
}

async function createSuburbPage(suburb) {
  try {
    // Generate unique content
    const content = await generateSuburbContent(suburb);

    // Build nearby suburbs list
    const nearbySuburbs = CONFIG.nearbySuburbsMap[suburb.name] || [];

    // Create frontmatter (NEW FORMAT from current script)
    const frontmatter = `---
title: "Digital Marketing Agency ${suburb.name}, Sydney | The Profit Platform"
description: "Leading digital marketing services in ${suburb.name}. Local SEO, Google Ads, and web design helping ${suburb.name} businesses grow. Free consultation available."
city: "${suburb.name}"
state: "NSW"
country: "Australia"
postcode: "${suburb.postcode}"
region: "${suburb.region}"
phone: "0487 286 451"
email: "avi@theprofitplatform.com.au"
serviceAreas: ${JSON.stringify([suburb.name, ...nearbySuburbs])}
coordinates:
  lat: ${suburb.lat}
  lng: ${suburb.lng}
draft: false
dateCreated: ${new Date().toISOString().split('T')[0]}
lastUpdated: ${new Date().toISOString().split('T')[0]}
---

`;

    // Combine frontmatter + content
    const fullContent = frontmatter + content;

    // Create filename (lowercase, hyphenated)
    const filename = `${suburb.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(CONFIG.outputDir, filename);

    // Write file
    await fs.writeFile(filepath, fullContent, 'utf-8');

    console.log(`✅ Created: ${filepath}`);
    console.log(`\n📄 Content Preview (first 500 chars):`);
    console.log(content.substring(0, 500) + '...\n');

    return { success: true, filepath, suburb: suburb.name };

  } catch (error) {
    console.error(`❌ Error generating ${suburb.name}:`, error.message);
    return { success: false, suburb: suburb.name, error: error.message };
  }
}

async function main() {
  console.log('🧪 Testing Suburb Page Generator\n');
  console.log(`Test Suburb: ${CONFIG.testSuburb.name}, ${CONFIG.testSuburb.region}\n`);

  if (!CONFIG.anthropicApiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not set in .env.local');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Generate test suburb
  const result = await createSuburbPage(CONFIG.testSuburb);

  if (result.success) {
    console.log('✅ TEST PASSED!');
    console.log(`\nNext steps:`);
    console.log(`1. Review the generated file: ${result.filepath}`);
    console.log(`2. Run: npm run build`);
    console.log(`3. Check: http://localhost:3001/locations/${CONFIG.testSuburb.name.toLowerCase()}/`);
    console.log(`4. If good, deploy: npm run deploy`);
  } else {
    console.log('❌ TEST FAILED!');
    console.log(`Error: ${result.error}`);
  }
}

main().catch(console.error);
