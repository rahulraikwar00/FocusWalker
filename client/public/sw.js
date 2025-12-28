const CACHE_NAME = "focus-walker-v2";
const TILE_CACHE = "map-tiles";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Map Tiles: Cache-First (Save data and work offline)
  if (url.hostname.includes("basemaps.cartocdn.com")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // If tile is in cache, return it IMMEDIATELY
        if (cached) return cached;

        // If not, get it from network and save it
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open("map-tiles").then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // 2. Vite Assets (JS/CSS with hashes): Network-First, then Cache
  // This ensures that when you update your app, users get the NEW version
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
