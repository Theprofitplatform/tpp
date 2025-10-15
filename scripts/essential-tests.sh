#!/bin/bash

echo "🧪 3 ESSENTIAL AUTOMATED TESTS"
echo "==============================="

FAILED_TESTS=0

# Test 1: Smoke Test - Site builds and deploys
echo "1. SMOKE TEST: Site builds successfully"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Smoke test passed - Build successful"
else
    echo "❌ Smoke test failed - Build error"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 2: User Acceptance Test - All critical pages render
echo ""
echo "2. USER ACCEPTANCE TEST: Critical pages functional"
CRITICAL_PAGES=("index.html" "about/index.html" "portfolio/index.html" "contact/index.html")
for page in "${CRITICAL_PAGES[@]}"; do
    if [ -f "dist/$page" ] && [ -s "dist/$page" ]; then
        echo "✅ $page renders properly"
    else
        echo "❌ $page missing or empty"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

# Test 3: Performance Test - Build size and speed
echo ""
echo "3. PERFORMANCE TEST: Build efficiency"
BUILD_START=$(date +%s)
npm run build > /dev/null 2>&1
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

BUILD_SIZE_MB=$(du -sm dist/ | cut -f1)

if [ $BUILD_TIME -lt 60 ] && [ $BUILD_SIZE_MB -lt 50 ]; then
    echo "✅ Performance test passed - ${BUILD_TIME}s build, ${BUILD_SIZE_MB}MB size"
else
    echo "❌ Performance test failed - ${BUILD_TIME}s build (>60s), ${BUILD_SIZE_MB}MB size (>50MB)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "==============================="
if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED - Site is production ready"
    exit 0
else
    echo "❌ $FAILED_TESTS test(s) failed - Please fix before deployment"
    exit 1
fi
