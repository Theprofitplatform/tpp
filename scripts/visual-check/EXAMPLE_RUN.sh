#!/bin/bash

# Visual Quality Agent - Example Run Script
# This script demonstrates how to run the visual quality agent

echo "🤖 Visual Quality Agent - Example Run"
echo "======================================"
echo ""

# Set working directory
cd /home/avi/projects/astro-site/scripts/visual-check

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    npm run install-browsers
fi

echo "Choose an option:"
echo ""
echo "1. Single inspection (production)"
echo "2. Single inspection (test site)"
echo "3. Start continuous monitoring (every 15 min)"
echo "4. Start continuous monitoring with auto-fix"
echo "5. View latest report"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "Running single inspection on production..."
        node src/cli.js inspect --url "https://theprofitplatform.com.au"
        ;;
    2)
        echo "Running single inspection on test site..."
        node src/cli.js inspect --url "https://test.theprofitplatform.com.au"
        ;;
    3)
        echo "Starting continuous monitoring..."
        echo "Press Ctrl+C to stop"
        node src/cli.js watch
        ;;
    4)
        echo "Starting continuous monitoring with auto-fix..."
        echo "⚠️  Warning: This will automatically apply high-confidence fixes!"
        echo "Press Ctrl+C to stop"
        node src/cli.js watch --auto-fix
        ;;
    5)
        echo "Latest report:"
        echo ""
        cat reports/summary.md 2>/dev/null || echo "No reports found yet. Run an inspection first."
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
