# Current Architecture State

**Last Updated**: 2025-10-05
**Status**: Pre-cleanup discovery complete

## Service Overview

| Service | Location | Deploy Target | Port | Status | Size |
|---------|----------|---------------|------|--------|------|
| Frontend | src/ | Cloudflare Pages | 3001 (dev) | ✅ Active | Part of main repo |
| API (Simple) | api/ | Local dev only | 3001 | ⚠️ Dev | 9.6MB |
| Backend (Full) | backend/ | VPS via PM2 | 4321 | ✅ Production | Separate deployment |
| Visual QA | scripts/visual-check/ | Systemd timer | N/A | ✅ Active | 2.1GB |
| N8N Workflows | n8n-workflows/ | n8n.theprofitplatform.com.au | 5678 | ✅ Active | 264KB |

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  PRODUCTION DEPLOYMENT                                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Frontend: theprofitplatform.com.au                      │ │
│  │ Platform: Cloudflare Pages                              │ │
│  │ Source: dist/ (built from src/)                         │ │
│  │ Build: Automatic on git push to main                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           ↓ API calls                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ API: api3.theprofitplatform.com.au                      │ │
│  │ Backend: VPS (different location)                       │ │
│  │ Port: 4321 (reverse proxy via Nginx)                    │ │
│  │ Process: PM2 (tpp-backend)                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ N8N: n8n.theprofitplatform.com.au                       │ │
│  │ Port: 5678                                              │ │
│  │ Workflows: Imported from n8n-workflows/                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Critical Findings

### 1. Frontend Package.json Pollution
**Problem**: Main package.json contains backend dependencies

**Evidence**:
```json
{
  "dependencies": {
    "express": "^4.18.2",      // ❌ Backend only
    "nodemailer": "^6.9.7",    // ❌ Backend only
    "cors": "^2.8.5",          // ❌ Backend only
    "@google/generative-ai": "0.24.1"  // ❌ Scripts only
  }
}
```

**Impact**:
- Cloudflare Pages bundle bloated by ~20MB
- Frontend includes unnecessary server dependencies
- Build time increased
- Security surface area expanded

**Solution**: Move to appropriate package.json files

### 2. Dual Backend Services

**API Service** (api/)
- Simple Express server
- Purpose: Contact forms, n8n webhook triggers
- Port: 3001
- **Status**: Local development only
- Production equivalent: api3.theprofitplatform.com.au

**Backend Service** (backend/)
- Full Express server with security middleware
- Purpose: Rank tracker, SERP analysis, speed tests
- Port: 4321
- **Status**: Running via PM2 in production
- Database: SQLite (rank-tracker.db)

**Question**: Should these be merged? Currently duplicates Express setup.

### 3. Screenshot Bloat (2.1GB!)

**Location**: scripts/visual-check/
- screenshots/: **1.9GB** (2,944 files)
- test-results/: **72MB**
- node_modules/: **20MB**

**Test Runs**: 13 runs from 2025-10-01 to 2025-10-03

**Problem**: All committed to git (or about to be)

**Solution**:
- Exclude from git via .gitignore
- Move to Cloudflare R2 storage
- 7-day local retention policy

### 4. Environment Variable Sprawl

**Found 6 different .env locations**:
- `.env` (root)
- `.env.local` (root)
- `.env.tool-agent` (root)
- `api/.env`
- `backend/.env.example`
- `tests/n8n-qa/.env`

**Risk**:
- Configuration drift
- Secrets exposure
- Inconsistent environments

### 5. Production API Configuration

**Frontend References**:
```javascript
const apiUrl = import.meta.env.PUBLIC_API_URL || 'https://api3.theprofitplatform.com.au'
```

**19 API endpoint references** in src/:
- `/api/contact` - Contact form submission
- `/api/serp/rank-check` - Rank tracking
- `/api/n8n/workflows` - N8N integration
- `/api/speed-test` - Performance testing
- `/api/seo-audit` - Site audits

**Deployment**:
- Development: api/ runs locally on PORT 3001
- Production: api3.theprofitplatform.com.au (separate VPS)
- Backend: Running via PM2 (tpp-backend process)

## Team Context

**Contributors** (git log analysis):
- Abhi <abhi@example.com>
- The Profit Platform <admin@theprofitplatform.com.au>
- Theprofitplatform <avi@theprofitplatform.com.au>
- houston[bot] (Astro bot)

**Collaboration**: Team project (3 humans + bot)

## Size Analysis

| Directory | Size | Notes |
|-----------|------|-------|
| **Total** | 4.1GB | Entire working tree |
| scripts/visual-check/ | 2.1GB | **BLOAT**: Screenshots + test results |
| tests/n8n-qa/ | 101MB | Test artifacts |
| api/ | 9.6MB | Includes node_modules |
| n8n-workflows/ | 264KB | Infrastructure as code |
| backend/ | N/A | Deployed separately |

## CI/CD Pipeline

**GitHub Actions** (.github/workflows/):
- `deploy.yml` - Cloudflare Pages deployment
- `pr-automation.yml` - PR automation

**Deployment Trigger**: Git push to main branch

## Repository Issues

1. ❌ **No clear monorepo structure** - services mixed together
2. ❌ **Massive test artifact bloat** - 2.1GB in git (or soon)
3. ❌ **Dependencies in wrong locations** - frontend has backend deps
4. ❌ **No service boundaries** - unclear what belongs where
5. ❌ **No architectural documentation** - organically grown
6. ❌ **Multiple .env files** - configuration sprawl
7. ❌ **Database files at risk** - *.db not gitignored

## Recommendations

### Immediate (This Cleanup)
1. Isolate dependencies per service
2. Strategic .gitignore for test artifacts
3. Document architecture and decisions
4. Organize documentation structure
5. Move screenshots to cloud storage

### Future Considerations
1. Merge api/ and backend/ into single service?
2. Implement proper monorepo tooling (workspaces)?
3. Separate repos per deployable service?
4. Add integration tests for API contracts?

## Next Steps

**See**: docs/INTELLIGENT_CLEANUP_PLAN_V2.md for execution plan

**Goal**: Clean, documented, maintainable monorepo with clear service boundaries
