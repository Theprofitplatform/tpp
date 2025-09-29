// Extract complete production HTML structure for exact replication
import { readFile, writeFile } from "node:fs/promises";
import { fetch } from "undici";
import * as cheerio from "cheerio";

const PROD_URL = "https://theprofitplatform.com.au/";

console.log("[extract-production-complete] Fetching complete production structure...");

const html = await fetch(PROD_URL).then(r => r.text());
const $ = cheerio.load(html);

// Extract complete HEAD section
const headHtml = $("head").html();

// Extract BODY content (without body tag itself)
const bodyContent = $("body").html();

// Extract HEAD scripts in order
const headScripts = [];
$("head script").each((_, el) => {
  const src = $(el).attr("src");
  const content = $(el).html();
  const type = $(el).attr("type");

  headScripts.push({
    src: src || null,
    content: content || null,
    type: type || null,
    html: $.html(el)
  });
});

// Extract BODY scripts in order (external and inline)
const bodyScripts = [];
$("body script").each((_, el) => {
  const src = $(el).attr("src");
  const content = $(el).html();
  const type = $(el).attr("type");

  bodyScripts.push({
    src: src || null,
    content: content || null,
    type: type || null,
    html: $.html(el),
    isInline: !src
  });
});

// Extract CSS links in order
const cssLinks = [];
$("head link[rel='stylesheet']").each((_, el) => {
  cssLinks.push({
    href: $(el).attr("href"),
    html: $.html(el)
  });
});

// Extract specific sections
const trustedBySection = $(".trust-signals, .testimonials-section, .trusted-by").html() ||
                        $("[class*='trust'], [class*='counter']").parent().html();

const menuOverlay = $("nav, .nav, .menu, .navigation").html() ||
                   $("[class*='nav'], [class*='menu']").html();

// Extract meta tags
const metaTags = [];
$("head meta").each((_, el) => {
  metaTags.push($.html(el));
});

// Extract title
const title = $("head title").text();

// Extract all link tags
const linkTags = [];
$("head link").each((_, el) => {
  linkTags.push($.html(el));
});

const extraction = {
  title,
  headHtml,
  bodyContent,
  headScripts,
  bodyScripts,
  cssLinks,
  metaTags,
  linkTags,
  trustedBySection,
  menuOverlay,
  stats: {
    headScripts: headScripts.length,
    bodyScripts: bodyScripts.length,
    cssLinks: cssLinks.length,
    metaTags: metaTags.length,
    bodySize: bodyContent.length
  }
};

await writeFile(".cache/production-complete.json", JSON.stringify(extraction, null, 2));

console.log(`[extract-production-complete] Extracted:`);
console.log(`  Title: ${title}`);
console.log(`  HEAD scripts: ${headScripts.length}`);
console.log(`  BODY scripts: ${bodyScripts.length} (${bodyScripts.filter(s => s.isInline).length} inline)`);
console.log(`  CSS links: ${cssLinks.length}`);
console.log(`  Meta tags: ${metaTags.length}`);
console.log(`  Body content: ${(bodyContent.length / 1024).toFixed(1)}KB`);

// Show first few items
console.log(`\nFirst 3 CSS links:`);
cssLinks.slice(0, 3).forEach((css, i) => {
  console.log(`  ${i + 1}. ${css.href}`);
});

console.log(`\nFirst 3 body scripts:`);
bodyScripts.slice(0, 3).forEach((script, i) => {
  if (script.src) {
    console.log(`  ${i + 1}. [external] ${script.src}`);
  } else {
    const preview = script.content.substring(0, 80).replace(/\n/g, ' ');
    console.log(`  ${i + 1}. [inline] ${preview}...`);
  }
});

console.log(`\n[extract-production-complete] Complete extraction saved to .cache/production-complete.json`);