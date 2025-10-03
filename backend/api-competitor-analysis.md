# Competitor Analysis API Documentation

## Overview
The Competitor Analysis API endpoint allows users to compare their website against a competitor's website across multiple SEO metrics, keywords, content, backlinks, and technical factors.

## Endpoint
`POST /api/competitor-analysis`

## Request Body
```json
{
  "yourDomain": "https://yourwebsite.com.au",
  "competitorDomain": "https://competitor.com.au"
}
```

## Response Format
```json
{
  "success": true,
  "yourDomain": "yourwebsite.com.au",
  "competitorDomain": "competitor.com.au",
  "comparison": {
    "Domain Authority": {
      "yourValue": 45,
      "competitorValue": 52
    },
    "Organic Traffic": {
      "yourValue": "12.5K",
      "competitorValue": "18.2K"
    },
    "Keywords Ranking": {
      "yourValue": 245,
      "competitorValue": 320
    },
    "Backlinks": {
      "yourValue": 1200,
      "competitorValue": 1850
    }
  },
  "seoMetrics": {
    "Domain Authority": {
      "yours": 45,
      "theirs": 52
    },
    "Page Authority": {
      "yours": 38,
      "theirs": 45
    },
    "Spam Score": {
      "yours": "2%",
      "theirs": "5%"
    },
    "Organic Keywords": {
      "yours": 245,
      "theirs": 320
    },
    "Monthly Traffic": {
      "yours": "12.5K",
      "theirs": "18.2K"
    },
    "Traffic Value": {
      "yours": "$3,200",
      "theirs": "$4,800"
    }
  },
  "keywordGap": [
    {
      "keyword": "digital marketing sydney",
      "volume": 2400,
      "difficulty": 45,
      "gap": -15
    },
    {
      "keyword": "seo services sydney",
      "volume": 1900,
      "difficulty": 52,
      "gap": 8
    },
    {
      "keyword": "google ads management",
      "volume": 1600,
      "difficulty": 48,
      "gap": -22
    }
  ],
  "contentAnalysis": {
    "Average Word Count": {
      "yours": 1200,
      "theirs": 1850
    },
    "Blog Posts": {
      "yours": 24,
      "theirs": 42
    },
    "Content Freshness": {
      "yours": "30 days",
      "theirs": "14 days"
    },
    "Images per Page": {
      "yours": 5,
      "theirs": 8
    },
    "Video Content": {
      "yours": "No",
      "theirs": "Yes"
    }
  },
  "backlinkProfile": {
    "Total Backlinks": {
      "yours": 1200,
      "theirs": 1850
    },
    "Referring Domains": {
      "yours": 145,
      "theirs": 220
    },
    "DoFollow Links": {
      "yours": 850,
      "theirs": 1320
    },
    "NoFollow Links": {
      "yours": 350,
      "theirs": 530
    },
    "Link Quality Score": {
      "yours": "72/100",
      "theirs": "68/100"
    }
  },
  "technicalSEO": {
    "Page Speed (Mobile)": {
      "yours": "3.2s",
      "theirs": "2.8s"
    },
    "Core Web Vitals": {
      "yours": "Good",
      "theirs": "Excellent"
    },
    "HTTPS": {
      "yours": "Yes",
      "theirs": "Yes"
    },
    "Mobile Friendly": {
      "yours": "Yes",
      "theirs": "Yes"
    },
    "Structured Data": {
      "yours": "Partial",
      "theirs": "Complete"
    },
    "XML Sitemap": {
      "yours": "Yes",
      "theirs": "Yes"
    }
  },
  "opportunities": [
    {
      "title": "Content Gap - Long-form Articles",
      "description": "Your competitor publishes 1850+ word articles while yours average 1200 words. Create comprehensive guides to compete."
    },
    {
      "title": "Keyword Opportunity - 'SEO Services Sydney'",
      "description": "You rank 8 positions higher than competitor for this high-volume keyword. Optimize further to dominate."
    },
    {
      "title": "Backlink Acquisition",
      "description": "Competitor has 75 more referring domains. Focus on quality link building from industry publications."
    },
    {
      "title": "Video Content Strategy",
      "description": "Competitor uses video content extensively. Add video to increase engagement and dwell time."
    },
    {
      "title": "Page Speed Optimization",
      "description": "Competitor loads 0.4s faster on mobile. Optimize images and reduce JavaScript to improve Core Web Vitals."
    }
  ],
  "actionPlan": [
    {
      "title": "Create 5 Long-form Content Pieces (2000+ words)",
      "description": "Target your top keywords with comprehensive, well-researched articles that outperform competitor content in depth and value."
    },
    {
      "title": "Build 30 Quality Backlinks",
      "description": "Reach out to industry publications, partner websites, and local Sydney business directories to acquire high-quality backlinks."
    },
    {
      "title": "Optimize Page Speed to Under 2.5s",
      "description": "Compress images, implement lazy loading, minify CSS/JS, and use a CDN to improve loading times across all devices."
    },
    {
      "title": "Add Video Content to Top 10 Pages",
      "description": "Create explainer videos, testimonials, and product demos to increase engagement and reduce bounce rate."
    },
    {
      "title": "Implement Complete Structured Data",
      "description": "Add comprehensive schema markup for all page types to enhance search appearance with rich snippets."
    }
  ]
}
```

## Implementation Notes

### Data Sources
The API should use a combination of:
1. **SEO APIs** (Moz, Ahrefs, SEMrush APIs if available, or free alternatives)
2. **Web Scraping** for basic metrics
3. **Google Search Console API** (if user connects)
4. **Lighthouse API** for technical metrics
5. **Simulated/Demo Data** for MVP phase

### Rate Limiting
- Maximum 3 requests per hour per IP
- Maximum 10 requests per day per IP
- Prevent abuse with honeypot and validation

### Error Handling
```json
{
  "success": false,
  "error": "Unable to analyze competitor. Please check the domain and try again."
}
```

Common errors:
- Invalid domain format
- Domain not accessible
- Rate limit exceeded
- API quota exceeded

### Response Time
- Target: < 15 seconds for full analysis
- Implement progress updates via WebSocket (future enhancement)
- Cache results for 24 hours per domain pair

### MVP Implementation Strategy
For initial release, use a combination of:
1. Free Moz API (limited calls)
2. Web scraping for basic metrics (word count, images, etc.)
3. Manual calculations for estimated traffic value
4. Pre-generated insights based on common patterns

Future enhancements:
1. Integrate with premium SEO APIs
2. Add real-time SERP tracking
3. Include social media metrics
4. Add automated reporting/alerts
