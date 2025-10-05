#!/bin/bash

echo "========================================="
echo "Competitor Analysis API Test Suite"
echo "========================================="

API_URL="http://localhost:4321/api/competitor-analysis"

echo -e "\n1. Testing Invalid Domain Format:"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"invalid","competitorDomain":"test.com"}' \
  | jq '{success, error}'

echo -e "\n2. Testing Missing Competitor Domain:"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"test.com"}' \
  | jq '{success, error}'

echo -e "\n3. Testing Valid Domains:"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"google.com","competitorDomain":"bing.com"}' \
  | jq '{success, yourDomain, competitorDomain}'

echo -e "\n4. Testing Real Domains:"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"theprofitplatform.com.au","competitorDomain":"webfx.com"}' \
  | jq '{success, comparison: .comparison."Domain Authority", opportunities: .opportunities | length}'

echo -e "\n5. Testing with HTTPS URLs:"
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"yourDomain":"https://github.com","competitorDomain":"https://gitlab.com"}' \
  | jq '{success, yourDomain, competitorDomain}'

echo -e "\n========================================="
echo "Test Suite Complete"
echo "========================================="
