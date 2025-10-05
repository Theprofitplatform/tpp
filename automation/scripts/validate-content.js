import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Validate generated blog content against quality standards
 */
async function validateContent() {
  try {
    console.log('\n🔍 Starting content validation...\n');

    // Find today's blog post
    const today = new Date().toISOString().split('T')[0];
    const blogDir = path.join(projectRoot, 'src/content/blog');
    const files = await fs.readdir(blogDir);
    const todayFile = files.find(f => f.startsWith(today));

    if (!todayFile) {
      throw new Error(`❌ No blog post generated today (${today})`);
    }

    const filepath = path.join(blogDir, todayFile);
    const fileContent = await fs.readFile(filepath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(fileContent);

    console.log(`📄 Validating: ${todayFile}\n`);

    const errors = [];
    const warnings = [];

    // === FRONTMATTER VALIDATION ===
    console.log('📋 Checking frontmatter...');

    const requiredFields = [
      'title',
      'description',
      'publishDate',
      'category',
      'tags',
      'author'
    ];

    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        errors.push(`Missing required frontmatter field: ${field}`);
      } else {
        console.log(`   ✓ ${field}: ${JSON.stringify(frontmatter[field]).substring(0, 50)}...`);
      }
    });

    // Author validation
    if (frontmatter.author && !['Avi', 'TPP Team'].includes(frontmatter.author)) {
      warnings.push(`Author should be "Avi" or "TPP Team", got: ${frontmatter.author}`);
    }

    // === META DESCRIPTION VALIDATION ===
    console.log('\n🔍 Checking SEO meta description...');

    if (frontmatter.description) {
      const descLength = frontmatter.description.length;
      if (descLength < 120) {
        errors.push(`Meta description too short: ${descLength} chars (minimum 120)`);
      } else if (descLength > 160) {
        errors.push(`Meta description too long: ${descLength} chars (maximum 160)`);
      } else {
        console.log(`   ✓ Length: ${descLength} chars`);
      }
    } else {
      errors.push('Missing meta description');
    }

    // === CONTENT LENGTH VALIDATION ===
    console.log('\n📏 Checking content length...');

    const wordCount = markdown.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`   Word count: ${wordCount}`);

    if (wordCount < 1500) {
      errors.push(`Word count too low: ${wordCount} (minimum 1500 for SEO)`);
    } else if (wordCount > 3000) {
      warnings.push(`Word count very high: ${wordCount} (may be too long for readers)`);
    } else {
      console.log(`   ✓ Word count within range`);
    }

    // === HEADING STRUCTURE VALIDATION ===
    console.log('\n📑 Checking heading structure...');

    const h1Count = (markdown.match(/^# .+$/gm) || []).length;
    const h2Count = (markdown.match(/^## .+$/gm) || []).length;
    const h3Count = (markdown.match(/^### .+$/gm) || []).length;

    console.log(`   H1: (from frontmatter), H2: ${h2Count}, H3: ${h3Count}`);

    // In Astro, the H1 is generated from frontmatter.title.
    // The markdown content should start with H2.
    if (!frontmatter.title) {
      errors.push('No title found in frontmatter (this becomes the H1)');
    }
    if (h1Count > 0) {
      warnings.push('H1 heading found in markdown body. This should be removed as the title from frontmatter is used as the H1.');
    }

    if (h2Count < 5) {
      errors.push(`Not enough H2 headings: ${h2Count} (minimum 5 for scannability)`);
    }

    if (h2Count + h3Count < 8) {
      warnings.push(`Total headings: ${h2Count + h3Count}. Consider adding more subsections.`);
    } else {
      console.log(`   ✓ Good heading structure`);
    }

    // === LINKS VALIDATION ===
    console.log('\n🔗 Checking links...');

    const internalLinks = (markdown.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    const externalLinks = (markdown.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;

    console.log(`   Internal: ${internalLinks}, External: ${externalLinks}`);

    if (internalLinks < 2) {
      warnings.push(`Few internal links: ${internalLinks} (recommended: 2-3 for SEO)`);
    } else {
      console.log(`   ✓ Good internal linking`);
    }

    if (externalLinks < 1) {
      errors.push('No external authority links. At least 1 is required for E-E-A-T.');
    } else {
      console.log(`   ✓ Has external references`);
    }

    // === TAGS VALIDATION ===
    console.log('\n🏷️  Checking tags...');

    if (frontmatter.tags) {
      const tagCount = frontmatter.tags.length;
      console.log(`   Tag count: ${tagCount}`);

      if (tagCount < 3) {
        warnings.push(`Few tags: ${tagCount} (recommended: 3-5)`);
      } else if (tagCount > 7) {
        warnings.push(`Many tags: ${tagCount} (keep focused: 3-5)`);
      } else {
        console.log(`   ✓ Good tag count`);
      }
    }

    // === PARAGRAPH STRUCTURE VALIDATION ===
    console.log('\n📝 Checking paragraph structure...');

    const paragraphs = markdown.split('\n\n').filter(p => {
      return p.trim().length > 0 && !p.startsWith('#') && !p.startsWith('-') && !p.startsWith('*');
    });

    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 100);

    if (longParagraphs.length > 0) {
      warnings.push(`${longParagraphs.length} paragraphs are very long (>100 words). Consider breaking them up.`);
    } else {
      console.log(`   ✓ Paragraphs are scannable`);
    }

    // === SYDNEY-SPECIFIC CONTENT ===
    console.log('\n🏙️  Checking Sydney-specific content...');

    const sydneyMentions = (markdown.match(/\bSydney\b/gi) || []).length;
    const australianSpelling = markdown.match(/\b(optimise|optimising|colour|centre|analyse)\b/gi) || [];

    console.log(`   Sydney mentions: ${sydneyMentions}`);
    console.log(`   Australian spelling found: ${australianSpelling.length > 0 ? 'Yes' : 'No'}`);

    if (sydneyMentions < 2) {
      warnings.push('Content should reference Sydney more for local SEO');
    }

    // === LIST AND BULLET POINTS ===
    console.log('\n📋 Checking scannability features...');

    const bulletPoints = (markdown.match(/^[-*] .+$/gm) || []).length;
    const numberedLists = (markdown.match(/^\d+\. .+$/gm) || []).length;

    console.log(`   Bullet points: ${bulletPoints}`);
    console.log(`   Numbered lists: ${numberedLists}`);

    if (bulletPoints + numberedLists < 5) {
      warnings.push('Consider adding more lists/bullets for scannability');
    } else {
      console.log(`   ✓ Content is scannable`);
    }

    // === READABILITY CHECK ===
    console.log('\n👁️  Checking readability...');

    const avgWordsPerSentence = wordCount / (markdown.match(/[.!?]+/g) || []).length;
    console.log(`   Avg words per sentence: ${avgWordsPerSentence.toFixed(1)}`);

    if (avgWordsPerSentence > 25) {
      warnings.push(`Long sentences detected (avg ${avgWordsPerSentence.toFixed(1)} words). Keep under 20 for readability.`);
    } else {
      console.log(`   ✓ Sentences are readable`);
    }

    // === KEYWORD DENSITY CHECK ===
    if (frontmatter.seo && frontmatter.seo.keywords && frontmatter.seo.keywords[0]) {
      console.log('\n🎯 Checking keyword usage...');

      const targetKeyword = frontmatter.seo.keywords[0].toLowerCase();
      const contentLower = markdown.toLowerCase();
      
      // Flexible keyword check: count individual words from the phrase
      const keywordParts = targetKeyword.split(/\s+/).filter(p => p.length > 2);
      let totalOccurrences = 0;
      const foundKeywords = new Set();

      keywordParts.forEach(part => {
        const partRegex = new RegExp(`\\b${part}\\b`, 'gi');
        const count = (contentLower.match(partRegex) || []).length;
        if (count > 0) {
          foundKeywords.add(part);
          totalOccurrences += count;
        }
      });

      const keywordDensity = (totalOccurrences / wordCount) * 100;
      const keywordCoverage = (foundKeywords.size / keywordParts.length) * 100;

      console.log(`   Target keyword phrase: "${targetKeyword}"`);
      console.log(`   Individual keyword parts found: ${foundKeywords.size} of ${keywordParts.length} (${[...foundKeywords].join(', ')})`);
      console.log(`   Total occurrences of parts: ${totalOccurrences}`);
      console.log(`   Keyword Density (based on parts): ${keywordDensity.toFixed(2)}%`);
      console.log(`   Keyword Coverage: ${keywordCoverage.toFixed(0)}%`);

      if (keywordCoverage < 75) {
         warnings.push(`Low keyword coverage: Only ${keywordCoverage.toFixed(0)}% of keyword parts found. Aim for >75%.`);
      }
      if (keywordDensity < 0.8) {
        warnings.push(`Low keyword density: ${keywordDensity.toFixed(2)}% (aim for 1-2%)`);
      } else if (keywordDensity > 3) {
        warnings.push(`High keyword density: ${keywordDensity.toFixed(2)}% (may look like stuffing)`);
      } else {
        console.log(`   ✓ Good keyword density and coverage`);
      }
    }

    // === RESULTS SUMMARY ===
    console.log('\n' + '='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ VALIDATION FAILED - Critical Errors:\n');
      errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS - Consider Improvements:\n');
      warnings.forEach((warn, i) => {
        console.log(`${i + 1}. ${warn}`);
      });
    }

    if (errors.length === 0) {
      console.log('\n✅ VALIDATION PASSED!');
      console.log('\nContent Quality Score:');
      const score = Math.max(0, 100 - (warnings.length * 5));
      console.log(`   ${score}/100 ${score >= 90 ? '🌟' : score >= 75 ? '👍' : '⚠️'}`);
      console.log(`\n📊 Final Stats:`);
      console.log(`   - Word count: ${wordCount}`);
      console.log(`   - Headings: ${h2Count + h3Count}`);
      console.log(`   - Internal links: ${internalLinks}`);
      console.log(`   - External links: ${externalLinks}`);
      console.log(`   - Sydney mentions: ${sydneyMentions}`);

      return true;
    } else {
      console.log('\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Validation error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateContent();
}

export { validateContent };
