import { describe, it, expect } from 'vitest';
import { DuplicateDetector } from '../duplicate-detector.mjs';

describe('DuplicateDetector', () => {
  const detector = new DuplicateDetector();

  describe('Similarity Detection', () => {
    it('should detect exact duplicates', async () => {
      const content = 'This is the exact same content.';
      const result = await detector.check(content, [content]);

      expect(result.isDuplicate).toBe(true);
      expect(result.maxSimilarity).toBe(1.0);
    });

    it('should detect highly similar content', async () => {
      const content1 = 'Sydney SEO services help businesses grow online with proven strategies.';
      const content2 = 'Sydney SEO services help businesses grow online with effective strategies.';
      const result = await detector.check(content1, [content2]);

      expect(result.maxSimilarity).toBeGreaterThan(0.7);
    });

    it('should not flag dissimilar content', async () => {
      const content1 = 'Sydney SEO services for local businesses.';
      const content2 = 'Melbourne web design and development solutions.';
      const result = await detector.check(content1, [content2]);

      expect(result.isDuplicate).toBe(false);
      expect(result.maxSimilarity).toBeLessThan(0.7);
    });

    it('should handle empty content arrays', async () => {
      const content = 'Some content here.';
      const result = await detector.check(content, []);

      expect(result.isDuplicate).toBe(false);
      expect(result.maxSimilarity).toBe(0);
    });
  });

  describe('Text Normalization', () => {
    it('should normalize text correctly', () => {
      const text = 'This Is A Test!!! With CAPS and punctuation...';
      const normalized = detector.normalize(text);

      expect(normalized).toBe('this is a test with caps and punctuation');
    });

    it('should handle special characters', () => {
      const text = 'Test@#$%with^&*()special-chars_123';
      const normalized = detector.normalize(text);

      expect(normalized).toContain('test');
      expect(normalized).toContain('special');
      expect(normalized).toContain('chars');
    });
  });

  describe('Sentence Extraction', () => {
    it('should extract sentences correctly', () => {
      const text = 'First sentence here. Second sentence. Third one!';
      const sentences = detector.extractSentences(detector.normalize(text));

      expect(sentences.size).toBe(3);
    });

    it('should ignore very short sentences', () => {
      const text = 'Hi. This is a longer sentence. Ok.';
      const sentences = detector.extractSentences(detector.normalize(text));

      expect(sentences.size).toBeLessThan(3); // 'hi' and 'ok' should be filtered
    });
  });

  describe('N-gram Extraction', () => {
    it('should extract n-grams correctly', () => {
      const text = 'this is a test sentence';
      const ngrams = detector.extractNgrams(text, 3);

      expect(ngrams.has('this is a')).toBe(true);
      expect(ngrams.has('is a test')).toBe(true);
      expect(ngrams.has('a test sentence')).toBe(true);
    });

    it('should handle text shorter than n', () => {
      const text = 'short';
      const ngrams = detector.extractNgrams(text, 5);

      expect(ngrams.size).toBe(0);
    });
  });

  describe('Jaccard Similarity', () => {
    it('should calculate correct similarity for identical sets', () => {
      const set1 = new Set(['a', 'b', 'c']);
      const set2 = new Set(['a', 'b', 'c']);
      const similarity = detector.jaccardSimilarity(set1, set2);

      expect(similarity).toBe(1.0);
    });

    it('should calculate correct similarity for disjoint sets', () => {
      const set1 = new Set(['a', 'b', 'c']);
      const set2 = new Set(['x', 'y', 'z']);
      const similarity = detector.jaccardSimilarity(set1, set2);

      expect(similarity).toBe(0.0);
    });

    it('should calculate correct similarity for overlapping sets', () => {
      const set1 = new Set(['a', 'b', 'c', 'd']);
      const set2 = new Set(['c', 'd', 'e', 'f']);
      const similarity = detector.jaccardSimilarity(set1, set2);

      expect(similarity).toBe(2 / 6); // 2 common, 6 total unique
    });

    it('should handle empty sets', () => {
      const set1 = new Set();
      const set2 = new Set();
      const similarity = detector.jaccardSimilarity(set1, set2);

      expect(similarity).toBe(1.0);
    });
  });

  describe('Content Fingerprinting', () => {
    it('should generate consistent fingerprints', () => {
      const content = 'Test content for fingerprinting';
      const fp1 = detector.generateFingerprint(content);
      const fp2 = detector.generateFingerprint(content);

      expect(fp1).toBe(fp2);
    });

    it('should generate different fingerprints for different content', () => {
      const content1 = 'First piece of content';
      const content2 = 'Second piece of content';
      const fp1 = detector.generateFingerprint(content1);
      const fp2 = detector.generateFingerprint(content2);

      expect(fp1).not.toBe(fp2);
    });

    it('should generate same fingerprint regardless of formatting', () => {
      const content1 = 'Test   Content!';
      const content2 = 'test content';
      const fp1 = detector.generateFingerprint(content1);
      const fp2 = detector.generateFingerprint(content2);

      expect(fp1).toBe(fp2);
    });
  });

  describe('Similarity Calculation', () => {
    it('should weight n-grams more than sentences', async () => {
      // Two texts with same n-grams but different sentence structure
      const content1 = 'Sydney SEO services help businesses grow online.';
      const content2 = 'Sydney SEO services. Help businesses grow online.';

      const similarity = detector.calculateSimilarity(content1, content2);

      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should handle very short texts', () => {
      const content1 = 'Hi';
      const content2 = 'Hello';
      const similarity = detector.calculateSimilarity(content1, content2);

      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('Multiple Content Checks', () => {
    it('should check against multiple existing contents', async () => {
      const newContent = 'Sydney SEO services for businesses.';
      const existing = [
        'Melbourne web design services.',
        'Sydney SEO services for companies.',
        'Brisbane marketing solutions.',
      ];

      const result = await detector.check(newContent, existing);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.maxSimilarity).toBeGreaterThan(0.6);
    });

    it('should return highest similarity match', async () => {
      const newContent = 'Test content here.';
      const existing = [
        'Completely different content.',
        'Test content here exactly.',
        'Another different text.',
      ];

      const result = await detector.check(newContent, existing);

      expect(result.maxSimilarity).toBeGreaterThan(0.9);
    });
  });
});
