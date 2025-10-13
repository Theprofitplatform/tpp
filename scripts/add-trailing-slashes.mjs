#!/usr/bin/env node
/**
 * Add trailing slashes to all internal links in HTML files
 * Fixes the 4,724 redirect issue by ensuring all href="/path" become href="/path/"
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DIST_DIR = './dist';

async function getAllHtmlFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function addTrailingSlashes(html) {
  // Match href="/path" (internal links without trailing slash)
  // Don't match:
  // - External links (http://, https://, mailto:, tel:)
  // - Anchors (#)
  // - Already has trailing slash
  // - File extensions (.html, .xml, .pdf, etc)
  // - Query params (?)

  return html.replace(
    /href="(\/[^"#?]*[^"#?\/])"/g,
    (match, path) => {
      // Skip if it has a file extension
      if (/\.[a-z]{2,4}$/i.test(path)) {
        return match;
      }
      // Skip if it's the root /
      if (path === '/') {
        return match;
      }
      // Add trailing slash
      return `href="${path}/"`;
    }
  );
}

async function main() {
  console.log('🔍 Finding HTML files in dist/...');
  const htmlFiles = await getAllHtmlFiles(DIST_DIR);
  console.log(`📄 Found ${htmlFiles.length} HTML files`);

  let totalLinks = 0;
  let filesModified = 0;

  for (const file of htmlFiles) {
    const originalHtml = await readFile(file, 'utf-8');
    const modifiedHtml = addTrailingSlashes(originalHtml);

    if (originalHtml !== modifiedHtml) {
      await writeFile(file, modifiedHtml, 'utf-8');
      const linksFixed = (modifiedHtml.match(/href="\/[^"]*\/"/g) || []).length -
                         (originalHtml.match(/href="\/[^"]*\/"/g) || []).length;
      totalLinks += linksFixed;
      filesModified++;
      console.log(`✅ ${file.replace(DIST_DIR, '')}: ${linksFixed} links fixed`);
    }
  }

  console.log(`\n🎉 Complete!`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total links fixed: ${totalLinks}`);
  console.log(`   This should eliminate most of the 4,724 redirects!\n`);
}

main().catch(console.error);
