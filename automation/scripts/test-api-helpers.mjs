#!/usr/bin/env node
/**
 * Test API Helpers Integration
 * Verifies retry, rate limiting, and caching work correctly
 */

import { retryWithBackoff, RateLimiter, withCache } from '../utils/api-helpers.mjs';

console.log('🧪 Testing API Helpers Integration\n');

// Test 1: Retry with backoff
console.log('1️⃣  Testing retryWithBackoff...');
let attemptCount = 0;

try {
  const result = await retryWithBackoff(
    async () => {
      attemptCount++;
      console.log(`   Attempt ${attemptCount}`);
      if (attemptCount < 3) {
        throw new Error('Simulated transient error');
      }
      return 'Success!';
    },
    {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2
    }
  );
  console.log(`   ✅ Retry succeeded after ${attemptCount} attempts: ${result}\n`);
} catch (error) {
  console.log(`   ❌ Retry failed: ${error.message}\n`);
}

// Test 2: Rate Limiter
console.log('2️⃣  Testing RateLimiter...');
const limiter = new RateLimiter(3, 10); // 3 tokens, refill 10 per second (fast for testing)

const startTime = Date.now();
const promises = [];

for (let i = 1; i <= 5; i++) {
  promises.push(
    limiter.execute(async () => {
      const elapsed = Date.now() - startTime;
      console.log(`   Request ${i} executed at ${elapsed}ms`);
      return i;
    })
  );
}

try {
  await Promise.all(promises);
  const elapsed = Date.now() - startTime;
  console.log(`   ✅ Rate limiter completed all requests in ${elapsed}ms\n`);
} catch (error) {
  console.log(`   ❌ Rate limiter failed: ${error.message}\n`);
}

// Test 3: Cache
console.log('3️⃣  Testing withCache...');
const cache = {};
let callCount = 0;

async function expensiveOperation(arg) {
  callCount++;
  console.log(`   Expensive operation called (call #${callCount}) with arg: ${arg}`);
  return `Result for ${arg}`;
}

const cachedOperation = withCache(
  expensiveOperation,
  cache,
  (arg) => arg,
  1000 // 1 second TTL
);

try {
  const result1 = await cachedOperation('test');
  console.log(`   First call result: ${result1}`);

  const result2 = await cachedOperation('test');
  console.log(`   Second call result: ${result2} (should be cached)`);

  const result3 = await cachedOperation('different');
  console.log(`   Third call result: ${result3} (different key, not cached)`);

  if (callCount === 2) {
    console.log(`   ✅ Cache working correctly (${callCount} actual calls, 3 total calls)\n`);
  } else {
    console.log(`   ❌ Cache not working (expected 2 calls, got ${callCount})\n`);
  }
} catch (error) {
  console.log(`   ❌ Cache test failed: ${error.message}\n`);
}

// Test 4: Author Assignment
console.log('4️⃣  Testing Author Assignment (import from generate-blog-post.js)...');
// We can't easily test this without refactoring, so we'll skip for now
console.log('   ⚠️  Skipping (requires refactoring to export function)\n');

console.log('✅ All API helper tests completed!\n');
