#!/bin/bash
# Fix webhook registration by deactivating and reactivating workflows

N8N_MANAGER="./automation/scripts/n8n-manager.sh"

# Webhooks that need fixing
WORKFLOWS=(
    "rejMpjmWJvnKygYd:Simple Test Workflow"
    "XXLvBVPAUGWt35oD:Minimal Webhook Test"
    "54xYxJPXqDOV40L3:Blog Automation Webhook"
)

echo "🔧 Fixing webhook registration..."
echo ""

for workflow in "${WORKFLOWS[@]}"; do
    IFS=':' read -r id name <<< "$workflow"

    echo "📌 Processing: $name (ID: $id)"

    # Deactivate
    echo "   ⏸️  Deactivating..."
    bash "$N8N_MANAGER" deactivate "$id" > /dev/null 2>&1

    sleep 2

    # Reactivate
    echo "   ✅ Reactivating..."
    bash "$N8N_MANAGER" activate "$id" > /dev/null 2>&1

    sleep 2

    echo "   ✓ Done"
    echo ""
done

echo "🎉 All webhooks reactivated!"
echo ""
echo "Testing test-simple webhook..."
curl -X POST https://n8n.theprofitplatform.com.au/webhook/test-simple \
  -H "Content-Type: application/json" \
  -d '{"test":true,"message":"After fix"}'
