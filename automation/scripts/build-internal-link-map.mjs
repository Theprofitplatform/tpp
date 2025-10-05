#!/usr/bin/env node

/**
 * Build Internal Link Map
 * Analyzes all published blog posts and creates a map of related content
 * for intelligent internal linking in new posts
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const blogDir = path.join(projectRoot, 'src/content/blog');

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Convert to lowercase and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Count frequency
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Calculate similarity between two posts
 */
function calculateSimilarity(post1, post2) {
  let score = 0;

  // Same category = high relevance
  if (post1.category === post2.category) {
    score += 10;
  }

  // Shared tags
  const sharedTags = post1.tags.filter(tag =>
    post2.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
  score += sharedTags.length * 5;

  // Shared keywords in title/description
  const post1Keywords = [
    ...post1.title.toLowerCase().split(/\s+/),
    ...post1.description.toLowerCase().split(/\s+/)
  ];
  const post2Keywords = [
    ...post2.title.toLowerCase().split(/\s+/),
    ...post2.description.toLowerCase().split(/\s+/)
  ];

  const sharedKeywords = post1Keywords.filter(kw =>
    post2Keywords.includes(kw) && kw.length > 4
  );
  score += sharedKeywords.length * 2;

  return score;
}

/**
 * Main function
 */
async function buildLinkMap() {
  console.log('\n🔗 Building Internal Link Map\n');
  console.log('━'.repeat(60));

  // Read all markdown files
  const files = (await readdir(blogDir))
    .filter(file => file.endsWith('.md'));

  console.log(`\n📄 Found ${files.length} blog posts\n`);

  const posts = [];

  // Parse each post
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(content);

    // Skip drafts
    if (frontmatter.draft) continue;

    const slug = file.replace(/\.md$/, '');

    posts.push({
      slug,
      title: frontmatter.title || 'Untitled',
      description: frontmatter.description || '',
      category: frontmatter.category || 'General',
      tags: frontmatter.tags || [],
      keywords: frontmatter.seo?.keywords || [],
      publishDate: frontmatter.publishDate || frontmatter.pubDate,
      wordCount: markdown.split(/\s+/).length,
      url: `/blog/${slug}/`,
      excerpt: frontmatter.description || markdown.substring(0, 200)
    });
  }

  console.log(`✅ Parsed ${posts.length} published posts\n`);

  // Build relationship map
  const linkMap = {};

  posts.forEach(post => {
    // Find related posts
    const related = posts
      .filter(p => p.slug !== post.slug)
      .map(p => ({
        ...p,
        similarity: calculateSimilarity(post, p)
      }))
      .filter(p => p.similarity > 5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    linkMap[post.slug] = {
      title: post.title,
      category: post.category,
      tags: post.tags,
      url: post.url,
      relatedPosts: related.map(r => ({
        slug: r.slug,
        title: r.title,
        url: r.url,
        category: r.category,
        similarity: r.similarity,
        reason: r.category === post.category ? 'Same category' : 'Shared tags/keywords'
      }))
    };
  });

  // Save link map
  const outputPath = path.join(projectRoot, 'automation/internal-link-map.json');
  await writeFile(outputPath, JSON.stringify(linkMap, null, 2), 'utf-8');

  console.log(`✅ Internal link map saved to: automation/internal-link-map.json\n`);

  // Generate summary by category
  const categories = {};
  posts.forEach(post => {
    categories[post.category] = (categories[post.category] || 0) + 1;
  });

  console.log('📊 Posts by category:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} posts`);
    });

  console.log('\n📈 Link opportunities:');
  const totalLinks = Object.values(linkMap).reduce((sum, post) => sum + post.relatedPosts.length, 0);
  console.log(`   - Total potential internal links: ${totalLinks}`);
  console.log(`   - Average links per post: ${(totalLinks / posts.length).toFixed(1)}`);

  console.log('\n' + '━'.repeat(60));
  console.log('\n✅ Link map build complete!\n');

  return linkMap;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildLinkMap();
}

export { buildLinkMap };
