import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";

export async function screenshot(url, outPath, width=1366, height=900) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "networkidle" });
  // small wait for any counters/inits; adjust if needed
  await page.waitForTimeout(1200);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
}

export function diff(imgAPath, imgBPath, outPath, threshold=0.1) {
  const imgA = PNG.sync.read(fs.readFileSync(imgAPath));
  const imgB = PNG.sync.read(fs.readFileSync(imgBPath));
  const { width, height } = imgA;
  const diffPng = new PNG({ width, height });
  const mismatch = pixelmatch(imgA.data, imgB.data, diffPng.data, width, height, { threshold });
  fs.writeFileSync(outPath, PNG.sync.write(diffPng));
  return mismatch;
}