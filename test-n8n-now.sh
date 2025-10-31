#!/bin/bash

# Quick test script for n8n webhook

echo "🧪 Testing n8n GMB Automation..."
echo ""

# Set webhook URL
export N8N_WEBHOOK_URL=https://n8n.theprofitplatform.com.au/webhook/gmb-posts

echo "📡 Webhook: $N8N_WEBHOOK_URL"
echo ""

# Run test
npm run automation:gmb-test-n8n

echo ""
echo "✅ Test complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check n8n executions: https://n8n.theprofitplatform.com.au"
echo "2. Check GMB in 1-2 minutes for test post"
echo "3. If successful, send real posts with:"
echo "   npm run automation:gmb-send-n8n automation/generated/gbp-posts/gbp-posts-2025-10-21.json"
