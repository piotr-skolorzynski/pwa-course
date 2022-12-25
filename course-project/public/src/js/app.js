// //registration without waiting for page load
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(() => console.log('service worker registered !'));
// }

let defferedPrompt;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('service worker registered !'));
    });
}

window.addEventListener('beforeinstallprompt', (event) => {
    console.log('beforeinstallprompt fired');
    event.preventDefault(); //zapobiegamy domyślnemu instalowaniu appki na pulpicie 
    defferedPrompt = event; //zapisanie do zmiennej referencji do eventu wyemitowanego po zdarzeniu beforeinstallprompt

    return false;
});