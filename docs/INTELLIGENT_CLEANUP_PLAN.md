# 🧹 Intelligent Project Cleanup Plan

**Generated**: 2025-10-05
**Project**: astro-site (theprofitplatform.com.au)
**Current State**: 80+ untracked files, 2 modified files, 4.1GB total size

---

## 📊 Analysis Summary

### File Categorization by Size & Purpose

| Category | Size | Files | Status | Action |
|----------|------|-------|--------|---------|
| **Visual Check Tests** | 2.1GB | scripts/visual-check/* | ⚠️ BLOAT | Cleanup node_modules, archive screenshots |
| **N8N QA Tests** | 101MB | tests/n8n-qa/* | ⚠️ TEMPORARY | Archive or gitignore |
| **API Service** | 9.6MB | api/* | ✅ KEEP | Separate commit, add to gitignore |
| **N8N Workflows** | 264KB | n8n-workflows/* | ✅ KEEP | Commit as infrastructure |
| **Documentation** | <1MB | *.md files | ✅ KEEP | Organize and commit |
| **Scripts** | <1MB | scripts/*.sh, *.py | ✅ KEEP | Review and commit useful ones |

### Key Findings

1. **🚨 CRITICAL**: `scripts/visual-check/node_modules/` (20MB) should NEVER be committed
2. **📦 Package.json**: Added Gemini AI dependencies (@google/generative-ai, @google/gemini-cli)
3. **🔧 New Services**:
   - API proxy service with systemd unit
   - Visual agent Playwright testing with systemd timer
   - N8N workflow automation infrastructure
4. **📝 Documentation**: Comprehensive setup guides for n8n/SEO workflows

---

## 🎯 Cleanup Strategy (5 Phases)

### Phase 1: Protect & Backup (5 min)
**Goal**: Ensure no data loss during cleanup

```bash
# Create timestamped backup
tar -czf ~/backups/astro-site-pre-cleanup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  ~/projects/astro-site/

# Verify backup
ls -lh ~/backups/
```

**Why**: Safety first - allows rollback if cleanup goes wrong

---

### Phase 2: Enhanced .gitignore (10 min)
**Goal**: Prevent future bloat and protect sensitive data

**Add to .gitignore**:
```gitignore
# Test artifacts and screenshots
scripts/visual-check/screenshots/
scripts/visual-check/test-results/
scripts/visual-check/node_modules/
tests/**/screenshots/
tests/**/test-results/
tests/**/artifacts/

# API service (separate deployment concern)
api/node_modules/
api/logs/
api/data/
api/.env

# N8N QA (temporary test artifacts)
tests/n8n-qa/

# Environment files (security)
.env.tool-agent
*.env.local

# Analysis reports (generated files)
scripts/visual-check/*.json
!scripts/visual-check/package.json

# Build artifacts
*.db-shm
*.db-wal

# Systemd service files (system-specific)
*.service
*.timer
```

**Why**:
- Prevents 2.1GB of test artifacts from being tracked
- Protects sensitive credentials
- Excludes generated/temporary files

---

### Phase 3: File Organization (20 min)
**Goal**: Logical structure for maintainability

#### 3A. Archive Non-Production Files
```bash
# Move test screenshots to archive
mkdir -p archive/visual-check-runs
mv scripts/visual-check/screenshots/* archive/visual-check-runs/

# Move test artifacts
mv scripts/visual-check/test-results archive/visual-check-runs/
mv tests/n8n-qa/screenshots archive/n8n-test-runs/
```

#### 3B. Organize Documentation
```bash
# Create docs structure
mkdir -p docs/{setup,workflows,api}

# Move setup guides
mv FINAL_SETUP_STATUS.md docs/setup/
mv GMAIL_SETUP.md docs/setup/
mv QUICKSTART_SEO_WORKFLOW.md docs/workflows/

# Move technical docs
mv docs/*seo-workflow*.md docs/workflows/
mv docs/n8n-*.md docs/workflows/
mv docs/POSTGRESQL_CREDENTIAL_SETUP.md docs/setup/
```

#### 3C. Scripts Directory Cleanup
```bash
# Keep production scripts in /scripts
# Move one-off setup scripts to docs/setup/scripts/
mkdir -p docs/setup/scripts

mv scripts/setup-*.sh docs/setup/scripts/
mv scripts/import-*.sh docs/setup/scripts/
mv scripts/verify-*.sh docs/setup/scripts/
mv scripts/auto-import-* docs/setup/scripts/
```

**Why**:
- Separates production code from test artifacts
- Clear distinction between active scripts and setup guides
- Easier navigation for future developers

---

### Phase 4: Dependency & Code Review (15 min)
**Goal**: Validate changes and update dependencies

#### 4A. Review Package.json Changes
**Changes Found**:
- ✅ `@google/generative-ai: 0.24.1` - For Gemini API integration
- ✅ `@google/gemini-cli: 0.7.0` - CLI tooling (dev dependency)

**Action**: KEEP - These support the visual analysis workflow

#### 4B. Update Outdated Dependencies
```bash
# Update undici (security/performance)
npm install undici@latest

# Verify no breaking changes
npm run build
npm run test
```

#### 4C. API Directory Decision
**Recommendation**: KEEP in repo but gitignore runtime files

**Rationale**:
- Small codebase (9.6MB with node_modules)
- Tightly coupled to astro-site workflows
- Separate service but shared deployment context
- Gitignore: node_modules, logs, data, .env

**Alternative**: If API grows beyond 50MB or gains independent deployment, create separate repo

---

### Phase 5: Commit Strategy (25 min)
**Goal**: Atomic, logical commits for clean git history

#### Commit 1: Infrastructure - .gitignore
```bash
git add .gitignore
git commit -m "chore: Enhanced .gitignore for test artifacts and sensitive files

- Exclude visual-check screenshots and test results (2.1GB saved)
- Protect API service runtime files (logs, data, node_modules)
- Ignore environment files (.env.tool-agent)
- Exclude systemd service files (system-specific configs)"
```

#### Commit 2: Dependencies - Package Updates
```bash
git add package.json package-lock.json
git commit -m "feat: Add Gemini AI integration and update dependencies

- Add @google/generative-ai@0.24.1 for visual analysis
- Add @google/gemini-cli@0.7.0 dev tooling
- Update undici 6.21.3 → 7.16.0 (security/performance)

Supports scripts/gemini-analyze.mjs workflow"
```

#### Commit 3: Infrastructure - N8N Workflows
```bash
git add n8n-workflows/
git commit -m "feat: Add n8n SEO workflow automation infrastructure

- Advanced SEO optimization workflow with 12 nodes
- PostgreSQL integration for competitor analysis
- SMTP email reporting configuration
- Automated setup and import scripts

Workflows deployed at n8n.theprofitplatform.com.au"
```

#### Commit 4: Documentation - Setup Guides
```bash
git add docs/setup/ docs/workflows/
git commit -m "docs: Add comprehensive n8n and SEO workflow setup guides

- Final setup status with UI activation steps
- Gmail app password configuration for SMTP
- Quick start guide for workflow testing
- PostgreSQL credential setup
- N8N workflow activation procedures"
```

#### Commit 5: Infrastructure - API Service
```bash
git add api/
git commit -m "feat: Add API proxy service for Claude Code integration

- Express-based proxy server (api/server.js)
- Claude Code API wrapper (api/claude-code-api.mjs)
- PM2 ecosystem configuration for process management
- Systemd service unit for auto-start (not committed)

Service runs independently from Astro static site"
```

#### Commit 6: Scripts - Visual Analysis
```bash
git add scripts/gemini-analyze.mjs scripts/visual-check/*.cjs
git commit -m "feat: Add visual regression and AI analysis scripts

- Gemini-powered visual analysis (gemini-analyze.mjs)
- Playwright-based page discovery and screenshot capture
- Email reporting for analysis results
- N8N webhook integration for automated workflows

Excludes test artifacts (screenshots, reports) via .gitignore"
```

#### Commit 7: Scripts - Domain Setup
```bash
git add scripts/setup-domain.sh
git commit -m "chore: Update domain setup script

[Review actual changes in git diff]"
```

#### Commit 8: Documentation - Cleanup Process
```bash
git add docs/INTELLIGENT_CLEANUP_PLAN.md docs/CLEANUP_EXECUTION_LOG.md
git commit -m "docs: Document intelligent cleanup process and execution

- Comprehensive cleanup plan with 5-phase strategy
- Execution log with commands and results
- Decision rationale for file organization
- Commit strategy documentation"
```

---

## 🎭 Alternative Strategies Considered

### Strategy A: Aggressive Cleanup (Not Recommended)
- Delete all test artifacts
- Remove all untracked files except minimal docs
- **Cons**: Loses valuable test history, hard to debug regressions

### Strategy B: Separate Repos (Overkill)
- Move API to separate repo
- Move n8n workflows to separate repo
- **Cons**: Complicates deployment, loses integration context

### Strategy C: Mono-repo with Workspaces (Future Option)
- Use npm workspaces for api/, scripts/visual-check/
- Independent package.json for each workspace
- **Pros**: Better dependency isolation
- **Cons**: Complexity for small project, not needed yet

**Chosen Strategy**: Hybrid - Keep integrated but use gitignore strategically

---

## 📋 Pre-Flight Checklist

Before executing:

- [ ] Backup created and verified
- [ ] Current branch: `main` and synced with origin
- [ ] No active dev server running (`pkill -f "astro dev"`)
- [ ] Review all git diffs before committing
- [ ] Test build after each major commit
- [ ] Run `npm run parity:scan` before final push

---

## 🚀 Execution Timeline

| Phase | Time | Risk | Reversible |
|-------|------|------|------------|
| 1. Backup | 5 min | Low | N/A |
| 2. .gitignore | 10 min | Low | Yes (git restore) |
| 3. File Organization | 20 min | Medium | Yes (from backup) |
| 4. Dependencies | 15 min | Medium | Yes (npm ci) |
| 5. Commits | 25 min | Low | Yes (git reset) |
| **TOTAL** | **75 min** | **Low** | **Yes** |

---

## 🎯 Success Metrics

After cleanup:

1. ✅ Git status shows <10 untracked files (from 80+)
2. ✅ Working tree size <500MB (from 4.1GB)
3. ✅ `npm run build` succeeds
4. ✅ `npm run parity:scan` passes
5. ✅ All commits are atomic and well-documented
6. ✅ Sensitive files (.env) not committed

---

## 🔄 Maintenance Plan

### Weekly
- Review test artifact sizes: `du -sh scripts/visual-check/screenshots/`
- Clean old screenshots: `find scripts/visual-check/screenshots/ -mtime +30 -delete`

### Monthly
- Audit .gitignore effectiveness: `git status --ignored`
- Update dependencies: `npm outdated && npm update`

### Quarterly
- Re-evaluate API service: If >100MB, consider separate repo
- Archive old test runs: `tar -czf archive/visual-runs-Q1-2025.tar.gz ...`

---

## 📞 Support & References

- **Git History**: Preserve via backup before major operations
- **Rollback Command**: `tar -xzf ~/backups/astro-site-pre-cleanup-*.tar.gz`
- **Questions**: Document decisions in docs/CLEANUP_EXECUTION_LOG.md

---

**Next Step**: Review this plan, then execute Phase 1 (Backup)
