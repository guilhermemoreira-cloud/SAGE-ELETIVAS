const CACHE_NAME = "SAGE-ELETIVAS-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./selecionar-professor.html",
  "./selecionar-gestor.html",
  "./professor.html",
  "./gestor.html",
  "./404.html",
  "./manifest.json",
  "./css/style.css",
  "./js/utils.js",
  "./js/storage.js",
  "./js/init-data.js",
  "./js/sincronizacao.js",
  "./js/professor.js",
  "./js/gestor.js",
  "./js/config.js",
  "./js/firebase-config.js",
  "./js/firebase-service.js",
  "./data/dados-planilha.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
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
