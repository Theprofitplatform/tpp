#!/bin/bash
# Test the n8n blog automation webhook

echo "🧪 Testing Blog Automation Webhook..."
echo ""

WEBHOOK_URL="https://n8n.theprofitplatform.com.au/webhook/blog-automation-trigger"

echo "📍 Webhook URL: $WEBHOOK_URL"
echo ""
echo "🚀 Sending request..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "force": false,
    "enableGitCommit": true,
    "enableDeployment": true
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📊 Response:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Webhook triggered successfully!"
    echo "💬 Check Discord for notification"
    echo "🌐 View execution: https://n8n.theprofitplatform.com.au/workflow/ocIhahMuBNMy1hNs"
else
    echo "❌ Webhook failed with status $HTTP_CODE"
fi
