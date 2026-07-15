// ===== MD-QR Studio — script.js =====

const typeEl          = document.getElementById("type");
const fieldsBox       = document.getElementById("dynamic-fields");
const sizeEl          = document.getElementById("size");
const logoEl          = document.getElementById("logo");
const generateBtn     = document.getElementById("generate");
const clearBtn        = document.getElementById("clear");
const downloadLink    = document.getElementById("download-link");
const whatsappShare   = document.getElementById("whatsapp-share");
const copyBtn         = document.getElementById("copy-link");
const copyStatus      = document.getElementById("copy-status");
const historyBox      = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clear-history");
const qrStyleEl       = document.getElementById("qr-style");
const canvasContainer = document.getElementById("qr-canvas");
const framedCanvas    = document.getElementById("framed-canvas");
const qrActions       = document.getElementById("qr-actions");
const qrPlaceholder   = document.getElementById("qr-placeholder");
const historyCount    = document.getElementById("history-count");
const viewMoreWrap    = document.getElementById("view-more-wrap");
const viewMoreBtn     = document.getElementById("view-more");

let logoImage      = null;
let currentPayload = "";
const PAGE_SIZE    = 5;
let visibleCount   = PAGE_SIZE;

const PRESET_LOGOS = {
  location: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EA4335"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 1.5.4 3 1.1 4.3L3.5 20.5l4.3-1.1c1.2.7 2.6 1.1 4.2 1.1 4.7 0 8.5-3.8 8.5-8.5S16.7 3.5 12 3.5zm4.9 12.1c-.2.6-1 1.1-1.6 1.2-.5.1-1.1.2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2 0-.2-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.2.1.2.1.4-.1.7l-.5.6c-.2.2-.3.4-.1.7.2.4.9 1.5 2 2.4.9.8 1.6 1.1 1.9 1.2.3.1.4.1.6-.1.2-.2.8-.9.9-1.2.1-.3.3-.2.5-.1.2.1 1.5.7 1.8.8.3.1.5.2.6.3.1.3 0 1-.2 1.5z" fill="#FFF"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#007AFF"/><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#FFF"/></svg>`,
  email: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#FF9500"/><path d="M17.5 8h-11c-.8 0-1.5.7-1.5 1.5v5c0 .8.7 1.5 1.5 1.5h11c.8 0 1.5-.7 1.5-1.5v-5c0-.8-.7-1.5-1.5-1.5zm-.5 1.5l-5 3-5-3v-1l5 3 5-3v1z" fill="#FFF"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#5856D6"/><path d="M12 17.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-4.2-4.2c2.3-2.3 6.1-2.3 8.4 0l-1.1 1.1c-1.7-1.7-4.5-1.7-6.2 0l-1.1-1.1zm-2.2-2.2c3.5-3.5 9.3-3.5 12.8 0l-1.1 1.1c-2.9-2.9-7.7-2.9-10.6 0l-1.1-1.1z" fill="#FFF"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M14.5 12h-2v7h-3v-7h-1.5v-2.5h1.5v-1.8c0-2 1.2-3.2 3-3.2.9 0 1.6.1 1.8.1v2.1h-1.3c-1 0-1.2.5-1.2 1.2v1.6h2.5l-.3 2.5z" fill="#FFF"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><radialGradient id="igGrad2" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient><circle cx="12" cy="12" r="12" fill="url(#igGrad2)"/><rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#FFF" stroke-width="1.2"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="#FFF" stroke-width="1.2"/><circle cx="15.2" cy="8.8" r="0.6" fill="#FFF"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#000000"/><path d="M15.5 6.5h1.8l-4 4.5 4.7 6.2h-3.6l-2.8-3.7-3.2 3.7H6.6l4.2-4.8L6.3 6.5h3.7l2.5 3.3 3-3.3zm-.6 9.5h1l-8-9H6.8l8.1 9z" fill="#FFF"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#FF0000"/><path d="M17 9.5c0-.8-.7-1.5-1.5-1.5h-7C7.7 8 7 8.7 7 9.5v5c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-5z" fill="#FFF"/><polygon points="10.5,10 14.5,12 10.5,14" fill="#FF0000"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#0A66C2"/><path d="M9.5 9h2.2v1.1h.1c.3-.6 1.1-1.3 2.3-1.3 2.4 0 2.9 1.6 2.9 3.7V16.5h-2.3v-3.6c0-.9-.1-2-1.2-2-1.1 0-1.3.9-1.3 1.9v3.7H9.5V9zM6 9h2.3v7.5H6V9zM7.2 7.8c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4z" fill="#FFF"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#26A5E4"/><path d="M6.3 11.7l10.8-4.2c.5-.2 1 .1.8.7l-1.9 8.7c-.1.6-.5.7-1 .4l-2.9-2.1-1.4 1.4c-.2.2-.3.3-.6.3l.2-2.9 5.2-4.7c.2-.2-.1-.3-.4-.1l-6.4 4-2.8-.9c-.6-.2-.6-.6.1-.9z" fill="#FFF"/></svg>`,
  website: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#8E8E93"/><path d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5zm-5 6.5c0-.6.1-1.2.3-1.7L10 13v1c0 1.1.9 2 2 2v1.9c-2.9-.5-5.1-2.9-5-5.9zm9.9 2.5c-.2-.8-1-1.4-1.9-1.4h-1v-3c0-.6-.4-1-1-1H9V9h2c.6 0 1-.4 1-1V7h2c1.1 0 2-.9 2-2v-.4c2.2.9 3.8 3.1 3.8 5.6 0 1.6-.6 3-1.6 4.1z" fill="#FFF"/></svg>`
};

// ─────────────────────────── Templates ───────────────────────────
const templates = {
  url:       [{ id: "url",      label: "Website URL",                placeholder: "https://example.com" }],
  text:      [{ id: "text",     label: "Text",                       textarea: true }],
  voting: [
    { id: "vid",    label: "Voter ID (optional)",  placeholder: "e.g. XYZ1234567" },
    { id: "vvname", label: "Name (optional)",       placeholder: "e.g. John Doe" },
    { id: "vcode",  label: "Code (optional)",       placeholder: "e.g. BOOTH-42" }
  ],
  phone:     [{ id: "name",     label: "Contact Name" },
              { id: "number",   label: "Phone Number" }],
  sms:       [{ id: "smsnum",   label: "Phone Number" },
              { id: "smsmsg",   label: "Message", textarea: true }],
  email:     [{ id: "emailto",  label: "Recipient Email" },
              { id: "emailsub", label: "Subject" },
              { id: "emailbody",label: "Body", textarea: true }],
  vcard:     [{ id: "vname",    label: "Full Name" },
              { id: "vphone",   label: "Phone" },
              { id: "vmail",    label: "Email" },
              { id: "vsite",    label: "Website (optional)" }],
  wifi:      [{ id: "ssid",     label: "Wi-Fi Name (SSID)" },
              { id: "wpass",    label: "Password" },
              { id: "wsec",     label: "Security (WEP/WPA/None)" }],
  whatsapp:  [{ id: "wphone",   label: "Phone (with country code)" },
              { id: "wmsg",     label: "Message", textarea: true }],
  upi:       [{ id: "uname",    label: "Name" },
              { id: "upiid",    label: "UPI ID (e.g. name@upi)" },
              { id: "uamt",     label: "Amount (optional)", placeholder: "e.g. 250.00" }],
  maps:      [{ id: "lat",      label: "Latitude  (e.g. 28.7041)" },
              { id: "lng",      label: "Longitude (e.g. 77.1025)" }],
  instagram: [{ id: "insta",    label: "Instagram Username (no @)" }],
  facebook:  [{ id: "fb",       label: "Facebook Page Username or URL" }],
  youtube:   [{ id: "yt",       label: "YouTube Channel / Video URL" }],
  twitter:   [{ id: "tw",       label: "Twitter/X Username (no @)" }],
  linkedin:  [{ id: "li",       label: "LinkedIn Profile or Company URL" }],
  telegram:  [{ id: "tg",       label: "Telegram Username or Group (no @)" }],
  snapchat:  [{ id: "snap",     label: "Snapchat Username" }],
  pinterest: [{ id: "pin",      label: "Pinterest Username or URL" }],
  pdf:       [{ id: "pdf",      label: "Direct PDF Link" }]
};

// ─────────────────────────── Load Fields ───────────────────────────
function loadFields() {
  const type = typeEl.value;
  fieldsBox.innerHTML = "";

  if (type === "voting") {
    const note = document.createElement("p");
    note.className = "voting-note";
    note.textContent = "Fill any combination — at least one field required. Fields are joined with | in the QR.";
    fieldsBox.appendChild(note);
  }

  (templates[type] || []).forEach((f) => {
    const lbl = document.createElement("label");
    lbl.textContent = f.label;
    fieldsBox.appendChild(lbl);
    const el = f.textarea ? document.createElement("textarea") : document.createElement("input");
    el.id = f.id;
    el.placeholder = f.placeholder || "";
    if (f.textarea) el.rows = 3;
    fieldsBox.appendChild(el);
  });
}
typeEl.addEventListener("change", loadFields);
loadFields();

// ─────────────────────────── Payload Builder ───────────────────────────
function buildPayload() {
  const t = typeEl.value;
  const g = (id) => document.getElementById(id)?.value.trim() || "";
  switch (t) {
    case "url":      return g("url");
    case "text":     return g("text");
    case "voting": {
      const parts = [g("vid"), g("vvname"), g("vcode")].filter(Boolean);
      return parts.length ? parts.join("|") : null;
    }
    case "phone":    return `tel:${g("number")}`;
    case "sms":      return `sms:${g("smsnum")}?body=${encodeURIComponent(g("smsmsg"))}`;
    case "email":    return `mailto:${g("emailto")}?subject=${encodeURIComponent(g("emailsub"))}&body=${encodeURIComponent(g("emailbody"))}`;
    case "vcard":    return `BEGIN:VCARD\nFN:${g("vname")}\nTEL:${g("vphone")}\nEMAIL:${g("vmail")}\nURL:${g("vsite")}\nEND:VCARD`;
    case "wifi":     return `WIFI:T:${g("wsec")||"WPA"};S:${g("ssid")};P:${g("wpass")};`;
    case "whatsapp": return `https://wa.me/${g("wphone")}?text=${encodeURIComponent(g("wmsg"))}`;
    case "upi": {
      const pa = g("upiid"), pn = encodeURIComponent(g("uname")), am = g("uamt");
      return am ? `upi://pay?pa=${pa}&pn=${pn}&am=${am}` : `upi://pay?pa=${pa}&pn=${pn}`;
    }
    case "maps":      return `https://www.google.com/maps?q=${g("lat")},${g("lng")}`;
    case "instagram": return `https://instagram.com/${g("insta")}`;
    case "facebook":  return g("fb").startsWith("http") ? g("fb") : `https://facebook.com/${g("fb")}`;
    case "youtube":   return g("yt");
    case "twitter":   return `https://twitter.com/${g("tw")}`;
    case "linkedin":  return g("li");
    case "telegram":  return `https://t.me/${g("tg")}`;
    case "snapchat":  return `https://snapchat.com/add/${g("snap")}`;
    case "pinterest": return g("pin").startsWith("http") ? g("pin") : `https://pinterest.com/${g("pin")}`;
    case "pdf":       return g("pdf");
    default:          return "";
  }
}

// ─────────────────────────── QR Styles ───────────────────────────
function getQRStyle(style) {
  switch (style) {
    case "rounded":   return { type:"rounded",       color:"#1e90ff" };
    case "dotted":    return { type:"dots",           color:"#0047ab" };
    case "line":      return { type:"classy",         color:"#28a745" };
    case "mixed":     return { type:"classy-rounded", gradient:{ type:"linear", colorStops:[{offset:0,color:"#ff9a9e"},{offset:1,color:"#fad0c4"}] } };
    case "cube":      return { type:"square",         gradient:{ type:"linear", colorStops:[{offset:0,color:"#3a7bd5"},{offset:1,color:"#3a6073"}] } };
    case "hexhoney":  return { type:"extra-rounded",  gradient:{ type:"linear", colorStops:[{offset:0,color:"#ffb347"},{offset:1,color:"#ffcc33"}] } };
    case "hex":       return { type:"extra-rounded",  color:"#ff6600" };
    case "gradient":  return {                         gradient:{ type:"radial",  colorStops:[{offset:0,color:"#ff0077"},{offset:1,color:"#00c6ff"}] } };
    case "fluid":     return { type:"dots",            gradient:{ type:"linear",  colorStops:[{offset:0,color:"#00ffa1"},{offset:1,color:"#0061ff"}] } };
    case "eye":       return { type:"square",          color:"#ff1493", eyeColor:"#000" };
    case "matrix":    return { type:"square",          color:"#00ff41", eyeColor:"#00ff41" };
    case "pixelated": return { type:"square",          gradient:{ type:"linear",  colorStops:[{offset:0,color:"#ff00ff"},{offset:1,color:"#00ffff"}] } };
    case "square":
    default:          return { type:"square",          color:"#000" };
  }
}

// Helper to draw text with emojis properly centered on canvas
function drawCenteredText(ctx, text, centerX, centerY, fontSize, fontColor) {
  const emojiFont = `800 ${fontSize}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif`;
  const textFont = `800 ${fontSize}px 'DM Sans', sans-serif`;

  ctx.fillStyle = fontColor;
  ctx.textBaseline = "middle";

  let segments = [text];
  let useSegmented = false;
  let emojiRegex = null;

  try {
    new RegExp('\\p{Extended_Pictographic}', 'u');
    emojiRegex = /\p{Extended_Pictographic}/u;
    segments = text.split(/(\p{Extended_Pictographic}+)/gu);
    useSegmented = true;
  } catch (e) {
    try {
      emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      segments = text.split(/([\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+)/gu);
      useSegmented = true;
    } catch (err) {
      useSegmented = false;
    }
  }

  if (!useSegmented || !emojiRegex) {
    ctx.font = textFont;
    ctx.textAlign = "center";
    ctx.fillText(text, centerX, centerY);
    return;
  }

  // Calculate total width of all segments using their respective fonts
  const segmentWidths = segments.map(seg => {
    if (!seg) return 0;
    ctx.textAlign = "left";
    const isEmoji = emojiRegex.test(seg);
    ctx.font = isEmoji ? emojiFont : textFont;
    return ctx.measureText(seg).width;
  });
  const totalWidth = segmentWidths.reduce((a, b) => a + b, 0);

  // Draw each segment using its respective font
  let currentX = centerX - totalWidth / 2;
  ctx.textAlign = "left";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    
    const isEmoji = emojiRegex.test(seg);
    ctx.font = isEmoji ? emojiFont : textFont;
    ctx.fillText(seg, currentX, centerY);
    currentX += segmentWidths[i];
  }
}

// ─────────────────────────── Frame Compositor ───────────────────────────
async function applyFrame(sourceDataUrl, outputSize) {
  const frameStyle  = document.getElementById("frame-style").value;
  const labelPos    = document.getElementById("label-pos").value;
  const topText     = document.getElementById("label-top").value.trim();
  const bottomText  = document.getElementById("label-bottom").value.trim();
  const frameColor  = document.getElementById("frame-color").value;
  const fontSize    = parseInt(document.getElementById("font-size").value) || 22;

  if (frameStyle === "none" && !topText && !bottomText) return sourceDataUrl;

  const padding   = 16;
  const gap       = 8;
  const labelH    = fontSize + gap;
  const hasTop    = topText    && (labelPos === "top"    || labelPos === "both");
  const hasBottom = bottomText && (labelPos === "bottom" || labelPos === "both");
  const extraTop  = hasTop    ? labelH : 0;
  const extraBot  = hasBottom ? labelH : 0;
  const totalW    = outputSize + padding * 2;
  const totalH    = outputSize + padding * 2 + extraTop + extraBot;

  const canvas  = document.getElementById("framed-canvas");
  canvas.width  = totalW;
  canvas.height = totalH;
  const ctx     = canvas.getContext("2d");
  ctx.clearRect(0, 0, totalW, totalH);

  switch (frameStyle) {
    case "rounded":
      roundRect(ctx, 0, 0, totalW, totalH, 24);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = frameColor; ctx.lineWidth = 5; ctx.stroke();
      break;
    case "shadow":
      ctx.shadowColor = frameColor + "66"; ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 8;
      roundRect(ctx, 4, 4, totalW-8, totalH-8, 20);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.shadowBlur = 0;
      break;
    case "badge":
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, totalW, totalH);
      ctx.strokeStyle = frameColor; ctx.lineWidth = 6; ctx.setLineDash([]);
      ctx.strokeRect(3, 3, totalW-6, totalH-6);
      ctx.strokeStyle = frameColor + "66"; ctx.lineWidth = 2;
      ctx.strokeRect(9, 9, totalW-18, totalH-18);
      break;
    case "ticket":
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, totalW, totalH);
      ctx.strokeStyle = frameColor; ctx.lineWidth = 3; ctx.setLineDash([10, 6]);
      roundRect(ctx, 4, 4, totalW-8, totalH-8, 12); ctx.stroke();
      ctx.setLineDash([]);
      break;
    case "ribbon":
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, totalW, totalH);
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, totalW, hasTop ? extraTop + padding/2 : 10);
      if (hasBottom) ctx.fillRect(0, totalH - extraBot - padding/2, totalW, extraBot + padding/2);
      break;
    default: // simple
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, totalW, totalH);
      ctx.strokeStyle = frameColor; ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, totalW-4, totalH-4);
  }

  const img = new Image();
  await new Promise((res) => { img.onload = res; img.src = sourceDataUrl; });
  ctx.drawImage(img, padding, padding + extraTop, outputSize, outputSize);

  const isRibbon = frameStyle === "ribbon";
  const fontColor = isRibbon ? "#fff" : frameColor;

  if (hasTop) {
    const qrTop = padding + extraTop;
    const centerY = qrTop - (gap / 2) - (fontSize / 2);
    drawCenteredText(ctx, topText, totalW / 2, centerY, fontSize, fontColor);
  }
  if (hasBottom) {
    const qrBottom = padding + extraTop + outputSize;
    const centerY = qrBottom + (gap / 2) + (fontSize / 2);
    drawCenteredText(ctx, bottomText, totalW / 2, centerY, fontSize, fontColor);
  }

  canvas.style.display = "block";
  return canvas.toDataURL("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,   y+h, x,   y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,   y,   x+r, y);
  ctx.closePath();
}

// ─────────────────────────── History ───────────────────────────
const STORAGE_KEY = "mdqr_history_v2";

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch { list = list.slice(0, list.length - 10); localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
}

function formatTime(ts) {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  return d.toLocaleDateString([], { month:"short", day:"numeric" });
}

function renderHistory() {
  const list = getHistory();
  historyCount.textContent = `${list.length} QR code${list.length !== 1 ? "s" : ""}`;
  historyBox.innerHTML = "";
  const visible = list.slice(0, visibleCount);
  visible.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "history-item";
    const img = document.createElement("img");
    img.src = item.img; img.alt = item.type;
    div.appendChild(img);
    const meta = document.createElement("div");
    meta.className = "hi-meta";
    meta.textContent = `${item.type} · ${formatTime(item.ts)}`;
    div.appendChild(meta);
    const del = document.createElement("button");
    del.className = "del-btn"; del.title = "Delete"; del.textContent = "✕";
    del.addEventListener("click", (e) => { e.stopPropagation(); deleteHistoryItem(idx); });
    div.appendChild(del);
    div.addEventListener("click", () => {
      typeEl.value = item.type; loadFields();
      (templates[item.type] || []).forEach((f) => {
        const el = document.getElementById(f.id);
        if (el) el.value = item.values?.[f.id] || "";
      });
      sizeEl.value = item.size || 800;
      qrStyleEl.value = item.style || "square";
      if (item.frame) {
        document.getElementById("frame-style").value  = item.frame.style    || "none";
        document.getElementById("label-pos").value    = item.frame.pos      || "bottom";
        document.getElementById("label-top").value    = item.frame.top      || "";
        document.getElementById("label-bottom").value = item.frame.bottom   || "";
        document.getElementById("frame-color").value  = item.frame.color    || "#7c3aed";
        document.getElementById("font-size").value    = item.frame.fontSize || 22;
        document.getElementById("font-size-val").textContent   = item.frame.fontSize || 22;
        document.getElementById("frame-color-val").textContent = item.frame.color    || "#7c3aed";
      }

      // Restore logo preset & settings
      if (item.logoSettings) {
        const preset = item.logoSettings.preset || "none";
        const sizeVal = item.logoSettings.size || 30;
        const marginVal = item.logoSettings.margin || 4;
        const shapeVal = item.logoSettings.shape || "circle";

        // Update preset buttons active state
        document.querySelectorAll(".logo-preset-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.preset === preset);
        });

        // Set inputs
        const sizeInput = document.getElementById("logo-size-input");
        const marginInput = document.getElementById("logo-margin-input");
        const shapeInput = document.getElementById("logo-shape");
        if (sizeInput) {
          sizeInput.value = sizeVal;
          document.getElementById("logo-size-val").textContent = sizeVal;
        }
        if (marginInput) {
          marginInput.value = marginVal;
          document.getElementById("logo-margin-val").textContent = marginVal;
        }
        if (shapeInput) {
          shapeInput.value = shapeVal;
          const shapeCdd = document.getElementById("cdd-logo-shape");
          if (shapeCdd) {
            const matched = shapeCdd.querySelector(`.cdd-item[data-value="${shapeVal}"]`);
            if (matched) {
              shapeCdd.querySelectorAll(".cdd-item").forEach(i => i.classList.remove("active"));
              matched.classList.add("active");
              shapeCdd.querySelector(".cdd-label").textContent = matched.textContent;
            }
          }
        }

        // Show/hide settings group
        const settingsGroup = document.getElementById("logo-settings-group");
        if (settingsGroup) {
          settingsGroup.style.display = preset === "none" ? "none" : "flex";
        }

        // Load correct logoImage
        if (preset === "none") {
          logoImage = null;
          logoEl.value = "";
          document.getElementById("logo-label").textContent = "Click to upload logo";
        } else {
          const svg = PRESET_LOGOS[preset];
          if (svg) {
            logoImage = new Image();
            logoImage.src = "data:image/svg+xml;base64," + btoa(svg);
          }
        }
      } else {
        // Fallback: reset logo states if history item has no logoSettings
        document.querySelectorAll(".logo-preset-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.preset === "none");
        });
        const settingsGroup = document.getElementById("logo-settings-group");
        if (settingsGroup) settingsGroup.style.display = "none";
        logoImage = null;
        logoEl.value = "";
        document.getElementById("logo-label").textContent = "Click to upload logo";
      }

      generateQR({ saveHistory: false });
      document.getElementById("qr-area").scrollIntoView({ behavior:"smooth", block:"center" });
    });
    historyBox.appendChild(div);
  });
  if (list.length > visibleCount) {
    viewMoreWrap.style.display = "block";
    viewMoreBtn.textContent = `↓ Show More (${list.length - visibleCount} remaining)`;
  } else {
    viewMoreWrap.style.display = "none";
  }
}

function addToHistory(img, type, size, style) {
  const values = {};
  (templates[type] || []).forEach((f) => { values[f.id] = document.getElementById(f.id)?.value.trim() || ""; });
  const frame = {
    style:    document.getElementById("frame-style").value,
    pos:      document.getElementById("label-pos").value,
    top:      document.getElementById("label-top").value.trim(),
    bottom:   document.getElementById("label-bottom").value.trim(),
    color:    document.getElementById("frame-color").value,
    fontSize: document.getElementById("font-size").value
  };

  // Save logo preset & settings
  let activePreset = "none";
  const activePresetBtn = document.querySelector(".logo-preset-btn.active");
  if (activePresetBtn) {
    activePreset = activePresetBtn.dataset.preset;
  }
  const logoSettings = {
    preset: activePreset,
    shape: document.getElementById("logo-shape")?.value || "circle",
    size: document.getElementById("logo-size-input")?.value || 30,
    margin: document.getElementById("logo-margin-input")?.value || 4
  };

  let list = getHistory();
  list.unshift({ img, type, size, style, values, frame, logoSettings, ts: Date.now() });
  saveHistory(list);
  visibleCount = PAGE_SIZE;
  renderHistory();
}

function deleteHistoryItem(idx) {
  const list = getHistory();
  list.splice(idx, 1);
  saveHistory(list);
  renderHistory();
}

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("Clear all QR history?")) return;
  localStorage.removeItem(STORAGE_KEY);
  visibleCount = PAGE_SIZE;
  renderHistory();
});
viewMoreBtn.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderHistory(); });
renderHistory();

function createLogoCanvas(srcUrl, shape, paddingPercentage) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, size, size);

      if (shape === "silhouette") {
        const outlineThickness = (paddingPercentage / 25) * 40; 
        const padding = outlineThickness + 10;
        const innerSize = size - 2 * padding;

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = size;
        maskCanvas.height = size;
        const mctx = maskCanvas.getContext("2d");

        mctx.drawImage(img, padding, padding, innerSize, innerSize);

        mctx.globalCompositeOperation = "source-in";
        mctx.fillStyle = "#ffffff";
        mctx.fillRect(0, 0, size, size);

        ctx.globalCompositeOperation = "source-over";
        if (outlineThickness > 0) {
          for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 8) {
            const dx = outlineThickness * Math.cos(theta);
            const dy = outlineThickness * Math.sin(theta);
            ctx.drawImage(maskCanvas, dx, dy);
          }
        }

        ctx.drawImage(img, padding, padding, innerSize, innerSize);
      } else {
        const padding = (paddingPercentage / 100) * (size / 2);
        const innerSize = size - 2 * padding;

        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        } else if (shape === "square") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(img, padding, padding, innerSize, innerSize);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      resolve(srcUrl);
    };
    img.src = srcUrl;
  });
}

// ─────────────────────────── Generate QR ───────────────────────────
async function generateQR(options = { saveHistory: true }) {
  const data = buildPayload();
  if (!data) { alert("Please enter at least one field!"); return; }
  currentPayload = data;

  const outputSize  = parseInt(sizeEl.value) || 800;
  const previewSize = Math.min(outputSize, 300);
  const style       = getQRStyle(qrStyleEl.value);

  const logoShape     = document.getElementById("logo-shape")?.value || "circle";
  const logoSizeVal   = (parseInt(document.getElementById("logo-size-input")?.value) || 30) / 100;
  const logoMarginVal = parseInt(document.getElementById("logo-margin-input")?.value) || 4;

  let finalLogoSrc = undefined;
  let hideDots = true;
  let logoMarginToUse = logoMarginVal;

  if (logoImage && logoImage.src) {
    if (logoShape === "none") {
      finalLogoSrc = logoImage.src;
      hideDots = true;
      logoMarginToUse = logoMarginVal;
    } else {
      finalLogoSrc = await createLogoCanvas(logoImage.src, logoShape, logoMarginVal);
      hideDots = false;
      logoMarginToUse = 0;
    }
  }

  const frameStyle    = document.getElementById("frame-style").value;
  const labelPos      = document.getElementById("label-pos").value;
  const topText       = document.getElementById("label-top").value.trim();
  const bottomText    = document.getElementById("label-bottom").value.trim();
  const hasTop        = topText    && (labelPos === "top"    || labelPos === "both");
  const hasBottom     = bottomText && (labelPos === "bottom" || labelPos === "both");
  const hasFrame      = frameStyle !== "none" || hasTop || hasBottom;
  const qrMarginVal   = hasFrame ? 5 : 25;

  const makeOptions = (sz) => ({
    width: sz,
    height: sz,
    data,

    image: finalLogoSrc,

    margin: qrMarginVal,

    qrOptions: {
      errorCorrectionLevel: "H"
    },

    dotsOptions: {
      type: style.type || "square",
      color: style.color || "#000",
      gradient: style.gradient || undefined
    },

    backgroundOptions: {
      color: "#fff"
    },

    cornersSquareOptions: {
      color: style.eyeColor || style.color || "#000"
    },

    imageOptions: {
      crossOrigin: "anonymous",
      margin: logoMarginToUse,
      imageSize: logoSizeVal,
      hideBackgroundDots: hideDots
    }
  });

  canvasContainer.innerHTML = "";
  framedCanvas.style.display = "none";
  if (qrPlaceholder) qrPlaceholder.style.display = "none";

  const previewQR = new QRCodeStyling(makeOptions(previewSize));
  previewQR.append(canvasContainer);

  const outputQR = new QRCodeStyling(makeOptions(outputSize));

  try {
    const blob    = await outputQR.getRawData("png");
    const dataUrl = await blobToDataUrl(blob);
    const finalDataUrl = await applyFrame(dataUrl, outputSize);

    if (finalDataUrl !== dataUrl) {
      canvasContainer.innerHTML = "";
      const previewFramed = await applyFrame(dataUrl, previewSize);
      const previewImg = new Image();
      previewImg.src = previewFramed;
      previewImg.style.cssText = "max-width:100%;border-radius:8px;display:block;";
      canvasContainer.appendChild(previewImg);
      framedCanvas.style.display = "none";
    }

    downloadLink.href    = finalDataUrl;
    whatsappShare.href   = `https://wa.me/?text=${encodeURIComponent("🔳 QR Code Data:\n" + data)}`;
    qrActions.style.display = "flex";

    if (options.saveHistory) addToHistory(finalDataUrl, typeEl.value, outputSize, qrStyleEl.value);
  } catch(err) {
    console.warn("QR error:", err);
  }
}

function blobToDataUrl(blob) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
}

// ─────────────────────────── Logo ───────────────────────────
const presetButtons = document.querySelectorAll(".logo-preset-btn");
presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    presetButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const preset = btn.dataset.preset;
    const settingsGroup = document.getElementById("logo-settings-group");

    if (preset === "none") {
      logoImage = null;
      logoEl.value = "";
      document.getElementById("logo-label").textContent = "Click to upload logo";
      if (settingsGroup) settingsGroup.style.display = "none";
    } else {
      // Clear file input
      logoEl.value = "";
      document.getElementById("logo-label").textContent = "Click to upload logo";

      const svg = PRESET_LOGOS[preset];
      if (svg) {
        logoImage = new Image();
        logoImage.src = "data:image/svg+xml;base64," + btoa(svg);
        if (settingsGroup) settingsGroup.style.display = "flex";
      }
    }
  });
});

logoEl.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoImage = new Image();
    logoImage.src = ev.target.result;

    // Deactivate presets and set active to 'none' if empty, or just clear active states
    presetButtons.forEach(b => b.classList.remove("active"));

    const settingsGroup = document.getElementById("logo-settings-group");
    if (settingsGroup) settingsGroup.style.display = "flex";
  };
  reader.readAsDataURL(file);
});

// ─────────────────────────── Buttons ───────────────────────────
copyBtn.addEventListener("click", () => {
  if (!currentPayload) { alert("Generate a QR first."); return; }
  navigator.clipboard.writeText(currentPayload).then(() => {
    copyStatus.style.display = "block";
    setTimeout(() => (copyStatus.style.display = "none"), 1800);
  }).catch(() => alert("Copy failed."));
});

generateBtn.addEventListener("click", () => generateQR({ saveHistory: true }));

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all fields?")) return;
  document.querySelectorAll("#dynamic-fields input, #dynamic-fields textarea").forEach((i) => (i.value = ""));
  canvasContainer.innerHTML = "";
  framedCanvas.style.display = "none";
  if (qrPlaceholder) qrPlaceholder.style.display = "flex";
  qrActions.style.display = "none";
  downloadLink.href = "#";
  logoImage = null; logoEl.value = "";
  document.getElementById("logo-label").textContent = "Click to upload logo";

  // Clear presets
  presetButtons.forEach(b => b.classList.toggle("active", b.dataset.preset === "none"));
  const settingsGroup = document.getElementById("logo-settings-group");
  if (settingsGroup) settingsGroup.style.display = "none";

  // Reset sliders
  const sizeInput = document.getElementById("logo-size-input");
  const marginInput = document.getElementById("logo-margin-input");
  if (sizeInput) {
    sizeInput.value = 30;
    document.getElementById("logo-size-val").textContent = 30;
  }
  if (marginInput) {
    marginInput.value = 4;
    document.getElementById("logo-margin-val").textContent = 4;
  }

  // Reset shape
  const shapeInput = document.getElementById("logo-shape");
  if (shapeInput) {
    shapeInput.value = "silhouette";
    const shapeCdd = document.getElementById("cdd-logo-shape");
    if (shapeCdd) {
      shapeCdd.querySelectorAll(".cdd-item").forEach(i => {
        i.classList.toggle("active", i.dataset.value === "silhouette");
      });
      const activeItem = shapeCdd.querySelector(".cdd-item.active");
      if (activeItem) {
        shapeCdd.querySelector(".cdd-label").textContent = activeItem.textContent;
      }
    }
  }

  currentPayload = "";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/QR-code-generator/sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((err) => console.error("SW Error:", err));
  });
}
