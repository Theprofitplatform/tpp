/**
 * Schema.org Utility Helpers
 * Generate structured data for SEO
 */

export interface FAQSchemaItem {
  question: string;
  answer: string;
}

export interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
}

/**
 * Generate FAQ Schema for FAQ components
 */
export function generateFAQSchema(items: FAQSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * Generate Video Schema for video testimonials
 */
export function generateVideoSchema(props: VideoSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": props.name,
    "description": props.description,
    "thumbnailUrl": props.thumbnailUrl,
    "uploadDate": props.uploadDate,
    "contentUrl": props.contentUrl
  };
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema(name: string, url: string, logo: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo
  };
}