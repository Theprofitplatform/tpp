// Parse production HTML to extract exact HEAD + BODY script/CSS order
import { readFile, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

console.log("[parse-production-order] Analyzing production HTML structure...");

const html = await readFile(".cache/prod.html", "utf8");
const $ = cheerio.load(html);

// Extract ordered arrays
const headCSS = [];
const headJS = [];
const bodyJS = [];
const inlineBottom = [];

// HEAD CSS links in order
$("head link[rel='stylesheet'][href]").each((_, el) => {
  const href = $(el).attr("href");
  if (href) headCSS.push(href);
});

// HEAD scripts in order
$("head script[src]").each((_, el) => {
  const src = $(el).attr("src");
  if (src) headJS.push(src);
});

// BODY scripts (external) in order
$("body script[src]").each((_, el) => {
  const src = $(el).attr("src");
  if (src) bodyJS.push(src);
});

// BODY inline scripts (especially at the bottom)
$("body script:not([src])").each((_, el) => {
  const content = $(el).html();
  if (content && content.trim()) {
    inlineBottom.push({
      content: content.trim(),
      index: $(el).index(),
      position: "body"
    });
  }
});

// Also check for any head inline scripts
$("head script:not([src])").each((_, el) => {
  const content = $(el).html();
  if (content && content.trim()) {
    inlineBottom.push({
      content: content.trim(),
      index: $(el).index(),
      position: "head"
    });
  }
});

const analysis = {
  headCSS,
  headJS,
  bodyJS,
  inlineBottom,
  stats: {
    totalCSS: headCSS.length,
    totalHeadJS: headJS.length,
    totalBodyJS: bodyJS.length,
    totalInline: inlineBottom.length
  }
};

// Save detailed analysis
await writeFile(".cache/production-order.json", JSON.stringify(analysis, null, 2));

console.log(`[parse-production-order] Found:`);
console.log(`  HEAD CSS: ${analysis.stats.totalCSS} files`);
console.log(`  HEAD JS: ${analysis.stats.totalHeadJS} files`);
console.log(`  BODY JS: ${analysis.stats.totalBodyJS} files`);
console.log(`  INLINE scripts: ${analysis.stats.totalInline} blocks`);

// Print first few items for verification
console.log(`\n[parse-production-order] Sample HEAD CSS:`);
headCSS.slice(0, 3).forEach((css, i) => console.log(`  ${i + 1}. ${css}`));

console.log(`\n[parse-production-order] Sample BODY JS:`);
bodyJS.slice(0, 3).forEach((js, i) => console.log(`  ${i + 1}. ${js}`));

console.log(`\n[parse-production-order] Inline scripts:`);
inlineBottom.forEach((script, i) => {
  const preview = script.content.substring(0, 100).replace(/\n/g, ' ');
  console.log(`  ${i + 1}. [${script.position}] ${preview}${script.content.length > 100 ? '...' : ''}`);
});

console.log(`\n[parse-production-order] Analysis saved to .cache/production-order.json`);