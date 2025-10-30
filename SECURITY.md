# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of The Profit Platform seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Create a Public Issue

Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

Send your vulnerability report to: **avi@theprofitplatform.com.au**

Include the following information:
- Type of vulnerability (e.g., XSS, CSRF, SQL injection, etc.)
- Full paths of affected source file(s)
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue and how an attacker might exploit it

### 3. What to Expect

- **Acknowledgment**: We'll acknowledge your email within 48 hours
- **Updates**: We'll provide regular updates on our progress
- **Timeline**: We aim to resolve critical vulnerabilities within 7 days
- **Credit**: With your permission, we'll credit you in our security advisories

### 4. Security Update Process

1. **Triage** (1-2 days): Verify and assess the vulnerability
2. **Fix Development** (3-7 days): Develop and test the fix
3. **Release** (1 day): Deploy the fix to production
4. **Disclosure** (after fix): Publish security advisory

## Security Best Practices

### For Contributors

- Always use the latest versions of dependencies
- Run `npm audit` before submitting pull requests
- Never commit sensitive data (API keys, passwords, tokens)
- Use environment variables for configuration
- Follow secure coding practices

### For Users

- Keep your installation up to date
- Use strong, unique passwords
- Enable two-factor authentication where available
- Regularly review access logs
- Report suspicious activity immediately

## Security Features

### Current Implementation

- **Content Security Policy**: Configured via Cloudflare headers
- **HTTPS**: Enforced across all pages
- **Dependency Scanning**: Automated via Dependabot
- **Code Scanning**: GitHub Advanced Security (when enabled)
- **Secret Scanning**: GitHub secret scanning (when enabled)

### Recommended GitHub Security Settings

To maximize security, enable these features in your repository:

1. **Settings → Security → Code security and analysis**
   - ✅ Dependency graph (enabled by default)
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Grouped security updates
   - ✅ Secret scanning (available on public repos)

2. **Branch Protection Rules**
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

## Known Security Considerations

### Third-Party Dependencies

This project uses several third-party services and APIs:
- Google APIs (Analytics, Search Console, My Business)
- Cloudflare (hosting, CDN, security)
- Anthropic AI, Google Generative AI, Perplexity AI
- DataForSEO, SerpAPI

Ensure all API keys are:
- Stored in environment variables
- Never committed to version control
- Rotated regularly
- Scoped with minimum required permissions

### Development vs Production

- Development server (`npm run dev`) is for local use only
- Never expose development server to public internet
- Production builds include optimizations and security headers
- Use `npm run build` and `npm run deploy` for production

## Security Contacts

- **Primary**: avi@theprofitplatform.com.au
- **Website**: https://theprofitplatform.com.au/contact/
- **Phone**: +61 487 286 451

## Acknowledgments

We appreciate the security research community's efforts in keeping The Profit Platform secure. Security researchers who responsibly disclose vulnerabilities will be acknowledged (with permission) in our security advisories.

---

**Last Updated**: 2025-10-30
