// Fetch PROD_URL HTML and persist to .cache/prod.html
import { writeFile, mkdir } from "node:fs/promises";
import { fetch } from "undici";

const PROD = process.env.PROD_URL || "https://theprofitplatform.com.au/";

console.log(`[fetch-production] Fetching ${PROD}...`);

const html = await fetch(PROD, { redirect: "follow" }).then(r => r.text());

await mkdir(".cache", { recursive: true });
await writeFile(".cache/prod.html", html);

console.log(`[fetch-production] Saved .cache/prod.html (${html.length} bytes)`);
console.log(`[fetch-production] Title: ${html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] || 'Not found'}`);
console.log(`[fetch-production] CSS links: ${(html.match(/link[^>]*rel=["']stylesheet["'][^>]*>/g) || []).length}`);
console.log(`[fetch-production] Script tags: ${(html.match(/<script[^>]*>/g) || []).length}`);