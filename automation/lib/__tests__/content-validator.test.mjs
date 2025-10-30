import { describe, it, expect } from 'vitest';
import { ContentValidator } from '../content-validator.mjs';

describe('ContentValidator', () => {
  const validator = new ContentValidator();

  describe('Word Count Validation', () => {
    it('should pass for content with valid word count', async () => {
      const content = 'word '.repeat(700);
      const result = await validator.validate(content);

      expect(result.checks.wordCount.valid).toBe(true);
      expect(result.checks.wordCount.count).toBe(700);
    });

    it('should fail for content with too few words', async () => {
      const content = 'word '.repeat(100);
      const result = await validator.validate(content);

      expect(result.checks.wordCount.valid).toBe(false);
      expect(result.checks.wordCount.count).toBe(100);
    });

    it('should fail for content with too many words', async () => {
      const content = 'word '.repeat(4000);
      const result = await validator.validate(content);

      expect(result.checks.wordCount.valid).toBe(false);
      expect(result.checks.wordCount.count).toBe(4000);
    });
  });

  describe('Readability Validation', () => {
    it('should pass for readable content', async () => {
      const content = 'This is a simple sentence. Another simple sentence here. ' +
        'We write in plain English. The content is easy to read. ' +
        'Short sentences work best. They improve readability scores. ' +
        'Good content helps users. Simple language is powerful.';
      const result = await validator.validate(content.repeat(10));

      expect(result.checks.readability.valid).toBe(true);
      expect(result.checks.readability.score).toBeGreaterThan(50);
    });
  });

  describe('Keyword Density Validation', () => {
    it('should pass for reasonable keyword density', async () => {
      const content = 'Sydney SEO services help businesses grow. ' +
        'Our team provides digital marketing in Sydney. ' +
        'Contact us for Sydney-based SEO solutions. ' +
        'We offer affordable SEO packages.';
      const result = await validator.validate(content.repeat(20), { keyword: 'SEO' });

      expect(result.checks.keywordDensity.valid).toBe(true);
      expect(result.checks.keywordDensity.density).toBeLessThanOrEqual(3.0);
    });

    it('should fail for excessive keyword density', async () => {
      const content = 'SEO SEO SEO SEO SEO SEO SEO SEO SEO SEO';
      const result = await validator.validate(content, { keyword: 'SEO' });

      expect(result.checks.keywordDensity.valid).toBe(false);
      expect(result.checks.keywordDensity.density).toBeGreaterThan(3.0);
    });
  });

  describe('Structure Validation', () => {
    it('should pass for well-structured content', async () => {
      const content = `# Main Heading

## Section One

This is a paragraph with some content.

## Section Two

Another paragraph here.

## Section Three

More content in this section.

This is another paragraph.

More content continues here.`;

      const result = await validator.validate(content);

      expect(result.checks.structure.valid).toBe(true);
      expect(result.checks.structure.headings.find(h => h.level === 'h1').count).toBe(1);
      expect(result.checks.structure.headings.find(h => h.level === 'h2').count).toBeGreaterThanOrEqual(3);
    });

    it('should fail for missing H1', async () => {
      const content = `## Section One

Content here.

## Section Two

More content.`;

      const result = await validator.validate(content);

      expect(result.checks.structure.valid).toBe(false);
      expect(result.checks.structure.issues).toContain('Missing H1 heading');
    });
  });

  describe('Quality Signals', () => {
    it('should detect AI phrases', async () => {
      const content = 'As an AI, I must say this is important to note. ' +
        'It is worth noting that we delve into the topic.';
      const result = await validator.validate(content.repeat(50));

      expect(result.checks.quality.valid).toBe(false);
      expect(result.checks.quality.issues.length).toBeGreaterThan(0);
    });

    it('should detect placeholder text', async () => {
      const content = 'This is [placeholder] text with TODO: fix this section.';
      const result = await validator.validate(content.repeat(50));

      expect(result.checks.quality.valid).toBe(false);
      expect(result.checks.quality.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Overall Score', () => {
    it('should calculate a high score for good content', async () => {
      const content = `# Sydney SEO Services

## Professional SEO Solutions

We provide comprehensive SEO services in Sydney. Our team helps businesses grow online.

## Our Approach

We use proven strategies to improve rankings. Contact us for a free consultation.

## Why Choose Us

Experience matters in digital marketing. We deliver results that count.

This is additional content to meet word count requirements. We focus on quality and results.`;

      const result = await validator.validate(content.repeat(5), { keyword: 'SEO' });

      expect(result.score).toBeGreaterThan(70);
      expect(result.valid).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    it('should count words correctly', () => {
      const content = 'This is a test sentence with seven words.';
      const count = validator.countWords(content);

      expect(count).toBe(8);
    });

    it('should count syllables approximately', () => {
      const content = 'beautiful wonderful';
      const syllables = validator.countSyllables(content);

      expect(syllables).toBeGreaterThan(0);
    });
  });
});
