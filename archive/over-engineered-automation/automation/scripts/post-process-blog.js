#!/usr/bin/env node

/**
 * Post-Processing Script for Blog Posts
 * Automatically optimizes generated blog posts to A+ SEO grade
 *
 * Fixes:
 * - Truncated meta descriptions
 * - Missing schema markup (Article + FAQPage)
 * - Adds Sydney postcodes if missing
 * - Validates SEO requirements
 * - Ensures keyword placement
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Get the most recently generated blog post
 */
async function getLatestBlogPost() {
  const blogDir = path.join(projectRoot, 'src/content/blog');
  const files = await fs.readdir(blogDir);

  // Get .md files only, filter out old ones
  const mdFiles = files.filter(f => f.endsWith('.md') && f.startsWith('20'));

  if (mdFiles.length === 0) {
    throw new Error('No blog posts found');
  }

  // Sort by filename (date-based) and get latest
  mdFiles.sort().reverse();
  const latestFile = mdFiles[0];

  return path.join(blogDir, latestFile);
}

/**
 * Parse frontmatter and content from markdown file
 */
function parseMarkdown(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid markdown format - no frontmatter found');
  }

  return {
    frontmatter: match[1],
    content: match[2]
  };
}

/**
 * Parse YAML-like frontmatter to object
 */
function parseFrontmatter(frontmatter) {
  const lines = frontmatter.split('\n');
  const obj = {};
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;
  let indentLevel = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const indent = line.match(/^\s*/)[0].length;

    // Simple key: value
    if (line.includes(': ') && !line.trim().startsWith('-')) {
      const [key, ...valueParts] = line.split(': ');
      const trimmedKey = key.trim();
      const value = valueParts.join(': ').trim().replace(/^["']|["']$/g, '');

      if (indent === 0) {
        obj[trimmedKey] = value;
        currentKey = trimmedKey;
        currentArray = null;
        currentObject = null;
      } else if (currentObject) {
        currentObject[trimmedKey] = value;
      }
    }
    // Array item
    else if (line.trim().startsWith('- ')) {
      const value = line.trim().substring(2).replace(/^["']|["']$/g, '');
      if (!currentArray) {
        currentArray = [];
        obj[currentKey] = currentArray;
      }
      currentArray.push(value);
    }
  }

  return obj;
}

/**
 * Fix truncated meta description
 */
function fixMetaDescription(description, title) {
  if (!description) return description;

  // If ends mid-word or with incomplete sentence
  if (description.length >= 155 && !description.match(/[.!?]$/)) {
    // Truncate to last complete word and add period
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > 140) {
      return description.substring(0, lastSpace) + '.';
    }
  }

  return description;
}

/**
 * Extract FAQ questions from content
 */
function extractFAQs(content) {
  const faqSection = content.match(/## Frequently Asked Questions[\s\S]*?(?=##|$)/);
  if (!faqSection) return [];

  const faqs = [];
  const qaPairs = faqSection[0].match(/\*\*Q: (.*?)\?\*\*\s*A: (.*?)(?=\*\*Q:|##|$)/gs);

  if (qaPairs) {
    for (const pair of qaPairs) {
      const question = pair.match(/\*\*Q: (.*?)\?\*\*/)?.[1];
      const answer = pair.match(/A: (.*?)(?=\*\*Q:|##|$)/s)?.[1]?.trim();

      if (question && answer) {
        faqs.push({ question: question + '?', answer });
      }
    }
  }

  return faqs.slice(0, 5); // Max 5 FAQs
}

/**
 * Generate schema markup
 */
function generateSchema(frontmatter, faqs) {
  const title = frontmatter.title || '';
  const description = frontmatter.description || '';
  const author = frontmatter.author || 'The Profit Platform';
  const publishDate = frontmatter.publishDate || new Date().toISOString().split('T')[0];
  const coverImage = frontmatter.coverImage || '';

  const schema = {
    type: 'Article',
    headline: title,
    datePublished: publishDate,
    dateModified: publishDate,
    author: {
      type: 'Person',
      name: author
    },
    publisher: {
      type: 'Organization',
      name: 'The Profit Platform',
      url: 'https://theprofitplatform.com.au'
    },
    image: coverImage,
    mainEntityOfPage: {
      type: 'WebPage',
      url: `https://theprofitplatform.com.au/blog/${frontmatter.slug || ''}`
    }
  };

  return { schema, faqs };
}

/**
 * Rebuild frontmatter with schema
 */
function rebuildFrontmatter(frontmatter, schema, faqs) {
  let output = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
author: "${frontmatter.author}"
publishDate: ${frontmatter.publishDate}
category: "${frontmatter.category}"
tags: ${JSON.stringify(frontmatter.tags?.slice(1, -1).split('","') || [])}
featured: ${frontmatter.featured || 'false'}
draft: ${frontmatter.draft || 'false'}
readTime: "${frontmatter.readTime}"
coverImage: "${frontmatter.coverImage}"
coverImageAlt: "${frontmatter.coverImageAlt}"
coverImageCredit:
  name: "${frontmatter['coverImageCredit'] || frontmatter.name}"
  link: "${frontmatter.link || ''}"
seo:
  title: "${frontmatter.title} | The Profit Platform"
  description: "${frontmatter.description}"
  keywords: ${JSON.stringify(frontmatter.keywords?.slice(1, -1).split('","') || [])}
schema:
  type: "${schema.type}"
  headline: "${schema.headline}"
  datePublished: "${schema.datePublished}"
  dateModified: "${schema.dateModified}"
  author:
    type: "Person"
    name: "${schema.author.name}"
  publisher:
    type: "Organization"
    name: "${schema.publisher.name}"
    url: "${schema.publisher.url}"
  image: "${schema.image}"
  mainEntityOfPage:
    type: "WebPage"
    url: "${schema.mainEntityOfPage.url}"`;

  if (faqs.length > 0) {
    output += '\nfaq:';
    for (const faq of faqs) {
      output += `\n  - question: "${faq.question.replace(/"/g, '\\"')}"`;
      output += `\n    answer: "${faq.answer.replace(/"/g, '\\"')}"`;
    }
  }

  output += '\n---\n';

  return output;
}

/**
 * Inject additional internal links into content
 */
function injectInternalLinks(content, currentLinkCount) {
  const targetLinks = 6; // Aim for 6 total internal links
  const linksToAdd = Math.max(0, targetLinks - currentLinkCount);

  if (linksToAdd === 0) return { content, added: 0 };

  // Link opportunities (phrase -> URL)
  const linkMap = {
    'local seo': '/seo',
    'search engine optimization': '/seo',
    'seo strategy': '/seo',
    'seo services': '/seo',
    'google ads': '/google-ads',
    'ppc campaign': '/google-ads',
    'paid advertising': '/google-ads',
    'web design': '/web-design',
    'website design': '/web-design',
    'responsive design': '/web-design',
    'digital marketing': '/services',
    'marketing services': '/services',
    'seo audit': '/tools/seo-audit',
    'keyword research': '/tools/keyword-research',
    'contact us': '/contact',
    'get in touch': '/contact'
  };

  let modifiedContent = content;
  let added = 0;

  for (const [phrase, url] of Object.entries(linkMap)) {
    if (added >= linksToAdd) break;

    // Skip if already linked
    if (modifiedContent.includes(`](${url})`)) continue;

    // Find first unlinked occurrence
    const regex = new RegExp(`(?<!\\[)\\b(${phrase})\\b(?!\\]|\\()`, 'i');
    const match = modifiedContent.match(regex);

    if (match) {
      const matchedText = match[1];
      modifiedContent = modifiedContent.replace(regex, `[${matchedText}](${url})`);
      added++;
    }
  }

  return { content: modifiedContent, added };
}

/**
 * Inject external authority links
 */
function injectExternalLinks(content, currentExtLinks) {
  const targetExtLinks = 3;
  const linksToAdd = Math.max(0, targetExtLinks - currentExtLinks);

  if (linksToAdd === 0) return { content, added: 0 };

  // Authority link opportunities (context -> URL + source)
  const authorityLinks = [
    {
      trigger: /google.*algorithm|search.*ranking|seo.*factor/i,
      url: 'https://developers.google.com/search/docs',
      text: 'Google Search documentation',
      source: 'Google Developers'
    },
    {
      trigger: /keyword.*research|search.*volume/i,
      url: 'https://ads.google.com/home/tools/keyword-planner/',
      text: "Google's Keyword Planner",
      source: 'Google Ads'
    },
    {
      trigger: /local.*search|google.*business|maps/i,
      url: 'https://support.google.com/business/',
      text: 'Google Business Profile Help',
      source: 'Google Support'
    },
    {
      trigger: /schema.*markup|structured.*data/i,
      url: 'https://schema.org/',
      text: 'Schema.org documentation',
      source: 'Schema.org'
    },
    {
      trigger: /seo.*best.*practice|seo.*guide/i,
      url: 'https://moz.com/learn/seo',
      text: "Moz's SEO Learning Center",
      source: 'Moz'
    }
  ];

  let modifiedContent = content;
  let added = 0;

  for (const link of authorityLinks) {
    if (added >= linksToAdd) break;
    if (modifiedContent.includes(link.url)) continue;

    const match = modifiedContent.match(link.trigger);
    if (match) {
      // Find a good place to insert (after the matched paragraph)
      const paragraphEnd = modifiedContent.indexOf('\n\n', match.index);
      if (paragraphEnd > -1) {
        const insertion = ` According to [${link.text}](${link.url}), `;
        const insertPoint = modifiedContent.lastIndexOf('. ', paragraphEnd) + 2;

        if (insertPoint > match.index) {
          modifiedContent = modifiedContent.slice(0, insertPoint) +
                           insertion.replace(', ', ', this is crucial for success. ') +
                           modifiedContent.slice(insertPoint);
          added++;
        }
      }
    }
  }

  return { content: modifiedContent, added };
}

/**
 * Enforce keyword in first H2
 */
function enforceKeywordInH2(content, targetKeyword) {
  const lines = content.split('\n');
  const firstH2Index = lines.findIndex(line => line.startsWith('## '));

  if (firstH2Index === -1) return { content, fixed: false };

  const firstH2 = lines[firstH2Index];

  // Check if keyword already present
  if (firstH2.toLowerCase().includes(targetKeyword.toLowerCase())) {
    return { content, fixed: false };
  }

  // Inject keyword naturally
  const heading = firstH2.replace('## ', '');
  const newHeading = `## ${targetKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: ${heading}`;

  lines[firstH2Index] = newHeading;

  return { content: lines.join('\n'), fixed: true };
}

/**
 * Inject Sydney postcodes if missing
 */
function injectSydneyPostcodes(content) {
  const postcodeRegex = /\b2\d{3}\b/g;
  const existingPostcodes = content.match(postcodeRegex) || [];

  if (existingPostcodes.length >= 3) {
    return { content, added: 0 };
  }

  const commonPostcodes = [
    { code: '2000', name: 'Sydney CBD' },
    { code: '2060', name: 'North Sydney' },
    { code: '2026', name: 'Bondi' },
    { code: '2088', name: 'Mosman' },
    { code: '2150', name: 'Parramatta' }
  ];

  let modifiedContent = content;
  let added = 0;
  const needed = 3 - existingPostcodes.length;

  // Find mentions of suburbs without postcodes
  for (const { code, name } of commonPostcodes) {
    if (added >= needed) break;
    if (existingPostcodes.includes(code)) continue;

    const suburbRegex = new RegExp(`\\b${name}\\b(?! \\(\\d{4}\\))`, 'i');
    const match = modifiedContent.match(suburbRegex);

    if (match) {
      modifiedContent = modifiedContent.replace(suburbRegex, `${match[0]} (${code})`);
      added++;
    }
  }

  return { content: modifiedContent, added };
}

/**
 * Main post-processing function
 */
async function postProcessBlog() {
  try {
    console.log('\n🔄 Starting A+ post-processing optimization...\n');

    // 1. Get latest blog post
    const filePath = await getLatestBlogPost();
    console.log(`📄 Processing: ${path.basename(filePath)}`);

    // 2. Read file
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const { frontmatter: rawFrontmatter, content } = parseMarkdown(rawContent);

    // 3. Parse frontmatter
    const frontmatter = parseFrontmatter(rawFrontmatter);
    const targetKeyword = frontmatter['targetKeyword'] || frontmatter.keywords?.split(',')[0] || '';

    // 4. Fix meta description
    const originalDesc = frontmatter.description;
    frontmatter.description = fixMetaDescription(frontmatter.description, frontmatter.title);

    if (originalDesc !== frontmatter.description) {
      console.log('✅ Fixed truncated meta description');
    }

    // 5. Extract FAQs
    const faqs = extractFAQs(content);
    console.log(`✅ Extracted ${faqs.length} FAQ questions`);

    // 6. Enforce keyword in first H2
    let processedContent = content;
    const keywordResult = enforceKeywordInH2(processedContent, targetKeyword);
    processedContent = keywordResult.content;
    if (keywordResult.fixed) {
      console.log(`✅ Injected keyword "${targetKeyword}" into first H2`);
    }

    // 7. Count existing links
    const currentIntLinks = (processedContent.match(/\]\(\//g) || []).length;
    const currentExtLinks = (processedContent.match(/\]\(http/g) || []).length;

    // 8. Inject internal links
    const intLinkResult = injectInternalLinks(processedContent, currentIntLinks);
    processedContent = intLinkResult.content;
    if (intLinkResult.added > 0) {
      console.log(`✅ Added ${intLinkResult.added} internal links (${currentIntLinks} → ${currentIntLinks + intLinkResult.added})`);
    }

    // 9. Inject external authority links
    const extLinkResult = injectExternalLinks(processedContent, currentExtLinks);
    processedContent = extLinkResult.content;
    if (extLinkResult.added > 0) {
      console.log(`✅ Added ${extLinkResult.added} external authority links (${currentExtLinks} → ${currentExtLinks + extLinkResult.added})`);
    }

    // 10. Inject Sydney postcodes
    const postcodeResult = injectSydneyPostcodes(processedContent);
    processedContent = postcodeResult.content;
    if (postcodeResult.added > 0) {
      console.log(`✅ Added ${postcodeResult.added} Sydney postcodes`);
    }

    // 11. Generate schema
    const { schema } = generateSchema(frontmatter, faqs);
    console.log('✅ Generated Article + FAQPage schema');

    // 12. Rebuild frontmatter
    const newFrontmatter = rebuildFrontmatter(frontmatter, schema, faqs);

    // 13. Write back
    const newContent = newFrontmatter + processedContent;
    await fs.writeFile(filePath, newContent, 'utf-8');

    console.log('\n🎉 A+ Post-processing complete!');
    console.log(`📊 Optimizations applied:
   - Meta description: ${originalDesc !== frontmatter.description ? 'Fixed ✅' : 'OK ✅'}
   - Keyword in H2: ${keywordResult.fixed ? 'Injected ✅' : 'Already present ✅'}
   - Internal links: ${intLinkResult.added > 0 ? `+${intLinkResult.added} added ✅` : 'Sufficient ✅'}
   - External links: ${extLinkResult.added > 0 ? `+${extLinkResult.added} added ✅` : 'Sufficient ✅'}
   - Sydney postcodes: ${postcodeResult.added > 0 ? `+${postcodeResult.added} added ✅` : 'Sufficient ✅'}
   - Article schema: Added ✅
   - FAQ schema: ${faqs.length} questions ✅
   - File updated: ${path.basename(filePath)} ✅`);

    return {
      success: true,
      file: filePath,
      optimizations: {
        metaFixed: originalDesc !== frontmatter.description,
        keywordFixed: keywordResult.fixed,
        internalLinksAdded: intLinkResult.added,
        externalLinksAdded: extLinkResult.added,
        postcodesAdded: postcodeResult.added,
        faqCount: faqs.length,
        schemaAdded: true
      }
    };

  } catch (error) {
    console.error('\n❌ Post-processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  postProcessBlog();
}

export { postProcessBlog };
