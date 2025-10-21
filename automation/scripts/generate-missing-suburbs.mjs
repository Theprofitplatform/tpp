#!/usr/bin/env node

/**
 * Generate only missing suburb pages from the configured list
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './src/content/locations',

  // Target Sydney suburbs (from the main script)
  targetSuburbs: [
    { name: 'North Sydney', postcode: '2060', lat: '-33.8403', lng: '151.2070', region: 'North Shore' },
    { name: 'Manly', postcode: '2095', lat: '-33.7969', lng: '151.2840', region: 'Northern Beaches' },
    { name: 'Surry Hills', postcode: '2010', lat: '-33.8862', lng: '151.2131', region: 'Inner Sydney' },
    { name: 'Pyrmont', postcode: '2009', lat: '-33.8717', lng: '151.1957', region: 'Inner Sydney' },
    { name: 'Mosman', postcode: '2088', lat: '-33.8286', lng: '151.2439', region: 'North Shore' },
    { name: 'Double Bay', postcode: '2028', lat: '-33.8777', lng: '151.2425', region: 'Eastern Suburbs' },
  ],

  nearbySuburbsMap: {
    'North Sydney': ['Milsons Point', 'Cremorne', 'Neutral Bay', 'Kirribilli'],
    'Manly': ['Freshwater', 'Curl Curl', 'Dee Why', 'Fairlight'],
    'Surry Hills': ['Darlinghurst', 'Redfern', 'Paddington', 'Chippendale'],
    'Pyrmont': ['Ultimo', 'Glebe', 'Darling Harbour', 'Barangaroo'],
    'Mosman': ['Cremorne', 'Neutral Bay', 'Balmoral', 'Beauty Point'],
    'Double Bay': ['Rose Bay', 'Bellevue Hill', 'Point Piper', 'Darling Point'],
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

    // Create frontmatter
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
    return { success: true, filepath, suburb: suburb.name };

  } catch (error) {
    console.error(`❌ Error generating ${suburb.name}:`, error.message);
    return { success: false, suburb: suburb.name, error: error.message };
  }
}

async function main() {
  console.log('🚀 Generating Missing Suburb Pages\n');

  if (!CONFIG.anthropicApiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not set in .env.local');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Check which suburbs already exist
  const existingFiles = await fs.readdir(CONFIG.outputDir);
  const existingSlugs = existingFiles
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  console.log(`📁 Existing suburbs: ${existingSlugs.join(', ')}\n`);

  // Filter to only missing suburbs
  const missingSuburbs = CONFIG.targetSuburbs.filter(suburb => {
    const slug = suburb.name.toLowerCase().replace(/\s+/g, '-');
    return !existingSlugs.includes(slug);
  });

  if (missingSuburbs.length === 0) {
    console.log('✅ All configured suburbs already exist!');
    return;
  }

  console.log(`📝 Will generate ${missingSuburbs.length} missing suburbs:`);
  missingSuburbs.forEach(s => console.log(`   - ${s.name}`));
  console.log('');

  // Process each missing suburb
  const results = [];

  for (const suburb of missingSuburbs) {
    const result = await createSuburbPage(suburb);
    results.push(result);

    // Rate limiting (avoid hitting API too fast)
    if (missingSuburbs.indexOf(suburb) < missingSuburbs.length - 1) {
      console.log('⏳ Waiting 3 seconds before next generation...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n📊 GENERATION SUMMARY:');
  console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);

  if (results.filter(r => !r.success).length > 0) {
    console.log('\nFailed suburbs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.suburb}: ${r.error}`);
    });
  }

  console.log('\n🎉 Generation complete!');
  console.log(`📁 Pages saved to: ${CONFIG.outputDir}`);
  console.log('\nNext steps:');
  console.log('1. npm run build');
  console.log('2. npm run deploy');
}

main().catch(console.error);
