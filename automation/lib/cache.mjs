#!/usr/bin/env node

/**
 * Cache System with TTL
 *
 * Simple file-based cache with time-to-live
 * Useful for caching API responses, expensive computations
 *
 * Usage:
 *   import { Cache } from './automation/lib/cache.mjs';
 *
 *   const cache = new Cache(3600000); // 1 hour TTL
 *
 *   let data = await cache.get('my-key');
 *   if (!data) {
 *     data = await fetchExpensiveData();
 *     await cache.set('my-key', data);
 *   }
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Cache {
  constructor(ttl = 3600000, options = {}) { // 1 hour default
    this.ttl = ttl;
    this.cacheDir = options.cacheDir || path.resolve(__dirname, '../.cache');
    this.verbose = options.verbose || false;
  }

  /**
   * Initialize cache directory
   */
  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error.message);
    }
  }

  /**
   * Generate cache file path from key
   */
  getCacheFile(key) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.cacheDir, `${hash}.json`);
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if expired/missing
   */
  async get(key) {
    const cacheFile = this.getCacheFile(key);

    try {
      const content = await fs.readFile(cacheFile, 'utf-8');
      const cached = JSON.parse(content);

      // Check if expired
      const now = Date.now();
      if (now - cached.timestamp < this.ttl) {
        if (this.verbose) {
          console.log(`💾 Cache hit: ${key} (age: ${((now - cached.timestamp) / 1000).toFixed(0)}s)`);
        }
        return cached.data;
      }

      // Expired - delete file
      if (this.verbose) {
        console.log(`⏰ Cache expired: ${key}`);
      }
      await fs.unlink(cacheFile).catch(() => {});
      return null;

    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Cache read error:', error.message);
      }
      if (this.verbose) {
        console.log(`❌ Cache miss: ${key}`);
      }
      return null;
    }
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} data - Data to cache (must be JSON-serializable)
   */
  async set(key, data) {
    await this.init();

    const cacheFile = this.getCacheFile(key);
    const cached = {
      key,
      timestamp: Date.now(),
      ttl: this.ttl,
      data,
    };

    try {
      await fs.writeFile(cacheFile, JSON.stringify(cached, null, 2));
      if (this.verbose) {
        console.log(`💾 Cached: ${key} (TTL: ${this.ttl / 1000}s)`);
      }
    } catch (error) {
      console.error('Cache write error:', error.message);
    }
  }

  /**
   * Check if key exists and is valid
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Delete cached value
   * @param {string} key - Cache key
   */
  async delete(key) {
    const cacheFile = this.getCacheFile(key);
    try {
      await fs.unlink(cacheFile);
      if (this.verbose) {
        console.log(`🗑️  Deleted cache: ${key}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Cache delete error:', error.message);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(f => fs.unlink(path.join(this.cacheDir, f)))
      );
      if (this.verbose) {
        console.log(`🧹 Cleared ${files.length} cache files`);
      }
    } catch (error) {
      console.error('Cache clear error:', error.message);
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpired() {
    try {
      const files = await fs.readdir(this.cacheDir);
      let cleaned = 0;

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.cacheDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const cached = JSON.parse(content);

          const age = Date.now() - cached.timestamp;
          if (age > cached.ttl) {
            await fs.unlink(filePath);
            cleaned++;
          }
        } catch (error) {
          // Invalid file, delete it
          await fs.unlink(filePath).catch(() => {});
          cleaned++;
        }
      }

      if (cleaned > 0 && this.verbose) {
        console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
      }

      return cleaned;
    } catch (error) {
      console.error('Cache cleanup error:', error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      let totalSize = 0;
      let validCount = 0;
      let expiredCount = 0;

      for (const file of jsonFiles) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const cached = JSON.parse(content);
          const age = Date.now() - cached.timestamp;

          if (age < cached.ttl) {
            validCount++;
          } else {
            expiredCount++;
          }
        } catch (error) {
          expiredCount++;
        }
      }

      return {
        totalEntries: jsonFiles.length,
        validEntries: validCount,
        expiredEntries: expiredCount,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      };
    } catch (error) {
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
      };
    }
  }

  /**
   * Wrap a function with caching
   * @param {string} key - Cache key
   * @param {Function} fn - Async function to cache
   * @returns {Promise<any>} - Function result (cached or fresh)
   */
  async wrap(key, fn) {
    let value = await this.get(key);

    if (value === null) {
      value = await fn();
      await this.set(key, value);
    }

    return value;
  }
}

/**
 * Pre-configured caches for common use cases
 */
export const caches = {
  short: new Cache(300000),    // 5 minutes
  medium: new Cache(3600000),  // 1 hour
  long: new Cache(86400000),   // 24 hours
};

export default Cache;
