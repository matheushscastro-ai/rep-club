const CACHE_NAME = "rep-club-pwa-v5";
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn("Cache addAll error:", err));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removendo cache antigo do PWA:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// NETWORK-FIRST: sempre busca versão online atualizada no GitHub Pages.
// Só usa cache local se o usuário estiver completamente sem internet (offline).
self.addEventListener("fetch", (event) => {
  if (
    event.request.url.includes("firebaseio.com") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("supabase.co") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
