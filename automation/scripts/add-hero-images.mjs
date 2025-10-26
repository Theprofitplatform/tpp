#!/usr/bin/env node

/**
 * Manually add hero images to blog posts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function addHeroImages() {
  console.log('🖼️  Adding hero images to blog posts...\n');

  const posts = [
    {
      file: 'src/content/blog/2025-10-26-seo-for-dentists-sydney-fill-your-appointment-book.md',
      image: {
        url: 'https://images.unsplash.com/photo-1629909615957-be38a5a3a047?w=1200&auto=format&fit=crop',
        alt: 'Professional dentist examining patient in modern Sydney dental clinic',
        photographer: 'Cedric Fauntleroy',
        photographerUrl: 'https://unsplash.com/@cfauntleroy'
      }
    },
    {
      file: 'src/content/blog/2025-10-26-seo-for-real-estate-agents-sydney-dominate-your-suburb.md',
      image: {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop',
        alt: 'Sydney real estate agent showing modern property to potential buyers',
        photographer: 'Breno Assis',
        photographerUrl: 'https://unsplash.com/@brenoassis'
      }
    }
  ];

  for (const post of posts) {
    const filepath = path.join(projectRoot, post.file);
    console.log(`📄 Processing: ${path.basename(post.file)}`);

    let content = await fs.readFile(filepath, 'utf-8');

    // Find the frontmatter end
    const frontmatterEnd = content.indexOf('---', 4);
    if (frontmatterEnd === -1) {
      console.error(`❌ Could not find frontmatter in ${post.file}`);
      continue;
    }

    // Check if coverImage already exists
    if (content.includes('coverImage:')) {
      console.log(`   ⚠️  Already has hero image, skipping`);
      continue;
    }

    // Insert hero image fields before the closing ---
    const imageFields = `coverImage: "${post.image.url}"
coverImageAlt: "${post.image.alt}"
coverImageCredit:
  name: "${post.image.photographer}"
  link: "${post.image.photographerUrl}"
`;

    const beforeClosing = content.substring(0, frontmatterEnd);
    const afterClosing = content.substring(frontmatterEnd);

    content = beforeClosing + imageFields + afterClosing;

    await fs.writeFile(filepath, content, 'utf-8');
    console.log(`   ✅ Added hero image from ${post.image.photographer}\n`);
  }

  console.log('✅ Done! Hero images added to all posts.');
}

addHeroImages().catch(console.error);
