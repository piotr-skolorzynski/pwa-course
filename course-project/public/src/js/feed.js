const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  // checking if in diferredPrompt variable is storred event emitted after beforeinstallprompt and firing its metod to install our app
  if (defferedPrompt) {
    defferedPrompt.prompt();

    //reakcja na wybór użytkownika
    defferedPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      //outcome: accepted or dismissed
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }

      defferedPrompt = null;
    });
  }

  // //how to unregister service workers
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then((registrations) => {
  //       for (let i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal); //plus button in app, only when click happens on this button we want to ask User if he would like to install our app 

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// currently not in use, allows to save assets in cache on demand otherwise 
// const onSaveButtonClicked = (event) => {
//   console.log('clicked');
//   if ('caches' in window) {
//     caches.open('user-requsted').then((cache) => {
//       cache.add('https://httpbin.org/get');
//       cache.add('/src/images/sf-boat.jpg');
//     });
//   };
// }

const clearCards = () => {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard() {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

const url = 'https://httpbin.org/get';
let networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('from web: ', data);
    clearCards();
    createCard();
  });

if ('caches' in window) {
  caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
    }).then((data) => {
      console.log('from cache: ', data);
      if (!networkDataReceived) {
        clearCards();
        createCard();

      }
    })
};
