#!/usr/bin/env node

/**
 * SEO Enhancement Post-Processor
 *
 * Runs after blog generation to ensure all SEO requirements are met
 *
 * Usage: node automation/scripts/seo-enhance-blog.mjs <path-to-blog-post.md>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function enhanceBlogPost(filePath) {
  console.log('\n🔍 Running SEO Enhancement Check...\n');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter and content
  const parts = content.split('---\n');
  if (parts.length < 3) {
    console.error('❌ Invalid blog post format (missing frontmatter)');
    process.exit(1);
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---\n');

  // Run all checks
  const results = {
    metaDescription: checkMetaDescription(frontmatter),
    internalLinks: checkInternalLinks(body),
    externalLinks: checkExternalLinks(body),
    images: checkImages(body),
    keywordDensity: checkKeywordDensity(body, frontmatter),
    faqSchema: checkFAQSchema(frontmatter),
    ctas: checkCTAs(body),
    lsiKeywords: checkLSIKeywords(body),
    headingHierarchy: checkHeadingHierarchy(body),
    wordCount: checkWordCount(body)
  };

  // Generate report
  const score = generateSEOReport(results, filePath);

  return { results, score };
}

function checkMetaDescription(frontmatter) {
  const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);
  if (!descMatch) {
    return { pass: false, issue: 'No meta description found', score: 0, maxScore: 15 };
  }

  const desc = descMatch[1];
  let issues = [];

  // Check for formatting errors
  if (desc.startsWith('**') || desc.startsWith('*') || desc.includes('**')) {
    issues.push('Contains markdown formatting (**, *)');
  }

  // Check length
  if (desc.length < 120) {
    issues.push(`Too short (${desc.length} chars, need 120-160)`);
  } else if (desc.length > 160) {
    issues.push(`Too long (${desc.length} chars, max 160)`);
  }

  const pass = issues.length === 0;
  const score = pass ? 15 : issues.some(i => i.includes('formatting')) ? 0 : 8;

  return {
    pass,
    value: desc,
    length: desc.length,
    issues: issues.length > 0 ? issues : undefined,
    score,
    maxScore: 15
  };
}

function checkInternalLinks(body) {
  const linkRegex = /\[([^\]]+)\]\((\/[^\)]+)\)/g;
  const matches = [...body.matchAll(linkRegex)];
  const count = matches.length;

  // Filter out TOC anchor links
  const realLinks = matches.filter(m => !m[2].startsWith('#'));
  const realCount = realLinks.length;

  const pass = realCount >= 8;
  const score = Math.min(20, Math.floor((realCount / 8) * 20));

  return {
    pass,
    count: realCount,
    total: count,
    target: '8-12',
    issue: !pass ? `Only ${realCount} internal links (need 8-12)` : undefined,
    score,
    maxScore: 20
  };
}

function checkExternalLinks(body) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const matches = [...body.matchAll(linkRegex)];
  const count = matches.length;

  const pass = count >= 5;
  const score = Math.min(15, Math.floor((count / 5) * 15));

  return {
    pass,
    count,
    target: '5-8',
    links: matches.map(m => ({ text: m[1], url: m[2] })).slice(0, 10),
    issue: !pass ? `Only ${count} external links (need 5-8)` : undefined,
    score,
    maxScore: 15
  };
}

function checkImages(body) {
  const imageRegex = /!\[([^\]]+)\]\(([^\)]+)\)/g;
  const matches = [...body.matchAll(imageRegex)];
  const count = matches.length;

  const hasPlaceholders = matches.some(m => m[2].includes('IMAGE_PLACEHOLDER'));

  const pass = count >= 6;
  const score = Math.min(20, Math.floor((count / 6) * 20));

  return {
    pass,
    count,
    target: '6-8',
    hasPlaceholders,
    images: matches.map(m => ({ alt: m[1], src: m[2] })),
    issue: !pass ? `Only ${count} images (need 6-8)` : hasPlaceholders ? 'Contains placeholder images' : undefined,
    score,
    maxScore: 20
  };
}

function checkKeywordDensity(body, frontmatter) {
  const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
  if (!titleMatch) {
    return { pass: false, issue: 'No title found', score: 0, maxScore: 15 };
  }

  // Try to extract target keyword from tags or title
  const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]+)\]/);
  const categoryMatch = frontmatter.match(/category:\s*"([^"]+)"/);

  // Simple keyword extraction - first part of title before colon or dash
  const title = titleMatch[1].toLowerCase();
  let keyword = title.split(/[:–—|-]/)[0].trim();

  // Clean up common patterns
  keyword = keyword.replace(/^(the|a|an)\s+/i, '');
  keyword = keyword.replace(/\?$/,  '');

  const wordCount = body.split(/\s+/).length;
  const keywordRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const occurrences = (body.match(keywordRegex) || []).length;
  const density = (occurrences / wordCount) * 100;

  const pass = density >= 0.5 && density <= 1.5;
  const score = pass ? 15 : density < 0.5 ? Math.floor((density / 0.5) * 15) : Math.max(0, 15 - Math.floor((density - 1.5) * 10));

  return {
    pass,
    keyword,
    occurrences,
    wordCount,
    density: density.toFixed(2) + '%',
    optimal: density >= 0.5 && density <= 1.0,
    issue: density < 0.5
      ? `Keyword density too low (${density.toFixed(2)}%, need 0.5-1.0%)`
      : density > 1.5
      ? `Keyword density too high (${density.toFixed(2)}%, max 1.5%)`
      : undefined,
    recommendation: density < 0.5
      ? `Add ${Math.ceil((wordCount * 0.005) - occurrences)} more mentions of "${keyword}"`
      : density > 1.5
      ? `Reduce keyword usage by ${Math.floor(occurrences - (wordCount * 0.015))} mentions`
      : 'Optimal density',
    score,
    maxScore: 15
  };
}

function checkFAQSchema(frontmatter) {
  const hasFAQ = frontmatter.includes('faq:') || frontmatter.includes('faq\n');

  const score = hasFAQ ? 5 : 0;

  return {
    pass: hasFAQ,
    issue: !hasFAQ ? 'No FAQ schema found in frontmatter' : undefined,
    score,
    maxScore: 5
  };
}

function checkCTAs(body) {
  // Look for CTA patterns
  const ctaPatterns = [
    /\[.*(?:download|get|schedule|contact|call|learn more|read more|start|try).*→.*\]/gi,
    /\[.*\]\(.*(?:contact|consultation|audit|checklist|guide|resource).*\)/gi,
    /(?:download|get|schedule|contact us|call now)/gi,
  ];

  const matches = new Set();
  ctaPatterns.forEach(pattern => {
    const found = body.match(pattern) || [];
    found.forEach(match => matches.add(match.toLowerCase()));
  });

  const count = matches.size;
  const pass = count >= 3;
  const score = Math.min(5, Math.floor((count / 3) * 5));

  return {
    pass,
    count,
    target: '3+',
    examples: Array.from(matches).slice(0, 5),
    issue: !pass ? `Only ${count} CTAs found (need 3+)` : undefined,
    score,
    maxScore: 5
  };
}

function checkLSIKeywords(body) {
  const lsiKeywords = [
    'local search optimization',
    'Google Maps SEO',
    'local search rankings',
    'near me searches',
    'local search results',
    'local search visibility',
    'local business listings'
  ];

  const found = lsiKeywords.filter(keyword =>
    body.toLowerCase().includes(keyword.toLowerCase())
  );

  const count = found.length;
  const pass = count >= 3;
  const score = Math.min(5, Math.floor((count / 3) * 5));

  return {
    pass,
    found: count,
    target: '3-4',
    keywords: found,
    issue: !pass ? `Only ${count}/7 LSI keywords present` : undefined,
    score,
    maxScore: 5
  };
}

function checkHeadingHierarchy(body) {
  const headings = body.match(/^#{1,6}\s+.+$/gm) || [];

  let issues = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = heading.match(/^#+/)[0].length;

    // Skip H1 (should be title)
    if (level === 1) {
      issues.push(`H1 found in body (should only be in title): "${heading}"`);
    }

    // Check for skipping levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push(`Heading level skip at "${heading}" (H${previousLevel} → H${level})`);
    }

    previousLevel = level;
  });

  const h2Count = headings.filter(h => h.startsWith('## ')).length;
  const h3Count = headings.filter(h => h.startsWith('### ')).length;

  return {
    pass: issues.length === 0,
    h2Count,
    h3Count,
    totalHeadings: headings.length,
    issues: issues.length > 0 ? issues : undefined,
    score: issues.length === 0 ? 5 : Math.max(0, 5 - issues.length),
    maxScore: 5
  };
}

function checkWordCount(body) {
  const words = body.split(/\s+/).filter(w => w.length > 0);
  const count = words.length;

  const pass = count >= 2500 && count <= 5000;
  const score = count >= 2500 && count <= 5000 ? 5 :
                count >= 2000 ? 3 :
                count >= 1500 ? 2 : 0;

  return {
    pass,
    count,
    target: '2,500-3,500',
    issue: count < 2500 ? `Word count too low (${count} words)` :
           count > 5000 ? `Word count very high (${count} words - consider splitting)` :
           undefined,
    score,
    maxScore: 5
  };
}

function generateSEOReport(results, filePath) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SEO QUALITY REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`File: ${path.basename(filePath)}\n`);

  let totalScore = 0;
  let maxTotalScore = 0;

  // Critical Elements
  console.log('CRITICAL ELEMENTS (Must Have)\n');

  // Meta Description (15 points)
  maxTotalScore += results.metaDescription.maxScore;
  totalScore += results.metaDescription.score;
  if (results.metaDescription.pass) {
    console.log(`✅ Meta Description: PASS (${results.metaDescription.score}/${results.metaDescription.maxScore})`);
    console.log(`   Length: ${results.metaDescription.length} chars`);
  } else {
    console.log(`❌ Meta Description: FAIL (${results.metaDescription.score}/${results.metaDescription.maxScore})`);
    if (results.metaDescription.issues) {
      results.metaDescription.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
  }

  // Internal Links (20 points)
  maxTotalScore += results.internalLinks.maxScore;
  totalScore += results.internalLinks.score;
  if (results.internalLinks.pass) {
    console.log(`✅ Internal Links: PASS (${results.internalLinks.score}/${results.internalLinks.maxScore})`);
    console.log(`   Count: ${results.internalLinks.count} (target: ${results.internalLinks.target})`);
  } else {
    console.log(`❌ Internal Links: FAIL (${results.internalLinks.score}/${results.internalLinks.maxScore})`);
    console.log(`   ${results.internalLinks.issue}`);
  }

  // External Links (15 points)
  maxTotalScore += results.externalLinks.maxScore;
  totalScore += results.externalLinks.score;
  if (results.externalLinks.pass) {
    console.log(`✅ External Links: PASS (${results.externalLinks.score}/${results.externalLinks.maxScore})`);
    console.log(`   Count: ${results.externalLinks.count} (target: ${results.externalLinks.target})`);
  } else {
    console.log(`❌ External Links: FAIL (${results.externalLinks.score}/${results.externalLinks.maxScore})`);
    console.log(`   ${results.externalLinks.issue}`);
  }

  // Images (20 points)
  maxTotalScore += results.images.maxScore;
  totalScore += results.images.score;
  if (results.images.pass) {
    console.log(`✅ Images: PASS (${results.images.score}/${results.images.maxScore})`);
    console.log(`   Count: ${results.images.count} (target: ${results.images.target})`);
    if (results.images.hasPlaceholders) {
      console.log(`   ⚠️  Contains placeholder images - replace before publishing`);
    }
  } else {
    console.log(`❌ Images: FAIL (${results.images.score}/${results.images.maxScore})`);
    console.log(`   ${results.images.issue}`);
  }

  console.log('\nCONTENT OPTIMIZATION\n');

  // Keyword Density (15 points)
  maxTotalScore += results.keywordDensity.maxScore;
  totalScore += results.keywordDensity.score;
  if (results.keywordDensity.pass) {
    console.log(`✅ Keyword Density: PASS (${results.keywordDensity.score}/${results.keywordDensity.maxScore})`);
    console.log(`   Keyword: "${results.keywordDensity.keyword}"`);
    console.log(`   Density: ${results.keywordDensity.density} (${results.keywordDensity.occurrences} occurrences)`);
  } else {
    console.log(`❌ Keyword Density: FAIL (${results.keywordDensity.score}/${results.keywordDensity.maxScore})`);
    console.log(`   Keyword: "${results.keywordDensity.keyword}"`);
    console.log(`   Density: ${results.keywordDensity.density} (${results.keywordDensity.occurrences} occurrences)`);
    console.log(`   ${results.keywordDensity.issue}`);
    console.log(`   💡 ${results.keywordDensity.recommendation}`);
  }

  // Word Count (5 points)
  maxTotalScore += results.wordCount.maxScore;
  totalScore += results.wordCount.score;
  if (results.wordCount.pass) {
    console.log(`✅ Word Count: PASS (${results.wordCount.score}/${results.wordCount.maxScore})`);
    console.log(`   Count: ${results.wordCount.count.toLocaleString()} words`);
  } else {
    console.log(`⚠️  Word Count: ${results.wordCount.score}/${results.wordCount.maxScore}`);
    console.log(`   Count: ${results.wordCount.count.toLocaleString()} words`);
    if (results.wordCount.issue) {
      console.log(`   ${results.wordCount.issue}`);
    }
  }

  console.log('\nENHANCEMENTS\n');

  // FAQ Schema (5 points)
  maxTotalScore += results.faqSchema.maxScore;
  totalScore += results.faqSchema.score;
  if (results.faqSchema.pass) {
    console.log(`✅ FAQ Schema: PASS (${results.faqSchema.score}/${results.faqSchema.maxScore})`);
  } else {
    console.log(`⚠️  FAQ Schema: MISSING (${results.faqSchema.score}/${results.faqSchema.maxScore})`);
    console.log(`   ${results.faqSchema.issue}`);
  }

  // CTAs (5 points)
  maxTotalScore += results.ctas.maxScore;
  totalScore += results.ctas.score;
  if (results.ctas.pass) {
    console.log(`✅ CTAs: PASS (${results.ctas.score}/${results.ctas.maxScore})`);
    console.log(`   Count: ${results.ctas.count}`);
  } else {
    console.log(`⚠️  CTAs: ${results.ctas.score}/${results.ctas.maxScore}`);
    console.log(`   ${results.ctas.issue}`);
  }

  // LSI Keywords (5 points)
  maxTotalScore += results.lsiKeywords.maxScore;
  totalScore += results.lsiKeywords.score;
  if (results.lsiKeywords.pass) {
    console.log(`✅ LSI Keywords: PASS (${results.lsiKeywords.score}/${results.lsiKeywords.maxScore})`);
    console.log(`   Found: ${results.lsiKeywords.found} (${results.lsiKeywords.keywords.join(', ')})`);
  } else {
    console.log(`⚠️  LSI Keywords: ${results.lsiKeywords.score}/${results.lsiKeywords.maxScore}`);
    console.log(`   ${results.lsiKeywords.issue}`);
  }

  console.log('\nTECHNICAL\n');

  // Heading Hierarchy (5 points)
  maxTotalScore += results.headingHierarchy.maxScore;
  totalScore += results.headingHierarchy.score;
  if (results.headingHierarchy.pass) {
    console.log(`✅ Heading Hierarchy: PASS (${results.headingHierarchy.score}/${results.headingHierarchy.maxScore})`);
    console.log(`   H2: ${results.headingHierarchy.h2Count}, H3: ${results.headingHierarchy.h3Count}`);
  } else {
    console.log(`⚠️  Heading Hierarchy: ${results.headingHierarchy.score}/${results.headingHierarchy.maxScore}`);
    results.headingHierarchy.issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const percentage = Math.round((totalScore / maxTotalScore) * 100);
  const grade = percentage >= 96 ? 'A+' :
                percentage >= 93 ? 'A' :
                percentage >= 90 ? 'A-' :
                percentage >= 87 ? 'B+' :
                percentage >= 83 ? 'B' :
                percentage >= 80 ? 'B-' :
                percentage >= 77 ? 'C+' :
                percentage >= 73 ? 'C' : 'D';

  console.log(`\n  FINAL SCORE: ${totalScore}/${maxTotalScore} (${percentage}%) - Grade: ${grade}\n`);

  if (percentage >= 96) {
    console.log('🎉 Excellent! This blog post exceeds SEO quality standards.');
  } else if (percentage >= 90) {
    console.log('✅ Great! This blog post meets SEO quality standards.');
  } else if (percentage >= 80) {
    console.log('⚠️  Good foundation, but needs improvements for optimal SEO.');
  } else {
    console.log('❌ This blog post needs significant improvements before publishing.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Priority recommendations
  const criticalIssues = [];
  if (!results.metaDescription.pass) criticalIssues.push('Fix meta description');
  if (!results.internalLinks.pass) criticalIssues.push(`Add ${8 - results.internalLinks.count} internal links`);
  if (!results.externalLinks.pass) criticalIssues.push(`Add ${5 - results.externalLinks.count} external links`);
  if (!results.images.pass) criticalIssues.push(`Add ${6 - results.images.count} images`);
  if (!results.keywordDensity.pass) criticalIssues.push('Optimize keyword density');

  if (criticalIssues.length > 0) {
    console.log('🚨 PRIORITY FIXES:\n');
    criticalIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }

  return { totalScore, maxTotalScore, percentage, grade };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node seo-enhance-blog.mjs <path-to-blog-post.md>');
    console.error('\nExample:');
    console.error('  node automation/scripts/seo-enhance-blog.mjs src/content/blog/my-post.md');
    process.exit(1);
  }

  enhanceBlogPost(filePath).catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

export { enhanceBlogPost };
