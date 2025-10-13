#!/bin/bash
# Quick Webhook Fix - Creates working webhooks instantly

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"
N8N_API="https://n8n.theprofitplatform.com.au/api/v1"
WEBHOOK_BASE="https://n8n.theprofitplatform.com.au/webhook"

echo "🔧 Creating working test webhooks..."
echo ""

# Create working webhook 1
echo "Creating: test-working-1..."
result=$(curl -s -X POST "${N8N_API}/workflows" \
  -H "X-N8N-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook 1 (Working)",
    "nodes": [{
      "parameters": {"httpMethod": "POST", "path": "test-working-1", "responseMode": "onReceived", "options": {}},
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [250, 300],
      "name": "Webhook"
    }],
    "connections": {},
    "settings": {"executionOrder": "v1"}
  }')

id1=$(echo "$result" | jq -r '.id')
curl -s -X POST "${N8N_API}/workflows/${id1}/activate" \
  -H "X-N8N-API-KEY: ${API_KEY}" > /dev/null
echo "✅ Created (ID: ${id1})"
echo ""

# Create working webhook 2
echo "Creating: test-working-2..."
result=$(curl -s -X POST "${N8N_API}/workflows" \
  -H "X-N8N-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook 2 (Working)",
    "nodes": [{
      "parameters": {"httpMethod": "POST", "path": "test-working-2", "responseMode": "onReceived", "options": {}},
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [250, 300],
      "name": "Webhook"
    }],
    "connections": {},
    "settings": {"executionOrder": "v1"}
  }')

id2=$(echo "$result" | jq -r '.id')
curl -s -X POST "${N8N_API}/workflows/${id2}/activate" \
  -H "X-N8N-API-KEY: ${API_KEY}" > /dev/null
echo "✅ Created (ID: ${id2})"
echo ""

echo "⏳ Waiting 3 seconds for webhooks to register..."
sleep 3
echo ""

echo "🧪 Testing webhooks..."
echo ""

# Test webhook 1
echo "Test 1: ${WEBHOOK_BASE}/test-working-1"
response=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_BASE}/test-working-1" \
  -H "Content-Type: application/json" \
  -d '{"test":true}')
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo "✅ SUCCESS - HTTP 200"
else
  echo "❌ FAILED - HTTP ${http_code}"
fi
echo ""

# Test webhook 2
echo "Test 2: ${WEBHOOK_BASE}/test-working-2"
response=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_BASE}/test-working-2" \
  -H "Content-Type: application/json" \
  -d '{"test":true}')
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo "✅ SUCCESS - HTTP 200"
else
  echo "❌ FAILED - HTTP ${http_code}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Working Webhooks:"
echo "  1. ${WEBHOOK_BASE}/test-working-1"
echo "  2. ${WEBHOOK_BASE}/test-working-2"
echo "  3. ${WEBHOOK_BASE}/ultra-test (existing)"
echo ""
echo "💡 Test command:"
echo "curl -X POST ${WEBHOOK_BASE}/test-working-1 -H 'Content-Type: application/json' -d '{\"test\":true}'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
