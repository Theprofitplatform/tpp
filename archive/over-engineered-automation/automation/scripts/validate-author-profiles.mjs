#!/usr/bin/env node
/**
 * Author Profile Validator
 * Validates that author social URLs and emails are real, not placeholders
 */

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Author profiles (copied from src/pages/blog/[...slug].astro)
const authorProfiles = {
  "Avi": {
    name: "Avi",
    jobTitle: "Founder & SEO Strategist",
    email: "avi@theprofitplatform.com.au",
    url: "https://theprofitplatform.com.au/about",
    sameAs: [
      "https://www.linkedin.com/company/theprofitplatform",
      "https://twitter.com/profitplatform"
    ]
  },
  "TPP Team": {
    name: "The Profit Platform Team",
    jobTitle: "Digital Marketing Experts",
    email: "team@theprofitplatform.com.au",
    url: "https://theprofitplatform.com.au/about",
    sameAs: [
      "https://www.linkedin.com/company/theprofitplatform",
      "https://twitter.com/profitplatform"
    ]
  },
  "The Profit Platform": {
    name: "The Profit Platform",
    jobTitle: "Digital Marketing Agency",
    email: "info@theprofitplatform.com.au",
    url: "https://theprofitplatform.com.au/about",
    sameAs: [
      "https://www.linkedin.com/company/theprofitplatform",
      "https://www.facebook.com/theprofitplatform",
      "https://www.instagram.com/theprofitplatform"
    ]
  }
};

// Schema publisher logo
const publisherLogo = "https://theprofitplatform.com.au/logo.png";

/**
 * Check if a URL is accessible
 */
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Author-Profile-Validator/1.0)'
      }
    });

    clearTimeout(timeout);

    return {
      valid: response.ok,
      status: response.status,
      url
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      url
    };
  }
}

/**
 * Validate email format
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Main validation
 */
async function main() {
  console.log('👤 Author Profile Validator\n');
  console.log('━'.repeat(60));

  const issues = [];
  const warnings = [];

  // Validate each author profile
  for (const [authorKey, profile] of Object.entries(authorProfiles)) {
    console.log(`\n📋 Validating: ${authorKey} (${profile.name})`);

    // 1. Email validation
    console.log(`\n   📧 Email: ${profile.email}`);
    if (!validateEmailFormat(profile.email)) {
      issues.push(`${authorKey}: Invalid email format: ${profile.email}`);
      console.log(`      ❌ Invalid format`);
    } else {
      console.log(`      ✓ Valid format`);

      // Check if domain exists (basic check)
      const domain = profile.email.split('@')[1];
      if (domain !== 'theprofitplatform.com.au') {
        warnings.push(`${authorKey}: Email domain is not theprofitplatform.com.au`);
        console.log(`      ⚠️  Domain: ${domain} (expected: theprofitplatform.com.au)`);
      }
    }

    // 2. Profile URL validation
    console.log(`\n   🔗 Profile URL: ${profile.url}`);
    const urlCheck = await checkUrl(profile.url);
    if (!urlCheck.valid) {
      issues.push(`${authorKey}: Profile URL not accessible: ${profile.url} (${urlCheck.error || urlCheck.status})`);
      console.log(`      ❌ Not accessible (${urlCheck.error || urlCheck.status})`);
    } else {
      console.log(`      ✓ Accessible (${urlCheck.status})`);
    }

    // 3. Social media URLs validation
    console.log(`\n   🌐 Social Media Links:`);
    for (const socialUrl of profile.sameAs) {
      const socialCheck = await checkUrl(socialUrl);

      const platform = socialUrl.includes('linkedin') ? 'LinkedIn' :
                      socialUrl.includes('twitter') ? 'Twitter' :
                      socialUrl.includes('facebook') ? 'Facebook' :
                      socialUrl.includes('instagram') ? 'Instagram' : 'Unknown';

      console.log(`      ${platform}: ${socialUrl}`);

      if (!socialCheck.valid) {
        // Social media URLs returning 40x might be due to bot detection, warn instead of error
        if (socialCheck.status === 403 || socialCheck.status === 999) {
          warnings.push(`${authorKey}: ${platform} URL may be protected by bot detection: ${socialUrl}`);
          console.log(`         ⚠️  Protected by bot detection (${socialCheck.status})`);
        } else if (socialCheck.status === 404) {
          issues.push(`${authorKey}: ${platform} profile doesn't exist: ${socialUrl}`);
          console.log(`         ❌ Profile not found (404)`);
        } else {
          warnings.push(`${authorKey}: ${platform} URL check failed: ${socialUrl} (${socialCheck.error || socialCheck.status})`);
          console.log(`         ⚠️  Check failed (${socialCheck.error || socialCheck.status})`);
        }
      } else {
        console.log(`         ✓ Accessible (${socialCheck.status})`);
      }
    }
  }

  // Validate publisher logo
  console.log(`\n\n📷 Publisher Logo: ${publisherLogo}`);
  const logoCheck = await checkUrl(publisherLogo);
  if (!logoCheck.valid) {
    issues.push(`Publisher logo not accessible: ${publisherLogo} (${logoCheck.error || logoCheck.status})`);
    console.log(`   ❌ Not accessible (${logoCheck.error || logoCheck.status})`);
  } else {
    console.log(`   ✓ Accessible (${logoCheck.status})`);
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 VALIDATION SUMMARY:');

  if (issues.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((warn, i) => {
      console.log(`   ${i + 1}. ${warn}`);
    });
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ All author profiles valid!');
  } else if (issues.length === 0) {
    console.log('\n✅ No critical issues (only warnings)');
  }

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Verify all email addresses are real and monitored');
  console.log('   2. Ensure social media profiles are claimed and active');
  console.log('   3. Publisher logo should exist at specified URL for rich results');
  console.log('   4. Keep author credentials up-to-date for E-E-A-T compliance');

  if (issues.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { authorProfiles, validateEmailFormat };
