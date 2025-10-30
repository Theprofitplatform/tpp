#!/bin/bash

##############################################################################
# Automation Improvements Setup Script
#
# This script prepares your environment for the parallel implementation plan
# Run this BEFORE starting the implementation
#
# Usage:
#   chmod +x scripts/setup-improvements.sh
#   ./scripts/setup-improvements.sh
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is NOT installed"
        return 1
    fi
}

# Start
print_header "🚀 AUTOMATION IMPROVEMENTS SETUP"

print_info "This script will prepare your environment for the improvements"
print_info "Estimated time: 5 minutes"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Setup cancelled"
    exit 1
fi

##############################################################################
# STEP 1: Verify Prerequisites
##############################################################################

print_header "STEP 1: Verifying Prerequisites"

MISSING=0

check_command node || MISSING=$((MISSING + 1))
check_command npm || MISSING=$((MISSING + 1))
check_command git || MISSING=$((MISSING + 1))

if [ $MISSING -gt 0 ]; then
    print_error "$MISSING required commands are missing"
    print_info "Install missing prerequisites and try again"
    exit 1
fi

print_success "All prerequisites installed"

##############################################################################
# STEP 2: Backup Current State
##############################################################################

print_header "STEP 2: Creating Backup"

print_step "Creating feature branch..."
BRANCH_NAME="automation-improvements-$(date +%Y%m%d)"

if git rev-parse --verify $BRANCH_NAME &>/dev/null; then
    print_warning "Branch $BRANCH_NAME already exists"
    read -p "Delete and recreate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D $BRANCH_NAME
        git checkout -b $BRANCH_NAME
    else
        git checkout $BRANCH_NAME
    fi
else
    git checkout -b $BRANCH_NAME
fi

print_success "Created branch: $BRANCH_NAME"

print_step "Committing current state..."
git add -A
git commit -m "Backup before automation improvements" || print_warning "No changes to commit"

print_success "Backup complete"

##############################################################################
# STEP 3: Install Dependencies
##############################################################################

print_header "STEP 3: Installing Dependencies"

print_step "Installing new npm packages..."

# Core dependencies
npm install nodemailer --save || print_warning "Failed to install nodemailer"

# Testing dependencies
npm install --save-dev vitest @vitest/ui || print_warning "Failed to install testing packages"

# Optional dependencies
npm install flesch-kincaid --save || print_warning "Failed to install flesch-kincaid"
npm install string-similarity --save || print_warning "Failed to install string-similarity"

print_success "Dependencies installed"

##############################################################################
# STEP 4: Create Directory Structure
##############################################################################

print_header "STEP 4: Creating Directory Structure"

print_step "Creating automation directories..."

mkdir -p automation/lib
mkdir -p automation/tests
mkdir -p automation/logs
mkdir -p automation/.cache
mkdir -p automation/data/backups
mkdir -p automation/generated/gbp-posts
mkdir -p automation/generated/link-outreach
mkdir -p automation/generated/review-emails
mkdir -p automation/reports

print_success "Directory structure created"

##############################################################################
# STEP 5: Backup Environment Files
##############################################################################

print_header "STEP 5: Backing Up Environment Files"

if [ -f .env.local ]; then
    print_step "Backing up .env.local..."
    cp .env.local .env.local.backup
    print_success "Backed up .env.local"
else
    print_warning ".env.local not found - will need to create one"
fi

##############################################################################
# STEP 6: Check Existing Files
##############################################################################

print_header "STEP 6: Checking Existing Files"

# Check for files that were already created
FILES_CREATED=0

if [ -f automation/lib/rate-limiter.mjs ]; then
    print_success "rate-limiter.mjs exists"
    FILES_CREATED=$((FILES_CREATED + 1))
fi

if [ -f automation/lib/env-validator.mjs ]; then
    print_success "env-validator.mjs exists"
    FILES_CREATED=$((FILES_CREATED + 1))
fi

if [ -f automation/lib/logger.mjs ]; then
    print_success "logger.mjs exists"
    FILES_CREATED=$((FILES_CREATED + 1))
fi

if [ $FILES_CREATED -eq 0 ]; then
    print_warning "No library files found - you'll need to create them"
elif [ $FILES_CREATED -eq 3 ]; then
    print_success "All foundation files exist"
else
    print_warning "Some foundation files missing ($FILES_CREATED/3 found)"
fi

##############################################################################
# STEP 7: Update package.json Scripts
##############################################################################

print_header "STEP 7: Updating package.json"

print_step "Adding test scripts..."

# Check if test scripts exist
if grep -q "\"test:unit\"" package.json; then
    print_info "Test scripts already configured"
else
    print_warning "You'll need to manually add test scripts to package.json"
    print_info "Add these to the scripts section:"
    echo ""
    echo '  "test:unit": "vitest run",'
    echo '  "test:watch": "vitest",'
    echo '  "test:coverage": "vitest run --coverage",'
    echo ""
fi

##############################################################################
# STEP 8: Environment Validation
##############################################################################

print_header "STEP 8: Environment Validation"

print_step "Checking required environment variables..."

if [ -f .env.local ]; then
    source .env.local

    # Check critical env vars
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        print_error "ANTHROPIC_API_KEY not set in .env.local"
        print_info "Get your API key from: https://console.anthropic.com"
    else
        print_success "ANTHROPIC_API_KEY is set"
    fi

    if [ -z "$GOOGLE_REVIEW_URL" ]; then
        print_warning "GOOGLE_REVIEW_URL not set"
    else
        if echo "$GOOGLE_REVIEW_URL" | grep -q "YOUR_PLACE_ID"; then
            print_error "GOOGLE_REVIEW_URL contains placeholder"
            print_info "Update with your actual review URL"
        else
            print_success "GOOGLE_REVIEW_URL is set"
        fi
    fi
else
    print_error ".env.local file not found"
    print_info "Create .env.local with required variables"
fi

##############################################################################
# STEP 9: Git Configuration
##############################################################################

print_header "STEP 9: Git Configuration"

print_step "Updating .gitignore..."

# Check if .cache is ignored
if grep -q "automation/.cache" .gitignore; then
    print_info ".cache already ignored"
else
    echo "" >> .gitignore
    echo "# Automation cache" >> .gitignore
    echo "automation/.cache/" >> .gitignore
    echo "automation/logs/" >> .gitignore
    print_success "Added to .gitignore"
fi

##############################################################################
# STEP 10: Generate Implementation Checklist
##############################################################################

print_header "STEP 10: Creating Implementation Checklist"

cat > IMPLEMENTATION-CHECKLIST.md << 'EOF'
# Automation Improvements - Implementation Checklist

## Pre-Implementation ✅
- [x] Backup created
- [x] Dependencies installed
- [x] Directory structure created
- [ ] Read PARALLEL-IMPLEMENTATION-PLAN.md
- [ ] Understand the work streams

## Stream 1: Core Infrastructure
### Day 1
- [ ] Task 1.1: Create library structure
- [ ] Task 1.2: Implement rate limiter
- [ ] Task 1.3: Create cache system
- [ ] Task 1.4: Add environment validator
- [ ] Task 1.5: Fix parity scripts

### Day 2
- [ ] Task 1.6: Add checkpointing
- [ ] Task 1.7: Implement usage tracking

### Day 3
- [ ] Task 1.8: Add dry-run mode
- [ ] Task 1.9: Optimize parallel processing

## Stream 2: Security & Error Handling
### Day 1
- [ ] Task 2.1: API key validation
- [ ] Task 2.2: Retry logic
- [ ] Task 2.3: Input sanitization
- [ ] Task 2.4: Error handling wrapper

### Day 2
- [ ] Task 2.5: Update all scripts
- [ ] Task 2.6: GSC API alerting
- [ ] Task 2.7: Security audit

### Day 3
- [ ] Task 2.8: Rate limiting integration
- [ ] Task 2.9: Final security review

## Stream 3: API Integrations
### Day 1
- [ ] Task 3.1: Setup Nodemailer
- [ ] Task 3.2: Research GBP API
- [ ] Task 3.3: Move suburb data to JSON
- [ ] Task 3.4: Update Google Review URL

### Day 2
- [ ] Task 3.5: Implement email sending
- [ ] Task 3.6: Create GBP posting

### Day 3
- [ ] Task 3.7: Test email automation
- [ ] Task 3.8: Test GBP integration
- [ ] Task 3.9: Add scheduling

## Stream 4: Content & Quality
### Day 1
- [ ] Task 4.1: Content validation
- [ ] Task 4.2: Similarity checker
- [ ] Task 4.3: Quality scorer

### Day 2
- [ ] Task 4.4: Enhance prompts
- [ ] Task 4.5: Add regeneration
- [ ] Task 4.6: Duplicate detection

### Day 3
- [ ] Task 4.7: Test validation
- [ ] Task 4.8: Fine-tune thresholds
- [ ] Task 4.9: Add versioning

## Stream 5: Monitoring & Logging
### Day 1
- [ ] Task 5.1: Structured logger
- [ ] Task 5.2: Metrics tracking
- [ ] Task 5.3: Slack integration

### Day 2
- [ ] Task 5.4: Dashboard data
- [ ] Task 5.5: Failure alerting
- [ ] Task 5.6: Enhanced health check

### Day 3
- [ ] Task 5.7: Monitoring reports
- [ ] Task 5.8: Performance tracking
- [ ] Task 5.9: Automated reports

## Stream 6: Testing & Documentation
### Day 1
- [ ] Task 6.1: API documentation
- [ ] Task 6.2: JSDoc comments

### Day 2
- [ ] Task 6.3: Setup Vitest
- [ ] Task 6.4: Unit tests
- [ ] Task 6.5: Integration tests

### Day 3
- [ ] Task 6.6: Feature tests
- [ ] Task 6.7: Complete docs
- [ ] Task 6.8: Troubleshooting guide

## Day 4: Integration Testing
- [ ] Task 7.1: Run full test suite
- [ ] Task 7.2: Test orchestrator
- [ ] Task 7.3: End-to-end tests
- [ ] Task 7.4: Performance testing
- [ ] Task 7.5: Fix bugs
- [ ] Task 7.6: Code review

## Day 5: Deployment
- [ ] Task 8.1: Update documentation
- [ ] Task 8.2: Deployment checklist
- [ ] Task 8.3: Backup system
- [ ] Task 8.4: Staging tests
- [ ] Task 8.5: Deploy Phase 1
- [ ] Task 8.6: Deploy Phase 2
- [ ] Task 8.7: Deploy Phase 3
- [ ] Task 8.8: Smoke tests
- [ ] Task 8.9: Monitor 24h
- [ ] Task 8.10: Document lessons

## Post-Deployment
- [ ] All tests passing
- [ ] No critical errors
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team trained

---

**Progress**: 0/88 tasks complete (0%)
**Started**: [Date]
**Target Completion**: [Date + 5 days]
EOF

print_success "Created IMPLEMENTATION-CHECKLIST.md"

##############################################################################
# SUMMARY
##############################################################################

print_header "✅ SETUP COMPLETE"

echo ""
print_success "Your environment is ready for the automation improvements!"
echo ""

print_info "📋 Next Steps:"
echo ""
echo "  1. Review the implementation plan:"
echo "     ${CYAN}cat PARALLEL-IMPLEMENTATION-PLAN.md${NC}"
echo ""
echo "  2. Check the implementation checklist:"
echo "     ${CYAN}cat IMPLEMENTATION-CHECKLIST.md${NC}"
echo ""
echo "  3. Start with Stream 1, Day 1:"
echo "     ${CYAN}Follow the tasks in order${NC}"
echo ""
echo "  4. Test frequently:"
echo "     ${CYAN}npm run test${NC}"
echo ""
echo "  5. Check health:"
echo "     ${CYAN}npm run health${NC}"
echo ""

print_warning "Important Reminders:"
echo ""
echo "  • Work on one stream at a time (or assign to team members)"
echo "  • Test each feature before moving to the next"
echo "  • Commit after completing each major task"
echo "  • Keep the main branch stable"
echo ""

print_info "📁 Files Created:"
echo "  • automation/lib/ (ready for implementations)"
echo "  • automation/logs/ (for logging)"
echo "  • automation/.cache/ (for caching)"
echo "  • automation/data/backups/ (for backups)"
echo "  • IMPLEMENTATION-CHECKLIST.md (track progress)"
echo ""

print_info "🌿 Git Branch:"
echo "  • ${BRANCH_NAME}"
echo ""

print_success "Happy coding! 🚀"
echo ""
