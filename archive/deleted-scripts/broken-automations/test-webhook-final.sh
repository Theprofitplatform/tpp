#!/bin/bash
# Final Webhook Verification Test

echo "╔═══════════════════════════════════════════════╗"
echo "║   Final Webhook Verification Test            ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

test_webhook() {
    local name=$1
    local url=$2

    printf "%-35s" "$name:"
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d '{"test":true}' 2>&1)

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ WORKING (HTTP $http_code)"
        return 0
    else
        echo "❌ BROKEN (HTTP $http_code)"
        return 1
    fi
}

WEBHOOK_BASE="https://n8n.theprofitplatform.com.au/webhook"

echo "Testing Webhooks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

working=0
broken=0

if test_webhook "Ultra Test (Verified Working)" "${WEBHOOK_BASE}/ultra-test"; then
    ((working++))
else
    ((broken++))
fi

if test_webhook "Test Working 1 (New)" "${WEBHOOK_BASE}/test-working-1"; then
    ((working++))
else
    ((broken++))
fi

if test_webhook "Test Working 2 (New)" "${WEBHOOK_BASE}/test-working-2"; then
    ((working++))
else
    ((broken++))
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  ✅ Working: $working"
echo "  ❌ Broken:  $broken"
echo ""

if [ $working -gt 0 ]; then
    echo "✅ You have $working working webhook(s)!"
    echo ""
    echo "Use this command to test:"
    echo "  curl -X POST ${WEBHOOK_BASE}/ultra-test -H 'Content-Type: application/json' -d '{\"test\":true}'"
else
    echo "⚠️  All webhooks need UI activation"
    echo ""
    echo "Activate them at:"
    echo "  1. https://n8n.theprofitplatform.com.au/workflow/thYxTlu07HvaekK2"
    echo "  2. https://n8n.theprofitplatform.com.au/workflow/25p1gTX2nALeeNd9"
    echo "  3. https://n8n.theprofitplatform.com.au/workflow/mYT1SIIuz3JZ5iZ8"
fi
