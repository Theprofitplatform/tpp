#!/bin/bash
# Sync GitHub Secrets to .env.local
# This script copies secrets from GitHub to your local .env.local file

set -e

REPO="Theprofitplatform/tpp"
ENV_FILE=".env.local"

echo "🔐 Syncing GitHub Secrets to .env.local..."
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Function to get secret value (requires gh secret view which may not be available)
# Note: GitHub doesn't allow reading secret values directly for security
# Users need to manually copy or re-create them

echo "📋 Your GitHub Secrets:"
gh secret list -R $REPO
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  GitHub doesn't allow reading secret values for security."
echo ""
echo "To sync these secrets to .env.local, you need to:"
echo ""
echo "1. Get fresh keys from the original sources:"
echo "   • CLAUDE_API_KEY: https://console.anthropic.com/settings/keys"
echo "   • GMAIL credentials: https://myaccount.google.com/apppasswords"
echo ""
echo "2. Add them to .env.local:"
echo ""
echo "   ANTHROPIC_API_KEY=sk-ant-your-key"
echo "   EMAIL_USER=your-email@gmail.com"
echo "   EMAIL_PASS=your-app-password"
echo "   EMAIL_TO=your-notification-email@gmail.com"
echo ""
echo "3. Or copy from your password manager/notes where you saved them"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Pro Tip: You can use the SAME keys in both places:"
echo "   - GitHub Secrets (for CI/CD)"
echo "   - .env.local (for local development)"
echo ""
echo "The values just need to match!"
echo ""
