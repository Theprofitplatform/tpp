import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Update internal-link-map.json with all published blog posts from topic-queue.json
 * This ensures new posts can be linked to from future posts
 */
async function updateLinkMap() {
  console.log('🔗 Updating internal link map...\n');

  // Load topic queue
  const queuePath = path.join(projectRoot, 'automation/topic-queue.json');
  const queue = JSON.parse(await fs.readFile(queuePath, 'utf-8'));

  // Load existing link map
  const linkMapPath = path.join(projectRoot, 'automation/internal-link-map.json');
  let linkMap = {};
  try {
    linkMap = JSON.parse(await fs.readFile(linkMapPath, 'utf-8'));
  } catch (error) {
    console.log('⚠️  No existing link map found, creating new one');
  }

  // Process all published posts
  let addedCount = 0;
  let updatedCount = 0;

  for (const post of queue.published) {
    if (!post.publishedSlug) {
      console.log(`⚠️  Skipping post without slug: ${post.title}`);
      continue;
    }

    const slug = post.publishedSlug;
    const url = `/blog/${slug}/`;

    // Check if post already exists in link map
    const exists = linkMap[slug] !== undefined;

    if (!exists) {
      addedCount++;
      console.log(`➕ Adding: ${post.title}`);
    } else {
      updatedCount++;
      console.log(`🔄 Updating: ${post.title}`);
    }

    // Find related posts based on category and tags
    const relatedPosts = queue.published
      .filter(p => {
        if (!p.publishedSlug || p.publishedSlug === slug) return false;

        const categoryMatch = p.category === post.category;
        const tagMatch = p.tags && post.tags && p.tags.some(tag => post.tags.includes(tag));

        return categoryMatch || tagMatch;
      })
      .map(p => {
        // Calculate similarity score
        let similarity = 0;

        // Category match: +50 points
        if (p.category === post.category) {
          similarity += 50;
        }

        // Tag matches: +10 points per shared tag
        if (p.tags && post.tags) {
          const sharedTags = p.tags.filter(tag => post.tags.includes(tag));
          similarity += sharedTags.length * 10;
        }

        return {
          slug: p.publishedSlug,
          title: p.title,
          url: `/blog/${p.publishedSlug}/`,
          category: p.category,
          similarity,
          reason: p.category === post.category ? 'Same category' : 'Shared tags/keywords'
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    // Update link map entry
    linkMap[slug] = {
      title: post.title,
      category: post.category,
      tags: post.tags || [],
      url,
      relatedPosts
    };
  }

  // Save updated link map
  await fs.writeFile(
    linkMapPath,
    JSON.stringify(linkMap, null, 2),
    'utf-8'
  );

  console.log('\n✅ Link map updated successfully!');
  console.log(`📊 Stats:`);
  console.log(`   - Total posts in map: ${Object.keys(linkMap).length}`);
  console.log(`   - Newly added: ${addedCount}`);
  console.log(`   - Updated: ${updatedCount}`);
  console.log(`\n💾 Saved to: ${linkMapPath}`);
}

// Run the update
updateLinkMap().catch(error => {
  console.error('❌ Error updating link map:', error);
  process.exit(1);
});
