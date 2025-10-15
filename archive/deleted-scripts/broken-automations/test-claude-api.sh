#!/bin/bash

# Test Claude API Keyword Research
# This tests if the ANTHROPIC_API_KEY is configured and working

echo "🧪 Testing Claude API Keyword Research..."
echo ""

# Test endpoint
URL="https://3340d42e.tpp.pages.dev/api/keyword-research"

# Test payload
PAYLOAD='{
  "keyword": "digital marketing",
  "location": "Sydney, Australia",
  "intent": "all"
}'

echo "📍 Endpoint: $URL"
echo "📦 Payload: $PAYLOAD"
echo ""
echo "⏳ Sending request..."
echo ""

# Make request and capture response
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Split response and status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "📊 Status Code: $HTTP_STATUS"
echo ""

# Parse data source from response
DATA_SOURCE=$(echo "$HTTP_BODY" | grep -o '"dataSource":"[^"]*"' | cut -d'"' -f4)
DATA_QUALITY=$(echo "$HTTP_BODY" | grep -o '"dataQuality":"[^"]*"' | cut -d'"' -f4)
KEYWORD_COUNT=$(echo "$HTTP_BODY" | grep -o '"keywords":\[[^]]*\]' | grep -o '{' | wc -l)

echo "Results:"
echo "--------"
echo "Data Source: $DATA_SOURCE"
echo "Data Quality: $DATA_QUALITY"
echo "Keywords Returned: $KEYWORD_COUNT"
echo ""

# Determine what's running
if [ "$DATA_SOURCE" = "claude-ai" ] || [ "$DATA_QUALITY" = "ai-enhanced" ]; then
    echo "✅ SUCCESS! Claude AI is working!"
    echo "🤖 Using AI-powered keyword research"
    echo "💰 Cost: \$0 (using your Anthropic subscription)"
elif [ "$DATA_SOURCE" = "dataforseo" ]; then
    echo "✅ DataForSEO is working (paid API)"
    echo "💰 Cost: ~\$0.05 per search"
elif [ "$DATA_SOURCE" = "sample" ]; then
    echo "⚠️  Using sample data (fallback mode)"
    echo "❌ Claude AI not configured or failed"
    echo ""
    echo "To enable Claude AI:"
    echo "1. Add ANTHROPIC_API_KEY to Cloudflare Pages environment variables"
    echo "2. Redeploy the site"
else
    echo "❓ Unknown data source: $DATA_SOURCE"
fi

echo ""
echo "Full response (first 500 chars):"
echo "--------------------------------"
echo "$HTTP_BODY" | head -c 500
echo ""
echo "..."
