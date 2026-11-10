// Multiplatform App Designer device chrome: injects each platform's status bar,
// system bars and browser frame into every .screen / .mini-screen, keyed by
// data-device. See device.css for the attributes.
(() => {
  // iOS glyphs (SF-style)
  const iosSignal = `<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="1"/><rect x="5" y="5" width="3.2" height="7" rx="1"/><rect x="10" y="2.5" width="3.2" height="9.5" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>`;
  const iosWifi = `<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.6c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8.5.9 10.2 10.2 0 0 0 1.3 3.8L2.5 5a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8.5 4.3c-1.8 0-3.5.7-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.5 0-1 .2-1.3.5L8.5 11.2l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z"/></svg>`;
  const iosBattery = `<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".45"/></svg>`;
  // Android glyphs (Material-style, 16px)
  const andWifi = `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 21 1 10.5a16.4 16.4 0 0 1 22 0L12 21Z"/></svg>`;
  const andSignal = `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M2 22 22 2v20H2Z"/></svg>`;
  const andBattery = `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M15.7 4H14V2h-4v2H8.3C7.6 4 7 4.6 7 5.3v15.3c0 .8.6 1.4 1.3 1.4h7.3c.8 0 1.4-.6 1.4-1.3V5.3C17 4.6 16.4 4 15.7 4Z"/></svg>`;
  // Android three-button navigation
  const navBack = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3-1.4-1.4Z"/></svg>`;
  const navHome = `<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`;
  const navRecents = `<svg width="20" height="20" viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`;
  // Browser glyphs
  const lock = `<svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 1 1 6 0v3H9V7Z"/></svg>`;
  const dots = `<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`;
  const arrowL = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M15.4 7.4 10.8 12l4.6 4.6-1.4 1.4-6-6 6-6 1.4 1.4Z"/></svg>`;
  const arrowR = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M8.6 7.4 13.2 12l-4.6 4.6 1.4 1.4 6-6-6-6-1.4 1.4Z"/></svg>`;
  const reload = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M17.6 6.4A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.2L13 11h7V4l-2.4 2.4Z"/></svg>`;
  const share = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2 7.8 6.2l1.4 1.4L11 5.8V15h2V5.8l1.8 1.8 1.4-1.4L12 2Zm-6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h-2v10H8V10H6Z"/></svg>`;
  const book = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 3h7a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4V3Zm16 0h-7a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h7V3Z"/></svg>`;
  const squares = `<svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="7" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  for (const s of document.querySelectorAll(".screen, .mini-screen")) {
    if (s.dataset.chrome === "none") continue;
    const device = s.dataset.device || "ios";
    const url = s.dataset.url || "example.app";
    const title = s.dataset.title || url.replace(/^[a-z]+:\/\//, "").split("/")[0];
    let html = "";

    if (device === "ios" || (device === "web-mobile" && s.dataset.browser === "safari")) {
      html += `<div class="ac-status" aria-hidden="true"><span>${esc(s.dataset.time || "9:41")}</span><span class="ac-right">${iosSignal}${iosWifi}${iosBattery}</span></div>` +
        `<div class="ac-island" aria-hidden="true"></div><div class="ac-home" aria-hidden="true"></div>`;
      if (device === "web-mobile") {
        html += `<div class="ac-browser ac-browser-safari" aria-hidden="true"><div class="ac-pill-url"><span style="color:#8e8e93">AA</span>&nbsp; ${esc(url)} &nbsp;${reload}</div><div class="ac-tools">${arrowL}${arrowR}${share}${book}${squares}</div></div>`;
      }
    } else if (device === "android" || device === "web-mobile") {
      html += `<div class="ac-status" aria-hidden="true"><span>${esc(s.dataset.time || "10:08")}</span><span class="ac-right">${andWifi}${andSignal}${andBattery}</span></div>` +
        `<div class="ac-hole" aria-hidden="true"></div>`;
      html += s.dataset.nav === "buttons"
        ? `<div class="ac-nav" aria-hidden="true">${navBack}${navHome}${navRecents}</div>`
        : `<div class="ac-pill" aria-hidden="true"></div>`;
      if (device === "web-mobile") {
        html += `<div class="ac-browser ac-browser-chrome" aria-hidden="true"><div class="ac-pill-url">${lock}<span>${esc(url)}</span></div><span class="ac-tabs">3</span>${dots}</div>`;
      }
    } else if (device === "web-desktop") {
      html += `<div class="ac-browser ac-browser-desktop" aria-hidden="true">` +
        `<div class="ac-tabstrip"><div class="ac-dots"><i></i><i></i><i></i></div><div class="ac-tab"><span class="ac-fav"></span><span>${esc(title)}</span></div></div>` +
        `<div class="ac-addr">${arrowL}${arrowR}${reload}<div class="ac-pill-url">${lock}<span>${esc(url)}</span></div>${dots}</div></div>`;
    }
    s.insertAdjacentHTML("beforeend", html);
  }
})();
