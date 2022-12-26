//lifecycle events
self.addEventListener('install', (event) => {
    console.log('[Service Worker]: Installing Service Worker ..', event);
    event.waitUntil(caches.open('static').then((cache) => {
        console.log('[Service Worker]: Precaching app shell!', cache);
        cache.add('/src/js/app.js');
    }));
});
self.addEventListener('activate', (event) => {
    console.log('[Service Worker]: Activating Service Worker ...', event);

    return self.clients.claim();
});

//non-lifecycle events
self.addEventListener('fetch', (event) => {
    // event.respondWith(null); //zwróci null więc strona padnie ;)
    event.respondWith(fetch(event.request)); //zwróci niezmienione dane na tą chwilę, oczekuje promise
});



