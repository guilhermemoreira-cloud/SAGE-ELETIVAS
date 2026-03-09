// sw.js - Service Worker para PWA

const CACHE_NAME = "sage-2026-v1";
const urlsToCache = [
  "/sage-2026/",
  "/sage-2026/index.html",
  "/sage-2026/selecionar-professor.html",
  "/sage-2026/selecionar-gestor.html",
  "/sage-2026/professor.html",
  "/sage-2026/gestor.html",
  "/sage-2026/404.html",
  "/sage-2026/manifest.json",
  "/sage-2026/css/style.css",
  "/sage-2026/js/utils.js",
  "/sage-2026/js/storage.js",
  "/sage-2026/js/init-data.js",
  "/sage-2026/js/sincronizacao.js",
  "/sage-2026/js/professor.js",
  "/sage-2026/js/gestor.js",
  "/sage-2026/js/config.js",
  "/sage-2026/data/dados-planilha.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Cache aberto");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
