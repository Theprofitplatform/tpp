# Keyword Research API Endpoint

## Endpoint
`POST /api/keyword-research`

## Request Body
```json
{
  "keyword": "digital marketing",
  "location": "Sydney, Australia",
  "intent": "all"  // Options: "all", "commercial", "informational", "transactional", "navigational"
}
```

## Response Format
```json
{
  "keywords": [
    {
      "keyword": "digital marketing Sydney",
      "volume": "2900",
      "difficulty": "Medium",  // Options: "Low", "Medium", "High"
      "intent": "Commercial",
      "priority": "high",  // Options: "high", "medium", "low"
      "type": "short"  // Options: "short", "long-tail"
    },
    {
      "keyword": "SEO services Sydney",
      "volume": "1600",
      "difficulty": "Medium",
      "intent": "Commercial",
      "priority": "high",
      "type": "short"
    },
    {
      "keyword": "how much does SEO cost in Sydney",
      "volume": "90",
      "difficulty": "Low",
      "intent": "Informational",
      "priority": "high",
      "type": "long-tail"
    }
  ],
  "avgVolume": "1530",
  "clusters": [
    {
      "name": "SEO Services",
      "keywords": [
        "SEO services Sydney",
        "SEO agency Sydney",
        "SEO consultant Sydney"
      ]
    },
    {
      "name": "Google Ads",
      "keywords": [
        "Google Ads management Sydney",
        "PPC management Sydney"
      ]
    }
  ]
}
```

## Data Source Suggestions

### Option 1: Use Existing KEYWORD_RESEARCH.md Data
The project has a comprehensive `KEYWORD_RESEARCH.md` file with real Sydney keyword data. You can:
1. Parse this file to extract keywords
2. Filter based on user's intent selection
3. Add location modifiers (suburb names) dynamically

### Option 2: External APIs
- **Google Keyword Planner API** (requires Google Ads account)
- **DataForSEO API** (paid)
- **Ubersuggest API** (paid)
- **SEMrush API** (paid)
- **Ahrefs API** (paid)

### Option 3: Custom Database
Build a keyword database from:
- Google Search Console data
- Manual keyword research
- Competitor analysis
- KEYWORD_RESEARCH.md data

## Implementation Priority

1. **Quick MVP**: Parse KEYWORD_RESEARCH.md and return filtered results
2. **Enhanced**: Add dynamic location-based keyword generation
3. **Production**: Integrate real-time API data from external sources

## Error Handling

Return appropriate error messages:
```json
{
  "error": "Invalid keyword provided",
  "message": "Please enter a valid keyword to research"
}
```

Status codes:
- 200: Success
- 400: Bad request (invalid input)
- 429: Rate limit exceeded
- 500: Server error
