let CACHE_STATIC_NAME = 'static-v13';
let CACHE_DYNAMIC_NAME = 'dynamic-v2'
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    'src/js/app.js',
    'src/js/feed.js',
    'src/js/material.min.js',
    'src/css/app.css',
    'src/css/feed.css',
    'src/images/main-image.jpg',
    "https://fonts.googleapis.com/css?family=Roboto:400,700",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
]

//lifecycle events
self.addEventListener('install', (event) => {
    console.log('[Service Worker]: Installing Service Worker ..', event);

    event.waitUntil(caches.open(CACHE_STATIC_NAME).then((cache) => {
        console.log('[Service Worker]: Precaching app shell!', cache);
        cache.addAll(STATIC_FILES);
    }));
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker]: Activating Service Worker ...', event);
    //wykonanie czyszczenia caches
    //caches.keys() - zwraca wszystkie klucze cache jaki istnieją
    event.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                console.log('[Service Worker]: Removing old cache!', key);
                return caches.delete(key); //usunięcie starego cache'a
            }
        }))
    }));

    return self.clients.claim();
});

//cache then network
// self.addEventListener('fetch', (event) => {
//     //zapisanie do cache'a dynamicznie danych które zostały pobrane z sieci
//     event.respondWith(caches.match(event.request).then((respone) => {
//         if (respone) {
//             return respone;
//         } else {
//             return fetch(event.request)
//                 .then((respone) => {
//                     return caches.open(CACHE_DYNAMIC_NAME)
//                         .then((cache) => {
//                             cache.put(event.request.url, respone.clone());
//                             return respone;
//                         });
//                 }).catch((err) => {
//                     return caches.open(CACHE_STATIC_NAME)
//                         .then((cache) => {
//                             return cache.match('/offline.html');
//                         });
//                 });
//         }
//     }));
// });

self.addEventListener('fetch', (event) => {
    const url = 'https://httpbin.org/get';

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then((cache) => {
                    return fetch(event.request)
                        .then((res) => {
                            cache.put(event.request, res.clone());

                            return res;
                        })
                })
        )
    } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {
        event.respondWith(
            caches.match(event.request));
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((respone) => {
                    if (respone) {
                        return respone;
                    } else {
                        return fetch(event.request)
                            .then((respone) => {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then((cache) => {
                                        cache.put(event.request.url, respone.clone());
                                        return respone;
                                    });
                            }).catch((err) => {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then((cache) => {
                                        if (event.request.url.indexOf('/help')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                }));
    }
});

// //network first then cache fallback
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         fetch(event.request)
//             .catch((err) => caches.match(event.request)));
// });



