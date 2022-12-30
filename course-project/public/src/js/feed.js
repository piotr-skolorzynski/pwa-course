const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');


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
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  // createPostArea.style.display = 'none';
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

function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.tile;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
const createDataArray = (data) => {
  let dataArray = [];
  for (let key in data) {
    dataArray.push(data[key]);
  };

  return dataArray;
}

const updateUI = (dataArray) => {
  clearCards();
  dataArray.map((data) => {
    return createCard(data);
  });
};

const url = 'https://pwa-course-96187-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
let networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('from web: ', data);
    const dataArray = createDataArray(data);
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then((data) => {
      if (!networkDataReceived) {
        console.log('From cache: ', data);
        updateUI(data);
      }
    });
};

//just sending data to backend
const sendData = () => {
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: {
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwa-course-96187.appspot.com/o/sf-boat.jpg?alt=media&token=77736d0f-b1f5-42e5-a1b8-6382e4d66588'
    }
  }).then((res) => {
    console.log('Sent data! ', res);
    updateUI(); //to reload page and update
  })
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    console.log('enter valid data!')
    return;
  };

  closeCreatePostModal();

  //standard chcecking if broweser supports service workers and synchronisation manager
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((sw) => {
        const post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value
        }

        writeData('sync-posts', post) //storing data in indexedDB
          .then(() => {
            return sw.sync.register('sync-new-posts'); //any name of task tag, register if successfully data was stored
          })
          .then(() => {
            const snackbarContainer = document.querySelector('#confirmation-toast'); //catch reference to toast on main page
            const toastMessage = { message: 'Your Post was saved for syncing!' }; //message to show in toast
            snackbarContainer.MaterialSnackbar.showSnackbar(toastMessage); //pass message to toast
          })
          .catch((err) => {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});
