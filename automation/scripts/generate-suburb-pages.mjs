#!/usr/bin/env node

/**
 * Automated Suburb Page Generator
 * Generates unique, SEO-optimized suburb landing pages
 * Uses Claude API for content generation
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './src/content/locations',
  targetSuburbs: [
    // Priority suburbs (start with these)
    { name: 'Bondi', postcode: '2026', lat: '-33.8915', lng: '151.2767', region: 'Eastern Suburbs' },
    { name: 'Parramatta', postcode: '2150', lat: '-33.8151', lng: '151.0010', region: 'Western Sydney' },
    { name: 'North Sydney', postcode: '2060', lat: '-33.8403', lng: '151.2070', region: 'North Shore' },
    { name: 'Manly', postcode: '2095', lat: '-33.7969', lng: '151.2840', region: 'Northern Beaches' },
    { name: 'Chatswood', postcode: '2067', lat: '-33.7969', lng: '151.1810', region: 'North Shore' },
    { name: 'Newtown', postcode: '2042', lat: '-33.8961', lng: '151.1789', region: 'Inner West' },
    { name: 'Surry Hills', postcode: '2010', lat: '-33.8862', lng: '151.2131', region: 'Inner Sydney' },
    { name: 'Pyrmont', postcode: '2009', lat: '-33.8717', lng: '151.1957', region: 'Inner Sydney' },
    { name: 'Mosman', postcode: '2088', lat: '-33.8286', lng: '151.2439', region: 'North Shore' },
    { name: 'Double Bay', postcode: '2028', lat: '-33.8777', lng: '151.2425', region: 'Eastern Suburbs' },
  ],
  nearbySuburbsMap: {
    'Bondi': ['Bondi Junction', 'Bronte', 'Tamarama', 'Waverley'],
    'Parramatta': ['Harris Park', 'Westmead', 'Rosehill', 'North Parramatta'],
    'North Sydney': ['Milsons Point', 'Cremorne', 'Neutral Bay', 'Kirribilli'],
    'Manly': ['Freshwater', 'Curl Curl', 'Dee Why', 'Fairlight'],
    'Chatswood': ['Willoughby', 'Artarmon', 'Lane Cove', 'Roseville'],
    'Newtown': ['Enmore', 'Stanmore', 'Erskineville', 'Marrickville'],
    'Surry Hills': ['Darlinghurst', 'Redfern', 'Paddington', 'Chippendale'],
    'Pyrmont': ['Ultimo', 'Glebe', 'Darling Harbour', 'Barangaroo'],
    'Mosman': ['Cremorne', 'Neutral Bay', 'Balmoral', 'Beauty Point'],
    'Double Bay': ['Rose Bay', 'Bellevue Hill', 'Point Piper', 'Darling Point'],
  }
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: CONFIG.anthropicApiKey,
});

/**
 * Generate unique suburb page content using Claude
 */
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

/**
 * Create complete suburb page file with frontmatter
 */
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

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Automated Suburb Page Generation\n');

  // Check API key
  if (!CONFIG.anthropicApiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not set');
    console.error('Set it with: export ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Process each suburb
  const results = [];

  for (const suburb of CONFIG.targetSuburbs) {
    const result = await createSuburbPage(suburb);
    results.push(result);

    // Rate limiting (avoid hitting API too fast)
    if (CONFIG.targetSuburbs.indexOf(suburb) < CONFIG.targetSuburbs.length - 1) {
      console.log('⏳ Waiting 2 seconds before next generation...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
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

  console.log('\n🎉 Automation complete!');
  console.log(`📁 Pages saved to: ${CONFIG.outputDir}`);
}

// Run
main().catch(console.error);
