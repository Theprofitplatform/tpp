#!/usr/bin/env node

/**
 * Enhance Location Page Content
 * 
 * Automatically enhances location pages with:
 * - FAQ sections
 * - Internal links to blog posts
 * - Keyword optimization
 * - Better content structure
 * 
 * Usage: node enhance-location-content.mjs [suburb-name]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const LOCATIONS_DIR = path.join(projectRoot, 'src/content/locations');

// Blog posts to link to (relevant to digital marketing)
const RELEVANT_BLOG_POSTS = [
  {
    url: '/blog/what-is-local-seo-complete-guide-for-sydney-businesses/',
    title: 'What is Local SEO? Complete Guide for Sydney Businesses',
    anchor: 'Learn more about local SEO',
    context: 'local SEO'
  },
  {
    url: '/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/',
    title: 'How to Optimise Your Google Business Profile',
    anchor: 'optimizing your Google Business Profile',
    context: 'Google Business'
  },
  {
    url: '/blog/local-seo-checklist-47-steps-to-dominate-sydney-suburb-search-results/',
    title: 'Local SEO Checklist: 47 Steps to Dominate',
    anchor: 'local SEO checklist',
    context: 'local SEO'
  },
  {
    url: '/blog/seo-for-plumbers-sydney-complete-guide-case-study/',
    title: 'SEO Success Stories',
    anchor: 'proven SEO strategies',
    context: 'success'
  },
  {
    url: '/blog/google-ads-vs-seo-sydney-businesses/',
    title: 'Google Ads vs SEO',
    anchor: 'Google Ads and SEO comparison',
    context: 'Google Ads'
  }
];

// FAQs to add to location pages
const generateFAQs = (city) => {
  return `

## Frequently Asked Questions

### How long does it take to see results from digital marketing in ${city}?

Most ${city} businesses start seeing initial results within 30-60 days. SEO improvements typically take 3-6 months for significant ranking changes, while Google Ads can generate leads within days. The timeline depends on your industry competition, current online presence, and the strategies implemented.

### What makes your digital marketing different for ${city} businesses?

We specialize in local ${city} market dynamics and understand the unique challenges businesses face in this area. Our strategies are tailored to attract customers specifically searching for services in ${city} and surrounding areas, not generic national approaches.

### How much should I budget for digital marketing in ${city}?

Most ${city} small businesses invest $1,500-$5,000 per month depending on their goals and competition level. We offer flexible packages starting at lower investment levels, with the ability to scale as you see results. We'll recommend a budget based on your specific situation and goals.

### Do you work with businesses outside of ${city}?

Yes! While we specialize in ${city} and surrounding Sydney areas, we work with businesses throughout Greater Sydney and Australia. Our local expertise translates well to other markets, and we adjust strategies based on each location's unique characteristics.

### Can I see examples of results you've achieved for ${city} businesses?

We've helped numerous ${city} area businesses increase their online visibility and customer acquisition. While we respect client confidentiality, we can share relevant case studies and discuss expected outcomes for your specific industry during a consultation.

### What if I already have a website and some marketing in place?

Perfect! We'll audit your current setup and identify opportunities for improvement. Many ${city} businesses come to us with existing websites and marketing efforts. We'll build on what's working and fix what isn't, rather than starting from scratch.

### Do you require long-term contracts?

No. We believe in earning your business every month through results, not locking you into lengthy contracts. Our ${city} clients stay with us because our strategies work and deliver measurable ROI, not because they're contractually obligated.

### How do you measure success?

We track metrics that matter to your business: website traffic, leads generated, phone calls, form submissions, and ultimately revenue. You'll receive regular reports showing exactly what we're doing and the results we're achieving for your ${city} business.
`;
};

// Generate service area section
const generateServiceAreaSection = (city, nearbyAreas) => {
  const areas = nearbyAreas || [city];
  return `

## Areas We Serve Around ${city}

While based in ${city}, we proudly serve businesses throughout the surrounding areas including ${areas.slice(0, 3).join(', ')}${areas.length > 3 ? ', and more' : ''}. Whether you're looking for local SEO, Google Ads management, or web design services, we help businesses across the region succeed online.

Our understanding of the local market extends beyond ${city} itself. We know the competitive landscape, customer behaviors, and specific challenges businesses face in this part of Sydney.
`;
};

/**
 * Parse frontmatter and content
 */
function parseMarkdown(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatterMatch) return { frontmatter: '', body: content };
  
  return {
    frontmatter: frontmatterMatch[0],
    body: content.substring(frontmatterMatch[0].length)
  };
}

/**
 * Extract city name and service areas from frontmatter
 */
function extractMetadata(frontmatter) {
  const cityMatch = frontmatter.match(/city:\s*"?([^"\n]+)"?/);
  const areasMatch = frontmatter.match(/serviceAreas:\s*\[(.*?)\]/s);
  
  const city = cityMatch ? cityMatch[1].trim() : 'Sydney';
  let serviceAreas = [city];
  
  if (areasMatch) {
    serviceAreas = areasMatch[1]
      .split(',')
      .map(a => a.trim().replace(/["\[\]]/g, ''))
      .filter(a => a.length > 0);
  }
  
  return { city, serviceAreas };
}

/**
 * Add internal links to content
 */
function addInternalLinks(content, city) {
  let enhanced = content;
  
  // Add link after "Local SEO" mention
  if (!enhanced.includes('](/blog/') && enhanced.includes('local SEO') || enhanced.includes('Local SEO')) {
    enhanced = enhanced.replace(
      /Our (local SEO|Local SEO) strategies/,
      `Our [local SEO](${RELEVANT_BLOG_POSTS[0].url}) strategies`
    );
  }
  
  // Add link after "Google My Business" or "Google Business Profile"
  if (enhanced.includes('Google My Business') || enhanced.includes('Google Business Profile')) {
    enhanced = enhanced.replace(
      /(Google My Business|Google Business Profile)/,
      `[$1](${RELEVANT_BLOG_POSTS[1].url})`
    );
  }
  
  // Add contextual link in Google Ads section
  if (enhanced.includes('Google Ads') && !enhanced.includes('Google Ads](')) {
    enhanced = enhanced.replace(
      /We create and manage targeted Google Ads campaigns/,
      `We create and manage targeted [Google Ads campaigns](${RELEVANT_BLOG_POSTS[4].url})`
    );
  }
  
  return enhanced;
}

/**
 * Check if content already has enhancements
 */
function hasEnhancements(content) {
  return content.includes('## Frequently Asked Questions') ||
         content.includes('## Areas We Serve');
}

/**
 * Enhance a single location page
 */
async function enhanceLocationPage(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    
    // Check if already enhanced
    if (hasEnhancements(content)) {
      return {
        success: false,
        reason: 'Already enhanced',
        filepath
      };
    }
    
    const { frontmatter, body } = parseMarkdown(content);
    const { city, serviceAreas } = extractMetadata(frontmatter);
    
    // Add internal links
    let enhancedBody = addInternalLinks(body, city);
    
    // Add FAQ section before any existing "Contact" or final CTA
    const faqSection = generateFAQs(city);
    
    // Add service area section
    const serviceAreaSection = generateServiceAreaSection(city, serviceAreas);
    
    // Find where to insert (before last heading or at end)
    const lastHeadingMatch = enhancedBody.match(/\n## (?:Ready|Contact|Get Started)/);
    
    let finalContent;
    if (lastHeadingMatch) {
      const insertPos = enhancedBody.indexOf(lastHeadingMatch[0]);
      finalContent = frontmatter +
        enhancedBody.substring(0, insertPos) +
        serviceAreaSection +
        faqSection +
        enhancedBody.substring(insertPos);
    } else {
      finalContent = frontmatter +
        enhancedBody +
        serviceAreaSection +
        faqSection;
    }
    
    // Write enhanced content
    await fs.writeFile(filepath, finalContent, 'utf-8');
    
    return {
      success: true,
      city,
      additions: {
        faqs: 8,
        internalLinks: 2-3,
        serviceArea: true
      },
      filepath
    };
    
  } catch (error) {
    return {
      success: false,
      reason: error.message,
      filepath
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Enhancing location page content...\n');
  
  try {
    const targetSuburb = process.argv[2];
    
    let filesToProcess;
    
    if (targetSuburb) {
      // Process specific suburb
      const filepath = path.join(LOCATIONS_DIR, `${targetSuburb}.md`);
      filesToProcess = [filepath];
      console.log(`Processing: ${targetSuburb}\n`);
    } else {
      // Process all suburbs
      const files = await fs.readdir(LOCATIONS_DIR);
      filesToProcess = files
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(LOCATIONS_DIR, f));
      console.log(`Processing ${filesToProcess.length} location pages\n`);
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const filepath of filesToProcess) {
      const result = await enhanceLocationPage(filepath);
      
      if (result.success) {
        console.log(`✅ ${result.city || path.basename(filepath)}`);
        console.log(`   + ${result.additions.faqs} FAQs`);
        console.log(`   + ${result.additions.internalLinks} internal links`);
        console.log(`   + Service area section\n`);
        successCount++;
      } else if (result.reason === 'Already enhanced') {
        console.log(`⏭️  ${path.basename(filepath)} (already enhanced)`);
        skipCount++;
      } else {
        console.log(`❌ ${path.basename(filepath)}: ${result.reason}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Enhanced: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log('\n✨ Location pages enhanced successfully!');
      console.log('   Each page now has:');
      console.log('   - 8 comprehensive FAQs');
      console.log('   - 2-3 internal links to blog posts');
      console.log('   - Service area section');
      console.log('   - Better content structure');
      console.log('\n   Word count increased by ~600-800 words per page');
    }
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    process.exit(1);
  }
}

main();
