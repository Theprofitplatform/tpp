#!/usr/bin/env node
/**
 * A/B Testing System for Headlines and Meta Descriptions
 * Generates and tests variations to improve CTR
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateVariations(slug) {
  console.log(`\n🧪 A/B Testing: Generating Headline Variations\n`);
  console.log('━'.repeat(60));

  // Load the post
  const postPath = path.join(projectRoot, 'src/content/blog', `${slug}.md`);
  let postContent;
  try {
    postContent = await fs.readFile(postPath, 'utf-8');
  } catch (err) {
    console.log(`❌ Could not read post: ${slug}\n`);
    return;
  }

  const { data: frontmatter, content } = matter(postContent);

  console.log(`\n📝 Original Post:\n`);
  console.log(`   Title: ${frontmatter.title}`);
  console.log(`   Description: ${frontmatter.description || 'None'}`);
  console.log(`   Category: ${frontmatter.category}\n`);

  console.log('━'.repeat(60));
  console.log('\n🤖 Generating variations with Claude...\n');

  const prompt = `You are an expert copywriter specializing in SEO and conversion optimization. Generate A/B test variations for this blog post.

CURRENT HEADLINE: ${frontmatter.title}
CURRENT META DESCRIPTION: ${frontmatter.description || 'None'}
CATEGORY: ${frontmatter.category}
CONTENT PREVIEW: ${content.substring(0, 500)}...

TASK: Generate 5 headline variations and 5 meta description variations designed to improve click-through rate (CTR).

For HEADLINES, test these psychological triggers:
1. Curiosity Gap - "The Secret to X That Nobody Tells You"
2. Urgency - "X Things You Need to Do Right Now"
3. Social Proof - "How X Sydney Businesses Got Y Results"
4. Specific Numbers - "7 Proven Ways to X in Sydney [2025]"
5. Question Format - "Are You Making These X Mistakes?"

For META DESCRIPTIONS (150-160 characters each):
1. Include primary keyword
2. Promise a specific benefit
3. Create urgency or curiosity
4. Include location (Sydney) if relevant
5. End with a call-to-action

Format your response as:

HEADLINE VARIATIONS:
1. [Variation type] - "Headline text"
2. [Variation type] - "Headline text"
...

META DESCRIPTION VARIATIONS:
1. [Variation type] - "Description text"
2. [Variation type] - "Description text"
...

RECOMMENDATION:
[Your top recommendation with reasoning]`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const variations = response.content[0].text;

    console.log('✅ Variations Generated:\n');
    console.log(variations);

    // Save A/B test plan
    const testPath = path.join(projectRoot, `automation/ab-tests/${slug}.md`);
    await fs.mkdir(path.join(projectRoot, 'automation/ab-tests'), { recursive: true });

    const testPlan = `# A/B Test Plan: ${frontmatter.title}

Generated: ${new Date().toISOString()}

## Original Version (Control)

**Headline:** ${frontmatter.title}
**Meta Description:** ${frontmatter.description || 'None'}

## Test Variations

${variations}

## Testing Protocol

### Phase 1: Headline Testing (2 weeks)
1. Run control vs top headline variation
2. Track:
   - Click-through rate (CTR) from search results
   - Engagement rate
   - Bounce rate
   - Time on page

### Phase 2: Meta Description Testing (2 weeks)
1. Winner from Phase 1 vs meta description variations
2. Track same metrics

### Success Metrics
- **Primary:** CTR improvement > 10%
- **Secondary:** Engagement rate improvement > 5%
- **Guard:** Bounce rate increase < 5%

### Implementation Checklist
- [ ] Set up tracking for both versions
- [ ] Run test for minimum 2 weeks (statistical significance)
- [ ] Collect minimum 100 impressions per variation
- [ ] Analyze results
- [ ] Implement winner
- [ ] Document learnings

## Test Data Template

| Variation | Impressions | Clicks | CTR | Engagement | Bounce Rate | Winner? |
|-----------|------------|--------|-----|------------|-------------|---------|
| Control   |            |        |     |            |             |         |
| Variation 1|            |        |     |            |             |         |
| Variation 2|            |        |     |            |             |         |

## Notes

_Record observations, insights, and learnings here_
`;

    await fs.writeFile(testPath, testPlan);

    console.log('\n━'.repeat(60));
    console.log(`\n✅ A/B test plan saved to: automation/ab-tests/${slug}.md\n`);
    console.log('━'.repeat(60));
    console.log('\n📊 Next Steps:\n');
    console.log('  1. Choose your top variation');
    console.log('  2. Update post frontmatter with variation');
    console.log('  3. Run for 2 weeks');
    console.log('  4. Analyze Search Console CTR data');
    console.log('  5. Implement winner permanently\n');
    console.log('━'.repeat(60) + '\n');

  } catch (err) {
    console.error('❌ Error generating variations:', err.message);
  }
}

// Get slug from command line
const slug = process.argv[2];

if (!slug) {
  console.log('\n❌ Usage: npm run blog:ab-test <post-slug>\n');
  console.log('Example: npm run blog:ab-test how-to-scale-local-seo\n');
  process.exit(1);
}

generateVariations(slug);
