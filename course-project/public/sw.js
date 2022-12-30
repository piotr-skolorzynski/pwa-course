importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

let CACHE_STATIC_NAME = 'static-v23';
let CACHE_DYNAMIC_NAME = 'dynamic-v2'
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    'src/js/app.js',
    'src/js/feed.js',
    'src/js/idb.js',
    'src/js/utility.js',
    'src/js/material.min.js',
    'src/css/app.css',
    'src/css/feed.css',
    'src/images/main-image.jpg',
    "https://fonts.googleapis.com/css?family=Roboto:400,700",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
]

// //function to trim the cache what means some data ca be missing
// const trimCache = (cacheName, maxItems) => {
//     caches.open(cacheName)
//         .then((cache) => {
//             return cache.keys()
//                 .then((keys) => {
//                     if (keys.length > maxItems) {
//                         cache.delete(keys[0])
//                             .then(trimCache(cacheName, maxItems));
//                     }
//                 });
//         });

// }

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

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', (event) => {
    const url = 'https://pwa-course-96187-default-rtdb.europe-west1.firebasedatabase.app/posts';

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    //we also want to store response in indexedDB instead using cache as prevoiusly
                    //Remember response can be used once that is why we use clone method
                    const clonedResponse = res.clone();
                    clearAllData('posts').then(() => { //before putting data to indexedDB we delete all data that already exists to provide consistency
                        return clonedResponse.json();
                    }).then((data) => {
                        for (let key in data) {
                            writeData('posts', data[key]);
                        };
                    });

                    return res;
                })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
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
                                        // trimCache(CACHE_DYNAMIC_NAME, 6);
                                        cache.put(event.request.url, respone.clone());

                                        return respone;
                                    });
                            }).catch((err) => {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then((cache) => {
                                        if (event.request.uheaders.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                }));
    }
});

self.addEventListener('sync', (event) => {
    console.log('[Service Worker]: ', event);

    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker]: Syncing new Posts!');

        event.waitUntil(
            readAllData('sync-posts')
                .then((data) => {
                    data.forEach((item) => {
                        fetch('https://pwa-course-96187-default-rtdb.europe-west1.firebasedatabase.app/posts.json', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'Application/json'
                            },
                            body: JSON.stringify({
                                id: item.id,
                                title: item.title,
                                location: item.location,
                                image: 'https://firebasestorage.googleapis.com/v0/b/pwa-course-96187.appspot.com/o/sf-boat.jpg?alt=media&token=77736d0f-b1f5-42e5-a1b8-6382e4d66588'
                            })
                        })
                            .then((res) => {
                                console.log('Sent data: ', res);

                                if (res.ok) {
                                    deleteItemFromData('sync-post', item.id);
                                }
                            })
                            .catch((err) => {
                                console.log('Error while sending data!', err);
                            })
                    })
                })
        );
    };
});
