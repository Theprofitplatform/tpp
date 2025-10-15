#!/usr/bin/env node
/**
 * Schema Markup Validator
 * Validates JSON-LD structured data for blog posts
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Validate schema markup for a blog post
 */
async function validateSchema(filepath) {
  const errors = [];
  const warnings = [];

  try {
    const fileContent = await fs.readFile(filepath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    console.log(`\n🔍 Validating schema for: ${path.basename(filepath)}`);

    // Calculate metrics we'll need
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const readTime = Math.ceil(wordCount / 200);

    // Build expected schema (matching what's in [slug].astro)
    const expectedSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: frontmatter.title,
      datePublished: frontmatter.publishDate,
      dateModified: frontmatter.publishDate,
      wordCount: wordCount,
      articleSection: frontmatter.category,
      keywords: frontmatter.tags ? frontmatter.tags.join(', ') : undefined,
      inLanguage: 'en-AU',
      isAccessibleForFree: true,
      timeRequired: `PT${readTime}M`
    };

    // Validate required fields
    console.log('\n📋 Checking required schema fields...');

    if (!frontmatter.title) {
      errors.push('Missing title (headline)');
    } else {
      console.log(`   ✓ headline: ${frontmatter.title.substring(0, 50)}...`);
    }

    if (!frontmatter.publishDate) {
      errors.push('Missing publishDate');
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(frontmatter.publishDate)) {
        errors.push(`Invalid publishDate format: ${frontmatter.publishDate} (should be YYYY-MM-DD)`);
      } else {
        console.log(`   ✓ datePublished: ${frontmatter.publishDate}`);
      }
    }

    if (!frontmatter.category) {
      errors.push('Missing category (articleSection)');
    } else {
      console.log(`   ✓ articleSection: ${frontmatter.category}`);
    }

    if (!frontmatter.tags || frontmatter.tags.length === 0) {
      warnings.push('Missing tags (keywords)');
    } else {
      console.log(`   ✓ keywords: ${frontmatter.tags.join(', ')}`);
    }

    console.log(`   ✓ wordCount: ${wordCount}`);
    console.log(`   ✓ timeRequired: PT${readTime}M`);

    // Validate author
    console.log('\n👤 Checking author schema...');

    const validAuthors = ['Avi', 'TPP Team', 'The Profit Platform'];
    if (!frontmatter.author) {
      errors.push('Missing author');
    } else if (!validAuthors.includes(frontmatter.author)) {
      warnings.push(`Unknown author: ${frontmatter.author} (valid: ${validAuthors.join(', ')})`);
    } else {
      console.log(`   ✓ author: ${frontmatter.author}`);

      // Author should have profile in [slug].astro
      const authorProfiles = {
        'Avi': {
          name: 'Avi Sharma',
          jobTitle: 'Founder & SEO Strategist',
          email: 'avi@theprofitplatform.com.au'
        },
        'TPP Team': {
          name: 'TPP Team',
          jobTitle: 'Digital Marketing Experts',
          email: 'hello@theprofitplatform.com.au'
        },
        'The Profit Platform': {
          name: 'The Profit Platform',
          jobTitle: 'Digital Marketing Agency',
          email: 'hello@theprofitplatform.com.au'
        }
      };

      const profile = authorProfiles[frontmatter.author];
      if (profile) {
        console.log(`   ✓ Profile found: ${profile.name} (${profile.jobTitle})`);
      } else {
        warnings.push(`No author profile found for: ${frontmatter.author}`);
      }
    }

    // Validate image schema
    console.log('\n🖼️  Checking image schema...');

    if (frontmatter.coverImage) {
      console.log(`   ✓ coverImage URL: ${frontmatter.coverImage.substring(0, 50)}...`);

      // Check if URL is valid
      try {
        new URL(frontmatter.coverImage);
        console.log(`   ✓ Valid image URL`);
      } catch (e) {
        errors.push(`Invalid coverImage URL: ${frontmatter.coverImage}`);
      }

      if (!frontmatter.coverImageAlt) {
        warnings.push('Missing coverImageAlt (image description)');
      } else {
        console.log(`   ✓ alt text: ${frontmatter.coverImageAlt.substring(0, 50)}...`);
      }

      if (!frontmatter.coverImageCredit) {
        warnings.push('Missing coverImageCredit');
      } else {
        console.log(`   ✓ credit: ${frontmatter.coverImageCredit.name}`);
      }
    } else {
      warnings.push('No coverImage (posts should have featured images)');
    }

    // Validate description
    console.log('\n📝 Checking description...');

    if (!frontmatter.description) {
      errors.push('Missing description');
    } else {
      const descLength = frontmatter.description.length;
      if (descLength < 120 || descLength > 160) {
        warnings.push(`Description length: ${descLength} chars (optimal: 120-160)`);
      } else {
        console.log(`   ✓ description: ${descLength} chars`);
      }
    }

    // Check for common schema issues
    console.log('\n⚠️  Checking for common issues...');

    // Issue 1: Missing external links (E-E-A-T)
    const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
    if (externalLinks < 1) {
      warnings.push('No external authority links (impacts E-E-A-T)');
    } else {
      console.log(`   ✓ Has ${externalLinks} external link(s)`);
    }

    // Issue 2: Missing internal links
    const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    if (internalLinks < 2) {
      warnings.push(`Only ${internalLinks} internal link(s) (recommended: 2-3)`);
    } else {
      console.log(`   ✓ Has ${internalLinks} internal link(s)`);
    }

    // Issue 3: Word count too low
    if (wordCount < 1500) {
      warnings.push(`Word count ${wordCount} is below SEO minimum (1500)`);
    } else {
      console.log(`   ✓ Word count ${wordCount} meets SEO standards`);
    }

    return { errors, warnings, schema: expectedSchema };

  } catch (error) {
    errors.push(`Failed to validate: ${error.message}`);
    return { errors, warnings: [], schema: null };
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Schema Markup Validator\n');
  console.log('━'.repeat(60));

  try {
    const blogDir = path.join(projectRoot, 'src/content/blog');
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`\n📄 Found ${mdFiles.length} blog posts`);

    let totalErrors = 0;
    let totalWarnings = 0;
    const results = [];

    for (const file of mdFiles) {
      const filepath = path.join(blogDir, file);
      const result = await validateSchema(filepath);

      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;

      results.push({
        file,
        errors: result.errors,
        warnings: result.warnings
      });

      if (result.errors.length > 0) {
        console.log(`\n❌ ERRORS:`);
        result.errors.forEach(err => console.log(`   - ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS:`);
        result.warnings.forEach(warn => console.log(`   - ${warn}`));
      }

      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log(`\n✅ Schema valid!`);
      }
    }

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`   Total posts: ${mdFiles.length}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Total warnings: ${totalWarnings}`);

    const postsWithErrors = results.filter(r => r.errors.length > 0).length;
    const postsWithWarnings = results.filter(r => r.warnings.length > 0).length;
    const perfectPosts = mdFiles.length - postsWithErrors - postsWithWarnings;

    console.log(`\n   ✅ Perfect: ${perfectPosts}`);
    console.log(`   ⚠️  With warnings: ${postsWithWarnings}`);
    console.log(`   ❌ With errors: ${postsWithErrors}`);

    if (totalErrors > 0) {
      console.log('\n❌ Schema validation FAILED');
      process.exit(1);
    } else {
      console.log('\n✅ Schema validation PASSED');
    }

  } catch (error) {
    console.error('\n❌ Validation error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateSchema };
