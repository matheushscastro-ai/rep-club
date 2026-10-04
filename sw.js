const CACHE_NAME = "rep-club-pwa-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./solo.html",
  "./solo.css",
  "./solo-app.js",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/dbz/goku_ssj.png",
  "./assets/dbz/cell_perfect.png",
  "./assets/dbz/goku_blast.png",
  "./assets/dbz/cell_blast.png",
  "./assets/dbz/clash_epicenter.png",
  "./assets/dbz/clash_epicenter_b.png",
  "./assets/dbz/goku_beam.png",
  "./assets/dbz/cell_beam.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn("Cache addAll error:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network first / bypass para APIs em tempo real (Firebase / Supabase)
  if (event.request.url.includes("firebaseio.com") || event.request.url.includes("googleapis.com") || event.request.url.includes("supabase.co") || event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
