#!/bin/bash
# Quick verification of SEO workflow setup

echo "🔍 SEO Workflow Setup Verification"
echo "==================================="
echo ""

# Check Ollama
echo "1. Ollama Service:"
if systemctl is-active --quiet ollama; then
    echo "   ✅ Running"
    ollama list | head -5
else
    echo "   ❌ Not running - run: sudo systemctl start ollama"
fi
echo ""

# Check PostgreSQL
echo "2. PostgreSQL Database:"
if sudo -u postgres psql -d n8n -c '\dt' 2>/dev/null | grep -q seo_analysis; then
    echo "   ✅ Tables exist"
    sudo -u postgres psql -d n8n -c "SELECT COUNT(*) as competitor_count FROM competitor_analysis;" 2>/dev/null
else
    echo "   ❌ Tables missing - run: bash scripts/setup-database.sh"
fi
echo ""

# Check n8n
echo "3. n8n Service:"
if systemctl is-active --quiet n8n; then
    echo "   ✅ Running"
    echo "   URL: https://n8n.theprofitplatform.com.au"
else
    echo "   ❌ Not running - run: sudo systemctl start n8n"
fi
echo ""

# Check workflow file
echo "4. Workflow File:"
if [ -f "n8n-workflows/advanced-seo-optimization-workflow.json" ]; then
    SIZE=$(ls -lh n8n-workflows/advanced-seo-optimization-workflow.json | awk '{print $5}')
    echo "   ✅ Exists ($SIZE)"
else
    echo "   ❌ Missing"
fi
echo ""

# Check test suite
echo "5. Test Suite:"
if [ -f "scripts/test-seo-workflow.cjs" ]; then
    SIZE=$(ls -lh scripts/test-seo-workflow.cjs | awk '{print $5}')
    echo "   ✅ Ready ($SIZE)"
else
    echo "   ❌ Missing"
fi
echo ""

echo "==================================="
echo ""
echo "📋 Next Steps:"
echo "1. Import workflow to n8n UI"
echo "2. Configure credentials"
echo "3. Activate workflow"
echo "4. Run: node scripts/test-seo-workflow.cjs"
echo ""
echo "📖 Docs: cat QUICKSTART_SEO_WORKFLOW.md"
