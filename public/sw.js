/// <reference lib="webworker" />

const CACHE_NAME = 'joetemulator-v2';
const COVERS_CACHE = 'joetemulator-covers-v1';
const PRECACHE_ASSETS = ['/', '/manifest.json'];
const COVER_HOSTS = new Set(['thumbnails.libretro.com']);

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter((n) => n !== CACHE_NAME && n !== COVERS_CACHE).map((n) => caches.delete(n))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // why: next/image proxies remote covers through /_next/image?url=…, so most cover traffic
    // is same-origin. The libretro-direct branch below stays for any non-optimized usage.
    const isOptimizedCover =
        url.origin === location.origin &&
        url.pathname === '/_next/image' &&
        [...COVER_HOSTS].some((h) => (url.searchParams.get('url') || '').includes(h));

    if ((COVER_HOSTS.has(url.hostname) || isOptimizedCover) && request.method === 'GET') {
        event.respondWith(
            caches.open(COVERS_CACHE).then((cache) =>
                cache.match(request).then((cached) => {
                    if (cached) return cached;
                    const fetchOpts = isOptimizedCover ? undefined : { mode: 'no-cors' };
                    return fetch(request, fetchOpts).then((res) => {
                        // why: opaque responses (no-cors) report status 0 but are valid to cache and serve as <img> sources.
                        if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
                        return res;
                    });
                })
            )
        );
        return;
    }

    if (url.origin !== location.origin) return;

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
