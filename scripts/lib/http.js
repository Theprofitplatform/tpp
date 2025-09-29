import { fetch } from "undici";

export async function getHTML(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`GET ${url} ${res.status}`);
  return await res.text();
}

export async function head(url) {
  const res = await fetch(url, { method: "HEAD", redirect: "manual" });
  return { ok: res.ok, status: res.status, headers: Object.fromEntries(res.headers) };
}

export async function get(url) {
  const res = await fetch(url, { redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  return { ok: res.ok, status: res.status, headers: Object.fromEntries(res.headers), body: buf };
}