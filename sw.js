// MD-QR Studio — Service Worker v2
const CACHE = "mdqr-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/qrstyle.css",
  "/script.js",
  "/manifest.json",
  "/icon.png",
  "https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0/lib/qr-code-styling.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/index.html")));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request));
    })
  );
});