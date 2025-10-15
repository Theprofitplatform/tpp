#!/bin/bash

# Master Setup Script for Advanced SEO Optimization Workflow
# Automates complete workflow setup

set -euo pipefail

echo "🚀 Advanced SEO Optimization Workflow - Complete Setup"
echo "======================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Step counter
STEP=1

print_step() {
    echo -e "${BLUE}[$STEP/5]${NC} $1"
    ((STEP++))
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check prerequisites
print_step "Checking prerequisites..."
echo ""

# Check n8n
if ! systemctl is-active --quiet n8n; then
    print_warning "n8n is not running"
    read -p "Start n8n now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo systemctl start n8n
        sleep 3
        print_success "n8n started"
    fi
fi

# Check PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL is not running"
    echo "Start it with: sudo systemctl start postgresql"
    exit 1
fi

print_success "Prerequisites OK"
echo ""

# Step 2: Setup Ollama
print_step "Setting up Ollama and AI models..."
echo ""

chmod +x "$SCRIPT_DIR/setup-ollama.sh"
if bash "$SCRIPT_DIR/setup-ollama.sh"; then
    print_success "Ollama setup complete"
else
    print_error "Ollama setup failed"
    exit 1
fi
echo ""

# Step 3: Setup Database
print_step "Setting up PostgreSQL database..."
echo ""

chmod +x "$SCRIPT_DIR/setup-database.sh"
if bash "$SCRIPT_DIR/setup-database.sh"; then
    print_success "Database setup complete"
else
    print_error "Database setup failed"
    exit 1
fi
echo ""

# Step 4: Import Workflow
print_step "Importing workflow to n8n..."
echo ""

chmod +x "$SCRIPT_DIR/import-workflow.sh"
bash "$SCRIPT_DIR/import-workflow.sh"
echo ""

# Step 5: Run Tests
print_step "Running test suite..."
echo ""

read -p "Have you configured n8n credentials? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Is the workflow activated in n8n? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Running tests..."
        if node "$SCRIPT_DIR/test-seo-workflow.cjs"; then
            print_success "All tests passed!"
        else
            print_warning "Some tests failed. Review output above."
        fi
    else
        print_warning "Activate workflow in n8n first, then run:"
        echo "  node $SCRIPT_DIR/test-seo-workflow.cjs"
    fi
else
    print_warning "Configure credentials in n8n first"
    echo ""
    echo "Credentials reference: $SCRIPT_DIR/workflow-credentials.txt"
    echo ""
    echo "After configuring, run tests with:"
    echo "  node $SCRIPT_DIR/test-seo-workflow.cjs"
fi

echo ""
echo "========================================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "========================================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure n8n credentials:"
echo "   • Open: https://n8n.theprofitplatform.com.au"
echo "   • Import workflow: $PROJECT_ROOT/n8n-workflows/advanced-seo-optimization-workflow.json"
echo "   • Add PostgreSQL credential (see: $SCRIPT_DIR/workflow-credentials.txt)"
echo "   • Add SMTP credential (see: $SCRIPT_DIR/workflow-credentials.txt)"
echo ""
echo "2. Activate the workflow:"
echo "   • Save workflow"
echo "   • Toggle 'Active' switch"
echo ""
echo "3. Run tests:"
echo "   cd $PROJECT_ROOT"
echo "   node scripts/test-seo-workflow.cjs"
echo ""
echo "4. Manual test:"
echo "   curl -X POST https://n8n.theprofitplatform.com.au/webhook/seo-optimization \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"content_id\":\"test\",\"title\":\"Test\",\"content\":\"Test\",\"keywords\":[\"test\"]}'"
echo ""
echo "📚 Documentation:"
echo "   • Test docs: $SCRIPT_DIR/SEO_WORKFLOW_TEST.md"
echo "   • Import guide: $SCRIPT_DIR/IMPORT_SEO_WORKFLOW.md"
echo "   • Test results: $SCRIPT_DIR/SEO_WORKFLOW_TEST_RESULTS.md"
echo ""
echo "✅ Services Status:"
systemctl is-active n8n && echo "   • n8n: Running" || echo "   • n8n: Stopped"
systemctl is-active postgresql && echo "   • PostgreSQL: Running" || echo "   • PostgreSQL: Stopped"
systemctl is-active ollama && echo "   • Ollama: Running" || echo "   • Ollama: Stopped"
echo ""
