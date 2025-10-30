# GitHub Security Setup Guide

## ✅ Completed Security Fixes

### 1. Dependency Vulnerabilities - FIXED ✅
- **Status**: All 6 moderate vulnerabilities resolved
- **Action**: Upgraded vitest from 2.1.8 to 4.0.5 and @vitest/ui to 4.0.5
- **Verification**: `npm audit` now shows 0 vulnerabilities

### 2. Dependabot Configuration - CREATED ✅
- **File**: `.github/dependabot.yml`
- **Features**:
  - Weekly automatic dependency updates (Mondays 9 AM Sydney time)
  - Grouped updates for Astro, testing, and linting packages
  - Automatic PR creation with labels and assignees
  - Security updates always allowed

### 3. Security Policy - CREATED ✅
- **File**: `SECURITY.md`
- **Features**:
  - Vulnerability disclosure process
  - Contact information
  - Security best practices
  - Supported versions matrix

### 4. Security Scanning Workflow - CREATED ✅
- **File**: `.github/workflows/security.yml`
- **Features**:
  - NPM dependency audit
  - Secret scanning with TruffleHog
  - Outdated dependency checks
  - License compliance checking
  - Runs on push, PR, and weekly schedule
  - Posts results to PR comments

## 🔧 Required Manual Setup

You need to enable these features in your GitHub repository:

### Step 1: Enable Dependabot Alerts

1. Go to: https://github.com/Theprofitplatform/tpp/settings/security_analysis
2. Under "Code security and analysis", enable:
   - ✅ **Dependency graph** (should already be enabled)
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Grouped security updates**

### Step 2: Enable Secret Scanning

1. On the same page (Security & analysis)
2. Enable:
   - ✅ **Secret scanning** (free for public repos)
   - ✅ **Push protection** (prevents accidental secret commits)

### Step 3: Configure Branch Protection

1. Go to: https://github.com/Theprofitplatform/tpp/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main` (or your default branch)
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 minimum)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Step 4: Review Security Advisories

1. Go to: https://github.com/Theprofitplatform/tpp/security
2. Review any existing advisories
3. Set up notifications for new advisories

### Step 5: Configure GitHub Actions Permissions

1. Go to: https://github.com/Theprofitplatform/tpp/settings/actions
2. Under "Workflow permissions":
   - ✅ Select "Read and write permissions"
   - ✅ Check "Allow GitHub Actions to create and approve pull requests"

## 🔍 Verification

### Verify Dependabot Configuration

```bash
# Check if dependabot.yml is valid
cat .github/dependabot.yml
```

### Verify No Vulnerabilities

```bash
cd /mnt/c/Users/abhis/projects/atpp/tpp
npm audit
# Expected: "found 0 vulnerabilities"
```

### Verify Security Workflow

```bash
# Check workflow file exists
ls -la .github/workflows/security.yml

# Trigger workflow manually
gh workflow run security.yml
```

### Check Current Package Versions

```bash
npm list vitest @vitest/ui
# Expected:
# vitest@4.0.5
# @vitest/ui@4.0.5
```

## 📊 Security Dashboard

After enabling GitHub security features, you'll have access to:

1. **Security Overview**: https://github.com/Theprofitplatform/tpp/security
   - Dependabot alerts dashboard
   - Secret scanning alerts
   - Code scanning alerts (if enabled)

2. **Dependency Graph**: https://github.com/Theprofitplatform/tpp/network/dependencies
   - Visual map of all dependencies
   - Dependents tracking

3. **Security Advisories**: https://github.com/Theprofitplatform/tpp/security/advisories
   - Create and manage security advisories
   - Coordinate vulnerability fixes

## 🔄 Ongoing Maintenance

### Weekly Tasks
- Review Dependabot PRs (auto-created on Mondays)
- Check security workflow results
- Review any new security alerts

### Monthly Tasks
- Run `npm audit` manually
- Review outdated dependencies: `npm outdated`
- Update major version dependencies

### Quarterly Tasks
- Review and update SECURITY.md
- Audit API keys and rotate as needed
- Review branch protection rules
- Check security workflow effectiveness

## 🚨 Responding to Security Alerts

### If Dependabot Creates an Alert:

1. **Review**: Click the alert to see details
2. **Update**: Accept the Dependabot PR or run manually:
   ```bash
   npm update <package-name>
   npm audit fix
   ```
3. **Test**: Run your test suite
4. **Deploy**: Merge and deploy the fix

### If Secret Scanning Finds Something:

1. **Verify**: Confirm it's a real secret (not a false positive)
2. **Rotate**: Immediately rotate the exposed credential
3. **Remove**: Remove the secret from git history if needed:
   ```bash
   # Use BFG Repo Cleaner or git filter-branch
   ```
4. **Update**: Store secrets properly in environment variables

## 📞 Support

If you encounter issues with security setup:

- **Email**: avi@theprofitplatform.com.au
- **Documentation**: See SECURITY.md
- **GitHub Docs**: https://docs.github.com/en/code-security

---

**Last Updated**: 2025-10-30
**Status**: Ready for manual GitHub UI configuration
