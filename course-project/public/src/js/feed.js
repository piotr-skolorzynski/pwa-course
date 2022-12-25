const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

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
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal); //plus button in app, only when click happens on this button we want to ask User if he would like to install our app 

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
