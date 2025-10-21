#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: './src/content/locations',
  targetSuburbs: [
    // North Shore (4)
    { name: 'Crows Nest', postcode: '2065', lat: '-33.8267', lng: '151.2019', region: 'North Shore' },
    { name: 'St Leonards', postcode: '2065', lat: '-33.8239', lng: '151.1934', region: 'North Shore' },
    { name: 'Lane Cove', postcode: '2066', lat: '-33.8172', lng: '151.1661', region: 'North Shore' },
    { name: 'Neutral Bay', postcode: '2089', lat: '-33.8333', lng: '151.2167', region: 'North Shore' },

    // Eastern Suburbs (4)
    { name: 'Bondi Junction', postcode: '2022', lat: '-33.8931', lng: '151.2472', region: 'Eastern Suburbs' },
    { name: 'Paddington', postcode: '2021', lat: '-33.8842', lng: '151.2274', region: 'Eastern Suburbs' },
    { name: 'Randwick', postcode: '2031', lat: '-33.9145', lng: '151.2416', region: 'Eastern Suburbs' },
    { name: 'Maroubra', postcode: '2035', lat: '-33.9506', lng: '151.2440', region: 'Eastern Suburbs' },

    // Inner West (3)
    { name: 'Glebe', postcode: '2037', lat: '-33.8803', lng: '151.1847', region: 'Inner West' },
    { name: 'Leichhardt', postcode: '2040', lat: '-33.8852', lng: '151.1571', region: 'Inner West' },
    { name: 'Balmain', postcode: '2041', lat: '-33.8565', lng: '151.1798', region: 'Inner West' },

    // Western/South (3)
    { name: 'Blacktown', postcode: '2148', lat: '-33.7689', lng: '150.9058', region: 'Western Sydney' },
    { name: 'Bankstown', postcode: '2200', lat: '-33.9165', lng: '151.0333', region: 'South Western Sydney' },
    { name: 'Cronulla', postcode: '2230', lat: '-34.0568', lng: '151.1531', region: 'Sutherland Shire' },
  ],
  nearbySuburbsMap: {
    'Crows Nest': ['North Sydney', 'Wollstonecraft', 'Cammeray', 'Naremburn'],
    'St Leonards': ['Crows Nest', 'North Sydney', 'Artarmon', 'Greenwich'],
    'Lane Cove': ['North Sydney', 'Chatswood', 'St Leonards', 'Greenwich'],
    'Neutral Bay': ['North Sydney', 'Mosman', 'Cremorne', 'Kirribilli'],
    'Bondi Junction': ['Bondi', 'Bondi Beach', 'Waverley', 'Paddington'],
    'Paddington': ['Bondi Junction', 'Surry Hills', 'Woollahra', 'Edgecliff'],
    'Randwick': ['Coogee', 'Kensington', 'Maroubra', 'Clovelly'],
    'Maroubra': ['Randwick', 'Malabar', 'Little Bay', 'South Maroubra'],
    'Glebe': ['Newtown', 'Ultimo', 'Annandale', 'Forest Lodge'],
    'Leichhardt': ['Newtown', 'Balmain', 'Annandale', 'Haberfield'],
    'Balmain': ['Leichhardt', 'Rozelle', 'Birchgrove', 'Balmain East'],
    'Blacktown': ['Mount Druitt', 'Seven Hills', 'Kings Park', 'Marayong'],
    'Bankstown': ['Liverpool', 'Yagoona', 'Punchbowl', 'Greenacre'],
    'Cronulla': ['Miranda', 'Caringbah', 'Woolooware', 'Bundeena'],
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
  console.log('🚀 Starting suburb page generation...');
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
  }

  return results;
}

// Run the script
main().catch(console.error);
