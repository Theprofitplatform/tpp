#!/usr/bin/env node

/**
 * Blog Post Performance Tracker
 * Analyzes blog post performance and provides insights for content optimization
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const blogDir = path.join(projectRoot, 'src/content/blog');

/**
 * Calculate days since publication
 */
function daysSince(date) {
  const now = new Date();
  const published = new Date(date);
  const diff = now - published;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Analyze blog post metrics
 */
async function trackPerformance() {
  console.log('\n📊 Blog Performance Tracker\n');
  console.log('━'.repeat(60));

  // Read all posts
  const files = (await readdir(blogDir))
    .filter(file => file.endsWith('.md'));

  const posts = [];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(content);

    if (frontmatter.draft) continue;

    const slug = file.replace(/\.md$/, '');
    const publishDate = frontmatter.publishDate || frontmatter.pubDate;
    const wordCount = markdown.split(/\s+/).length;
    const headingCount = (markdown.match(/^#{2,3} .+$/gm) || []).length;
    const internalLinks = (markdown.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    const externalLinks = (markdown.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;

    posts.push({
      slug,
      title: frontmatter.title,
      category: frontmatter.category,
      tags: frontmatter.tags || [],
      publishDate,
      daysSince: publishDate ? daysSince(publishDate) : null,
      wordCount,
      headingCount,
      internalLinks,
      externalLinks,
      author: frontmatter.author,
      hasImage: !!frontmatter.coverImage
    });
  }

  console.log(`\n✅ Analyzed ${posts.length} published posts\n`);

  // Sort by publication date
  posts.sort((a, b) => {
    if (!a.publishDate || !b.publishDate) return 0;
    return new Date(b.publishDate) - new Date(a.publishDate);
  });

  // Calculate averages
  const avgWordCount = posts.reduce((sum, p) => sum + p.wordCount, 0) / posts.length;
  const avgHeadings = posts.reduce((sum, p) => sum + p.headingCount, 0) / posts.length;
  const avgInternalLinks = posts.reduce((sum, p) => sum + p.internalLinks, 0) / posts.length;
  const avgExternalLinks = posts.reduce((sum, p) => sum + p.externalLinks, 0) / posts.length;

  // Performance summary
  console.log('📈 Content Quality Metrics:');
  console.log(`   Average word count: ${Math.round(avgWordCount)} words`);
  console.log(`   Average headings: ${avgHeadings.toFixed(1)}`);
  console.log(`   Average internal links: ${avgInternalLinks.toFixed(1)}`);
  console.log(`   Average external links: ${avgExternalLinks.toFixed(1)}`);
  console.log(`   Posts with images: ${posts.filter(p => p.hasImage).length}/${posts.length}`);

  // Category breakdown
  console.log('\n📊 Posts by Category:');
  const categories = {};
  posts.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} posts`);
    });

  // Recent posts (last 30 days)
  console.log('\n📅 Recent Posts (last 30 days):');
  const recentPosts = posts.filter(p => p.daysSince !== null && p.daysSince <= 30);
  if (recentPosts.length > 0) {
    recentPosts.forEach(p => {
      console.log(`   ${p.daysSince}d ago - ${p.title}`);
      console.log(`      ${p.wordCount} words, ${p.internalLinks} internal links, ${p.externalLinks} external links`);
    });
  } else {
    console.log('   No posts published in last 30 days');
  }

  // Content recommendations
  console.log('\n💡 Recommendations:');
  const lowWordCount = posts.filter(p => p.wordCount < 1500);
  const noExternalLinks = posts.filter(p => p.externalLinks === 0);
  const noInternalLinks = posts.filter(p => p.internalLinks === 0);

  if (lowWordCount.length > 0) {
    console.log(`   ⚠️  ${lowWordCount.length} posts have <1500 words (consider expanding)`);
  }
  if (noExternalLinks.length > 0) {
    console.log(`   ⚠️  ${noExternalLinks.length} posts have no external links (add authority links)`);
  }
  if (noInternalLinks.length > 0) {
    console.log(`   ⚠️  ${noInternalLinks.length} posts have no internal links (add cross-links)`);
  }
  if (lowWordCount.length === 0 && noExternalLinks.length === 0 && noInternalLinks.length === 0) {
    console.log(`   ✅ All posts meet quality standards!`);
  }

  // Save performance report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPosts: posts.length,
      avgWordCount: Math.round(avgWordCount),
      avgHeadings: parseFloat(avgHeadings.toFixed(1)),
      avgInternalLinks: parseFloat(avgInternalLinks.toFixed(1)),
      avgExternalLinks: parseFloat(avgExternalLinks.toFixed(1)),
      postsWithImages: posts.filter(p => p.hasImage).length
    },
    categories,
    posts: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      publishDate: p.publishDate,
      daysSince: p.daysSince,
      wordCount: p.wordCount,
      quality: {
        headings: p.headingCount,
        internalLinks: p.internalLinks,
        externalLinks: p.externalLinks,
        hasImage: p.hasImage
      }
    }))
  };

  const reportPath = path.join(projectRoot, 'automation/performance-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n━'.repeat(60));
  console.log(`\n✅ Performance report saved to: automation/performance-report.json\n`);

  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  trackPerformance();
}

export { trackPerformance };
