#!/usr/bin/env node

/**
 * Sync Suburbs Database
 * Updates suburbs.json to match actual generated location pages
 * 
 * This script:
 * 1. Scans src/content/locations/ for all .md files
 * 2. Reads frontmatter from each file
 * 3. Updates suburbs.json with accurate status and metadata
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const SUBURBS_JSON = path.join(projectRoot, 'automation/data/suburbs.json');
const LOCATIONS_DIR = path.join(projectRoot, 'src/content/locations');

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');
    
    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Scan locations directory and get all suburbs
 */
async function scanGeneratedSuburbs() {
  try {
    const files = await fs.readdir(LOCATIONS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const suburbs = [];
    
    for (const file of mdFiles) {
      const filepath = path.join(LOCATIONS_DIR, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter) {
        console.warn(`⚠️  Could not parse frontmatter for ${file}`);
        continue;
      }

      // Extract suburb name from filename
      const suburbSlug = file.replace('.md', '');
      const suburbName = frontmatter.city || 
                        suburbSlug.split('-').map(w => 
                          w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ');

      suburbs.push({
        name: suburbName,
        slug: suburbSlug,
        postcode: frontmatter.postcode || 'Unknown',
        region: frontmatter.region || 'Sydney',
        coordinates: frontmatter.coordinates ? {
          lat: frontmatter.coordinates.lat,
          lng: frontmatter.coordinates.lng
        } : null,
        status: 'generated',
        dateGenerated: frontmatter.dateCreated || frontmatter.lastUpdated || '2025-10-21',
        lastUpdated: frontmatter.lastUpdated || '2025-10-21'
      });
    }

    return suburbs.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('❌ Error scanning locations:', error.message);
    throw error;
  }
}

/**
 * Merge with existing suburbs data
 */
async function mergeWithExisting(scannedSuburbs) {
  try {
    const existingData = JSON.parse(await fs.readFile(SUBURBS_JSON, 'utf-8'));
    const existingSuburbsMap = new Map(
      existingData.suburbs.map(s => [s.name, s])
    );

    const mergedSuburbs = scannedSuburbs.map(scanned => {
      const existing = existingSuburbsMap.get(scanned.name);
      
      if (existing) {
        // Merge: keep existing metadata, update status
        return {
          ...existing,
          status: 'generated',
          slug: scanned.slug,
          dateGenerated: scanned.dateGenerated,
          lastUpdated: scanned.lastUpdated
        };
      } else {
        // New suburb not in database
        return {
          name: scanned.name,
          slug: scanned.slug,
          postcode: scanned.postcode,
          coordinates: scanned.coordinates || { lat: '0', lng: '0' },
          region: scanned.region,
          priority: 2,
          status: 'generated',
          nearbySuburbs: [],
          demographics: {
            description: `${scanned.name} area`
          },
          dateGenerated: scanned.dateGenerated,
          lastUpdated: scanned.lastUpdated
        };
      }
    });

    return mergedSuburbs;

  } catch (error) {
    console.error('❌ Error merging data:', error.message);
    throw error;
  }
}

/**
 * Save updated suburbs data
 */
async function saveSuburbsData(suburbs) {
  const data = {
    suburbs: suburbs,
    metadata: {
      lastUpdated: new Date().toISOString().split('T')[0],
      totalSuburbs: suburbs.length,
      generated: suburbs.filter(s => s.status === 'generated').length,
      pendingGeneration: suburbs.filter(s => s.status === 'pending').length,
      version: '1.1',
      syncedAt: new Date().toISOString()
    }
  };

  await fs.writeFile(SUBURBS_JSON, JSON.stringify(data, null, 2), 'utf-8');
  return data.metadata;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Syncing suburbs database with generated location pages...\n');

  try {
    // Step 1: Scan generated location pages
    console.log('📂 Scanning src/content/locations/...');
    const scannedSuburbs = await scanGeneratedSuburbs();
    console.log(`✅ Found ${scannedSuburbs.length} location pages\n`);

    // Step 2: Merge with existing data
    console.log('🔀 Merging with existing suburbs.json...');
    const mergedSuburbs = await mergeWithExisting(scannedSuburbs);
    console.log(`✅ Merged ${mergedSuburbs.length} suburbs\n`);

    // Step 3: Save updated data
    console.log('💾 Saving updated suburbs.json...');
    const metadata = await saveSuburbsData(mergedSuburbs);
    console.log('✅ Database updated successfully!\n');

    // Step 4: Show summary
    console.log('📊 Summary:');
    console.log(`   Total suburbs: ${metadata.totalSuburbs}`);
    console.log(`   Generated: ${metadata.generated}`);
    console.log(`   Pending: ${metadata.pendingGeneration}`);
    console.log(`   Last updated: ${metadata.lastUpdated}`);
    console.log(`   Synced at: ${metadata.syncedAt}\n`);

    console.log('✨ Suburbs database is now in sync with generated pages!');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
