#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 50 suburbs with complete data
const ALL_SUBURBS = [
  // Existing suburbs (keeping their data)
  { name: 'Ashfield', postcode: '2131', lat: '-33.8886', lng: '151.1256', region: 'Inner West' },
  { name: 'Auburn', postcode: '2144', lat: '-33.8493', lng: '151.0332', region: 'Western Sydney' },
  { name: 'Balmain', postcode: '2041', lat: '-33.8565', lng: '151.1798', region: 'Inner West' },
  { name: 'Bankstown', postcode: '2200', lat: '-33.9165', lng: '151.0333', region: 'South Western Sydney' },
  { name: 'Blacktown', postcode: '2148', lat: '-33.7689', lng: '150.9058', region: 'Western Sydney' },
  { name: 'Bondi', postcode: '2026', lat: '-33.8915', lng: '151.2767', region: 'Eastern Suburbs' },
  { name: 'Bondi Junction', postcode: '2022', lat: '-33.8931', lng: '151.2472', region: 'Eastern Suburbs' },
  { name: 'Brisbane', postcode: '4000', lat: '-27.4705', lng: '153.0260', region: 'Queensland' },
  { name: 'Burwood', postcode: '2134', lat: '-33.8772', lng: '151.1043', region: 'Inner West' },
  { name: 'Cabramatta', postcode: '2166', lat: '-33.8943', lng: '150.9355', region: 'Western Sydney' },
  { name: 'Campbelltown', postcode: '2560', lat: '-34.0639', lng: '150.8145', region: 'South Western Sydney' },
  { name: 'Castle Hill', postcode: '2154', lat: '-33.7339', lng: '151.0032', region: 'Hills District' },
  { name: 'Chatswood', postcode: '2067', lat: '-33.7969', lng: '151.1832', region: 'North Shore' },
  { name: 'Cronulla', postcode: '2230', lat: '-34.0568', lng: '151.1531', region: 'Sutherland Shire' },
  { name: 'Crows Nest', postcode: '2065', lat: '-33.8267', lng: '151.2019', region: 'North Shore' },
  { name: 'Double Bay', postcode: '2028', lat: '-33.8779', lng: '151.2425', region: 'Eastern Suburbs' },
  { name: 'Eastgardens', postcode: '2036', lat: '-33.9444', lng: '151.2250', region: 'Eastern Suburbs' },
  { name: 'Epping', postcode: '2121', lat: '-33.7725', lng: '151.0820', region: 'North Shore' },
  { name: 'Fairfield', postcode: '2165', lat: '-33.8670', lng: '150.9565', region: 'Western Sydney' },
  { name: 'Glebe', postcode: '2037', lat: '-33.8803', lng: '151.1847', region: 'Inner West' },
  { name: 'Homebush', postcode: '2140', lat: '-33.8647', lng: '151.0821', region: 'Inner West' },
  { name: 'Hornsby', postcode: '2077', lat: '-33.7045', lng: '151.0993', region: 'North Shore' },
  { name: 'Hurstville', postcode: '2220', lat: '-33.9675', lng: '151.1028', region: 'St George' },
  { name: 'Kensington', postcode: '2033', lat: '-33.9131', lng: '151.2237', region: 'Eastern Suburbs' },
  { name: 'Kogarah', postcode: '2217', lat: '-33.9636', lng: '151.1335', region: 'St George' },
  { name: 'Lane Cove', postcode: '2066', lat: '-33.8172', lng: '151.1661', region: 'North Shore' },
  { name: 'Leichhardt', postcode: '2040', lat: '-33.8852', lng: '151.1571', region: 'Inner West' },
  { name: 'Liverpool', postcode: '2170', lat: '-33.9211', lng: '150.9234', region: 'South Western Sydney' },
  { name: 'Manly', postcode: '2095', lat: '-33.7969', lng: '151.2840', region: 'Northern Beaches' },
  { name: 'Maroubra', postcode: '2035', lat: '-33.9506', lng: '151.2440', region: 'Eastern Suburbs' },
  { name: 'Mascot', postcode: '2020', lat: '-33.9262', lng: '151.1953', region: 'Eastern Suburbs' },
  { name: 'Matraville', postcode: '2036', lat: '-33.9592', lng: '151.2342', region: 'Eastern Suburbs' },
  { name: 'Melbourne', postcode: '3000', lat: '-37.8136', lng: '144.9631', region: 'Victoria' },
  { name: 'Miranda', postcode: '2228', lat: '-34.0335', lng: '151.1005', region: 'Sutherland Shire' },
  { name: 'Mosman', postcode: '2088', lat: '-33.8290', lng: '151.2439', region: 'North Shore' },
  { name: 'Neutral Bay', postcode: '2089', lat: '-33.8333', lng: '151.2167', region: 'North Shore' },
  { name: 'Newtown', postcode: '2042', lat: '-33.8961', lng: '151.1789', region: 'Inner West' },
  { name: 'North Sydney', postcode: '2060', lat: '-33.8403', lng: '151.2070', region: 'North Shore' },
  { name: 'Paddington', postcode: '2021', lat: '-33.8842', lng: '151.2274', region: 'Eastern Suburbs' },
  { name: 'Parramatta', postcode: '2150', lat: '-33.8151', lng: '151.0010', region: 'Western Sydney' },
  { name: 'Penrith', postcode: '2750', lat: '-33.7507', lng: '150.6942', region: 'Western Sydney' },
  { name: 'Perth', postcode: '6000', lat: '-31.9505', lng: '115.8605', region: 'Western Australia' },
  { name: 'Pyrmont', postcode: '2009', lat: '-33.8688', lng: '151.1957', region: 'Inner West' },
  { name: 'Randwick', postcode: '2031', lat: '-33.9145', lng: '151.2416', region: 'Eastern Suburbs' },
  { name: 'Ryde', postcode: '2112', lat: '-33.8149', lng: '151.1017', region: 'North Shore' },
  { name: 'St Leonards', postcode: '2065', lat: '-33.8239', lng: '151.1934', region: 'North Shore' },
  { name: 'Strathfield', postcode: '2135', lat: '-33.8761', lng: '151.0875', region: 'Inner West' },
  { name: 'Surry Hills', postcode: '2010', lat: '-33.8866', lng: '151.2113', region: 'Eastern Suburbs' },
  { name: 'Sutherland', postcode: '2232', lat: '-34.0310', lng: '151.0580', region: 'Sutherland Shire' },
  { name: 'Sydney', postcode: '2000', lat: '-33.8688', lng: '151.2093', region: 'Sydney CBD' },
];

// Nearby suburbs mapping
const NEARBY_SUBURBS = {
  'Ashfield': ['Burwood', 'Croydon', 'Summer Hill', 'Haberfield'],
  'Auburn': ['Lidcombe', 'Homebush', 'Granville', 'Silverwater'],
  'Balmain': ['Leichhardt', 'Rozelle', 'Birchgrove', 'Balmain East'],
  'Bankstown': ['Liverpool', 'Yagoona', 'Punchbowl', 'Greenacre'],
  'Blacktown': ['Mount Druitt', 'Seven Hills', 'Kings Park', 'Marayong'],
  'Bondi': ['Bondi Beach', 'Bondi Junction', 'North Bondi', 'Tamarama'],
  'Bondi Junction': ['Bondi', 'Bondi Beach', 'Waverley', 'Paddington'],
  'Brisbane': ['South Bank', 'Fortitude Valley', 'New Farm', 'West End'],
  'Burwood': ['Strathfield', 'Ashfield', 'Croydon', 'Concord'],
  'Cabramatta': ['Fairfield', 'Canley Vale', 'Lansvale', 'Warwick Farm'],
  'Campbelltown': ['Macquarie Fields', 'Ingleburn', 'Leumeah', 'Minto'],
  'Castle Hill': ['Baulkham Hills', 'Kellyville', 'West Pennant Hills', 'Rouse Hill'],
  'Chatswood': ['Willoughby', 'Artarmon', 'Lane Cove', 'Roseville'],
  'Cronulla': ['Miranda', 'Caringbah', 'Woolooware', 'Bundeena'],
  'Crows Nest': ['North Sydney', 'Wollstonecraft', 'Cammeray', 'Naremburn'],
  'Double Bay': ['Rose Bay', 'Bellevue Hill', 'Edgecliff', 'Point Piper'],
  'Eastgardens': ['Maroubra', 'Kingsford', 'Pagewood', 'Hillsdale'],
  'Epping': ['Eastwood', 'North Epping', 'Carlingford', 'Beecroft'],
  'Fairfield': ['Cabramatta', 'Wetherill Park', 'Prairiewood', 'Smithfield'],
  'Glebe': ['Newtown', 'Ultimo', 'Annandale', 'Forest Lodge'],
  'Homebush': ['Strathfield', 'Flemington', 'North Strathfield', 'Rhodes'],
  'Hornsby': ['Wahroonga', 'Thornleigh', 'Asquith', 'Mount Colah'],
  'Hurstville': ['Kogarah', 'Penshurst', 'Mortdale', 'Carlton'],
  'Kensington': ['Randwick', 'Kingsford', 'Moore Park', 'Zetland'],
  'Kogarah': ['Hurstville', 'Rockdale', 'Carlton', 'Beverley Park'],
  'Lane Cove': ['North Sydney', 'Chatswood', 'St Leonards', 'Greenwich'],
  'Leichhardt': ['Newtown', 'Balmain', 'Annandale', 'Haberfield'],
  'Liverpool': ['Bankstown', 'Cabramatta', 'Fairfield', 'Moorebank'],
  'Manly': ['Freshwater', 'Curl Curl', 'Dee Why', 'Fairlight'],
  'Maroubra': ['Randwick', 'Malabar', 'Little Bay', 'South Maroubra'],
  'Mascot': ['Alexandria', 'Rosebery', 'Botany', 'Eastlakes'],
  'Matraville': ['Maroubra', 'Phillip Bay', 'Little Bay', 'Chifley'],
  'Melbourne': ['South Yarra', 'St Kilda', 'Richmond', 'Carlton'],
  'Miranda': ['Cronulla', 'Caringbah', 'Sutherland', 'Sylvania'],
  'Mosman': ['Neutral Bay', 'Cremorne', 'Balmoral', 'Clifton Gardens'],
  'Neutral Bay': ['North Sydney', 'Mosman', 'Cremorne', 'Kirribilli'],
  'Newtown': ['Enmore', 'Stanmore', 'Erskineville', 'Marrickville'],
  'North Sydney': ['Milsons Point', 'Cremorne', 'Neutral Bay', 'Kirribilli'],
  'Paddington': ['Bondi Junction', 'Surry Hills', 'Woollahra', 'Edgecliff'],
  'Parramatta': ['Westmead', 'Harris Park', 'Rydalmere', 'North Parramatta'],
  'Penrith': ['St Marys', 'Kingswood', 'Cambridge Park', 'Emu Plains'],
  'Perth': ['Fremantle', 'Subiaco', 'Northbridge', 'Victoria Park'],
  'Pyrmont': ['Ultimo', 'Glebe', 'Darling Harbour', 'Chippendale'],
  'Randwick': ['Coogee', 'Kensington', 'Maroubra', 'Clovelly'],
  'Ryde': ['Macquarie Park', 'North Ryde', 'West Ryde', 'Gladesville'],
  'St Leonards': ['Crows Nest', 'North Sydney', 'Artarmon', 'Greenwich'],
  'Strathfield': ['Burwood', 'Homebush', 'Concord', 'Enfield'],
  'Surry Hills': ['Redfern', 'Darlinghurst', 'Paddington', 'Waterloo'],
  'Sutherland': ['Miranda', 'Cronulla', 'Kirrawee', 'Jannali'],
  'Sydney': ['Circular Quay', 'The Rocks', 'Barangaroo', 'Darling Harbour'],
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate consistent suburb content using unified template
 */
async function generateSuburbContent(suburb) {
  const nearbySuburbs = NEARBY_SUBURBS[suburb.name] || [];

  const prompt = `You are an expert local SEO content writer creating a suburb landing page for The Profit Platform, a digital marketing agency in Sydney.

SUBURB: ${suburb.name}, ${suburb.region}
POSTCODE: ${suburb.postcode}
NEARBY SUBURBS: ${nearbySuburbs.join(', ')}

INSTRUCTIONS:
Write a professional, engaging suburb landing page (700-900 words) using this EXACT structure:

## H1: Digital Marketing Services in ${suburb.name} - Get More Customers Online

### Opening Paragraph (Problem/Context):
- Start with a relatable local business scenario
- Mention 1-2 specific local landmarks or characteristics of ${suburb.name}
- Address the pain point: great local business but struggling with online visibility
- Keep it conversational and empathetic
- 2-3 sentences max

### Section 1: The Challenge
**Heading:** ## The Digital Marketing Challenge for ${suburb.name} Businesses

- Describe specific challenges local businesses face
- Reference the local market and competition
- Mention nearby suburbs naturally: ${nearbySuburbs.slice(0, 2).join(', ')}
- Be specific to ${suburb.region} area
- 3-4 paragraphs

### Section 2: Our Services
**Heading:** ## How We Help ${suburb.name} Businesses Grow

Brief intro paragraph, then:

**Local SEO**
One paragraph explaining local SEO benefits for ${suburb.name}

**Google Ads Management**
One paragraph explaining targeted Google Ads for ${suburb.region}

**Web Design & Development**
One paragraph explaining professional websites that convert

**Conversion Optimization**
One paragraph explaining how we improve website performance

### Section 3: Why Choose Us
**Heading:** ## Why ${suburb.name} Businesses Choose The Profit Platform

- 3-4 bullet points with brief explanations
- Focus on local understanding, results, transparency
- No generic marketing speak

### Section 4: Call to Action
**Heading:** ## Ready to Grow Your ${suburb.name} Business?

- Strong closing paragraph
- Clear next step: call or contact
- Mention nearby areas: ${nearbySuburbs.slice(0, 3).join(', ')}

CRITICAL RULES:
- NO emojis anywhere
- NO "picture this" openings
- NO generic corporate speak
- Use ${suburb.name} naturally throughout (not forced)
- Professional but conversational tone
- Specific to ${suburb.name} and ${suburb.region}
- Focus on business problems and solutions
- Short paragraphs (2-3 sentences)

Return ONLY the markdown content body (no frontmatter).`;

  console.log(`🤖 Generating consistent content for ${suburb.name}...`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

/**
 * Create standardized frontmatter
 */
function createFrontmatter(suburb) {
  const nearbySuburbs = NEARBY_SUBURBS[suburb.name] || [];
  const today = new Date().toISOString().split('T')[0];

  return `---
title: "Digital Marketing Agency ${suburb.name}, Sydney | The Profit Platform"
description: "Leading digital marketing services in ${suburb.name}. Expert SEO, Google Ads & web design for ${suburb.region} businesses. Call 0487 286 451 for a free consultation."
city: "${suburb.name}"
state: "${suburb.state || 'NSW'}"
country: "${suburb.country || 'Australia'}"
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
 * Regenerate a single suburb page
 */
async function regenerateSuburbPage(suburb) {
  try {
    const filename = suburb.name.toLowerCase().replace(/\s+/g, '-') + '.md';
    const filepath = path.join('./src/content/locations', filename);

    // Generate new content
    const content = await generateSuburbContent(suburb);

    // Create standardized frontmatter
    const frontmatter = createFrontmatter(suburb);

    // Combine and write
    const fullContent = frontmatter + content;
    fs.writeFileSync(filepath, fullContent, 'utf-8');

    console.log(`✅ Regenerated: ${filepath}`);
    return { suburb: suburb.name, status: 'success', filepath };

  } catch (error) {
    console.error(`❌ Error regenerating ${suburb.name}:`, error.message);
    return { suburb: suburb.name, status: 'error', error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 REGENERATING ALL 50 SUBURBS WITH CONSISTENT FORMAT\n');
  console.log('📍 Target: 50 suburbs');
  console.log('⏱️  Estimated time: ~15 minutes');
  console.log('💰 Estimated cost: ~$5 API\n');

  const results = [];

  // Regenerate each suburb
  for (const suburb of ALL_SUBURBS) {
    const result = await regenerateSuburbPage(suburb);
    results.push(result);

    // Wait 3 seconds between API calls
    if (ALL_SUBURBS.indexOf(suburb) < ALL_SUBURBS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n📊 Regeneration Summary:');
  console.log(`✅ Success: ${results.filter(r => r.status === 'success').length}`);
  console.log(`❌ Errors: ${results.filter(r => r.status === 'error').length}`);

  if (results.filter(r => r.status === 'error').length > 0) {
    console.log('\n⚠️  Errors:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   - ${r.suburb}: ${r.error}`);
    });
  }

  console.log('\n🎉 All suburb pages regenerated with consistent format!');
  console.log('\n✅ Next steps:');
  console.log('1. npm run build');
  console.log('2. npm run deploy');
  console.log('3. Verify consistency across all pages');

  return results;
}

// Run
main().catch(console.error);
