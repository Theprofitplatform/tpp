#!/usr/bin/env node

/**
 * Simple form test using curl and browser verification
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Testing Growth Journey Form Implementation...\n');

async function testFormElements() {
  try {
    console.log('📍 Testing form elements presence...');

    // Test 1: Check if the main section exists
    const { stdout: sectionTest } = await execAsync('curl -s http://localhost:4322 | grep -c "id=\\"growth-journey\\""');
    const sectionExists = parseInt(sectionTest.trim()) > 0;
    console.log(sectionExists ? '✅ Growth Journey section found' : '❌ Growth Journey section not found');

    // Test 2: Check if form exists
    const { stdout: formTest } = await execAsync('curl -s http://localhost:4322 | grep -c "id=\\"growth-form\\""');
    const formExists = parseInt(formTest.trim()) > 0;
    console.log(formExists ? '✅ Growth form found' : '❌ Growth form not found');

    // Test 3: Check if form fields exist
    const { stdout: nameFieldTest } = await execAsync('curl -s http://localhost:4322 | grep -c "name=\\"name\\""');
    const nameFieldExists = parseInt(nameFieldTest.trim()) > 0;
    console.log(nameFieldExists ? '✅ Name field found' : '❌ Name field not found');

    const { stdout: emailFieldTest } = await execAsync('curl -s http://localhost:4322 | grep -c "name=\\"email\\""');
    const emailFieldExists = parseInt(emailFieldTest.trim()) > 0;
    console.log(emailFieldExists ? '✅ Email field found' : '❌ Email field not found');

    // Test 4: Check if service pills exist
    const { stdout: servicePillsTest } = await execAsync('curl -s http://localhost:4322 | grep -c "service-pill"');
    const servicePillsExist = parseInt(servicePillsTest.trim()) > 0;
    console.log(servicePillsExist ? '✅ Service pills found' : '❌ Service pills not found');

    // Test 5: Check if stepper exists
    const { stdout: stepperTest } = await execAsync('curl -s http://localhost:4322 | grep -c "stepper"');
    const stepperExists = parseInt(stepperTest.trim()) > 0;
    console.log(stepperExists ? '✅ Stepper component found' : '❌ Stepper component not found');

    // Test 6: Check if contact card exists
    const { stdout: contactTest } = await execAsync('curl -s http://localhost:4322 | grep -c "contact-card"');
    const contactExists = parseInt(contactTest.trim()) > 0;
    console.log(contactExists ? '✅ Contact card found' : '❌ Contact card not found');

    // Test 7: Check if mobile sticky bar exists
    const { stdout: stickyTest } = await execAsync('curl -s http://localhost:4322 | grep -c "mobile-sticky-bar"');
    const stickyExists = parseInt(stickyTest.trim()) > 0;
    console.log(stickyExists ? '✅ Mobile sticky bar found' : '❌ Mobile sticky bar not found');

    // Test 8: Check JavaScript inclusion
    const { stdout: jsTest } = await execAsync('curl -s http://localhost:4322 | grep -c "growth-form.js"');
    const jsExists = parseInt(jsTest.trim()) > 0;
    console.log(jsExists ? '✅ JavaScript file referenced' : '❌ JavaScript file not referenced');

    // Test 9: Check if all expected form components are present
    const { stdout: htmlContent } = await execAsync('curl -s http://localhost:4322 | grep -A 50 -B 10 "growth-journey"');

    const hasStepperContent = htmlContent.includes('Tell us about yourself') || htmlContent.includes('Project details');
    const hasFormFields = htmlContent.includes('type="text"') && htmlContent.includes('type="email"');
    const hasContactInfo = htmlContent.includes('tel:') || htmlContent.includes('mailto:');

    console.log(hasStepperContent ? '✅ Stepper content found' : '❌ Stepper content not found');
    console.log(hasFormFields ? '✅ Form input fields found' : '❌ Form input fields not found');
    console.log(hasContactInfo ? '✅ Contact links found' : '❌ Contact links not found');

    // Summary
    const totalTests = 11;
    const passedTests = [
      sectionExists, formExists, nameFieldExists, emailFieldExists,
      servicePillsExist, stepperExists, contactExists, stickyExists,
      jsExists, hasStepperContent, hasFormFields
    ].filter(Boolean).length;

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests >= 9) {
      console.log('\n🎉 Growth Journey Form Implementation Looks Good!');
      console.log('🌐 View at: http://localhost:4322/#growth-journey');

      // Try to open the page
      console.log('\n🚀 Opening browser to test the form...');

      // For Linux systems, use xdg-open
      try {
        await execAsync('xdg-open http://localhost:4322/#growth-journey');
        console.log('✅ Browser opened successfully');
      } catch (browserError) {
        console.log('ℹ️  Manual testing required - visit http://localhost:4322/#growth-journey');
      }
    } else {
      console.log('\n⚠️  Some issues found. Review the failed tests above.');
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
  }
}

// Run the tests
await testFormElements();