// //registration without waiting for page load
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(() => console.log('service worker registered !'));
// }

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('service worker registered !'));
    });
}
