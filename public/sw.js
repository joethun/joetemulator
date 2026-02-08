/// <reference lib="webworker" />

const CACHE_NAME = 'joetemulator-v1';
const PRECACHE_ASSETS = ['/', '/manifest.json'];

// install
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)));
    self.skipWaiting();
});

// activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
    );
    self.clients.claim();
});

// fetch
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin !== location.origin) return;

    // navigation: network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    // other: cache first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((res) => {
                if (res.ok && (request.url.includes('/_next/static/') || request.url.includes('/icons/'))) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return res;
            });
        })
    );
});
