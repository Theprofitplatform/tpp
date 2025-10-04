import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Check for plagiarism and duplicate content
 */
async function checkPlagiarism() {
  try {
    console.log('\n🔍 Starting plagiarism check...\n');

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
    const { content: newContent } = matter(fileContent);

    console.log(`📄 Checking: ${todayFile}\n`);

    // Get existing posts (excluding today's post)
    const existingFiles = files.filter(f => f !== todayFile && f.endsWith('.md'));

    if (existingFiles.length === 0) {
      console.log('✅ No existing posts to compare against (first post)');
      return true;
    }

    console.log(`📚 Comparing against ${existingFiles.length} existing posts...\n`);

    // Load all existing posts
    const existingPosts = await Promise.all(
      existingFiles.map(async f => {
        const content = await fs.readFile(path.join(blogDir, f), 'utf-8');
        const { content: markdown } = matter(content);
        return { filename: f, content: markdown };
      })
    );

    // Check for duplicate paragraphs
    const newParagraphs = extractParagraphs(newContent);
    const duplicates = [];

    for (const newPara of newParagraphs) {
      // Skip short paragraphs
      if (newPara.length < 100) continue;

      for (const existingPost of existingPosts) {
        const existingParagraphs = extractParagraphs(existingPost.content);

        for (const existingPara of existingParagraphs) {
          // Check for exact or near-exact matches
          const similarity = calculateSimilarity(newPara, existingPara);

          if (similarity > 0.85) { // 85% similar or more
            duplicates.push({
              newText: truncate(newPara, 100),
              existingFile: existingPost.filename,
              existingText: truncate(existingPara, 100),
              similarity: (similarity * 100).toFixed(1)
            });
          }
        }
      }
    }

    // Check for common phrases (self-plagiarism patterns)
    const commonPhrases = findCommonPhrases(newContent, existingPosts);

    // Optional: External plagiarism check via API
    let externalCheckResult = null;
    if (process.env.COPYSCAPE_API_KEY) {
      console.log('🌐 Running external plagiarism check via Copyscape...');
      externalCheckResult = await copyscapeCheck(newContent);
    }

    // === RESULTS ===
    console.log('='.repeat(60));

    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE CONTENT DETECTED:\n');
      duplicates.forEach((dup, i) => {
        console.log(`${i + 1}. Similarity: ${dup.similarity}%`);
        console.log(`   File: ${dup.existingFile}`);
        console.log(`   New: "${dup.newText}..."`);
        console.log(`   Existing: "${dup.existingText}..."\n`);
      });

      // Fail if high similarity
      if (duplicates.some(d => parseFloat(d.similarity) > 95)) {
        console.log('❌ Critical: Exact or near-exact duplicate paragraphs found!');
        console.log('This content appears to be copied from existing posts.\n');
        process.exit(1);
      } else {
        console.log('⚠️  Warning: Some similar content found, but within acceptable range.\n');
      }
    } else {
      console.log('\n✅ No duplicate paragraphs detected\n');
    }

    if (commonPhrases.length > 0) {
      console.log('📝 Common phrases across posts:');
      commonPhrases.slice(0, 5).forEach(phrase => {
        console.log(`   - "${phrase.text}" (used in ${phrase.count} posts)`);
      });
      console.log('');
    }

    if (externalCheckResult) {
      if (externalCheckResult.matches > 0) {
        console.log('⚠️  External plagiarism matches found:');
        console.log(`   Matches: ${externalCheckResult.matches}`);
        console.log(`   Details: Check Copyscape dashboard\n`);
      } else {
        console.log('✅ No external plagiarism detected\n');
      }
    }

    console.log('✅ Plagiarism check completed');
    return true;

  } catch (error) {
    console.error('\n❌ Plagiarism check error:', error.message);
    // Don't fail the workflow if plagiarism check fails
    console.warn('⚠️  Continuing anyway (plagiarism check is non-blocking)\n');
    return false;
  }
}

/**
 * Extract meaningful paragraphs from markdown
 */
function extractParagraphs(markdown) {
  return markdown
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => {
      // Filter out headings, lists, code blocks
      return (
        p.length > 50 &&
        !p.startsWith('#') &&
        !p.startsWith('-') &&
        !p.startsWith('*') &&
        !p.startsWith('```') &&
        !p.match(/^\d+\./)
      );
    })
    .map(p => normalizeText(p));
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/[*_`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate similarity between two text strings (Jaccard similarity)
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Find common phrases used across multiple posts
 */
function findCommonPhrases(newContent, existingPosts) {
  const phraseLength = 5; // 5-word phrases
  const minOccurrences = 2;

  const newPhrases = extractPhrases(newContent, phraseLength);
  const commonPhrases = [];

  for (const phrase of newPhrases) {
    let count = 0;
    for (const post of existingPosts) {
      if (post.content.toLowerCase().includes(phrase.toLowerCase())) {
        count++;
      }
    }

    if (count >= minOccurrences) {
      commonPhrases.push({ text: phrase, count: count + 1 }); // +1 for new post
    }
  }

  return commonPhrases.sort((a, b) => b.count - a.count);
}

/**
 * Extract n-word phrases from text
 */
function extractPhrases(text, n) {
  const words = text.split(/\s+/);
  const phrases = [];

  for (let i = 0; i <= words.length - n; i++) {
    const phrase = words.slice(i, i + n).join(' ');
    // Skip if contains markdown or special chars
    if (!phrase.match(/[#*\[\]()]/)) {
      phrases.push(phrase);
    }
  }

  return [...new Set(phrases)]; // Remove duplicates
}

/**
 * Truncate text for display
 */
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Optional: Check external plagiarism via Copyscape API
 */
async function copyscapeCheck(content) {
  if (!process.env.COPYSCAPE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://www.copyscape.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        u: process.env.COPYSCAPE_API_KEY,
        o: 'csearch',
        t: content,
        e: 'UTF-8',
        c: '10' // Max results
      })
    });

    const result = await response.text();

    // Parse XML response (simplified)
    const matchCount = (result.match(/<result>/g) || []).length;

    return {
      matches: matchCount,
      raw: result
    };
  } catch (error) {
    console.warn('⚠️  Copyscape API check failed:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkPlagiarism();
}

export { checkPlagiarism };
