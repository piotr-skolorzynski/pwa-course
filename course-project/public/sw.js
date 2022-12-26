let CACHE_STATIC_NAME = 'static-v4';
let CACHE_DYNAMIC_NAME = 'dynamic-v2'

//lifecycle events
self.addEventListener('install', (event) => {
    console.log('[Service Worker]: Installing Service Worker ..', event);

    event.waitUntil(caches.open(CACHE_STATIC_NAME).then((cache) => {
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

//non-lifecycle events
self.addEventListener('fetch', (event) => {
    //zapisanie do cache'a dynamicznie danych które zostały pobrane z sieci
    event.respondWith(caches.match(event.request).then((respone) => {
        if (respone) {
            return respone;
        } else {
            return fetch(event.request)
                .then((respone) => {
                    return caches.open(CACHE_DYNAMIC_NAME)
                        .then((cache) => {
                            cache.put(event.request.url, respone.clone()); //put nie w przeciwnieństwie do add nie wysyła requesta i automatycznie zachowuje parę klucz-wartość 
                            //resposne jest konsumowana jednorazowo i dalej jest pust więc dlatego musi być użyta metoda .clone() żeby zapisać do cache i jeszce móć zwrócić response.
                            return respone;
                        });
                });
        }
    }));
});



