/*
 * AppScan: the slop scan, run inside the page. Platform-aware via
 * .screen[data-device]. Two ways to use it:
 *
 *   shoot.mjs injects it and calls AppScan.run({ small }) after fonts load,
 *   then does the pixel-contrast pass itself (needs screenshots).
 *
 *   A published artifact inlines it with <script data-auto> and opens
 *   <url>#scan: AppScan.overlay() draws the report on the page. Text over
 *   images is listed as "check by eye" there, since no pixels can be read.
 *
 * It catches the mechanical tells only (slop.md marks them [scan]). Taste is
 * the critic's job.
 */
(() => {
  const SLOP_WORDS = [
    "effortless", "seamless", "unlock", "elevate", "supercharge", "empower", "revolutioni",
    "game-chang", "next-level", "welcome back", "let's get started", "your journey", "journey awaits",
    "lorem", "ipsum", "john doe", "jane doe", "user name", "ai-powered", "powered by ai",
    "all in one place", "at your fingertips", "take control", "level up", "stay on track",
    "crush your", "smarter way", "like never before", "transform your", "trusted by thousands",
    "get started for free", "the future of",
  ];
  // Fonts that read as "nobody chose". A warn, not a fail: defend or replace.
  const DEFAULT_REACH = /^(Inter|Inter Variable|Poppins|Montserrat|Manrope|DM Sans|Plus Jakarta Sans|Nunito|Raleway|Outfit|Space Grotesk|Playfair Display|DM Serif Display|Lato|Open Sans)$/i;

  // Per-platform constants. Units differ (pt, dp/sp, px) but the CSS px in a
  // mockup equals one of each, so the numbers compare directly.
  const PLATFORM = {
    ios:           { label: "iOS", unit: "pt", floor: 11, tap: 44, centredFab: "fail", anyFab: null,
                     system: /^(-apple-system|system-ui|SF Pro|SF Pro Rounded|SF Pro Display|SF Pro Text|New York|SF Mono)$/i },
    android:       { label: "Android", unit: "sp", floor: 11, tap: 48, centredFab: "warn", anyFab: null,
                     system: /^(system-ui|Roboto|Roboto Flex|Roboto Flex Variable|Google Sans|Google Sans Flex|Google Sans Flex Variable|Google Sans Text)$/i },
    "web-mobile":  { label: "mobile web", unit: "px", floor: 12, tap: 44, centredFab: "fail", anyFab: null, system: /^(system-ui)$/i },
    "web-desktop": { label: "desktop web", unit: "px", floor: 12, tap: 24, centredFab: "fail", anyFab: "warn", measure: true, system: /^(system-ui)$/i },
  };

  const parse = (c) => {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
  };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const isChrome = (el) => el.closest(".ac-status,.ac-island,.ac-home,.ac-nav,.ac-browser,.mini");
  const cssPx = (el, name, d) => { const v = parseFloat(getComputedStyle(el).getPropertyValue(name)); return Number.isFinite(v) ? v : d; };

  function run(opts = {}) {
    const small = !!opts.small;
    const out = [];
    for (const screen of document.querySelectorAll(".screen")) {
      // At a small size, a storyboard or store panel is a picture, not a screen.
      if (small && screen.dataset.chrome === "none") continue;
      const device = screen.dataset.device || "ios";
      const P = PLATFORM[device] || PLATFORM.ios;
      const name = screen.dataset.name || "screen";
      screen.scrollIntoView({ block: "start" });
      const fails = [], warns = [], facts = { device };
      const sr = screen.getBoundingClientRect();
      const safeTop = screen.dataset.chrome === "none" ? 0 : cssPx(screen, "--safe-top", 0);
      const safeBottom = screen.dataset.chrome === "none" ? 0 : cssPx(screen, "--safe-bottom", 0);
      const all = [...screen.querySelectorAll("*")].filter((e) => !isChrome(e));
      const visible = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05 && r.bottom > sr.top && r.top < sr.bottom; };

      const textElsAll = all.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(e));
      const textEls = textElsAll.filter((e) => !e.closest("[data-system]"));
      const text = textEls.map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ")).join(" \n ");

      // Effective solid background behind an element (null if an image/gradient is in the way).
      const bgOf = (el) => {
        let layers = [];
        for (let n = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.backgroundImage && cs.backgroundImage !== "none") return null;
          const c = parse(cs.backgroundColor);
          if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
          if (n === screen) break;
        }
        let base = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
        return base;
      };

      // ---- Typography
      const fams = new Map(), sizes = new Map(), weights = new Set();
      let tiny = [], lowContrast = [], centered = 0, blocks = 0, edge = [], overImage = [], longMeasure = [];
      const pxJobs = [], pxBase = out.length * 1000;
      for (const e of textEls) {
        const cs = getComputedStyle(e);
        const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
        fams.set(fam, (fams.get(fam) || 0) + 1);
        const px = parseFloat(cs.fontSize);
        sizes.set(px, (sizes.get(px) || 0) + 1);
        weights.add(cs.fontWeight);
        const t = e.textContent.trim().slice(0, 40);
        if (px < P.floor) tiny.push(`${px}px "${t}"`);
        const fg = parse(cs.color);
        let bg = bgOf(e);
        if (bg) {
          const r0 = e.getBoundingClientRect();
          const stack = document.elementsFromPoint(r0.left + Math.min(r0.width / 2, 40), r0.top + r0.height / 2);
          const at = stack.indexOf(e);
          for (const n of stack.slice(at + 1)) {
            if (n.contains(e)) break;
            if (n.matches("img,svg,canvas,video,picture") || n.closest("svg") || getComputedStyle(n).backgroundImage !== "none") {
              bg = null; overImage.push(`"${t}"`);
              const id = String(pxJobs.length + pxBase);
              e.setAttribute("data-ac-px", id);
              const large = px >= 24 || (px >= 18.6 && +cs.fontWeight >= 600);
              if (fg) pxJobs.push({ id, t, fg, need: large ? 3 : 4.5 });
              break;
            }
            if ((parse(getComputedStyle(n).backgroundColor)?.a || 0) > 0.95) break;
          }
        }
        if (fg && bg) {
          const ratio = contrast(blend(fg, bg), bg);
          const large = px >= 24 || (px >= 18.6 && +cs.fontWeight >= 600);
          if (ratio < (large ? 3 : 4.5)) lowContrast.push(`${ratio.toFixed(2)}:1 ${px}px "${t}"`);
        }
        const len = e.textContent.trim().length;
        if (len > 24) { blocks++; if (cs.textAlign === "center") centered++; }
        if (P.measure && len > 90) {
          const rg = document.createRange(); rg.selectNodeContents(e);
          const lines = [...rg.getClientRects()].filter((r) => r.width > 1);
          const widest = Math.max(0, ...lines.map((r) => r.width));
          if (widest / px > 42) longMeasure.push(`${Math.round(widest / px * 2)}ch "${t}"`);
        }
        if (!e.closest("[data-bleed]")) {
          const rg = document.createRange(); rg.selectNodeContents(e);
          for (const r of rg.getClientRects()) {
            if (r.width < 1) continue;
            const inset = Math.min(r.left - sr.left, sr.right - r.right);
            if (inset >= 0 && inset < 12) { edge.push(`${Math.round(inset)}px "${t}"`); break; }
          }
        }
      }
      facts.fonts = Object.fromEntries(fams);
      facts.sizes = [...sizes.keys()].sort((a, b) => b - a);
      facts.weights = [...weights].sort();
      const famList = [...fams.keys()].filter((f) => !P.system.test(f));
      if (famList.length > 2) fails.push(`More than two type families in content: ${famList.join(", ")}`);
      const defaults = [...fams.keys()].filter((f) => DEFAULT_REACH.test(f));
      if (defaults.length) warns.push(`Default-reach font in use (${defaults.join(", ")}). Defend it in DIRECTION.md or replace it.${device === "ios" ? " (If Inter is standing in for SF Pro off-Mac, say so in the report.)" : ""}`);
      if (sizes.size > 8) warns.push(`${sizes.size} distinct text sizes. A type scale has 5 to 7 steps: ${facts.sizes.join(", ")}`);
      if (sizes.size <= 3 && textEls.length > 8) warns.push(`Only ${sizes.size} text sizes across ${textEls.length} text elements. Hierarchy is flat.`);
      const maxPx = Math.max(...sizes.keys());
      const heroFloor = device === "web-desktop" ? 32 : 26;
      if (textEls.length > 6 && maxPx < heroFloor && !screen.hasAttribute("data-dense")) warns.push(`Largest text is ${maxPx}px. No element owns the screen. (Mark data-dense if this is deliberate.)`);
      if (tiny.length) fails.push(`Text below ${P.floor}${P.unit} (${P.label} floor): ${tiny.slice(0, 4).join("; ")}`);
      if (lowContrast.length) fails.push(`Contrast below WCAG on solid ground: ${lowContrast.slice(0, 5).join("; ")}`);
      if (longMeasure.length) warns.push(`Line length over ~80 characters: ${longMeasure.slice(0, 3).join("; ")}. Cap the measure (max-width 60 to 75ch) or use columns.`);

      // ---- Safe zones: text under the status bar, a browser bar, the indicator.
      const topLabel = safeTop > 70 ? "browser bar" : "status bar";
      const bottomZone = device === "web-desktop" ? 0
        : (device === "web-mobile" && screen.dataset.browser === "safari") ? safeBottom
        : (device === "android" && screen.dataset.nav === "buttons") ? safeBottom
        : 16;
      const bottomLabel = bottomZone > 16 ? (device === "web-mobile" ? "browser bar" : "navigation bar") : (device === "ios" ? "home indicator" : "gesture pill");
      const under = [];
      for (const e of textEls) {
        if (e.closest("[data-bleed]") || screen.dataset.chrome === "none") continue;
        const r = e.getBoundingClientRect();
        if (safeTop && r.top < sr.top + safeTop - 10 && r.bottom > sr.top + 8) under.push(`"${e.textContent.trim().slice(0, 24)}" (${topLabel})`);
        if (bottomZone && r.bottom > sr.bottom - bottomZone && !e.closest("[data-scrolls]")) under.push(`"${e.textContent.trim().slice(0, 24)}" (${bottomLabel})`);
      }
      if (under.length) warns.push(`Text inside the system's safe areas: ${under.slice(0, 3).join("; ")}`);
      if (blocks >= 4 && centered / blocks > 0.6) warns.push(`${centered}/${blocks} text blocks centred. Centred everything reads as a template.`);
      if (edge.length) warns.push(`Text within 12px of the screen edge: ${edge.slice(0, 3).join("; ")}`);

      // ---- Clipping and collisions
      const clipped = [], overlaps = [], offscreen = [], crowded = [], stacked = [];
      const boxes = [];
      for (const e of textElsAll) {
        const cs = getComputedStyle(e);
        const t = e.textContent.trim().slice(0, 30);
        if (cs.overflow !== "visible" || cs.overflowX !== "visible") {
          if (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow !== "ellipsis") clipped.push(`"${t}"`);
          if (e.scrollHeight > e.clientHeight + 2 && !cs.webkitLineClamp?.match(/\d/)) clipped.push(`"${t}" (height)`);
        }
        for (const n of e.childNodes) {
          if (n.nodeType !== 3 || !n.textContent.trim()) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          const fs = parseFloat(cs.fontSize);
          for (const lr of rg.getClientRects()) {
            if (lr.width < 1) continue;
            const inkTop = Math.max(lr.top, lr.bottom - 0.98 * fs), inkBottom = lr.bottom - 0.04 * fs;
            const r = { left: lr.left, right: lr.right, top: inkTop, bottom: inkBottom, width: lr.width, height: inkBottom - inkTop };
            boxes.push({ e, r, t });
            if ((r.left < sr.left - 1 || r.right > sr.right + 1) && !e.closest("[data-bleed]")) offscreen.push(`"${t}"`);
          }
        }
      }
      for (const b of boxes) {
        for (let n = b.e.parentElement; n && n !== screen; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflow === "visible" && cs.overflowX === "visible") continue;
          if (n.hasAttribute("data-scrolls")) break;
          const pr = n.getBoundingClientRect();
          if (b.r.right > pr.right + 1 || b.r.left < pr.left - 1 || b.r.bottom > pr.bottom + 2) clipped.push(`"${b.t}" cut by its container`);
          break;
        }
      }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.e === b.e || a.e.contains(b.e) || b.e.contains(a.e)) continue;
        const floats = (x) => x.e.closest(".glass,.glass-dark,[data-system],[data-float]");
        if (!floats(a) !== !floats(b)) continue;
        if (a.e.closest("[data-behind]") || b.e.closest("[data-behind]")) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 2 && oy > Math.min(a.r.height, b.r.height) * 0.35) overlaps.push(`"${a.t}" / "${b.t}"`);
        else if (oy > Math.min(a.r.height, b.r.height) * 0.6 && ox > -3 && ox <= 2) crowded.push(`"${a.t}" / "${b.t}"`);
        else if (ox > 4 && oy > -2 && oy <= Math.min(a.r.height, b.r.height) * 0.35) stacked.push(`"${a.t}" / "${b.t}"`);
      }
      if (clipped.length) fails.push(`Text clipped: ${[...new Set(clipped)].slice(0, 4).join("; ")}`);
      if (overlaps.length) fails.push(`Text overlapping text: ${[...new Set(overlaps)].slice(0, 4).join("; ")}`);
      if (stacked.length) warns.push(`Lines of text touching vertically (ink under 2px apart): ${[...new Set(stacked)].slice(0, 3).join("; ")}`);
      if (crowded.length) fails.push(`Text touching text (under 3px apart): ${[...new Set(crowded)].slice(0, 4).join("; ")}`);
      if (offscreen.length) fails.push(`Text running off the screen (mark data-bleed if deliberate): ${[...new Set(offscreen)].slice(0, 3).join("; ")}`);
      const leftBand = device === "web-desktop" ? sr.width * 0.35 : 140;
      const lefts = new Set(textEls.filter((e) => e.textContent.trim().length > 2).map((e) => Math.round((e.getBoundingClientRect().left - sr.left) / 3) * 3).filter((x) => x > 0 && x < leftBand));
      facts.leftEdges = lefts.size;
      const leftMax = device === "web-desktop" ? 8 : 5;
      if (lefts.size > leftMax && !screen.hasAttribute("data-dense")) warns.push(`${lefts.size} distinct left edges in the left third. Align to fewer verticals.`);

      // ---- Copy
      const emoji = text.match(/\p{Extended_Pictographic}/gu);
      if (emoji) fails.push(`Emoji in UI copy or as icons: ${[...new Set(emoji)].join(" ")}`);
      const lower = text.toLowerCase();
      const hits = SLOP_WORDS.filter((w) => lower.includes(w));
      if (hits.length) fails.push(`Slop copy: ${hits.map((h) => `"${h}"`).join(", ")}`);
      const greet = textEls.find((e) => /^(good (morning|afternoon|evening|night)|hi|hey|hello|welcome)\b/i.test(e.textContent.trim()) && e.getBoundingClientRect().top - sr.top < (device === "web-desktop" ? 200 : 260));
      if (greet) fails.push(`Greeting at the top of the screen: "${greet.textContent.trim().slice(0, 40)}". Spend that space on the thing itself.`);
      if (/\u2014/.test(text)) warns.push("Em dash in visible copy. Usually a period or colon reads cleaner.");
      if ((text.match(/!/g) || []).length > 1) warns.push(`${(text.match(/!/g) || []).length} exclamation marks. The UI is shouting.`);

      // ---- Colour, gradients, shadows, cards
      const accents = new Map();
      let gradients = 0, purpleGrad = 0, glows = 0, shadows = 0, cards = [], chips = 0, blurBlobs = 0;
      for (const e of all) {
        if (!visible(e)) continue;
        const cs = getComputedStyle(e);
        if (e.closest("[data-system]")) continue;
        for (const prop of ["color", "backgroundColor", "borderTopColor", "fill", "stroke"]) {
          if ((prop === "fill" || prop === "stroke") && !(e instanceof SVGElement)) continue;
          const c = parse(cs[prop]);
          if (!c || c.a < 0.5) continue;
          if (prop === "borderTopColor" && parseFloat(cs.borderTopWidth) === 0) continue;
          const { h, s, l } = hsl(c);
          if (s > 0.38 && l > 0.15 && l < 0.85) { const k = Math.round(h / 24) * 24 % 360; accents.set(k, (accents.get(k) || 0) + 1); }
        }
        const bi = cs.backgroundImage;
        if (bi && bi.includes("gradient")) {
          gradients++;
          const stops = [...bi.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0])).filter(Boolean).map(hsl);
          if (stops.some((x) => x.s > 0.35 && x.h >= 235 && x.h <= 295)) purpleGrad++;
        }
        const r = e.getBoundingClientRect();
        if (/blur\((\d{2,})/.test(cs.filter) && r.width > 80) blurBlobs++;
        if (cs.boxShadow !== "none") {
          shadows++;
          for (const sh of cs.boxShadow.split(/,(?![^(]*\))/)) {
            const c = parse(sh); const nums = sh.replace(/rgba?\([^)]+\)/, "").trim().split(/\s+/).map(parseFloat);
            if (c && !/inset/.test(sh) && Math.abs(nums[0]) < 1 && Math.abs(nums[1]) < 1 && (nums[2] || 0) > 8 && hsl(c).s > 0.4) glows++;
          }
        }
        const radius = parseFloat(cs.borderTopLeftRadius);
        const filled = (parse(cs.backgroundColor)?.a || 0) > 0.05 || cs.boxShadow !== "none" || parseFloat(cs.borderTopWidth) > 0;
        if (radius >= 10 && filled && r.width > 120 && r.height > 56) cards.push(e);
        if (r.width >= 26 && r.width <= 48 && Math.abs(r.width - r.height) < 2 && radius >= 6 && radius < r.width / 2 - 1 && filled && e.querySelector("svg,img,i,span")) chips++;
      }
      const hues = [...accents.keys()];
      facts.accentHues = hues;
      if (hues.length > 3) fails.push(`${hues.length} saturated hue families (${hues.join("°, ")}°). One accent, maybe one semantic colour. This is confetti.`);
      else if (hues.length === 3) warns.push(`Three saturated hue families (${hues.join("°, ")}°). Is each one earning its place?`);
      if (purpleGrad) fails.push(`Purple/indigo gradient x${purpleGrad}. The single most recognisable AI tell.`);
      if (gradients > 2) warns.push(`${gradients} gradients. Gradients are a seasoning, not a surface treatment.`);
      if (glows) fails.push(`Coloured zero-offset glow shadow x${glows}.`);
      if (blurBlobs) fails.push(`Large blurred blob x${blurBlobs}. Ambient orbs behind content are a slop signature.`);
      if (chips >= 3) warns.push(`${chips} icon-in-tinted-square chips. If every row has one, none of them mean anything.`);

      // ---- Floating action buttons
      let centredFab = false, anyFab = false;
      for (const e of all) {
        if (!visible(e)) continue;
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        const bg = parse(cs.backgroundColor);
        const roundish = parseFloat(cs.borderTopLeftRadius) >= Math.min(r.width, r.height) * 0.28;
        const fabSized = r.width >= 44 && r.width <= 96 && r.height >= 44 && r.height <= 72;
        if (fabSized && roundish && bg && bg.a > 0.8 && hsl(bg).s > 0.35 && sr.bottom - r.bottom < 140 && e.querySelector("svg,span,i")) {
          anyFab = true;
          if (Math.abs((r.left + r.right) / 2 - (sr.left + sr.right) / 2) < 30 && Math.abs(r.width - r.height) < 2) centredFab = true;
        }
      }
      if (centredFab) {
        const msg = device === "android"
          ? "Centred FAB over the navigation bar. Material 3 puts the FAB at the end (bottom-right, 16dp in), or in the toolbar; the centre-docked FAB is a 2016 pattern."
          : "Centred floating action button over the tab bar. Put the primary action where the content is.";
        (P.centredFab === "fail" ? fails : warns).push(msg);
      } else if (anyFab && P.anyFab) warns.push("A floating action button on desktop web. Pointer-driven screens put the primary action in the layout (toolbar, header, inline).");

      let nested = 0;
      for (const c of cards) if (cards.some((o) => o !== c && o.contains(c))) nested++;
      facts.cards = cards.length;
      if (nested >= 2) fails.push(`Cards nested inside cards x${nested}. Group with space, not boxes.`);
      const cardMax = device === "web-desktop" ? 10 : 6;
      if (cards.length >= cardMax && !screen.hasAttribute("data-dense")) warns.push(`${cards.length} card containers on one screen. Is the screen just a stack of boxes?`);
      if (shadows > (device === "web-desktop" ? 10 : 6)) warns.push(`${shadows} elements cast shadows. Depth should come from one or two layers, not every tile.`);

      // ---- Touch / pointer targets
      const smallTargets = [];
      for (const e of screen.querySelectorAll("button,a,[role=button],[data-tap],input,select")) {
        if (isChrome(e) || !visible(e)) continue;
        const r = e.getBoundingClientRect();
        if (r.width < P.tap && r.height < P.tap && !e.hasAttribute("data-hit-expanded")) smallTargets.push(`${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute("aria-label") || e.textContent).trim().slice(0, 20)}"`);
      }
      if (smallTargets.length) warns.push(`Targets under ${P.tap}${P.unit} (${P.label} minimum; add padding, or data-hit-expanded if the hit area is larger than the drawing): ${smallTargets.slice(0, 4).join("; ")}`);

      // ---- Platform-specific structure
      if (device === "web-desktop" && !screen.hasAttribute("data-dense")) {
        const w = sr.width;
        const widest = Math.max(0, ...textEls.map((e) => e.getBoundingClientRect().width));
        if (textEls.length > 8 && widest < w * 0.28 && facts.leftEdges <= 2) warns.push("Desktop page uses a narrow column with wide empty flanks. Either make the width a deliberate editorial measure or use the screen (sidebar, two columns, a wide table).");
      }

      facts.overImage = overImage.slice(0, 6);
      const id = String(out.length);
      screen.setAttribute("data-ac-id", id);
      out.push({ id, name, device, fails, warns, facts, pxJobs, chrome: screen.dataset.chrome !== "none" && !screen.classList.contains("app-icon") });
    }
    return out;
  }

  // In-page report for a published artifact: <url>#scan
  function overlay(opts = {}) {
    document.getElementById("ac-scan-panel")?.remove();
    const report = run(opts);
    const panel = document.createElement("div");
    panel.id = "ac-scan-panel";
    panel.style.cssText = "position:fixed;inset:16px 16px auto auto;max-height:calc(100vh - 32px);width:min(440px,calc(100vw - 32px));overflow:auto;z-index:99999;background:#111;color:#eee;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:14px 16px;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.4);white-space:pre-wrap";
    let txt = `AppScan  ${report.length} screen(s)\n`;
    let failed = 0;
    for (const s of report) {
      txt += `\n── ${s.name} [${s.device}]\n`;
      for (const f of s.fails) txt += `  FAIL  ${f}\n`;
      for (const w of s.warns) txt += `  warn  ${w}\n`;
      if (s.facts.overImage?.length) txt += `  eye   text over image/illustration, check contrast by eye: ${s.facts.overImage.join(", ")}\n`;
      if (!s.fails.length && !s.warns.length) txt += `  clean\n`;
      failed += s.fails.length;
    }
    txt += `\n${failed ? failed + " FAIL(s)." : "No FAILs."} Mechanical tells only; the rubric is still the judge. Close: remove #scan from the URL.`;
    panel.textContent = txt;
    document.body.appendChild(panel);
    return report;
  }

  window.AppScan = { run, overlay, PLATFORM };

  // <script data-auto src=...> or inlined with data-auto: open #scan to see the report.
  const me = document.currentScript;
  if (me && me.hasAttribute("data-auto")) {
    const check = () => { if (location.hash === "#scan") overlay(); else document.getElementById("ac-scan-panel")?.remove(); };
    addEventListener("hashchange", check);
    if (document.readyState === "complete") setTimeout(check, 300); else addEventListener("load", () => setTimeout(check, 300));
  }
})();
