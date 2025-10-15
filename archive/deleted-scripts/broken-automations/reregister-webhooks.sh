#!/bin/bash
# Re-register webhooks after n8n restart

N8N_API="https://n8n.theprofitplatform.com.au/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4MjY5fQ.WEFFV0Y2dLt2_IE_aHgDzFMkFJOJ5cYxAiMlU2UG5qQ"

echo "🔄 Re-registering webhook: test-simple"

# Deactivate
curl -s -X POST "${N8N_API}/workflows/rejMpjmWJvnKygYd/deactivate" \
  -H "X-N8N-API-KEY: ${API_KEY}" > /dev/null

echo "   ⏸️  Deactivated"
sleep 3

# Activate
curl -s -X POST "${N8N_API}/workflows/rejMpjmWJvnKygYd/activate" \
  -H "X-N8N-API-KEY: ${API_KEY}" > /dev/null

echo "   ✅ Activated"
sleep 2

# Test
echo ""
echo "🧪 Testing webhook..."
curl -X POST https://n8n.theprofitplatform.com.au/webhook/test-simple \
  -H "Content-Type: application/json" \
  -d '{"test":true,"message":"After re-registration"}'
