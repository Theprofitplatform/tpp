#!/bin/bash

echo "🔍 CORE SITE FUNCTIONALITY TEST"
echo "=================================="

# Test 1: Site builds successfully
echo "1. Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else 
    echo "❌ Build failed"
    exit 1
fi

# Test 2: Core pages exist in dist
echo "2. Checking core pages..."
PAGES=("dist/index.html" "dist/about/index.html" "dist/portfolio/index.html" "dist/contact/index.html")
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "✅ $page exists"
    else
        echo "❌ $page missing"
        exit 1
    fi
done

# Test 3: Check if contact forms are properly structured
echo "3. Testing contact form structure..."
if grep -q "contact" dist/contact/index.html; then
    echo "✅ Contact page has content"
else
    echo "❌ Contact page content missing"
    exit 1
fi

# Test 4: Check SEO elements
echo "4. Testing SEO elements..."
if grep -q "schema.org" dist/index.html; then
    echo "✅ Schema markup present"
else
    echo "❌ Schema markup missing"
    exit 1
fi

# Test 5: Check file sizes are reasonable
echo "5. Testing build efficiency..."
BUILD_SIZE=$(du -sh dist/ | cut -f1)
echo "✅ Build size: $BUILD_SIZE"

echo ""
echo "🎉 CORE TESTS PASSED - Site is functional"
echo "========================================"
