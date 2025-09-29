// Rebuild BaseLayout.astro with exact production structure
import { readFile, writeFile } from "node:fs/promises";

console.log("[rebuild-baselayout] Creating exact production BaseLayout...");

const extraction = JSON.parse(await readFile(".cache/production-complete.json", "utf8"));

// Create exact BaseLayout with production structure
const baseLayoutContent = `---
// BaseLayout.astro - EXACT production structure
export interface Props {
  title?: string;
}

const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
${extraction.headHtml}
</head>

<body>
<slot />

${extraction.bodyScripts.map(script => {
  if (script.src) {
    return `<script is:inline src="${script.src}"></script>`;
  } else {
    return `<script is:inline>\n${script.content}\n</script>`;
  }
}).join('\n\n')}

<!-- Additional JSON-LD Schema -->
<script type="application/ld+json" is:inline>
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Profit Platform",
  "url": "https://theprofitplatform.com.au/",
  "telephone": "+61487286451",
  "email": "avi@theprofitplatform.com.au",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sydney",
    "addressRegion": "NSW",
    "addressCountry": "AU"
  },
  "areaServed": "Greater Sydney",
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61574707582255",
    "https://www.linkedin.com/company/theprofitplatform",
    "https://www.instagram.com/theprofitplatformau"
  ]
}
</script>

<script type="application/ld+json" is:inline>
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is your pricing structured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer Starter ($990/mo), Professional ($1,990/mo), Enterprise ($3,990/mo) with all plans including dedicated account management, monthly reporting, and no lock-in contracts."
      }
    },
    {
      "@type": "Question",
      "name": "What areas of Sydney do you service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All of Greater Sydney including CBD, Eastern Suburbs, North Shore, Inner West, Western and Southern Sydney."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to see results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most clients see improvements within 3-6 months for SEO, while Google Ads can generate leads immediately after setup."
      }
    }
  ]
}
</script>

</body>
</html>`;

await writeFile("src/layouts/BaseLayout-PRODUCTION.astro", baseLayoutContent);

console.log("[rebuild-baselayout] Production BaseLayout created!");
console.log(`  HEAD size: ${(extraction.headHtml.length / 1024).toFixed(1)}KB`);
console.log(`  Body scripts: ${extraction.bodyScripts.length} total`);
console.log(`  External scripts: ${extraction.bodyScripts.filter(s => s.src).length}`);
console.log(`  Inline scripts: ${extraction.bodyScripts.filter(s => !s.src).length}`);

// Show script order
console.log(`\nScript execution order:`);
extraction.bodyScripts.forEach((script, i) => {
  if (script.src) {
    console.log(`  ${i + 1}. [external] ${script.src}`);
  } else {
    const preview = script.content.substring(0, 60).replace(/\n/g, ' ');
    console.log(`  ${i + 1}. [inline] ${preview}...`);
  }
});

console.log(`\n[rebuild-baselayout] Ready to replace current BaseLayout`);