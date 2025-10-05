#!/bin/bash
# Quick test script for Claude Code API

set -e

echo "🧪 Testing Claude Code API Server"
echo "=================================="
echo ""

# Start server in background
echo "🚀 Starting server on port 3001..."
PORT=3001 node server.js > /tmp/claude-api-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test 1: Health check
echo "1️⃣  Testing /health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health)
echo "   Response: $HEALTH"
echo ""

# Test 2: Status check
echo "2️⃣  Testing /status endpoint..."
STATUS=$(curl -s http://localhost:3001/status)
echo "   Response: $STATUS"
echo ""

# Test 3: Simple Claude request
echo "3️⃣  Testing /api/claude endpoint..."
CLAUDE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello in one sentence"}')
echo "   Response: $CLAUDE_RESPONSE"
echo ""

# Test 4: Code analysis
echo "4️⃣  Testing /api/claude/analyze endpoint..."
ANALYZE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/claude/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "function add(a,b) { return a+b; }", "language": "javascript", "task": "review"}')
echo "   Response: ${ANALYZE_RESPONSE:0:200}..."
echo ""

# Test 5: Content generation
echo "5️⃣  Testing /api/claude/generate endpoint..."
GENERATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/claude/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "automation", "length": "short", "tone": "professional"}')
echo "   Response: ${GENERATE_RESPONSE:0:200}..."
echo ""

# Cleanup
echo "🧹 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ All tests complete!"
echo ""
echo "📋 Server logs:"
cat /tmp/claude-api-test.log
