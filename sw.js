// Mealody Demo Service Worker — Offline-Cache der App-Shell
const CACHE = "mealody-demo-v2";
const ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "impressum.html",
  "datenschutz.html",
  "agb.html",
  "widerruf.html",
  "HANDBUCH.html",
  "fonts/inter.css",
  "fonts/inter-latin.woff2",
  "fonts/inter-latin-ext.woff2",
  "fonts/playfair.css",
  "fonts/playfair-latin.woff2",
  "fonts/playfair-latin-ext.woff2",
  "fonts/fontawesome.min.css",
  "webfonts/fa-solid-900.woff2",
  "webfonts/fa-regular-400.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Eigene Dateien: erst Cache, dann Netz (stale-while-revalidate light)
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
