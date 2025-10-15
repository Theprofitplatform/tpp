#!/usr/bin/env node
/**
 * Keyword Research Tool
 * Uses DataForSEO API to get real keyword data
 */

import { researchKeyword, getKeywordDifficulty } from '../utils/dataforseo-helper.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function performKeywordResearch(keyword, location = 'Australia') {
  console.log('\n🔍 Keyword Research Tool\n');
  console.log('━'.repeat(60));

  try {
    const research = await researchKeyword(keyword, location);

    console.log('\n📊 Main Keyword Analysis\n');
    console.log(`   Keyword: "${research.mainKeyword.keyword}"`);
    console.log(`   Search Volume: ${research.mainKeyword.searchVolume.toLocaleString()}/month`);
    console.log(`   Competition: ${research.mainKeyword.competition}`);
    console.log(`   CPC: $${research.mainKeyword.cpcUsd.toFixed(2)}`);

    console.log('\n━'.repeat(60));
    console.log('\n🎯 Related Keywords (Top 10)\n');
    research.relatedKeywords.slice(0, 10).forEach((kw, i) => {
      console.log(`   ${i + 1}. "${kw.keyword}"`);
      console.log(`      Volume: ${kw.searchVolume.toLocaleString()}/mo | Competition: ${kw.competition}`);
    });

    if (research.questions.length > 0) {
      console.log('\n━'.repeat(60));
      console.log('\n❓ Question Keywords\n');
      research.questions.forEach((q, i) => {
        console.log(`   ${i + 1}. "${q.keyword}" (${q.searchVolume.toLocaleString()}/mo)`);
      });
    }

    if (research.topCompetitors.length > 0) {
      console.log('\n━'.repeat(60));
      console.log('\n🏆 Top 10 Ranking Pages\n');
      research.topCompetitors.forEach((comp, i) => {
        console.log(`   ${i + 1}. ${comp.title}`);
        console.log(`      ${comp.domain} | ${comp.url}`);
      });
    }

    console.log('\n━'.repeat(60));
    console.log('\n💡 Content Recommendations\n');
    console.log(`   Target Word Count: ${research.contentSuggestions.targetWordCount}`);
    console.log(`   Format: ${research.contentSuggestions.recommendedFormat}`);
    if (research.questions.length > 0) {
      console.log(`   Include FAQ: Yes (${research.questions.length} questions found)`);
    }

    // Get difficulty scores for top keywords
    console.log('\n━'.repeat(60));
    console.log('\n📈 Keyword Difficulty Analysis\n');

    const topKeywords = research.relatedKeywords.slice(0, 5).map(k => k.keyword);
    const difficulties = await getKeywordDifficulty([keyword, ...topKeywords], location);

    difficulties.forEach(diff => {
      console.log(`   "${diff.keyword}"`);
      console.log(`   Difficulty: ${diff.difficulty}/100 (${diff.difficultyLevel})\n`);
    });

    // Save research
    const timestamp = new Date().toISOString().split('T')[0];
    const safeKeyword = keyword.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const reportPath = path.join(
      projectRoot,
      `automation/keyword-research/${safeKeyword}-${timestamp}.json`
    );

    await fs.mkdir(path.join(projectRoot, 'automation/keyword-research'), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(research, null, 2));

    console.log('━'.repeat(60));
    console.log(`\n✅ Research saved to: automation/keyword-research/${safeKeyword}-${timestamp}.json\n`);

    // Generate blog post idea
    console.log('━'.repeat(60));
    console.log('\n📝 Blog Post Idea\n');
    console.log(`   Title: "${generateTitle(keyword, research)}"`);
    console.log(`   Target Keywords: ${[keyword, ...research.relatedKeywords.slice(0, 4).map(k => k.keyword)].join(', ')}`);
    console.log(`   Estimated Difficulty: ${difficulties[0]?.difficultyLevel || 'Unknown'}`);
    console.log(`   Potential Monthly Traffic: ${Math.round(research.mainKeyword.searchVolume * 0.15).toLocaleString()} visits`);
    console.log('\n   Suggested Outline:');
    console.log(`   1. Introduction - Address the main question`);
    console.log(`   2. ${research.relatedKeywords[0]?.keyword || 'Key concept 1'}`);
    console.log(`   3. ${research.relatedKeywords[1]?.keyword || 'Key concept 2'}`);
    console.log(`   4. ${research.relatedKeywords[2]?.keyword || 'Key concept 3'}`);
    if (research.questions.length > 0) {
      console.log(`   5. FAQ Section`);
      research.questions.slice(0, 3).forEach((q, i) => {
        console.log(`      - ${q.keyword}`);
      });
    }
    console.log(`   6. Conclusion with CTA\n`);

    console.log('━'.repeat(60) + '\n');

    return research;

  } catch (err) {
    if (err.message.includes('not configured')) {
      console.log('\n❌ DataForSEO API not configured\n');
      console.log('To enable real keyword data:');
      console.log('1. Sign up at https://dataforseo.com/');
      console.log('2. Get your credentials from dashboard');
      console.log('3. Add to .env.local:');
      console.log('   DATAFORSEO_LOGIN=your_login');
      console.log('   DATAFORSEO_PASSWORD=your_password\n');
      console.log('💰 Cost: ~$0.05-0.075 per keyword research request\n');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

function generateTitle(keyword, research) {
  // Generate SEO-friendly title based on research
  const templates = [
    `${capitalize(keyword)}: Complete Guide for Sydney Businesses`,
    `How to ${keyword.replace(/^how to /i, '')} in Sydney [2025 Guide]`,
    `${research.mainKeyword.searchVolume > 1000 ? 'Ultimate' : 'Complete'} Guide to ${capitalize(keyword)}`,
    `${capitalize(keyword)}: Everything Sydney Business Owners Need to Know`
  ];

  return templates[0];
}

function capitalize(str) {
  return str.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Get keyword from command line
const keyword = process.argv.slice(2).join(' ');

if (!keyword) {
  console.log('\n❌ Usage: npm run blog:keyword-research <keyword>\n');
  console.log('Example: npm run blog:keyword-research local seo sydney\n');
  process.exit(1);
}

performKeywordResearch(keyword);
