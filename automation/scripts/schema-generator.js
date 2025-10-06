/**
 * Schema Markup Generator
 * Automatically generates structured data (JSON-LD) for blog posts
 * Supports: Article, FAQ, HowTo schemas
 */

/**
 * Generate all applicable schema types for a blog post
 * @param {string} content - The markdown content
 * @param {object} metadata - Post metadata (title, description, author, etc.)
 * @returns {array} Array of schema objects
 */
export function generateSchemas(content, metadata) {
  const schemas = [];

  // 1. FAQ Schema (if Q&A section exists)
  const faqs = extractFAQs(content);
  if (faqs.length >= 3) {
    schemas.push(generateFAQSchema(faqs));
  }

  // 2. HowTo Schema (if step-by-step guide exists)
  const steps = extractSteps(content);
  if (steps.length >= 3) {
    schemas.push(generateHowToSchema(steps, metadata));
  }

  // 3. Article Schema (always include)
  schemas.push(generateArticleSchema(metadata));

  return schemas;
}

/**
 * Extract FAQ pairs from content
 * Looks for patterns like "**Q:" or "Q:" followed by "A:"
 */
function extractFAQs(content) {
  const faqs = [];

  // Pattern 1: **Q: ... A: ...
  const boldQAPattern = /\*\*Q:\s*(.*?)\*\*\s*\n\s*A:\s*(.*?)(?=\n\*\*Q:|\n##|\n\*\*|$)/gs;
  const boldMatches = [...content.matchAll(boldQAPattern)];

  boldMatches.forEach(match => {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  });

  // Pattern 2: Q: ... A: ... (without bold)
  if (faqs.length === 0) {
    const plainQAPattern = /Q:\s*(.*?)\n\s*A:\s*(.*?)(?=\nQ:|\n##|$)/gs;
    const plainMatches = [...content.matchAll(plainQAPattern)];

    plainMatches.forEach(match => {
      faqs.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    });
  }

  return faqs;
}

/**
 * Extract step-by-step instructions from content
 * Looks for patterns like "### Step 1:" or "## Step 1:"
 */
function extractSteps(content) {
  const steps = [];

  // Pattern: ### Step X: Title
  const stepPattern = /###?\s*Step\s+(\d+):\s*(.*?)\n\n(.*?)(?=###?\s*Step|\n##[^#]|$)/gs;
  const matches = [...content.matchAll(stepPattern)];

  matches.forEach(match => {
    const stepNumber = parseInt(match[1]);
    const stepTitle = match[2].trim();
    const stepDescription = match[3].trim();

    // Extract first paragraph as description (limit to 500 chars)
    const firstParagraph = stepDescription.split('\n\n')[0];
    const description = firstParagraph.substring(0, 500);

    steps.push({
      position: stepNumber,
      name: stepTitle,
      text: description
    });
  });

  // Sort by position to ensure correct order
  steps.sort((a, b) => a.position - b.position);

  return steps;
}

/**
 * Generate FAQ Schema
 */
function generateFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate HowTo Schema
 */
function generateHowToSchema(steps, metadata) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": metadata.title,
    "description": metadata.description,
    "step": steps.map(step => ({
      "@type": "HowToStep",
      "position": step.position,
      "name": step.name,
      "text": step.text
    }))
  };
}

/**
 * Generate Article Schema
 */
function generateArticleSchema(metadata) {
  const isAvi = metadata.author === "Avi" || metadata.author === "Avi Sharma";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": metadata.title,
    "description": metadata.description,
    "image": metadata.coverImage,
    "datePublished": metadata.publishDate,
    "dateModified": metadata.publishDate,
    "author": {
      "@type": isAvi ? "Person" : "Organization",
      "name": isAvi ? "Avi Sharma" : "The Profit Platform",
      "url": "https://theprofitplatform.com.au/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Profit Platform",
      "logo": {
        "@type": "ImageObject",
        "url": "https://theprofitplatform.com.au/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://theprofitplatform.com.au/blog/${metadata.slug}`
    }
  };
}

/**
 * Analyze content and report what schemas were generated
 */
export function analyzeSchemas(content, metadata) {
  const faqs = extractFAQs(content);
  const steps = extractSteps(content);
  const schemas = generateSchemas(content, metadata);

  return {
    schemasGenerated: schemas.length,
    schemaTypes: schemas.map(s => s['@type']),
    faqCount: faqs.length,
    stepCount: steps.length,
    details: {
      hasFAQ: faqs.length >= 3,
      hasHowTo: steps.length >= 3,
      hasArticle: true
    },
    schemas
  };
}
