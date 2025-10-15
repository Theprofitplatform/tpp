# Case Study Library

This directory contains verified case studies for use in social media and email content generation.

## Purpose

Instead of fabricating examples, social media generators can pull from this library of real, anonymized client results.

## Usage

```javascript
import { getCaseStudy } from './case-study-loader.js';

// Get relevant case study by category
const caseStudy = getCaseStudy('Content Marketing');
// Returns: { business: "Tech consultancy", location: "Sydney CBD", metric: "47% traffic increase", timeframe: "4 months" }
```

## Adding New Case Studies

1. Get client permission for anonymized results
2. Create JSON file with template below
3. Reference in social media content

## Template

```json
{
  "id": "unique-id",
  "category": "SEO|Google Ads|Content Marketing|Web Design",
  "business_type": "Tech company|eCommerce store|B2B consultancy",
  "location": "Sydney CBD|Surry Hills|Parramatta",
  "postcode": "2000|2010|2150",
  "challenge": "Brief description of problem",
  "solution": "Brief description of approach",
  "results": [
    { "metric": "47% increase", "type": "traffic", "timeframe": "4 months" },
    { "metric": "240 leads", "type": "leads", "timeframe": "quarter" }
  ],
  "verified": true,
  "date_added": "2025-10-10",
  "use_for": ["social", "email", "blog"]
}
```

## Guidelines

- ✅ Always anonymize client names
- ✅ Use real, verified results only
- ✅ Include specific timeframes
- ✅ Mention Sydney locations for local relevance
- ❌ Don't fabricate statistics
- ❌ Don't use without permission
