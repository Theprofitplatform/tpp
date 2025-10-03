import { defineCollection, z } from 'astro:content';

// Services Collection Schema
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    featured: z.boolean().default(false),
    price: z.string().optional(),
    duration: z.string().optional(),
    category: z.enum(['marketing', 'development', 'design', 'consulting', 'other']),
    tags: z.array(z.string()).default([]),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// Blog Collection Schema
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('The Profit Platform'),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    coverImage: z.string().optional(),
    category: z.enum(['marketing', 'business', 'technology', 'case-study', 'tutorial', 'news']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
  }),
});

// Locations Collection Schema
const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default('Australia'),
    description: z.string(),
    serviceAreas: z.array(z.string()).default([]),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Industries Collection Schema
const industriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    coverImage: z.string().optional(),
    services: z.array(z.string()).default([]),
    caseStudies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
  }),
});

// Funnels Collection Schema
const funnelsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    targetAudience: z.string(),
    goal: z.string(),
    steps: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
    conversionRate: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    industry: z.string().optional(),
  }),
});

export const collections = {
  services: servicesCollection,
  blog: blogCollection,
  locations: locationsCollection,
  industries: industriesCollection,
  funnels: funnelsCollection,
};
