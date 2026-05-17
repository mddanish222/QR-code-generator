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

// ─────────────────────────── Frame Compositor ───────────────────────────
async function applyFrame(sourceDataUrl, outputSize) {
  const frameStyle  = document.getElementById("frame-style").value;
  const labelPos    = document.getElementById("label-pos").value;
  const topText     = document.getElementById("label-top").value.trim();
  const bottomText  = document.getElementById("label-bottom").value.trim();
  const frameColor  = document.getElementById("frame-color").value;
  const fontSize    = parseInt(document.getElementById("font-size").value) || 22;

  if (frameStyle === "none" && !topText && !bottomText) return sourceDataUrl;

  const padding   = 24;
  const labelH    = fontSize + 20;
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

  ctx.font = `700 ${fontSize}px 'DM Sans', sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const isRibbon = frameStyle === "ribbon";
  ctx.fillStyle = isRibbon ? "#fff" : frameColor;
  if (hasTop)    ctx.fillText(topText,    totalW/2, extraTop/2 + (isRibbon ? 0 : padding/2));
  if (hasBottom) ctx.fillText(bottomText, totalW/2, totalH - extraBot/2 - (isRibbon ? 0 : padding/2));

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
  let list = getHistory();
  list.unshift({ img, type, size, style, values, frame, ts: Date.now() });
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

// ─────────────────────────── Generate QR ───────────────────────────
async function generateQR(options = { saveHistory: true }) {
  const data = buildPayload();
  if (!data) { alert("Please enter at least one field!"); return; }
  currentPayload = data;

  const outputSize  = parseInt(sizeEl.value) || 800;
  const previewSize = Math.min(outputSize, 300);
  const style       = getQRStyle(qrStyleEl.value);

  const makeOptions = (sz) => ({
    width: sz, height: sz, data,
    image: logoImage ? logoImage.src : undefined,
    dotsOptions:          { type: style.type || "square", color: style.color || "#000", gradient: style.gradient || undefined },
    backgroundOptions:    { color: "#fff" },
    cornersSquareOptions: { color: style.eyeColor || style.color || "#000" },
    imageOptions:         { crossOrigin:"anonymous", margin:6, imageSize:0.5 }
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
logoEl.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { logoImage = new Image(); logoImage.src = ev.target.result; };
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
  currentPayload = "";
});
