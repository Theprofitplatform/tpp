import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';
import { generateSchemas, analyzeSchemas } from './schema-generator.js';
import { generateVisualSuggestions, generateVisualReport } from './visual-suggester.js';
import { analyzeReadability, generateReadabilityReport } from './readability-analyzer.js';
import { enhanceInternalLinks, generateLinkingReport } from './smart-linker.js';
import { enhanceReadability, generateEnhancementReport } from './readability-enhancer.js';
import { generateCharts, generateChartReport } from './chart-generator.js';
import { enrichStatistics, generateEnrichmentReport } from './statistics-enrichment.js';
import { createDeepSeekClient } from '../utils/deepseek-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local for local development
dotenv.config({ path: path.join(projectRoot, '.env.local') });

// Create DeepSeek client
const deepseek = createDeepSeekClient();

/**
 * Assign author based on topic expertise and category
 * @param {string} category - Blog post category
 * @param {Array<string>} tags - Post tags
 * @returns {string} Author name
 */
function assignAuthorByExpertise(category, tags = []) {
  // Avi Sharma - Founder & SEO Strategist
  // Expertise: SEO, Local SEO, Technical SEO, Strategy
  const aviExpertise = {
    categories: ['SEO', 'Analytics', 'Marketing Strategy'],
    tags: ['Local SEO', 'Technical SEO', 'SEO Tools', 'Keyword Research',
           'Link Building', 'Schema Markup', 'Voice Search', 'Multi-Location SEO',
           'SEO', 'Rankings', 'Google Business Profile', 'Local Search']
  };

  // TPP Team - Digital Marketing Experts
  // Expertise: Google Ads, PPC, Web Design, Paid Advertising
  const tppExpertise = {
    categories: ['Google Ads', 'Web Design', 'Digital Marketing', 'Content Marketing'],
    tags: ['PPC', 'Google Ads', 'Ad Copywriting', 'CPC', 'Quality Score',
           'Bidding Strategies', 'Remarketing', 'Landing Pages', 'Web Design',
           'CRO', 'Conversions', 'Page Speed', 'Mobile Design', 'Accessibility']
  };

  // Check category match first (higher weight)
  if (aviExpertise.categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    return 'Avi';
  }
  if (tppExpertise.categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    return 'TPP Team';
  }

  // Check tag overlap (count matches)
  const aviTagMatches = tags.filter(tag =>
    aviExpertise.tags.some(expertTag =>
      tag.toLowerCase().includes(expertTag.toLowerCase()) ||
      expertTag.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;

  const tppTagMatches = tags.filter(tag =>
    tppExpertise.tags.some(expertTag =>
      tag.toLowerCase().includes(expertTag.toLowerCase()) ||
      expertTag.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;

  // Assign based on tag matches
  if (aviTagMatches > tppTagMatches) {
    return 'Avi';
  } else if (tppTagMatches > aviTagMatches) {
    return 'TPP Team';
  }

  // Default to Avi for general content (founder adds more E-E-A-T weight)
  return 'Avi';
}

/**
 * Main blog post generation function using DeepSeek API
 */
async function generateBlogPostWithDeepSeek() {
  try {
    console.log('🤖 Starting blog post generation with DeepSeek API...\n');

    // 1. Load topic queue
    const queuePath = path.join(projectRoot, 'automation/topic-queue.json');
    const queue = JSON.parse(await fs.readFile(queuePath, 'utf-8'));

    // 2. Select next topic (by priority or manual topic ID)
    const topicId = process.env.TOPIC_ID;
    let topic;

    if (topicId) {
      topic = queue.queue.find(t => t.id === parseInt(topicId));
      console.log(`📌 Manual topic selection: ID ${topicId}`);
    } else {
      // Get next pending topic by priority
      const pending = queue.queue.filter(t => t.status === 'pending');
      if (pending.length === 0) {
        throw new Error('❌ No pending topics in queue');
      }
      topic = pending.sort((a, b) => a.priority - b.priority)[0];
      console.log(`📌 Auto-selected topic by priority`);
    }

    if (!topic) {
      throw new Error('❌ Topic not found');
    }

    console.log(`📝 Topic: ${topic.title}`);
    console.log(`🎯 Keyword: ${topic.targetKeyword}`);
    console.log(`📁 Category: ${topic.category}\n`);

    // 3. Fetch featured image from Unsplash
    let imageData = null;
    try {
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      imageData = await fetchAndSaveFeaturedImage(
        topic.targetKeyword,
        topic.category,
        slug
      );
    } catch (error) {
      console.warn('⚠️  Failed to fetch image, continuing without:', error.message);
    }

    // 4. Load brand guidelines and template
    const brandGuidelines = await fs.readFile(
      path.join(projectRoot, 'automation/brand-guidelines.md'),
      'utf-8'
    );

    const template = await fs.readFile(
      path.join(projectRoot, 'automation/prompt-templates/blog-post-simple.txt'),
      'utf-8'
    );

    // 4.5 Load internal link map for intelligent linking
    let relatedPosts = [];
    try {
      const linkMapPath = path.join(projectRoot, 'automation/internal-link-map.json');
      const linkMap = JSON.parse(await fs.readFile(linkMapPath, 'utf-8'));

      // Find posts related to this topic's category/tags
      const relevantPosts = Object.values(linkMap)
        .filter(post =>
          post.category === topic.category ||
          post.tags.some(tag => topic.tags.includes(tag))
        )
        .slice(0, 5);

      relatedPosts = relevantPosts.map(p => ({
        title: p.title,
        url: p.url,
        category: p.category
      }));

      if (relatedPosts.length > 0) {
        console.log(`🔗 Found ${relatedPosts.length} related posts for internal linking`);
      }
    } catch (error) {
      console.warn('⚠️  Internal link map not found, skipping intelligent linking');
    }

    // 5. Build prompt
    const systemPrompt = `You are an expert digital marketing content writer for The Profit Platform, a Sydney-based agency.

BRAND GUIDELINES:
${brandGuidelines}

Follow these guidelines strictly to maintain brand voice and quality standards.`;

    // Add related posts for internal linking
    let relatedPostsSection = '';
    if (relatedPosts.length > 0) {
      relatedPostsSection = `\n\nRELATED POSTS FOR INTERNAL LINKING:
Include 2-3 contextual internal links to these related blog posts:

${relatedPosts.map(p => `- [${p.title}](${p.url}) - ${p.category}`).join('\n')}

Link to these posts naturally where relevant in the content. Use contextual anchor text, not "click here".`;
    }

    const userPrompt = template
      .replace('{brand_guidelines}', '(see system context)')
      .replace('{title}', topic.title)
      .replace('{target_keyword}', topic.targetKeyword)
      .replace('{category}', topic.category)
      .replace('{tags}', topic.tags.join(', '))
      .replace('{search_intent}', topic.searchIntent)
      + relatedPostsSection;

    // 6. Generate content with DeepSeek
    console.log('🧠 Generating content with DeepSeek API...');

    const content = await deepseek.generateContent(systemPrompt, userPrompt, {
      model: 'deepseek-chat',
      max_tokens: 4000,
      temperature: 0.7,
    });

    console.log(`✅ Content generated (${content.split(/\s+/).length} words)\n`);

    // 7. Generate SEO meta description
    console.log('🔍 Generating SEO meta description...');

    const metaPrompt = `Write a compelling meta description (150-160 characters) for this blog post.

Title: ${topic.title}
Target Keyword: ${topic.targetKeyword}

Content preview:
${content.substring(0, 800)}

Requirements:
- Include target keyword naturally
- Action-oriented and compelling
- Exactly 150-160 characters
- No quotation marks

Return only the meta description text.`;

    const metaDescription = await deepseek.generateContent(
      'You are an expert SEO copywriter specializing in meta descriptions.',
      metaPrompt,
      {
        model: 'deepseek-chat',
        max_tokens: 200,
        temperature: 0.5,
      }
    );

    const cleanMetaDescription = metaDescription
      .trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .substring(0, 160);

    console.log(`✅ Meta description: ${cleanMetaDescription.length} chars\n`);

    // 8. Enhance readability (optional)
    console.log('📝 Enhancing readability for business owners...');
    let readableContent = content;
    let readabilityImprovements = null;

    if (process.env.ENABLE_READABILITY_ENHANCEMENT !== 'false') {
      try {
        const enhancementResult = await enhanceReadability(content, {
          title: topic.title,
          category: topic.category,
          tags: topic.tags
        });

        if (enhancementResult.success) {
          readableContent = enhancementResult.content;
          readabilityImprovements = enhancementResult.improvements;
          console.log(generateEnhancementReport(readabilityImprovements));
        } else {
          console.warn('⚠️  Readability enhancement failed, using original content');
        }
      } catch (error) {
        console.warn('⚠️  Readability enhancement error:', error.message);
      }
    } else {
      console.log('⚠️  Readability enhancement disabled (set ENABLE_READABILITY_ENHANCEMENT=true to enable)');
    }

    // 9. Add internal links
    console.log('🔗 Adding internal links...');
    let contentWithLinks = readableContent;

    try {
      const linkMapPath = path.join(projectRoot, 'automation/internal-link-map.json');
      const linkMap = JSON.parse(await fs.readFile(linkMapPath, 'utf-8'));

      const linkingResult = enhanceInternalLinks(contentWithLinks, linkMap, topic.title, topic);
      contentWithLinks = linkingResult.content;

      console.log(generateLinkingReport(linkingResult));
    } catch (error) {
      console.warn('⚠️  Smart linking failed, using basic internal links:', error.message);
      contentWithLinks = await addInternalLinks(contentWithLinks);
    }

    // 10. Analyze readability
    console.log('\n📖 Analyzing readability...');
    const readabilityAnalysis = analyzeReadability(contentWithLinks);
    console.log(generateReadabilityReport(readabilityAnalysis));

    // 11. Generate visual content suggestions
    console.log('\n🎨 Generating visual content suggestions...');
    const visualSuggestions = generateVisualSuggestions(contentWithLinks, {
      title: topic.title,
      category: topic.category,
      tags: topic.tags
    });

    const visualReport = generateVisualReport(visualSuggestions);
    console.log(`Found ${visualReport.totalSuggestions} visual opportunities:`);
    console.log(`  High priority: ${visualReport.byPriority.high}`);
    console.log(`  Medium priority: ${visualReport.byPriority.medium}`);
    console.log(`  Estimated time: ${visualReport.estimatedTotalTime}`);

    // Save visual suggestions for later reference
    const suggestionsDir = path.join(projectRoot, 'automation/visual-suggestions');
    try {
      await fs.mkdir(suggestionsDir, { recursive: true });
      const suggestionsFile = path.join(suggestionsDir, `${topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-deepseek.json`);
      await fs.writeFile(suggestionsFile, JSON.stringify(visualSuggestions, null, 2));
      console.log(`  💾 Saved suggestions to: ${path.basename(suggestionsFile)}`);
    } catch (err) {
      console.warn('  ⚠️  Could not save visual suggestions:', err.message);
    }

    // 12. Calculate read time
    const wordCount = contentWithLinks.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); // Average reading speed: 200 wpm

    // 13. Generate slug
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 14. Determine author based on topic expertise
    const author = assignAuthorByExpertise(topic.category, topic.tags);

    // 15. Generate schema markup
    console.log('\n🔍 Generating schema markup...');
    const schemaAnalysis = analyzeSchemas(contentWithLinks, {
      title: topic.title,
      description: cleanMetaDescription,
      author,
      publishDate: new Date().toISOString().split('T')[0],
      slug,
      coverImage: imageData?.coverImage || ''
    });

    console.log(`Generated ${schemaAnalysis.schemasGenerated} schemas:`);
    schemaAnalysis.schemaTypes.forEach(type => console.log(`  ✓ ${type}`));
    if (schemaAnalysis.faqCount > 0) console.log(`  📋 ${schemaAnalysis.faqCount} FAQs detected`);
    if (schemaAnalysis.stepCount > 0) console.log(`  📝 ${schemaAnalysis.stepCount} steps detected`);

    // 16. Create frontmatter with image data
    const today = new Date().toISOString().split('T')[0];
    let frontmatter = `---
title: "${topic.title}"
description: "${cleanMetaDescription}"
author: "${author}"
publishDate: ${today}
category: "${topic.category}"
tags: ${JSON.stringify(topic.tags)}
featured: false
draft: false
readTime: "${readTime} min"`;

    // Add image data if available
    if (imageData) {
      frontmatter += `
coverImage: "${imageData.coverImage}"
coverImageAlt: "${imageData.coverImageAlt}"
coverImageCredit:
  name: "${imageData.coverImageCredit.name}"
  link: "${imageData.coverImageCredit.link}"`;
    }

    frontmatter += `
seo:
  title: "${topic.title} | The Profit Platform"
  description: "${cleanMetaDescription}"
  keywords: ${JSON.stringify([topic.targetKeyword, ...topic.tags.slice(0, 3)])}`;

    // Add schema markup
    if (schemaAnalysis.schemas.length > 0) {
      frontmatter += `
schema: ${JSON.stringify(schemaAnalysis.schemas, null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}`;
    }

    frontmatter += `
---

`;

    // 17. Combine and save
    const fullContent = frontmatter + contentWithLinks;
    const filename = `${today}-${slug}-deepseek.md`;
    const filepath = path.join(projectRoot, 'src/content/blog', filename);

    await fs.writeFile(filepath, fullContent, 'utf-8');

    // 18. Update queue (mark as published)
    topic.status = 'published';
    topic.publishedDate = today;
    topic.publishedSlug = slug;
    topic.wordCount = wordCount;
    topic.author = author;

    queue.published.push(topic);
    queue.queue = queue.queue.filter(t => t.id !== topic.id);

    await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));

    // 19. Success summary
    console.log('\n✅ Blog post generated successfully with DeepSeek!');
    console.log(`📄 File: ${filename}`);
    console.log(`📊 Stats:
   - Word count: ${wordCount}
   - Read time: ${readTime} min
   - Author: ${author}
   - Category: ${topic.category}
   - Tags: ${topic.tags.join(', ')}`);
    console.log(`🔗 URL: https://theprofitplatform.com.au/blog/${slug}`);
    console.log(`\n📋 Remaining topics in queue: ${queue.queue.length}`);

    // 20. Send Discord notification (if webhook configured)
    await sendDiscordNotification({
      title: topic.title,
      url: `https://theprofitplatform.com.au/blog/${slug}`,
      wordCount,
      author,
      category: topic.category,
      slug
    });

    return {
      success: true,
      topic,
      filepath,
      slug,
      wordCount,
      author
    };

  } catch (error) {
    console.error('\n❌ Error generating blog post with DeepSeek:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Add internal links to relevant service pages
 */
async function addInternalLinks(content) {
  const linkMap = {
    // SEO links
    'local seo': '/seo',
    'search engine optimization': '/seo',
    'seo strategy': '/seo',
    'seo services': '/seo',

    // Google Ads links
    'google ads': '/google-ads',
    'ppc campaign': '/google-ads',
    'paid advertising': '/google-ads',

    // Web Design links
    'web design': '/web-design',
    'website design': '/web-design',
    'responsive design': '/web-design',

    // General services
    'digital marketing': '/services',
    'marketing strategy': '/services',

    // Tools (if mentioned)
    'seo audit': '/tools/seo-audit',
    'keyword research': '/tools/keyword-research',
    'speed test': '/tools/speed-test'
  };

  let linkedContent = content;
  let linksAdded = 0;
  const maxLinks = 3;
  const linkedPhrases = new Set();

  // Find first occurrence of each keyword and add link
  for (const [keyword, url] of Object.entries(linkMap)) {
    if (linksAdded >= maxLinks) break;

    // Skip if already linked
    if (linkedPhrases.has(keyword)) continue;

    // Find first occurrence of keyword (case-insensitive, not already linked)
    const regex = new RegExp(
      `(?<!\\[)\\b(${keyword})\\b(?!\\]|\\()`,
      'i'
    );
    const match = linkedContent.match(regex);

    if (match) {
      const matchedText = match[1];
      linkedContent = linkedContent.replace(
        regex,
        `[${matchedText}](${url})`
      );
      linkedPhrases.add(keyword);
      linksAdded++;
      console.log(`   ✓ Added link: "${matchedText}" → ${url}`);
    }
  }

  console.log(`   Total internal links: ${linksAdded}`);
  return linkedContent;
}

/**
 * Send Discord notification about new blog post
 * @param {Object} data - Blog post data
 */
async function sendDiscordNotification(data) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('\n⚠️  Discord webhook not configured, skipping notification');
    return;
  }

  console.log('\n📤 Sending Discord notification...');

  try {
    const embed = {
      title: '✅ New Blog Post Generated with DeepSeek!',
      description: data.title,
      color: 0x3b82f6, // Blue
      fields: [
        {
          name: '📊 Word Count',
          value: `${data.wordCount} words`,
          inline: true
        },
        {
          name: '✍️ Author',
          value: data.author,
          inline: true
        },
        {
          name: '📁 Category',
          value: data.category,
          inline: true
        },
        {
          name: '🔗 URL',
          value: data.url,
          inline: false
        }
      ],
      footer: {
        text: '🤖 DeepSeek Blog Generation'
      },
      timestamp: new Date().toISOString()
    };

    const payload = {
      username: 'Blog Bot (DeepSeek)',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/6134/6134346.png',
      embeds: [embed]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API error: ${response.status} ${errorText}`);
    }

    console.log('   ✓ Discord notification sent successfully');
  } catch (error) {
    console.error('   ✗ Failed to send Discord notification:', error.message);
    // Don't fail the whole process for notification errors
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBlogPostWithDeepSeek();
}

export { generateBlogPostWithDeepSeek };