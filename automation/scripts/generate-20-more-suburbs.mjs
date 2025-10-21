#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for scaling to 50 total suburbs (20 more)
const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './src/content/locations',
  targetSuburbs: [
    // Additional North Shore (4)
    { name: 'Hornsby', postcode: '2077', lat: '-33.7045', lng: '151.0993', region: 'North Shore' },
    { name: 'Ryde', postcode: '2112', lat: '-33.8149', lng: '151.1017', region: 'North Shore' },
    { name: 'Epping', postcode: '2121', lat: '-33.7725', lng: '151.0820', region: 'North Shore' },
    { name: 'Castle Hill', postcode: '2154', lat: '-33.7339', lng: '151.0032', region: 'Hills District' },

    // Southern Sydney (4)
    { name: 'Hurstville', postcode: '2220', lat: '-33.9675', lng: '151.1028', region: 'St George' },
    { name: 'Miranda', postcode: '2228', lat: '-34.0335', lng: '151.1005', region: 'Sutherland Shire' },
    { name: 'Sutherland', postcode: '2232', lat: '-34.0310', lng: '151.0580', region: 'Sutherland Shire' },
    { name: 'Kogarah', postcode: '2217', lat: '-33.9636', lng: '151.1335', region: 'St George' },

    // Additional Inner West (4)
    { name: 'Strathfield', postcode: '2135', lat: '-33.8761', lng: '151.0875', region: 'Inner West' },
    { name: 'Ashfield', postcode: '2131', lat: '-33.8886', lng: '151.1256', region: 'Inner West' },
    { name: 'Burwood', postcode: '2134', lat: '-33.8772', lng: '151.1043', region: 'Inner West' },
    { name: 'Homebush', postcode: '2140', lat: '-33.8647', lng: '151.0821', region: 'Inner West' },

    // Western Sydney Expansion (4)
    { name: 'Auburn', postcode: '2144', lat: '-33.8493', lng: '151.0332', region: 'Western Sydney' },
    { name: 'Fairfield', postcode: '2165', lat: '-33.8670', lng: '150.9565', region: 'Western Sydney' },
    { name: 'Cabramatta', postcode: '2166', lat: '-33.8943', lng: '150.9355', region: 'Western Sydney' },
    { name: 'Campbelltown', postcode: '2560', lat: '-34.0639', lng: '150.8145', region: 'South Western Sydney' },

    // Eastern Suburbs Completion (4)
    { name: 'Kensington', postcode: '2033', lat: '-33.9131', lng: '151.2237', region: 'Eastern Suburbs' },
    { name: 'Matraville', postcode: '2036', lat: '-33.9592', lng: '151.2342', region: 'Eastern Suburbs' },
    { name: 'Eastgardens', postcode: '2036', lat: '-33.9444', lng: '151.2250', region: 'Eastern Suburbs' },
    { name: 'Mascot', postcode: '2020', lat: '-33.9262', lng: '151.1953', region: 'Eastern Suburbs' },
  ],
  nearbySuburbsMap: {
    'Hornsby': ['Wahroonga', 'Thornleigh', 'Asquith', 'Mount Colah'],
    'Ryde': ['Macquarie Park', 'North Ryde', 'West Ryde', 'Gladesville'],
    'Epping': ['Eastwood', 'North Epping', 'Carlingford', 'Beecroft'],
    'Castle Hill': ['Baulkham Hills', 'Kellyville', 'West Pennant Hills', 'Rouse Hill'],
    'Hurstville': ['Kogarah', 'Penshurst', 'Mortdale', 'Carlton'],
    'Miranda': ['Cronulla', 'Caringbah', 'Sutherland', 'Sylvania'],
    'Sutherland': ['Miranda', 'Cronulla', 'Kirrawee', 'Jannali'],
    'Kogarah': ['Hurstville', 'Rockdale', 'Carlton', 'Beverley Park'],
    'Strathfield': ['Burwood', 'Homebush', 'Concord', 'Enfield'],
    'Ashfield': ['Burwood', 'Croydon', 'Summer Hill', 'Haberfield'],
    'Burwood': ['Strathfield', 'Ashfield', 'Croydon', 'Concord'],
    'Homebush': ['Strathfield', 'Flemington', 'North Strathfield', 'Rhodes'],
    'Auburn': ['Lidcombe', 'Homebush', 'Granville', 'Silverwater'],
    'Fairfield': ['Cabramatta', 'Wetherill Park', 'Prairiewood', 'Smithfield'],
    'Cabramatta': ['Fairfield', 'Canley Vale', 'Lansvale', 'Warwick Farm'],
    'Campbelltown': ['Macquarie Fields', 'Ingleburn', 'Leumeah', 'Minto'],
    'Kensington': ['Randwick', 'Kingsford', 'Moore Park', 'Zetland'],
    'Matraville': ['Maroubra', 'Phillip Bay', 'Little Bay', 'Chifley'],
    'Eastgardens': ['Maroubra', 'Kingsford', 'Pagewood', 'Hillsdale'],
    'Mascot': ['Alexandria', 'Rosebery', 'Botany', 'Eastlakes'],
  }
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: CONFIG.anthropicApiKey,
});

/**
 * Generate suburb page content using Claude
 */
async function generateSuburbContent(suburb) {
  const nearbySuburbs = CONFIG.nearbySuburbsMap[suburb.name] || [];

  const prompt = `You are an expert local SEO content writer creating a suburb landing page for a digital marketing agency in Sydney.

SUBURB: ${suburb.name}, ${suburb.region}
POSTCODE: ${suburb.postcode}
NEARBY SUBURBS: ${nearbySuburbs.join(', ')}
COMPANY: The Profit Platform (digital marketing agency - SEO, Google Ads, web design)
PHONE: 0487 286 451
EMAIL: avi@theprofitplatform.com.au

Write a unique, high-quality suburb landing page (600-800 words) that:
1. Opens with a relatable scenario specific to ${suburb.name} (mention specific local landmarks or characteristics)
2. Addresses pain points local businesses face (Sydney market competitive, hard to get found online)
3. Explains how The Profit Platform helps local businesses in ${suburb.name}
4. Lists 3-4 specific services (SEO, Google Ads, Web Design, Local SEO)
5. Includes a strong call-to-action to contact us
6. Uses natural language - DO NOT sound like AI or marketing copy
7. Mentions nearby suburbs naturally: ${nearbySuburbs.join(', ')}

CRITICAL RULES:
- Write like a human, not a robot
- Use conversational Australian English
- Include specific references to ${suburb.name} and ${suburb.region}
- No generic "digital landscape" corporate speak
- Focus on real business problems and solutions
- Keep paragraphs short (2-3 sentences max)
- Use "you" and "we" language

Return ONLY the markdown content body (no frontmatter). Start with an engaging opening paragraph.`;

  console.log(`🤖 Generating content for ${suburb.name}...`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

/**
 * Create frontmatter for suburb page
 */
function createFrontmatter(suburb) {
  const nearbySuburbs = CONFIG.nearbySuburbsMap[suburb.name] || [];
  const today = new Date().toISOString().split('T')[0];

  return `---
title: "Digital Marketing Agency ${suburb.name}, Sydney | The Profit Platform"
description: "Leading digital marketing services in ${suburb.name}. Expert SEO, Google Ads & web design for ${suburb.region} businesses. Call 0487 286 451 for a free consultation."
city: "${suburb.name}"
state: "NSW"
country: "Australia"
postcode: "${suburb.postcode}"
region: "${suburb.region}"
phone: "0487 286 451"
email: "avi@theprofitplatform.com.au"
serviceAreas: ${JSON.stringify([suburb.name, ...nearbySuburbs.slice(0, 4)])}
coordinates:
  lat: ${suburb.lat}
  lng: ${suburb.lng}
draft: false
dateCreated: ${today}
lastUpdated: ${today}
---

`;
}

/**
 * Generate a single suburb page
 */
async function generateSuburbPage(suburb) {
  try {
    const filename = suburb.name.toLowerCase().replace(/\s+/g, '-') + '.md';
    const filepath = path.join(CONFIG.outputDir, filename);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${suburb.name} (already exists)`);
      return { suburb: suburb.name, status: 'skipped', filepath };
    }

    // Generate content
    const content = await generateSuburbContent(suburb);

    // Create frontmatter
    const frontmatter = createFrontmatter(suburb);

    // Combine and write file
    const fullContent = frontmatter + content;
    fs.writeFileSync(filepath, fullContent, 'utf-8');

    console.log(`✅ Created: ${filepath}`);
    return { suburb: suburb.name, status: 'created', filepath };

  } catch (error) {
    console.error(`❌ Error generating ${suburb.name}:`, error.message);
    return { suburb: suburb.name, status: 'error', error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting suburb page generation (Scale to 50)...');
  console.log(`📍 Target: ${CONFIG.targetSuburbs.length} suburbs\n`);

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const results = [];

  // Generate each suburb page with delay to avoid rate limits
  for (const suburb of CONFIG.targetSuburbs) {
    const result = await generateSuburbPage(suburb);
    results.push(result);

    // Wait 3 seconds between API calls to avoid rate limits
    if (CONFIG.targetSuburbs.indexOf(suburb) < CONFIG.targetSuburbs.length - 1) {
      console.log('⏳ Waiting 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n📊 Generation Summary:');
  console.log(`✅ Created: ${results.filter(r => r.status === 'created').length}`);
  console.log(`⏭️  Skipped: ${results.filter(r => r.status === 'skipped').length}`);
  console.log(`❌ Errors: ${results.filter(r => r.status === 'error').length}`);

  if (results.filter(r => r.status === 'created').length > 0) {
    console.log('\n🎉 New suburb pages created! Next steps:');
    console.log('1. Review the content');
    console.log('2. Run: npm run build');
    console.log('3. Run: npm run deploy');
    console.log('\n🏆 Total suburb pages after this: 50 (complete Sydney metro coverage!)');
  }

  return results;
}

// Run the script
main().catch(console.error);
