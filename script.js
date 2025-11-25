// Element refs
const typeEl = document.getElementById("type");
const fieldsBox = document.getElementById("dynamic-fields");
const sizeEl = document.getElementById("size");
const logoEl = document.getElementById("logo");
const generateBtn = document.getElementById("generate");
const clearBtn = document.getElementById("clear");
const downloadLink = document.getElementById("download-link");
const whatsappShare = document.getElementById("whatsapp-share");
const copyBtn = document.getElementById("copy-link");
const copyStatus = document.getElementById("copy-status");
const historyBox = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clear-history");
const qrStyleEl = document.getElementById("qr-style");
const canvasContainer = document.getElementById("qr-canvas");

let qrCode = null;
let logoImage = null;

// ---------------------- Templates ----------------------
const templates = {
  url: [{ id: "url", label: "Website URL", placeholder: "https://example.com" }],
  text: [{ id: "text", label: "Text", textarea: true }],
  phone: [
    { id: "name", label: "Contact Name" },
    { id: "number", label: "Phone Number" }
  ],
  sms: [
    { id: "smsnum", label: "Phone Number" },
    { id: "smsmsg", label: "Message", textarea: true }
  ],
  email: [
    { id: "emailto", label: "Recipient Email" },
    { id: "emailsub", label: "Subject" },
    { id: "emailbody", label: "Body", textarea: true }
  ],
  vcard: [
    { id: "vname", label: "Full Name" },
    { id: "vphone", label: "Phone" },
    { id: "vmail", label: "Email" },
    { id: "vsite", label: "Website (optional)" }
  ],
  wifi: [
    { id: "ssid", label: "Wi-Fi Name (SSID)" },
    { id: "wpass", label: "Password" },
    { id: "wsec", label: "Security (WEP/WPA/None)" }
  ],
  whatsapp: [
    { id: "wphone", label: "Phone Number (with country code)" },
    { id: "wmsg", label: "Message", textarea: true }
  ],

  /* NEW templates */
  upi: [
    { id: "uname", label: "Name" },
    { id: "upiid", label: "UPI ID (example@upi)" },
    { id: "uamt", label: "Amount (optional)", placeholder: "e.g. 250.00" }
  ],

  maps: [
    { id: "lat", label: "Latitude (e.g. 28.7041)" },
    { id: "lng", label: "Longitude (e.g. 77.1025)" }
  ],

  instagram: [{ id: "insta", label: "Instagram Username (no @)" }],

  facebook: [{ id: "fb", label: "Facebook Page Username or URL" }],

  youtube: [{ id: "yt", label: "YouTube Channel / Video URL" }],

  twitter: [{ id: "tw", label: "Twitter/X Username (no @)" }],

  linkedin: [{ id: "li", label: "LinkedIn Profile or Company URL" }],

  telegram: [{ id: "tg", label: "Telegram Username or Group (no @)" }],

  snapchat: [{ id: "snap", label: "Snapchat Username" }],

  pinterest: [{ id: "pin", label: "Pinterest Username or URL" }],

  pdf: [{ id: "pdf", label: "Direct PDF Link" }]
};

// ---------------------- Load Input Fields ----------------------
function loadFields() {
  const type = typeEl.value;
  fieldsBox.innerHTML = "";
  (templates[type] || []).forEach((f) => {
    const label = document.createElement("label");
    label.textContent = f.label;
    fieldsBox.appendChild(label);

    const input = f.textarea ? document.createElement("textarea") : document.createElement("input");
    input.id = f.id;
    input.placeholder = f.placeholder || "";
    fieldsBox.appendChild(input);
  });
}
typeEl.addEventListener("change", loadFields);
loadFields();

// ---------------------- Payload Builder ----------------------
function buildPayload() {
  const t = typeEl.value;
  const g = (id) => document.getElementById(id)?.value.trim();
  switch (t) {
    case "url": return g("url");
    case "text": return g("text");
    case "phone": return `tel:${g("number")}`;
    case "sms": return `sms:${g("smsnum")}?body=${encodeURIComponent(g("smsmsg") || "")}`;
    case "email": return `mailto:${g("emailto")}?subject=${encodeURIComponent(g("emailsub") || "")}&body=${encodeURIComponent(g("emailbody") || "")}`;
    case "vcard":
      return `BEGIN:VCARD\nFN:${g("vname") || ""}\nTEL:${g("vphone") || ""}\nEMAIL:${g("vmail") || ""}\nURL:${g("vsite") || ""}\nEND:VCARD`;
    case "wifi": return `WIFI:T:${g("wsec") || "WPA"};S:${g("ssid") || ""};P:${g("wpass") || ""};`;
    case "whatsapp": return `https://wa.me/${g("wphone") || ""}?text=${encodeURIComponent(g("wmsg") || "")}`;

    /* NEW payloads */
    case "upi": {
      const pa = g("upiid") || "";
      const pn = encodeURIComponent(g("uname") || "");
      const am = g("uamt") || "";
      // standard UPI deep-link form (apps accept this)
      return am ? `upi://pay?pa=${pa}&pn=${pn}&am=${am}` : `upi://pay?pa=${pa}&pn=${pn}`;
    }

    case "maps": {
      const lat = g("lat") || "";
      const lng = g("lng") || "";
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }

    case "instagram": return `https://instagram.com/${g("insta") || ""}`;
    case "facebook": return g("fb")?.startsWith("http") ? g("fb") : `https://facebook.com/${g("fb") || ""}`;
    case "youtube": return g("yt");
    case "twitter": return `https://twitter.com/${g("tw") || ""}`;
    case "linkedin": return g("li");
    case "telegram": return `https://t.me/${g("tg") || ""}`;
    case "snapchat": return `https://snapchat.com/add/${g("snap") || ""}`;
    case "pinterest": return g("pin")?.startsWith("http") ? g("pin") : `https://pinterest.com/${g("pin") || ""}`;
    case "pdf": return g("pdf");
    default: return "";
  }
}

// ---------------------- QR Style Options (10 styles) ----------------------
function getQRStyle(style) {
  switch (style) {
    case "rounded":
      return { type: "rounded", color: "#1e90ff" };
    case "dotted":
      return { type: "dots", color: "#0047ab" };
    case "line":
      return { type: "classy", color: "#28a745" };
case "mixed": return { type: "classy-rounded", gradient: { type: "linear", colorStops: [{ offset: 0, color: "#ff9a9e" }, { offset: 1, color: "#fad0c4" }] } };    
    case "cube":
      return {
        type: "square",
        gradient: {
          type: "linear",
          colorStops: [
            { offset: 0, color: "#3a7bd5" }, // bright blue
            { offset: 1, color: "#3a6073" }  // deep purple/steel
          ]}};
case "hex":
      return {
        type: "extra-rounded",
        gradient: {
          type: "linear",
          colorStops: [
            { offset: 0, color: "#ffb347" }, // soft orange
            { offset: 1, color: "#ffcc33" }  // golden yellow
          ]
        }
      };
    case "gradient":
      return { gradient: { type: "radial", colorStops: [{ offset: 0, color: "#ff0077" }, { offset: 1, color: "#00c6ff" }] } };
    case "fluid":
      return { type: "dots", gradient: { type: "linear", colorStops: [{ offset: 0, color: "#00ffa1" }, { offset: 1, color: "#0061ff" }] } };
    case "eye":
      return { type: "square", color: "#ff1493", eyeColor: "#000" };
    case "matrix":
      return { type: "square", color: "#0f0", gradient: null, eyeColor: "#0f0" }; // green matrix-ish
case "pixelated":
      return {
        type: "square",
        gradient: {
          type: "linear",
          colorStops: [
            { offset: 0, color: "#ff00ff" }, // neon magenta
            { offset: 1, color: "#00ffff" }  // neon cyan
          ]
        }
      };
    case "square":
    default:
      return { type: "square", color: "#000" };
  }
}

// ---------------------- History System ----------------------
function loadHistory() {
  const items = JSON.parse(localStorage.getItem("qr_history") || "[]");
  historyBox.innerHTML = "";
  items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "history-item";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = "qr";
    div.appendChild(img);

    const del = document.createElement("div");
            del.title = "Delete";
    del.addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteHistoryItem(idx);
    });
    div.appendChild(del);

    div.addEventListener("click", () => {
      typeEl.value = item.type;
      loadFields();
      (templates[item.type] || []).forEach((f) => {
        const el = document.getElementById(f.id);
        if (el) el.value = item.values[f.id] || "";
      });
      sizeEl.value = item.size || 300;
      qrStyleEl.value = item.style || "square";
      generateQR({ saveHistory: false });
      // scroll to QR canvas on mobile
      document.getElementById("qr-canvas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    historyBox.appendChild(div);
  });
}

function addToHistory(img, type, size, style) {
  const values = {};
  (templates[type] || []).forEach((f) => {
    values[f.id] = document.getElementById(f.id)?.value.trim() || "";
  });
  let list = JSON.parse(localStorage.getItem("qr_history") || "[]");
  list.unshift({ img, type, size, style, values });
  list = list.slice(0, 20);
  localStorage.setItem("qr_history", JSON.stringify(list));
  loadHistory();
}

function deleteHistoryItem(index) {
  let list = JSON.parse(localStorage.getItem("qr_history") || "[]");
  if (index < 0 || index >= list.length) return;
  list.splice(index, 1);
  localStorage.setItem("qr_history", JSON.stringify(list));
  loadHistory();
}

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("Clear entire QR history?")) return;
  localStorage.removeItem("qr_history");
  loadHistory();
});
loadHistory();

// ---------------------- Generate QR ----------------------
async function generateQR(options = { saveHistory: true }) {
  const data = buildPayload();
  if (!data) return alert("Enter valid data!");

  const outputSize = parseInt(sizeEl.value) || 300;   // user selected size
  const previewSize = 320;                            // fixed preview size
  const style = getQRStyle(qrStyleEl.value);

  // ------------------ 1. PREVIEW QR (fixed 300px) ------------------
  const previewOptions = {
    width: previewSize,
    height: previewSize,
    data: data,
    image: logoImage ? logoImage.src : undefined,
    dotsOptions: {
      type: style.type || "square",
      color: style.color || "#000",
      gradient: style.gradient || undefined
    },
    backgroundOptions: { color: "#fff" },
    cornersSquareOptions: { color: style.eyeColor || style.color || "#000" },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 3,
      imageSize: 0.5
    }
  };

  // Show preview in dotted box
  canvasContainer.innerHTML = "";
  const previewQR = new QRCodeStyling(previewOptions);
  previewQR.append(canvasContainer);

  // ------------------ 2. OUTPUT QR (for download/share) ------------------
  const outputOptions = {
    width: outputSize,
    height: outputSize,
    data: data,
    image: logoImage ? logoImage.src : undefined,
    dotsOptions: {
      type: style.type || "square",
      color: style.color || "#000",
      gradient: style.gradient || undefined
    },
    backgroundOptions: { color: "#fff" },
    cornersSquareOptions: { color: style.eyeColor || style.color || "#000" },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 3,
      imageSize: 0.5
    }
  };

  const outputQR = new QRCodeStyling(outputOptions);

  // Convert to PNG for download/share/history
  try {
    const blob = await outputQR.getRawData("png");
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    downloadLink.href = dataUrl;
    whatsappShare.href = `https://wa.me/?text=Scan%20this%20QR:%20${encodeURIComponent(dataUrl)}`;

    if (options.saveHistory)
      addToHistory(dataUrl, typeEl.value, outputSize, qrStyleEl.value);

  }  catch (err) {
  console.warn("Preview failed:", err);
}
}

// ---------------------- Logo Upload ----------------------
logoEl.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoImage = new Image();
    logoImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ---------------------- Buttons ----------------------
copyBtn.addEventListener("click", () => {
  const imgURL = downloadLink.href;
  if (!imgURL) return alert("Generate a QR first.");
  navigator.clipboard.writeText(imgURL).then(() => {
    copyStatus.style.display = "inline";
    setTimeout(() => (copyStatus.style.display = "none"), 1500);
  }).catch(() => alert("Copy failed. Try manually."));
});

generateBtn.addEventListener("click", () => generateQR({ saveHistory: true }));

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all form fields?")) return;

  document.querySelectorAll("input, textarea").forEach((i) => (i.value = ""));
  canvasContainer.innerHTML = "";

  // FIX: clear the logo
  logoImage = null;
  logoEl.value = "";
});


