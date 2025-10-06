# Refactoring Action Plan - Quick Start Guide

## Priority 0: Immediate Actions (Do This Week)

### 1. Create PageHero Component

**Impact**: Eliminates 162 lines of duplicate code across 6 pages (85% reduction)

**File**: `/home/avi/projects/astro-site/src/components/sections/PageHero.astro`

```astro
---
/**
 * PageHero Component
 * Reusable hero section for internal pages
 * Used on: About, Services, Portfolio, Blog, Privacy, Terms
 */

interface Props {
  title: string;
  subtitle: string;
  className?: string;
}

const { title, subtitle, className = '' } = Astro.props;
---

<section class={`page-hero relative py-24 md:py-32 overflow-hidden ${className}`}>
  <!-- Gradient Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-60"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-transparent to-transparent opacity-40"></div>

  <div class="container mx-auto px-4 relative z-10">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
        {title}
      </h1>
      <p class="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
        {subtitle}
      </p>
    </div>
  </div>
</section>
```

**Update About Page**:

```astro
---
// Before: 27 lines of hero markup
// After: 3 lines

import BaseLayout from '../layouts/BaseLayout.astro';
import NavigationSection from '../components/sections/NavigationSection.astro';
import FooterSection from '../components/sections/FooterSection.astro';
import PageHero from '../components/sections/PageHero.astro';
---

<BaseLayout title="About Us | The Profit Platform - Sydney Digital Marketing">
  <NavigationSection />

  <main id="main-content" role="main" class="min-h-screen">
    <PageHero
      title="About The Profit Platform"
      subtitle="Sydney's hungry new digital marketing expert. Founded 2024 with fresh strategies & personalised service."
    />

    <!-- Rest of page content -->
  </main>

  <FooterSection />
</BaseLayout>
```

**Apply to**: services.astro, portfolio.astro, blog.astro, privacy.astro, terms.astro

---

### 2. Create CTASection Component

**Impact**: Eliminates 76 lines of duplicate code across 4 pages (79% reduction)

**File**: `/home/avi/projects/astro-site/src/components/sections/CTASection.astro`

```astro
---
/**
 * CTASection Component
 * Reusable call-to-action section with gradient background
 * Used on: About, Services, Portfolio, Blog
 */

interface Props {
  heading: string;
  subtext: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

const {
  heading,
  subtext,
  ctaText = "Get Your Free Consultation",
  ctaLink = "/contact",
  className = ''
} = Astro.props;
---

<section class={`relative py-20 md:py-32 overflow-hidden ${className}`}>
  <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent"></div>

  <div class="container mx-auto px-4 text-center relative z-10">
    <h2 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
      {heading}
    </h2>
    <p class="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
      {subtext}
    </p>
    <a
      href={ctaLink}
      class="inline-block bg-white text-indigo-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
    >
      {ctaText}
    </a>
  </div>
</section>
```

**Update About Page**:

```astro
---
import CTASection from '../components/sections/CTASection.astro';
---

<!-- Replace 19 lines with 3 lines -->
<CTASection
  heading="Ready to Grow Your Business?"
  subtext="Let's discuss how we can help you achieve your goals"
/>
```

**Apply to**: services.astro, portfolio.astro, blog.astro

---

### 3. Create ServiceBlock Component

**Impact**: Reduces services.astro from 285 lines to ~80 lines (73% reduction)

**File**: `/home/avi/projects/astro-site/src/components/sections/ServiceBlock.astro`

```astro
---
/**
 * ServiceBlock Component
 * Individual service detail block with features list and visual
 */

interface Props {
  badge: {
    text: string;
    color: 'indigo' | 'purple' | 'pink' | 'green';
  };
  heading: string;
  description: string;
  features: string[];
  icon: string;
  visual: {
    title: string;
    subtitle: string;
    gradient: string;
  };
  imagePosition?: 'left' | 'right';
}

const {
  badge,
  heading,
  description,
  features,
  icon,
  visual,
  imagePosition = 'right'
} = Astro.props;

const badgeColors = {
  indigo: 'bg-indigo-100 text-indigo-600',
  purple: 'bg-purple-100 text-purple-600',
  pink: 'bg-pink-100 text-pink-600',
  green: 'bg-green-100 text-green-600'
};

const buttonColors = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  green: 'bg-green-600 hover:bg-green-700'
};

const textColors = {
  indigo: 'text-indigo-600',
  purple: 'text-purple-600',
  pink: 'text-pink-600',
  green: 'text-green-600'
};
---

<div class="mb-20">
  <div class={`grid md:grid-cols-2 gap-12 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
    <!-- Content Side -->
    <div class={imagePosition === 'right' ? '' : 'order-1 md:order-2'}>
      <div class={`inline-block ${badgeColors[badge.color]} px-4 py-2 rounded-full text-sm font-semibold mb-4`}>
        {badge.text}
      </div>
      <h2 class="text-4xl font-bold mb-6">{heading}</h2>
      <p class="text-lg text-gray-600 mb-6">
        {description}
      </p>
      <ul class="space-y-3 mb-8">
        {features.map(feature => (
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <a href="/contact" class={`inline-block ${buttonColors[badge.color]} text-white px-8 py-3 rounded-full font-semibold transition-colors`}>
        Get Started
      </a>
    </div>

    <!-- Visual Side -->
    <div class={`relative bg-gradient-to-br ${visual.gradient} rounded-3xl p-12 text-center shadow-2xl border border-white/50 group hover:scale-105 transition-transform duration-300 ${imagePosition === 'right' ? '' : 'order-2 md:order-1'}`}>
      <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl"></div>
      <div class="relative">
        <div class="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div class={`text-3xl font-black ${textColors[badge.color]} mb-3`}>{visual.title}</div>
        <p class="text-gray-700 font-medium">{visual.subtitle}</p>
      </div>
    </div>
  </div>
</div>
```

**Create Data File**: `/home/avi/projects/astro-site/src/data/services.ts`

```typescript
/**
 * Services Data
 * Centralized service information for the services page
 */

export interface Service {
  badge: {
    text: string;
    color: 'indigo' | 'purple' | 'pink' | 'green';
  };
  heading: string;
  description: string;
  features: string[];
  icon: string;
  visual: {
    title: string;
    subtitle: string;
    gradient: string;
  };
  imagePosition: 'left' | 'right';
}

export const services: Service[] = [
  {
    badge: { text: "SEO Services", color: "indigo" },
    heading: "Search Engine Optimization",
    description: "Dominate search results and attract high-quality organic traffic. Our proven SEO strategies help Sydney businesses rank higher and generate more leads.",
    features: [
      "Keyword research & strategy",
      "On-page optimization",
      "Technical SEO audits",
      "Link building & outreach",
      "Local SEO optimization"
    ],
    icon: "🔍",
    visual: {
      title: "Rank Higher",
      subtitle: "Appear on page 1 of Google for your target keywords",
      gradient: "from-indigo-100 via-purple-100 to-pink-100"
    },
    imagePosition: "right"
  },
  {
    badge: { text: "Paid Advertising", color: "purple" },
    heading: "Google Ads Management",
    description: "Get immediate visibility and qualified leads with expertly managed Google Ads campaigns that maximize your ROI.",
    features: [
      "Campaign strategy & setup",
      "Ad copywriting & testing",
      "Landing page optimization",
      "Conversion tracking & analytics",
      "Ongoing optimization"
    ],
    icon: "📊",
    visual: {
      title: "Instant Results",
      subtitle: "Start generating qualified leads from day one",
      gradient: "from-purple-100 via-pink-100 to-red-100"
    },
    imagePosition: "left"
  },
  {
    badge: { text: "Web Design", color: "pink" },
    heading: "Website Design & Development",
    description: "Beautiful, high-converting websites built on modern technology. Your website is your digital storefront – make it count.",
    features: [
      "Custom responsive design",
      "Conversion-focused layouts",
      "Fast page speed optimization",
      "Mobile-first approach",
      "SEO-ready structure"
    ],
    icon: "💻",
    visual: {
      title: "Modern Design",
      subtitle: "Stand out with a website that converts visitors to customers",
      gradient: "from-pink-100 via-red-100 to-orange-100"
    },
    imagePosition: "right"
  },
  {
    badge: { text: "Content Marketing", color: "green" },
    heading: "Content Strategy & Creation",
    description: "Build authority and engage your audience with strategic content that drives results and establishes your brand as an industry leader.",
    features: [
      "Blog writing & management",
      "Content strategy development",
      "Social media content",
      "Email marketing campaigns",
      "Case studies & whitepapers"
    ],
    icon: "✍️",
    visual: {
      title: "Engaging Content",
      subtitle: "Connect with your audience through valuable content",
      gradient: "from-green-100 via-teal-100 to-cyan-100"
    },
    imagePosition: "left"
  }
];
```

**Update Services Page**: `/home/avi/projects/astro-site/src/pages/services.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import NavigationSection from '../components/sections/NavigationSection.astro';
import FooterSection from '../components/sections/FooterSection.astro';
import PageHero from '../components/sections/PageHero.astro';
import ServiceBlock from '../components/sections/ServiceBlock.astro';
import CTASection from '../components/sections/CTASection.astro';
import { services } from '../data/services';
---

<BaseLayout title="Services | The Profit Platform - Sydney Digital Marketing">
  <NavigationSection />

  <main id="main-content" role="main" class="min-h-screen">
    <PageHero
      title="Our Services"
      subtitle="Comprehensive digital marketing solutions tailored to your business goals"
    />

    <!-- Services Grid -->
    <section class="py-20 md:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-7xl mx-auto">
          {services.map(service => (
            <ServiceBlock {...service} />
          ))}
        </div>
      </div>
    </section>

    <CTASection
      heading="Ready to Transform Your Digital Presence?"
      subtext="Get a free consultation and custom strategy for your business"
      ctaText="Book Your Free Consultation"
    />
  </main>

  <FooterSection />
</BaseLayout>
```

**Result**: services.astro goes from 285 lines → ~50 lines

---

### 4. Update Tailwind Config with Color System

**File**: `/home/avi/projects/astro-site/tailwind.config.cjs`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Main indigo
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea', // Main purple
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777', // Main pink
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
        },
        // Typography colors
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-tertiary': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Page titles
        'page-title': ['3rem', { lineHeight: '1.2', fontWeight: '900' }],
        'page-title-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '900' }],
        // Section titles
        'section-title': ['2.25rem', { lineHeight: '1.2', fontWeight: '800' }],
        'section-title-lg': ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
      },
      spacing: {
        // Section spacing
        'section': '5rem',
        'section-lg': '8rem',
      },
      maxWidth: {
        'content-narrow': '56rem',  // 896px - for legal/about text
        'content': '72rem',          // 1152px - standard content
        'content-wide': '80rem',     // 1280px - wide layouts only
      }
    },
  },
  plugins: [],
}
```

---

## Quick Wins (Can do in 1 hour)

### Add Typography Utility Classes

**File**: `/home/avi/projects/astro-site/src/styles/globals.css`

Add at the end:

```css
/* Typography Utilities */
.page-title {
  @apply text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight;
}

.section-title {
  @apply text-4xl md:text-5xl font-black text-gray-900 mb-8;
}

.subsection-title {
  @apply text-2xl md:text-3xl font-bold text-gray-900 mb-6;
}

.body-text {
  @apply text-lg text-gray-600 leading-relaxed;
}

.body-text-large {
  @apply text-xl md:text-2xl text-gray-700 leading-relaxed font-medium;
}

/* Gradient Utilities */
.gradient-card {
  @apply relative rounded-3xl p-12 shadow-2xl border border-white/50;
}

.gradient-card-overlay {
  @apply absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl;
}

.gradient-card-indigo {
  @apply gradient-card bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100;
}

.gradient-card-purple {
  @apply gradient-card bg-gradient-to-br from-purple-100 via-pink-100 to-red-100;
}

.gradient-card-pink {
  @apply gradient-card bg-gradient-to-br from-pink-100 via-red-100 to-orange-100;
}

.gradient-card-green {
  @apply gradient-card bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100;
}

/* Button Utilities */
.btn-primary {
  @apply inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors;
}

.btn-secondary {
  @apply inline-block bg-white text-indigo-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl;
}

/* Card Utilities */
.card {
  @apply bg-white rounded-xl shadow-lg p-6;
}

.card-large {
  @apply bg-white rounded-2xl shadow-lg p-8 md:p-12;
}

/* Section Utilities */
.section-padding {
  @apply py-20 md:py-32;
}

.section-padding-small {
  @apply py-16 md:py-20;
}
```

---

## Testing After Refactoring

### Visual Regression Testing

1. **Before refactoring**: Take screenshots of all pages
2. **After refactoring**: Compare screenshots to ensure no visual changes

```bash
# Install Playwright for testing
npm install -D @playwright/test

# Create test script
npx playwright test
```

### Manual Testing Checklist

- [ ] About page renders correctly
- [ ] Services page shows all 4 services
- [ ] Portfolio page displays properly
- [ ] Blog page layout intact
- [ ] Privacy page readable
- [ ] Terms page readable
- [ ] All CTAs link to /contact
- [ ] Mobile responsive on all pages
- [ ] Gradient text displays correctly
- [ ] Hover effects work on cards

---

## Estimated Time

| Task | Time | Priority |
|------|------|----------|
| Create PageHero component | 30 min | P0 |
| Update 6 pages with PageHero | 45 min | P0 |
| Create CTASection component | 20 min | P0 |
| Update 4 pages with CTASection | 30 min | P0 |
| Create ServiceBlock component | 45 min | P0 |
| Create services data file | 30 min | P0 |
| Update services.astro | 20 min | P0 |
| Update Tailwind config | 15 min | P0 |
| Add utility classes to globals.css | 20 min | P0 |
| Testing and fixes | 60 min | P0 |
| **Total** | **5 hours** | |

---

## Success Metrics

### Code Quality
- ✅ Reduce total page lines by 67% (1,500 → 500)
- ✅ Reduce duplicated code by 88% (400 → 50 lines)
- ✅ Increase component count from 2 to 12+

### Developer Experience
- ✅ New page creation time: 2-3 hours → 30 minutes
- ✅ Content updates: No code changes needed
- ✅ Design changes: Update once, cascade everywhere

### Maintainability
- ✅ Single source of truth for each pattern
- ✅ Type-safe component props
- ✅ Testable components
- ✅ Easy to onboard new developers

---

## Next Steps

1. **Read the full report**: `/home/avi/projects/astro-site/docs/code-review-report.md`
2. **Start with P0 tasks** above (5 hours of work)
3. **Test thoroughly** before committing
4. **Move to P1 tasks** (Content Collections, Stats components)
5. **Establish code review** process to prevent future regressions

---

**Remember**: The homepage already shows the right pattern. We're just applying that pattern to the rest of the site.

Good luck! 🚀