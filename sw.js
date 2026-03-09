const CACHE_NAME = "SAGE-ELETIVAS-v1";
const urlsToCache = [
  "/SAGE-ELETIVAS/",
  "/SAGE-ELETIVAS/index.html",
  "/SAGE-ELETIVAS/selecionar-professor.html",
  "/SAGE-ELETIVAS/selecionar-gestor.html",
  "/SAGE-ELETIVAS/professor.html",
  "/SAGE-ELETIVAS/gestor.html",
  "/SAGE-ELETIVAS/404.html",
  "/SAGE-ELETIVAS/manifest.json",
  "/SAGE-ELETIVAS/css/style.css",
  "/SAGE-ELETIVAS/js/utils.js",
  "/SAGE-ELETIVAS/js/storage.js",
  "/SAGE-ELETIVAS/js/init-data.js",
  "/SAGE-ELETIVAS/js/sincronizacao.js",
  "/SAGE-ELETIVAS/js/professor.js",
  "/SAGE-ELETIVAS/js/gestor.js",
  "/SAGE-ELETIVAS/js/config.js",
  "/SAGE-ELETIVAS/js/firebase-config.js",
  "/SAGE-ELETIVAS/js/firebase-service.js",
  "/SAGE-ELETIVAS/data/dados-planilha.json",
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
