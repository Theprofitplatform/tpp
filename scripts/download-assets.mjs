// Parse prod HTML, collect local asset URLs, download to /public, fix CSS url(...) references.
import { readFile, writeFile, mkdir, stat, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fetch } from "undici";
import * as cheerio from "cheerio";

const ROOT = "https://theprofitplatform.com.au";

console.log("[download-assets] Reading production HTML...");
const html = await readFile(".cache/prod.html", "utf8");
const $ = cheerio.load(html);

// Collect asset URLs from head/body (local only, starting with "/" or relative)
const urls = new Set();
$("link[rel='stylesheet'][href]").each((_,el)=> {
  const href = $(el).attr("href");
  if (href) urls.add(href);
});
$("link[rel='icon'][href], link[rel='shortcut icon'][href], link[rel='apple-touch-icon'][href]").each((_,el)=> {
  const href = $(el).attr("href");
  if (href) urls.add(href);
});
$("script[src]").each((_,el)=> {
  const src = $(el).attr("src");
  if (src) urls.add(src);
});
$("img[src]").each((_,el)=> {
  const src = $(el).attr("src");
  if (src) urls.add(src);
});

function toAbs(u){
  if(!u || u.startsWith("http")) return u;
  if(u.startsWith("//")) return "https:" + u;
  if(u.startsWith("/")) return ROOT + u;
  return ROOT + "/" + u.replace(/^\.?\//,"");
}

async function save(url, outPath){
  await mkdir(dirname(outPath), { recursive: true });
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  return buf.length;
}

console.log(`[download-assets] Found ${urls.size} potential assets`);

const downloads = [];
let downloadCount = 0;
let totalBytes = 0;

for(const u of urls){
  if(!u || u.startsWith("http") || u.startsWith("//")) continue;
  const abs = toAbs(u);
  const rel = u.startsWith("/") ? u.slice(1) : u.replace(/^\.?\//,"");
  const out = join("public", rel);

  downloads.push(
    save(abs, out)
      .then((bytes) => {
        downloadCount++;
        totalBytes += bytes;
        console.log(`[saved] ${rel} (${(bytes/1024).toFixed(1)}KB)`);
      })
      .catch(e => console.warn(`[miss] ${u} - ${e.message}`))
  );
}

await Promise.all(downloads);

// Rewrite CSS url(...) → absolute root if they were relative pathing
async function* walk(dir){
  try {
    for(const entry of await readdir(dir, { withFileTypes: true })){
      const p = join(dir, entry.name);
      if(entry.isDirectory()) yield* walk(p);
      else yield p;
    }
  } catch(e) {
    // Directory might not exist
  }
}

let cssFixed = 0;
for await (const file of walk("public")){
  if(!file.endsWith(".css")) continue;
  let css = await readFile(file, "utf8");
  const original = css;
  // url(../fonts/x.woff2) → url(/fonts/x.woff2)
  css = css.replace(/url\((['"]?)\.\.\/fonts\//g, "url($1/fonts/");
  css = css.replace(/url\((['"]?)\.\.\/images\//g, "url($1/images/");
  css = css.replace(/url\((['"]?)\.\.\/assets\//g, "url($1/assets/");

  if (css !== original) {
    await writeFile(file, css);
    cssFixed++;
    console.log(`[css-fixed] ${file}`);
  }
}

console.log(`[assets] Download complete: ${downloadCount} files, ${(totalBytes/1024).toFixed(1)}KB total`);
if (cssFixed > 0) console.log(`[assets] Fixed ${cssFixed} CSS files for absolute paths`);