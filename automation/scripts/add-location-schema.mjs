#!/usr/bin/env node

/**
 * Add LocalBusiness Schema to Location Pages
 * 
 * This script adds proper LocalBusiness schema markup to all location pages
 * to improve local SEO and search engine understanding.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const LOCATIONS_DIR = path.join(projectRoot, 'src/content/locations');

/**
 * Parse frontmatter from markdown
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, bodyStart: 0 };

  const frontmatterText = match[1];
  const bodyStart = match[0].length;
  
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  let currentKey = null;
  let isMultiline = false;
  
  for (const line of lines) {
    if (line.includes(':') && !isMultiline) {
      const colonIndex = line.indexOf(':');
      currentKey = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Handle multiline values (coordinates, serviceAreas)
      if (value === '' || value === '[' || value === '{') {
        isMultiline = true;
        frontmatter[currentKey] = [];
        continue;
      }
      
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      frontmatter[currentKey] = value;
      
    } else if (isMultiline && line.trim() === ']') {
      isMultiline = false;
    } else if (isMultiline && line.trim().startsWith('-')) {
      // Array item
      let item = line.trim().substring(1).trim();
      item = item.replace(/^["']|["']$/g, '');
      if (Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(item);
      }
    }
  }

  return { frontmatter, bodyStart };
}

/**
 * Generate LocalBusiness schema for a location
 */
function generateSchema(frontmatter) {
  const city = frontmatter.city || frontmatter.title?.split(',')[0] || 'Sydney';
  const region = frontmatter.region || 'Sydney';
  const postcode = frontmatter.postcode || '2000';
  const state = frontmatter.state || 'NSW';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://theprofitplatform.com.au/locations/${city.toLowerCase().replace(/\s+/g, '-')}/`,
    "name": "The Profit Platform",
    "description": frontmatter.description || `Digital marketing services in ${city}`,
    "url": `https://theprofitplatform.com.au/locations/${city.toLowerCase().replace(/\s+/g, '-')}/`,
    "telephone": frontmatter.phone || "+61487286451",
    "email": frontmatter.email || "avi@theprofitplatform.com.au",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressRegion": state,
      "postalCode": postcode,
      "addressCountry": "AU"
    },
    "areaServed": {
      "@type": "City",
      "name": city
    },
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00",
    "sameAs": [
      "https://www.facebook.com/theprofitplatform",
      "https://www.linkedin.com/company/theprofitplatform",
      "https://twitter.com/profitplatform"
    ]
  };

  // Add geo coordinates if available
  if (frontmatter.coordinates) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": frontmatter.coordinates.lat || frontmatter.lat,
      "longitude": frontmatter.coordinates.lng || frontmatter.lng
    };
  }

  // Add service areas if available
  if (Array.isArray(frontmatter.serviceAreas) && frontmatter.serviceAreas.length > 0) {
    schema.areaServed = frontmatter.serviceAreas.map(area => ({
      "@type": "City",
      "name": area
    }));
  }

  return schema;
}

/**
 * Add schema to location page
 */
async function addSchemaToPage(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const { frontmatter, bodyStart } = parseFrontmatter(content);
    
    // Check if schema already exists
    if (content.includes('script type="application/ld+json"') || 
        content.includes('@type": "LocalBusiness')) {
      return { success: false, reason: 'Schema already exists', filepath };
    }

    // Generate schema
    const schema = generateSchema(frontmatter);
    const schemaMarkup = `
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

`;

    // Find first H1 or H2 heading to insert schema before it
    const body = content.substring(bodyStart);
    const headingMatch = body.match(/\n(#{1,2}\s+.+)/);
    
    if (!headingMatch) {
      return { success: false, reason: 'No heading found', filepath };
    }

    const headingPos = bodyStart + body.indexOf(headingMatch[0]);
    
    // Insert schema before first heading
    const newContent = 
      content.substring(0, headingPos) +
      schemaMarkup +
      content.substring(headingPos);

    // Write updated content
    await fs.writeFile(filepath, newContent, 'utf-8');

    const city = frontmatter.city || path.basename(filepath, '.md');
    return { success: true, city, filepath };

  } catch (error) {
    return { 
      success: false, 
      reason: error.message, 
      filepath 
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📍 Adding LocalBusiness schema to location pages...\n');

  try {
    // Get all location files
    const files = await fs.readdir(LOCATIONS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`Found ${mdFiles.length} location pages\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each file
    for (const file of mdFiles) {
      const filepath = path.join(LOCATIONS_DIR, file);
      const result = await addSchemaToPage(filepath);

      if (result.success) {
        console.log(`✅ ${result.city || file}`);
        successCount++;
      } else if (result.reason === 'Schema already exists') {
        console.log(`⏭️  ${file} (already has schema)`);
        skipCount++;
      } else {
        console.log(`❌ ${file}: ${result.reason}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ⏭️  Skipped (existing): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${mdFiles.length}`);

    if (successCount > 0) {
      console.log('\n✨ Schema markup successfully added to location pages!');
      console.log('   This will improve local SEO and rich snippet display.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
