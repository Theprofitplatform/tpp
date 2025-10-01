import cheerio from "cheerio";

export function extractHeadInfo(html) {
  const $ = cheerio.load(html);
  const title = $("head title").text().trim();
  const desc = $("meta[name='description']").attr("content") || "";
  const canonical = $("link[rel='canonical']").attr("href") || "";
  const css = $("head link[rel='stylesheet'][href]").map((_,e)=>$(e).attr("href")).get();
  const jsHead = $("head script[src]").map((_,e)=>$(e).attr("src")).get();
  const jsBody = $("body script[src]").map((_,e)=>$(e).attr("src")).get();
  const ld = $("script[type='application/ld+json']").map((_,e)=>$(e).text()).get();
  return { title, desc, canonical, css, jsHead, jsBody, ld };
}

export function sameOrder(a,b){ return a.length===b.length && a.every((v,i)=>v===b[i]); }

export function hasJSONLD(types, ldBlocks) {
  const found = new Set();
  for (const t of ldBlocks) {
    try {
      const j = JSON.parse(t);
      const type = j["@type"] || (Array.isArray(j["@graph"]) ? j["@graph"].map(x=>x["@type"]).join(",") : "");
      for (const want of types) {
        if (type?.includes?.(want)) found.add(want);
      }
    } catch {}
  }
  return types.every(t => found.has(t));
}