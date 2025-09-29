#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPhase0() {
  console.log('🔄 Creating Phase-0 raw carryover...');

  // Read the production HTML
  const productionPath = path.join(__dirname, '..', 'production-source.html');
  const html = fs.readFileSync(productionPath, 'utf8');

  // Add Astro frontmatter and wrap in Astro syntax
  const astroContent = `---
// Phase-0 Raw Carryover - EXACT production HTML for pixel parity
---
${html}`;

  // Write to index.astro
  const outputPath = path.join(__dirname, '..', 'src', 'pages', 'index.astro');
  fs.writeFileSync(outputPath, astroContent, 'utf8');

  console.log('✅ Phase-0 index.astro created with complete production HTML');
  console.log(`📄 Size: ${(astroContent.length / 1024).toFixed(1)}KB`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPhase0();
}

export { createPhase0 };