const addPhotoBtn = document.querySelector('#add-photo');
const addFirstPhotoBtn = document.querySelector('#add-first-post');
const postModal = document.querySelector('.add-post-modal');
const body = document.querySelector('body');
const bodyOverlay = document.querySelector('.body-overlay');
const uploadPhotoBtn = document.querySelector('#file-upload');
const uploadedPhoto = document.querySelector('#uploaded-photo')
const postModalFirstPart = document.querySelector('.add-post-modal__step-1');
const postModalSecondPart = document.querySelector('.add-post-modal__step-2');
const postModalFooter = document.querySelector('.modal__footer');
const dropboxContainer = document.querySelector('.drag-and-drop-container');
const hashtagsWarningText = document.querySelector('.post-hashtags-label');
const textForPost = document.querySelector('#post-text');
const hashtagsForPost = document.querySelector('#post-hashtags');
const publishPostBtn = document.querySelector('#post-publish');
const textCounter = document.querySelector('.text-counter');

import { token, baseUrl, regexExp,textForPostlimit } from "./constants.js";
import { getPostsFromServer } from "./showPosts.js";
import { showSuccessNotification, showErrorNotification } from "./helpers.js";


export function openWindow() {
    this.classList.add('active');
    body.classList.add('with-overlay');
    bodyOverlay.classList.add('active');
}

function closePostModal() {
    postModal.classList.remove('active');
    body.classList.remove('with-overlay');
    bodyOverlay.classList.remove('active');
    removePostModalInfo();
}

function removePostModalInfo() {
    uploadPhotoBtn.value = '';
    uploadedPhoto.src = './img/photo-post.jpg';
    textForPost.value = '';
    hashtagsForPost.value = '';
    postModalSecondPart.classList.add('hidden');
    postModalFirstPart.classList.remove('hidden');
    postModalFooter.classList.add('hidden');
    dropboxContainer.classList.remove('active-drag-and-drop');
    hashtagsWarningText.classList.remove('active');
    publishPostBtn.disabled = false;
    publishPostBtn.classList.remove('btn-disabled');
}

let file;

function uploadPhoto() {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('loadend', function(){
        uploadedPhoto.src = reader.result;
        postModalFirstPart.classList.add('hidden');
        postModalSecondPart.classList.remove('hidden');
        postModalFooter.classList.remove('hidden');
    })
}

async function sendPostToServer() {
    const postData = new FormData();
    postData.set('text', textForPost.value);
    postData.set('tags', hashtagsForPost.value);
    postData.set('image', file);
    const postServerUrl = `${baseUrl}posts/`;
    return fetch(postServerUrl, {
        method: 'POST',
        body: postData,
        headers: {
            Authorization:
                `Bearer ${token}`
        },
    })
}

export function initListenersAddPostFile() {
    addPhotoBtn.addEventListener('click', openWindow.bind(postModal));
    addFirstPhotoBtn.addEventListener('click', openWindow.bind(postModal));
    bodyOverlay.addEventListener('click', closePostModal);

    uploadPhotoBtn.addEventListener('change', function () {
        file = uploadPhotoBtn.files[0];
        uploadPhoto();
    })

    dropboxContainer.addEventListener('dragenter', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropboxContainer.classList.add('active-drag-and-drop');
    }, false)

    dropboxContainer.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropboxContainer.classList.remove('active-drag-and-drop');
    }, false)

    dropboxContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropboxContainer.classList.add('active-drag-and-drop');
    }, false)

    dropboxContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropboxContainer.classList.remove('active');

        const draggedData = event.dataTransfer;
        file = draggedData.files[0];
        uploadPhoto();
    })

    textForPost.addEventListener('input', () => {
        const textLength = textForPost.value.length;
        textCounter.textContent = textLength + '/' + textForPostlimit;
        hashtagsWarningText.classList.remove('active');
        if (textLength > textForPostlimit) {
            textForPost.classList.add('error-validation');
            publishPostBtn.disabled = true;
            publishPostBtn.classList.add('btn-disabled')
        } else {
            textForPost.classList.remove('error-validation');
            publishPostBtn.disabled = false;
            publishPostBtn.classList.remove('btn-disabled');
        }

    })

    hashtagsForPost.addEventListener('input', () => {
        const hashtags = hashtagsForPost.value.trim();
    
        if (!regexExp.test(hashtags) && hashtags.length >=1) {
            hashtagsForPost.classList.add('error-validation');
            publishPostBtn.disabled = true;
            publishPostBtn.classList.add('btn-disabled');
            hashtagsWarningText.classList.add('active');
        } else {
            hashtagsForPost.classList.remove('error-validation');
            publishPostBtn.disabled = false;
            publishPostBtn.classList.remove('btn-disabled');
            hashtagsWarningText.classList.remove('active');
        }
    })

    publishPostBtn.addEventListener('click', function () {
        sendPostToServer()
            .then((response) => {
                if (response.status === 201) {
                    closePostModal();
                    showSuccessNotification('Данные сохранены!', 'Мы сохранили ваши данные');
                    removePostModalInfo();
                    getPostsFromServer()
                }
                return response.json();
            })
            .catch((err) => {
                closePostModal();
                removePostModalInfo();
                showErrorNotification('Не удалось загрузить фото');
                return err;
            })
    })
}



