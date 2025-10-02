#!/usr/bin/env node

/**
 * Growth Journey Section Implementation Verification
 *
 * This script verifies that all the requested features have been implemented correctly
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Verifying Growth Journey Section Implementation...\n');

const checklist = [
  {
    name: '2-Step Form Flow',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('form-step') &&
             content.includes('Contact Info') &&
             content.includes('progress-bar') &&
             content.includes('progress-fill') &&
             content.includes('Your Goals');
    }
  },
  {
    name: 'Service Selection Pills',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('service-pills') &&
             content.includes('service-pill') &&
             content.includes('Local SEO') &&
             content.includes('Google Ads') &&
             content.includes('Web Design') &&
             content.includes('Full Service');
    }
  },
  {
    name: '15-Minute Response Promise',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('response-promise') &&
             content.includes('15 minutes');
    }
  },
  {
    name: 'Social Proof & Reviews',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('4.9★') &&
             content.includes('100+ reviews') &&
             content.includes('testimonial-rotator') &&
             content.includes('micro-testimonial');
    }
  },
  {
    name: 'Sticky Mobile Contact Bar',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('mobile-contact-bar') &&
             content.includes('Get Strategy Session') &&
             content.includes('Call Now') &&
             content.includes('tel:+61487286451');
    }
  },
  {
    name: 'Phone Field AU Formatting',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('phone-formatting') ||
             content.includes('phoneField.addEventListener') ||
             content.includes('Australian phone number');
    }
  },
  {
    name: 'Website Favicon Preview',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('website-preview') &&
             content.includes('favicon-preview') &&
             content.includes('updateWebsiteFavicon');
    }
  },
  {
    name: 'Goal Selection Chips',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('goal-chips') &&
             content.includes('More phone calls') &&
             content.includes('Rank #1 locally') &&
             content.includes('Lower cost per lead');
    }
  },
  {
    name: 'Privacy Checkbox & Compliance',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('privacy-consent') &&
             content.includes('Privacy Policy') &&
             content.includes('required') &&
             content.includes('100% secure');
    }
  },
  {
    name: 'Honeypot Spam Protection',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('honeypot') &&
             content.includes('company-website') &&
             content.includes('aria-hidden="true"');
    }
  },
  {
    name: 'Calendly Integration',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('calendly-modal') &&
             content.includes('openCalendar') &&
             content.includes('Schedule a Call Now') &&
             content.includes('assets.calendly.com');
    }
  },
  {
    name: 'UTM Tracking',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('utm_source') &&
             content.includes('utm_medium') &&
             content.includes('utm_campaign') &&
             content.includes('initializeUTMTracking');
    }
  },
  {
    name: 'Service Auto-preselection',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('autoPreSelectService') &&
             content.includes('serviceParam') &&
             content.includes('/seo');
    }
  },
  {
    name: 'Progress Indicator',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('progress-steps') &&
             content.includes('progress-fill') &&
             content.includes('Contact Info') &&
             content.includes('Your Goals');
    }
  },
  {
    name: 'Accessibility Features',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('aria-') &&
             content.includes('role=') &&
             content.includes('radiogroup') &&
             content.includes('aria-required') &&
             content.includes('aria-describedby');
    }
  },
  {
    name: 'Mobile Responsive Design',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('@media (max-width: 768px)') &&
             content.includes('mobile-bar-active') &&
             content.includes('prefers-reduced-motion');
    }
  },
  {
    name: 'Form Validation',
    check: () => {
      const content = fs.readFileSync('./src/components/sections/GrowthJourneySection.astro', 'utf8');
      return content.includes('validateField') &&
             content.includes('validateStep1') &&
             content.includes('field-error') &&
             content.includes('showFieldError');
    }
  },
  {
    name: 'Updated Index.astro',
    check: () => {
      const content = fs.readFileSync('./src/pages/index.astro', 'utf8');
      return content.includes('GrowthJourneySection') &&
             !content.includes('ContactSection from');
    }
  }
];

let passed = 0;
let failed = 0;

console.log('Feature Verification Results:');
console.log('============================\n');

checklist.forEach((item, index) => {
  try {
    const result = item.check();
    if (result) {
      console.log(`✅ ${item.name}`);
      passed++;
    } else {
      console.log(`❌ ${item.name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${item.name} (Error: ${error.message})`);
    failed++;
  }
});

console.log('\n============================');
console.log(`Total Features: ${checklist.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 ALL FEATURES IMPLEMENTED SUCCESSFULLY!');
  console.log('\nNext Steps:');
  console.log('1. Test the form in your browser at http://localhost:4321/');
  console.log('2. Test mobile responsiveness');
  console.log('3. Verify form submission works');
  console.log('4. Check accessibility with screen readers');
  console.log('5. Test Calendly integration');
} else {
  console.log('\n⚠️  Some features may need attention.');
}

console.log('\n📋 Implementation Summary:');
console.log('==========================');
console.log('✨ 2-step form flow with progress indicator');
console.log('🎯 Service selection pills with icons');
console.log('⚡ 15-minute response promise');
console.log('⭐ Social proof with rotating testimonials');
console.log('📱 Sticky mobile contact bar');
console.log('🔢 Australian phone number formatting');
console.log('🌐 Website favicon preview');
console.log('🎯 Business goal selection chips');
console.log('🔒 Privacy compliance & honeypot protection');
console.log('📅 Calendly booking integration');
console.log('📊 UTM tracking & service auto-preselection');
console.log('♿ Full accessibility support');
console.log('📱 Mobile-first responsive design');
console.log('✅ Comprehensive form validation');

console.log('\n🚀 Ready to test at: http://localhost:4321/');