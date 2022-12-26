//lifecycle events
self.addEventListener('install', (event) => {
    console.log('[Service Worker]: Installing Service Worker ..', event);
    event.waitUntil(caches.open('static').then((cache) => {
        console.log('[Service Worker]: Precaching app shell!', cache);
        cache.addAll([
            '/',
            '/index.html',
            'src/js/app.js',
            'src/js/feed.js',
            'src/js/material.min.js',
            'src/css/app.css',
            'src/css/feed.css',
            'src/images/main-image.jpg',
            "https://fonts.googleapis.com/css?family=Roboto:400,700",
            "https://fonts.googleapis.com/icon?family=Material+Icons",
            "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
        ]);
    }));
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker]: Activating Service Worker ...', event);

    return self.clients.claim();
});

//non-lifecycle events
self.addEventListener('fetch', (event) => {
    //event.request - nazwa klucza dla cache, dla fetch jest to adres
    //sprawdzamy czy mamy w cache'u pliki, jeśli tak to je zasysamy jak nie to wykonujemy fetch
    //później będzie inny przykład, jeśli nie ma połączenia i nie jesteśmy w stanie pobrać danych to skorzystaj z tych, które są w cache'u.
    event.respondWith(caches.match(event.request).then((respone) => {
        if (respone) {
            return respone;
        } else {
            return fetch(event.request);
        }
    }));
});



