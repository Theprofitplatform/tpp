#!/bin/bash

# Visual Quality Agent - Installation Script
# Run this to set up the agent on your VPS

set -e

echo "🤖 Visual Quality Agent - Installation"
echo "======================================"
echo ""

# 1. Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npm run install-browsers

# 3. Create necessary directories
echo "📁 Creating directories..."
mkdir -p screenshots reports fixes visual-checks/screenshots visual-checks/reports visual-checks/fixes

# 4. Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 .

# 5. Test installation
echo "✅ Testing installation..."
node -v
npm -v

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit config/config.json to customize settings"
echo "2. Run a test: node src/cli.js inspect --url 'https://theprofitplatform.com.au'"
echo "3. Set up continuous monitoring (see USAGE.md)"
echo ""
echo "Quick start:"
echo "  ./EXAMPLE_RUN.sh"
echo ""
