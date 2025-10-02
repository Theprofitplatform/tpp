#!/bin/bash

# Domain Management Setup Script for Cloudflare Pages
# This script helps configure new.theprofitplatform.com.au for the tpp-new project

set -e

echo "🔧 Cloudflare Pages Domain Setup"
echo "=================================="

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN environment variable not set"
    echo ""
    echo "To fix this:"
    echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create a token with these permissions:"
    echo "   - Zone:Zone:Read"
    echo "   - Zone:DNS:Edit"
    echo "   - Account:Cloudflare Pages:Edit"
    echo "3. Export the token: export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo ""
    echo "Or set it in your ~/.bashrc:"
    echo "echo 'export CLOUDFLARE_API_TOKEN=\"your_token_here\"' >> ~/.bashrc"
    echo "source ~/.bashrc"
    exit 1
fi

# Project details
PROJECT_NAME="tpp-new"
DOMAIN="new.theprofitplatform.com.au"
ACCOUNT_ID="8fc18f5691f32fccc13eb17e85a0ae10"

echo "📋 Configuration:"
echo "   Project: $PROJECT_NAME"
echo "   Domain: $DOMAIN"
echo "   Account: $ACCOUNT_ID"
echo ""

# Add custom domain to Pages project
echo "🌐 Adding custom domain to Pages project..."
response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"name\": \"$DOMAIN\"}")

success=$(echo "$response" | jq -r '.success // false')

if [ "$success" = "true" ]; then
    echo "✅ Custom domain added successfully!"

    # Get the CNAME target
    cname_target=$(echo "$response" | jq -r '.result.name // "N/A"')
    echo ""
    echo "📝 DNS Configuration Required:"
    echo "   Add this CNAME record to your DNS:"
    echo "   Type: CNAME"
    echo "   Name: new"
    echo "   Value: $cname_target"
    echo "   TTL: Auto"
    echo ""
    echo "🎯 After DNS propagation, your site will be available at:"
    echo "   https://$DOMAIN"

else
    echo "❌ Failed to add custom domain"
    echo "Response: $response"

    # Check if domain already exists
    if echo "$response" | grep -q "already exists"; then
        echo ""
        echo "ℹ️  Domain might already be configured."
        echo "   Check: https://dash.cloudflare.com/pages/view/$PROJECT_NAME"
    fi
fi

echo ""
echo "🔗 Useful Links:"
echo "   - Pages Dashboard: https://dash.cloudflare.com/pages/view/$PROJECT_NAME"
echo "   - API Tokens: https://dash.cloudflare.com/profile/api-tokens"
echo "   - DNS Management: https://dash.cloudflare.com/dns"