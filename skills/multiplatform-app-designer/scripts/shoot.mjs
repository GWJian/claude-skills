#!/usr/bin/env node
/*
 * shoot.mjs: render every .screen and .app-icon in a mockup to PNG at device
 * resolution, tile a contact sheet, then run the slop scan (scripts/scan.js)
 * inside the page and a pixel-contrast pass over the screenshots.
 *
 *   node shoot.mjs mockup.html                      -> ./shots/*.png, sheet.png, scan.json
 *   node shoot.mjs mockup.html --out shots/r1       output folder
 *   node shoot.mjs mockup.html --small              small-phone / laptop sizes (device.css body[data-small])
 *   node shoot.mjs mockup.html --scale 2            device pixel ratio (default 3; desktop screens always 2)
 *   node shoot.mjs mockup.html --only android       only screens with that data-device (comma list; "web" = both web)
 *   node shoot.mjs mockup.html --dark               prefers-color-scheme: dark
 *   node shoot.mjs mockup.html --no-scan            render only
 *
 * Exit code 1 if the scan finds any FAIL. Warnings never fail the run.
 *
 * Browser: playwright-core drives whichever Chromium it can find, in this
 * order: $MPAD_CHROME, Google Chrome / Chromium / Edge on macOS, Windows or
 * Linux, then Playwright's own downloaded Chromium (Node or Python). On a Mac
 * the system Chrome also renders Apple's fonts; elsewhere Inter stands in for
 * SF Pro (fonts.css) and the report must say so.
 *
 * playwright-core is resolved from the cwd first, then from this skill
 * folder. If neither has it:  npm install   (in the skill folder).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
let chromium;
for (const base of [process.cwd(), path.join(here, "..")]) {
  try { ({ chromium } = createRequire(path.join(base, "package.json"))("playwright-core")); break; } catch {}
}
if (!chromium) {
  console.error("playwright-core not found. Run once:\n  npm install\nin " + path.join(here, "..") + " (or `npm i playwright-core` in your project).");
  process.exit(2);
}

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const has = (n) => argv.includes(n);
const file = argv.find((a) => a.endsWith(".html"));
if (!file) { console.error("usage: node shoot.mjs <mockup.html> [--out dir] [--small] [--scale 3] [--only ios,android] [--dark] [--no-scan]"); process.exit(2); }

const SRC = path.resolve(file);
const OUT = path.resolve(arg("--out", path.join(path.dirname(SRC), "shots")));
const SCALE = parseFloat(arg("--scale", "3"));
const SMALL = has("--small");
const ONLY = arg("--only", "").split(",").map((s) => s.trim()).filter(Boolean);
const DARK = has("--dark");
fs.mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- browser
const home = os.homedir();
const glob1 = (dir, re) => { try { return fs.readdirSync(dir).filter((f) => re.test(f)).sort().reverse().map((f) => path.join(dir, f)); } catch { return []; } };
const pwCaches = [
  process.env.PLAYWRIGHT_BROWSERS_PATH,
  path.join(home, ".cache", "ms-playwright"),                     // Linux
  path.join(home, "Library", "Caches", "ms-playwright"),          // macOS
  path.join(process.env.LOCALAPPDATA || "", "ms-playwright"),     // Windows
].filter(Boolean);
const pwChromium = pwCaches.flatMap((c) => glob1(c, /^chromium(_headless_shell)?-\d+/)).flatMap((d) => [
  path.join(d, "chrome-linux", "chrome"), path.join(d, "chrome-linux64", "chrome"),
  path.join(d, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"), path.join(d, "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"),
  path.join(d, "chrome-win", "chrome.exe"), path.join(d, "chrome-win64", "chrome.exe"),
  path.join(d, "chrome-headless-shell-linux64", "chrome-headless-shell"), path.join(d, "chrome-headless-shell-linux", "chrome-headless-shell"),
]);
let pyChromium = [];
try { pyChromium = [execSync(`python3 -c "from playwright.sync_api import sync_playwright\nwith sync_playwright() as p: print(p.chromium.executable_path)"`, { stdio: ["ignore", "pipe", "ignore"], timeout: 15000 }).toString().trim()]; } catch {}

const CHROME = [
  process.env.MPAD_CHROME, process.env.APP_DESIGNER_CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium", "/usr/bin/microsoft-edge",
  ...pwChromium, ...pyChromium,
].find((p) => p && fs.existsSync(p));
if (!CHROME) {
  console.error("No Chromium found. Install Google Chrome, or run `npx playwright-core install chromium`, or set MPAD_CHROME=/path/to/chrome.");
  process.exit(2);
}
const onMac = process.platform === "darwin";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
const smallInit = () => {
  const set = () => document.body && document.body.setAttribute("data-small", "");
  if (document.body) set(); else document.addEventListener("DOMContentLoaded", set, { once: true });
};
const settle = async () => {
  await document.fonts.ready;
  // Land every finite animation on its final frame, except inside a screen
  // marked data-freeze="ms", which is paused at that moment instead.
  for (const a of document.getAnimations()) {
    try {
      const host = a.effect?.target?.closest?.("[data-freeze]");
      if (host) { a.pause(); a.currentTime = parseFloat(host.dataset.freeze) || 0; continue; }
      const t = a.effect?.getComputedTiming?.(); if (t && t.endTime !== Infinity) a.finish();
    } catch {}
  }
  await new Promise((r) => setTimeout(r, 250));
};
const open = async (scale) => {
  const p = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: scale, colorScheme: DARK ? "dark" : "light" });
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("requestfailed", (r) => {
    const u = r.url();
    if (/\/System\/Library\/Fonts\//.test(u) && !onMac) return;             // Apple faces, expected off-Mac
    if (/node_modules\/material-symbols\//.test(u)) { errors.push("Material Symbols not installed: run `npm install` in the skill folder (" + u + ")"); return; }
    errors.push("request failed: " + u);
  });
  // The small size is applied before the page's own scripts run, so a layout
  // that measures the screen at load sees the size it will be shot at.
  if (SMALL) await p.addInitScript(smallInit);
  await p.goto(pathToFileURL(SRC).href, { waitUntil: "networkidle" });
  await p.evaluate(settle);
  // Transparent outside the screen's rounded corners, so every PNG can be
  // dropped onto any page or panel as it is.
  await p.addStyleTag({ content: "html,body{background:transparent!important}" });
  return p;
};
const page = await open(SCALE);

// Which fonts actually rendered? Tells the report whether SF/NY are real.
const fontFacts = await page.evaluate(() => {
  const loaded = new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")));
  const sys = (f) => document.fonts.check(`16px "${f}"`);
  return {
    "SF Pro": loaded.has("SF Pro"), "New York": loaded.has("New York"),
    "Google Sans Flex": loaded.has("Google Sans Flex"), "Roboto Flex": loaded.has("Roboto Flex"),
    "Inter": loaded.has("Inter"), "Newsreader": loaded.has("Newsreader"),
    "Material Symbols Outlined": loaded.has("Material Symbols Outlined"),
    "CJK": loaded.has("Noto Sans SC") || sys("Noto Sans CJK SC") || sys("PingFang SC") || sys("Microsoft YaHei"),
  };
});

// Hide screens not asked for (--only), then collect the rest.
const onlyJs = (only) => {
  for (const s of document.querySelectorAll(".screen, .app-icon")) {
    const d = s.dataset.device || "ios";
    if (!only.includes(d) && !(only.includes("web") && d.startsWith("web"))) s.style.display = "none";
  }
};
if (ONLY.length) await page.evaluate(onlyJs, ONLY);

const all = await page.$$(".screen, .app-icon");
const live = [];
for (const h of all) if (await h.evaluate((e) => getComputedStyle(e).display !== "none")) live.push(h);
if (!live.length) { console.error("No .screen elements found. Wrap each screen in <section class=\"screen\" data-device=\"...\">."); process.exit(2); }
const unsized = await page.evaluate(() => [...document.querySelectorAll(".screen, .app-icon")].filter((e) => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== "none" && (r.width < 10 || r.height < 10); }).length);
if (unsized) {
  console.error(`${unsized} screen(s) have no size, so device.css did not load. Link it with an absolute file:// URL to <skill>/assets/device.css.`);
  for (const e of errors) console.error("  " + e);
  process.exit(2);
}

const shots = [];
let page2 = null;   // desktop screens at 3x are 4320px wide for no gain: shoot them at 2x
for (let i = 0; i < live.length; i++) {
  const meta = await live[i].evaluate((e) => ({
    name: e.dataset.name || "", icon: e.classList.contains("app-icon"), device: e.dataset.device || "ios",
    w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, radius: parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0,
  }));
  const name = (meta.name || `screen-${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const out = path.join(OUT, /^\d+-/.test(name) ? `${name}.png` : `${String(i + 1).padStart(2, "0")}-${name}.png`);
  if (meta.device === "web-desktop" && !meta.icon && SCALE > 2) {
    if (!page2) { page2 = await open(2); if (ONLY.length) await page2.evaluate(onlyJs, ONLY); }
    const h2 = (await page2.$$(".screen, .app-icon"))[all.indexOf(live[i])];
    await h2.screenshot({ path: out, omitBackground: true });
  } else {
    await live[i].screenshot({ path: out, omitBackground: true });
  }
  shots.push({ ...meta, name, out });
}
if (page2) await page2.close();

// Contact sheet: the flow side by side. Phones at 1:1, desktop windows at
// half width so they sit in the same row. Detail lives in the full PNGs.
const sheetW = (s) => s.icon ? 344 : s.device === "web-desktop" ? Math.round(s.w / 2) : Math.round(s.w);
const sheetR = (s) => s.icon ? s.radius : s.device === "web-desktop" ? s.radius / 2 : s.radius;
const rowW = Math.min(1700, shots.reduce((m, s) => Math.max(m, sheetW(s)), 0) * 4 + 3 * 32);
const sheetHtml = `<html><body style="margin:0;padding:40px;background:#d9d9d6;display:flex;flex-wrap:wrap;gap:40px 32px;align-items:flex-start;width:${rowW}px">${shots
  .map((s) => `<figure style="margin:0;font:500 13px Inter,-apple-system,system-ui;color:#555"><img src="${pathToFileURL(s.out).href}" style="width:${sheetW(s)}px;display:block;border-radius:${sheetR(s)}px"><figcaption style="padding-top:10px;text-align:center">${s.name} <span style="opacity:.55">${s.icon ? "icon" : s.device}</span></figcaption></figure>`)
  .join("")}</body></html>`;
const sheetFile = path.join(OUT, "_sheet.html");
fs.writeFileSync(sheetFile, sheetHtml);
const sp = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: rowW + 80, height: 1000 } });
await sp.goto(pathToFileURL(sheetFile).href, { waitUntil: "load" });
await sp.screenshot({ path: path.join(OUT, "sheet.png"), fullPage: true });
fs.unlinkSync(sheetFile);
await sp.close();

console.log(`\nShot ${shots.length} screen(s) at ${SCALE}x${SMALL ? " (small sizes)" : ""} -> ${OUT}`);
for (const s of shots) console.log(`  ${s.out}  [${s.icon ? "icon" : s.device} ${Math.round(s.w)}x${Math.round(s.h)}]`);
console.log("  " + path.join(OUT, "sheet.png") + "   (the flow; open each full PNG above for detail)");
console.log(`\nFonts: SF Pro ${fontFacts["SF Pro"] ? "real (Mac)" : "not on this machine, Inter stands in; say so in the report"}; Google Sans Flex ${fontFacts["Google Sans Flex"] ? "ok" : "missing"}; Roboto Flex ${fontFacts["Roboto Flex"] ? "ok" : "missing"}; Material Symbols ${fontFacts["Material Symbols Outlined"] ? "ok" : "missing (npm install in the skill folder)"}; CJK face ${fontFacts.CJK ? "available" : "none (only matters for Chinese UI)"}`);
if (errors.length) { console.log("\nPage errors:"); for (const e of [...new Set(errors)]) console.log("  " + e); }

if (has("--no-scan")) { await browser.close(); process.exit(0); }

// ------------------------------------------------------------------ slop scan
await page.addScriptTag({ path: path.join(here, "scan.js") });
const report = await page.evaluate((small) => window.AppScan.run({ small }), SMALL);
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const liveNames = new Set(shots.filter((s) => !s.icon).map((s) => s.name));
const scanned = ONLY.length ? report.filter((s) => liveNames.has(slug(s.name))) : report;

// ------------------------------------------------- pixel contrast pass
// Text over an image or an SVG, and the system chrome over whatever the
// design put under it: hide the ink, photograph what is really behind it,
// and measure against every pixel of that ground.
const measure = async (handle, fg) => {
  const buf = await handle.screenshot({ scale: "css", animations: "disabled" });
  return page.evaluate(async ({ b64, fg }) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const L = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const lf = L(fg.r, fg.g, fg.b), ratios = [];
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40) continue; const lb = L(d[i], d[i + 1], d[i + 2]); ratios.push((Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05)); }
    ratios.sort((a, b) => a - b);
    return ratios[Math.floor(ratios.length * 0.12)] || 21;
  }, { b64: buf.toString("base64"), fg });
};
const rgbOf = (s) => { const p = (s.match(/[\d.]+/g) || []).map(Number); return { r: p[0] || 0, g: p[1] || 0, b: p[2] || 0 }; };
for (const s of scanned) {
  for (const j of s.pxJobs) {
    const h = await page.$(`[data-ac-px="${j.id}"]`); if (!h) continue;
    await h.evaluate((e) => { e.style.setProperty("color", "transparent", "important"); e.style.setProperty("text-shadow", "none", "important"); });
    const ratio = await measure(h, j.fg);
    await h.evaluate((e) => { e.style.removeProperty("color"); e.style.removeProperty("text-shadow"); });
    if (ratio < j.need) s.fails.push(`Text on an image/illustration fails contrast over part of its ground (${ratio.toFixed(2)}:1, needs ${j.need}): "${j.t}". Add a scrim, move it, or change the ink.`);
  }
  if (!s.chrome) continue;
  const scr = await page.$(`.screen[data-ac-id="${s.id}"]`); if (!scr) continue;
  const probes = [
    [".ac-status > span:first-child", "status-bar clock", "color"], [".ac-status .ac-right", "status-bar icons", "color"],
    [".ac-home", "home indicator", "backgroundColor"], [".ac-pill", "gesture pill", "backgroundColor"], [".ac-nav", "navigation buttons", "color"],
  ];
  for (const [q, label, prop] of probes) {
    const h = await scr.$(q); if (!h) continue;
    const fg = rgbOf(await h.evaluate((e, prop) => getComputedStyle(e)[prop], prop));
    await h.evaluate((e) => e.style.setProperty("opacity", "0", "important"));
    const ratio = await measure(h, fg);
    await h.evaluate((e) => e.style.removeProperty("opacity"));
    if (ratio < 2.2) s.fails.push(`The ${label} is lost on what sits under it (${ratio.toFixed(2)}:1). Use data-chrome="light" / data-home, or change the art under it.`);
  }
}

const appSizes = [...new Set(scanned.flatMap((s) => s.facts.sizes || []))].sort((a, b) => b - a);
let failed = 0;
for (const s of scanned) {
  console.log(`\n── ${s.name} [${s.device}] ─────────────────────────────`);
  console.log(`  fonts ${JSON.stringify(s.facts.fonts)}  sizes [${s.facts.sizes.join(", ")}]  weights [${s.facts.weights.join(", ")}]  hues [${s.facts.accentHues.join(", ")}]  cards ${s.facts.cards}`);
  for (const f of s.fails) console.log("  FAIL  " + f);
  for (const w of s.warns) console.log("  warn  " + w);
  if (s.facts.overImage?.length) console.log("  eye   text over image/illustration (pixel-measured above; still look): " + s.facts.overImage.join(", "));
  if (!s.fails.length && !s.warns.length) console.log("  clean");
  failed += s.fails.length;
}
console.log(`\nApp-wide: ${appSizes.length} text sizes [${appSizes.join(", ")}]${appSizes.length > 9 ? "  warn: a type scale this long is not a scale. Merge sizes a step apart." : ""}`);
fs.writeFileSync(path.join(OUT, "scan.json"), JSON.stringify({ fonts: fontFacts, small: SMALL, screens: scanned.map(({ pxJobs, chrome, ...r }) => r) }, null, 2));
console.log(`\n${failed ? failed + " FAIL(s)." : "No FAILs."} The scan only catches mechanical tells. Now read sheet.png with your own eyes.`);
await browser.close();
process.exit(failed ? 1 : 0);
