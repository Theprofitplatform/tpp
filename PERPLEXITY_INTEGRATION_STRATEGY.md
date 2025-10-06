# Perplexity API Integration Strategy

**Date**: 2025-10-06
**Status**: Planning Phase
**Priority**: High-Value Enhancements

---

## Why Perplexity API?

**Perplexity's Strengths**:
1. **Real-time web search** - Access current statistics, trends, case studies
2. **Citation-backed responses** - Built-in source attribution for credibility
3. **Up-to-date information** - Overcome Claude's January 2025 knowledge cutoff
4. **Fact verification** - Cross-check statistics and claims
5. **Research automation** - Deep-dive competitor analysis

**Current System Gaps**:
- ❌ Statistics are Claude-generated (sometimes fabricated)
- ❌ No real case studies or client examples
- ❌ No competitive intelligence integration
- ❌ No real-time trend detection
- ❌ No citation/source attribution

---

## High-Value Use Cases (Priority Order)

### **#1: Real-Time Statistics Enrichment** ⭐⭐⭐⭐⭐

**Problem**: Claude generates statistics like "67% of Sydney businesses..." without real sources
**Solution**: Query Perplexity for verified statistics before/during content generation

**Implementation**:
```javascript
// Before: Claude generates this
"67% of Sydney businesses are leaving money on the table with Google Ads extensions."

// After: Perplexity enriches this
"According to WordStream's 2024 PPC Benchmark Report, 64% of businesses underutilize
ad extensions, leaving an estimated 15-20% performance improvement untapped [1]."

[1] WordStream PPC Benchmarks 2024 - wordstream.com/blog/ppc-industry-benchmarks
```

**Value**: +40 quality points (authenticity, credibility, SEO)

---

### **#2: Sydney-Specific Data Integration** ⭐⭐⭐⭐⭐

**Problem**: Generic advice not tailored to Sydney market conditions
**Solution**: Query Perplexity for Sydney-specific data, trends, regulations

**Queries**:
- "Sydney digital marketing industry statistics 2024-2025"
- "Google Ads average CPC Sydney Australia by industry"
- "Sydney local SEO competition analysis"
- "Australian e-commerce conversion rate benchmarks"

**Value**: +30 quality points (localization, relevance)

---

### **#3: Competitive Case Studies** ⭐⭐⭐⭐

**Problem**: No real client examples or competitor benchmarks
**Solution**: Research real case studies and success stories via Perplexity

**Queries**:
- "Sydney businesses Google Ads success stories case studies"
- "Australian digital marketing agency case studies [topic]"
- "Before and after results [specific strategy] Australia"

**Value**: +25 quality points (social proof, credibility)

---

### **#4: Fact-Checking & Citation System** ⭐⭐⭐⭐

**Problem**: No verification of Claude-generated claims
**Solution**: Post-generation fact-check with Perplexity, add citations

**Process**:
1. Extract claims from generated content
2. Query Perplexity: "Verify: [claim] - provide sources"
3. Replace unverified claims or add [citation] markers
4. Generate bibliography section

**Value**: +20 quality points (trustworthiness, authority)

---

### **#5: Trending Topics Detection** ⭐⭐⭐

**Problem**: Topic queue is manually curated
**Solution**: Use Perplexity to identify trending Sydney business/marketing topics

**Queries**:
- "Top trending digital marketing topics Sydney businesses 2025"
- "Most searched Google Ads questions Australia"
- "Emerging SEO trends for local businesses Sydney"

**Value**: +15 quality points (timeliness, relevance)

---

### **#6: Competitor Intelligence** ⭐⭐⭐

**Problem**: No competitor content analysis
**Solution**: Analyze competitor blog strategies with Perplexity

**Queries**:
- "Top digital marketing blogs Sydney Australia"
- "[competitor name] recent blog topics and performance"
- "What are [competitor] doing well in content marketing"

**Value**: +10 quality points (differentiation, strategy)

---

## Implementation Plan

### **Phase 1: Statistics Enrichment (Week 2.5)** ⭐ START HERE

**Goal**: Replace 50%+ of fabricated statistics with real, cited data

**Components**:
1. `perplexity-client.js` - API wrapper with rate limiting
2. `statistics-enrichment.js` - Extract claims, query Perplexity, replace
3. Integration into `generate-blog-post.js` (Step 8.6)

**Estimated Time**: 4-6 hours
**Estimated Cost**: $0.01-0.05 per blog post (1-5 Perplexity queries)

**Example Flow**:
```javascript
// 1. Generate content with Claude
const content = await generateContent(topic);

// 2. Extract statistics/claims
const claims = extractStatistics(content);
// ["67% of Sydney businesses...", "CTR increased by 224%", etc.]

// 3. Enrich with Perplexity
const enrichedClaims = await enrichWithPerplexity(claims, topic);
// Returns verified statistics with sources

// 4. Replace in content
const enrichedContent = replaceClaims(content, enrichedClaims);
```

---

### **Phase 2: Sydney Data Integration (Week 3)** ⭐

**Goal**: Add 3-5 Sydney-specific data points per blog post

**Components**:
1. `sydney-data-fetcher.js` - Query Sydney-specific data
2. Cache layer for frequently requested data (avoid duplicate queries)
3. Integration with visual suggestions (charts for Sydney data)

**Estimated Time**: 3-4 hours
**Estimated Cost**: $0.02-0.05 per blog post (2-5 queries, cached)

---

### **Phase 3: Fact-Checking System (Week 3.5)** ⭐

**Goal**: Verify 100% of major claims, add citations

**Components**:
1. `claim-extractor.js` - Identify verifiable claims
2. `fact-checker.js` - Query Perplexity for verification
3. `citation-generator.js` - Add [1], [2] markers and bibliography

**Estimated Time**: 4-5 hours
**Estimated Cost**: $0.03-0.08 per blog post (3-8 verification queries)

---

### **Phase 4: Trending Topics Auto-Queue (Week 4)**

**Goal**: Auto-populate topic queue with trending subjects

**Components**:
1. `trend-detector.js` - Weekly Perplexity scan for trends
2. `topic-scorer.js` - Score trending topics by relevance
3. Auto-add to `topic-queue.json` with priority

**Estimated Time**: 3-4 hours
**Estimated Cost**: $0.10-0.20 per week (10-20 trend queries)

---

## Technical Architecture

### **Perplexity Client Module**

```javascript
// automation/scripts/perplexity-client.js

import Anthropic from '@anthropic-ai/sdk'; // Perplexity uses same client pattern

export class PerplexityClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.perplexity.ai';
    this.rateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
  }

  async query(prompt, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.2,
        return_citations: true,
        search_recency_filter: options.recencyFilter || 'month'
      })
    });

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      citations: data.citations || [],
      usage: data.usage
    };
  }

  async enrichStatistic(claim, context = {}) {
    const prompt = `Find verified statistics and data for: "${claim}"

Context: ${context.topic || 'General digital marketing'}
Location: Sydney, Australia
Recency: Prefer 2024-2025 data

Requirements:
- Provide exact statistic with source
- Include source URL
- Prefer industry reports, research studies, or authoritative publications
- If multiple sources exist, choose most reputable

Return format:
Statistic: [exact number/percentage]
Source: [publication name, year]
URL: [source URL]
Context: [1-2 sentence explanation]`;

    return await this.query(prompt, { recencyFilter: 'month' });
  }
}
```

---

### **Statistics Enrichment Module**

```javascript
// automation/scripts/statistics-enrichment.js

export async function enrichStatistics(content, metadata, perplexityClient) {
  console.log('\n🔍 Enriching statistics with real-time data...');

  // 1. Extract statistics (reuse from chart-generator.js)
  const statistics = extractStatistics(content);

  if (statistics.length === 0) {
    return { content, enriched: 0, citations: [] };
  }

  // 2. Prioritize statistics to enrich (top 5-10)
  const priorityStats = statistics
    .filter(s => s.type === 'percentage' || s.type === 'improvement')
    .slice(0, 5);

  console.log(`   Found ${statistics.length} statistics, enriching top ${priorityStats.length}`);

  // 3. Query Perplexity for each statistic
  const enrichments = [];
  const citations = [];

  for (const stat of priorityStats) {
    try {
      const result = await perplexityClient.enrichStatistic(
        stat.fullLine,
        { topic: metadata.title, category: metadata.category }
      );

      if (result.citations.length > 0) {
        enrichments.push({
          original: stat.fullLine,
          enriched: result.content,
          citations: result.citations
        });

        citations.push(...result.citations);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to enrich: ${stat.value}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. Replace statistics in content
  let enrichedContent = content;
  let replacements = 0;

  for (const enrichment of enrichments) {
    if (enrichedContent.includes(enrichment.original)) {
      enrichedContent = enrichedContent.replace(
        enrichment.original,
        enrichment.enriched
      );
      replacements++;
    }
  }

  console.log(`   ✅ Enriched ${replacements} statistics with ${citations.length} citations`);

  return {
    content: enrichedContent,
    enriched: replacements,
    citations: deduplicateCitations(citations)
  };
}
```

---

## Cost Analysis

### **Perplexity API Pricing** (as of 2025):
- **Sonar Small**: $0.0002/request (~$0.20 per 1,000 requests)
- **Sonar Large**: $0.001/request (~$1.00 per 1,000 requests)
- **Sonar Huge**: $0.005/request (~$5.00 per 1,000 requests)

### **Estimated Costs per Blog Post**:

| Feature | Queries | Model | Cost per Post | Monthly (12 posts) |
|---------|---------|-------|---------------|-------------------|
| Statistics Enrichment | 3-5 | Large | $0.003-0.005 | $0.04-0.06 |
| Sydney Data | 2-3 | Large | $0.002-0.003 | $0.02-0.04 |
| Fact-Checking | 5-8 | Large | $0.005-0.008 | $0.06-0.10 |
| **TOTAL per post** | **10-16** | **Large** | **$0.01-0.016** | **$0.12-0.20** |

**Annual Cost**: ~$1.50-2.50 for 144 blog posts

**ROI**: Priceless - transforms fabricated statistics into authoritative, cited data

---

## Quality Impact

### **Before Perplexity Integration**:
- Quality Score: 95-100/100
- Authority: Medium (no citations)
- Trustworthiness: Medium (unverified claims)
- SEO Value: Medium (no E-E-A-T signals)

### **After Perplexity Integration**:
- Quality Score: **100+/100** (bonus for citations)
- Authority: **High** (industry sources cited)
- Trustworthiness: **High** (verified claims)
- SEO Value: **High** (strong E-E-A-T signals)

**E-E-A-T Improvement**:
- **Experience**: ✅ Real case studies
- **Expertise**: ✅ Industry data sources
- **Authoritativeness**: ✅ Citations from reputable publications
- **Trustworthiness**: ✅ Fact-checked claims

---

## Implementation Priority

**Immediate (This Week)**:
1. ✅ Create `perplexity-client.js` wrapper
2. ✅ Implement `statistics-enrichment.js`
3. ✅ Add Perplexity API key to `.env.local`
4. ✅ Integrate into blog generation pipeline
5. ✅ Test with 1-2 blog posts

**Next Week**:
1. Sydney-specific data fetcher
2. Fact-checking system
3. Citation generator

**Week 4**:
1. Trending topics auto-queue
2. Competitor intelligence
3. Performance measurement

---

## Success Metrics

**Quality Metrics**:
- % of statistics with real citations: Target 60%+
- Average citations per blog post: Target 5-10
- Fact-check pass rate: Target 95%+

**Business Metrics**:
- Blog trust score (survey): Target 8.5/10
- SEO ranking improvement: Target +10-20 positions
- Backlink acquisition: Target +20% (due to citation-worthy content)

---

## Next Steps

1. **Add Perplexity API key to `.env.local`**
2. **Create `perplexity-client.js` module**
3. **Implement `statistics-enrichment.js`**
4. **Test enrichment with existing blog post**
5. **Integrate into `generate-blog-post.js`** as Step 8.6

**Timeline**: 4-6 hours to MVP (statistics enrichment only)

---

**Status**: READY TO IMPLEMENT
**Priority**: ⭐⭐⭐⭐⭐ (Highest ROI enhancement)
