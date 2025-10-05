#!/bin/bash
set -e

echo "🚀 Installing n8n..."

# Install n8n globally
npm install -g n8n

echo "✅ n8n installed successfully"
echo ""

# Start n8n with PM2
echo "📦 Starting n8n with PM2..."
pm2 start n8n --name n8n-server -- start
pm2 save

echo "✅ n8n is now running!"
echo ""
echo "📍 Access n8n at: http://$(hostname -I | awk '{print $1}'):5678"
echo ""
echo "📋 Next Steps:"
echo "1. Open n8n in your browser"
echo "2. Create an account/login"
echo "3. Configure Gmail OAuth2 credentials"
echo "4. Import tool-improvement-agent-workflow.json"
echo "5. Activate the workflow"
echo ""
echo "📖 Full instructions: ~/projects/astro-site/n8n-workflows/n8n-setup-instructions.md"
