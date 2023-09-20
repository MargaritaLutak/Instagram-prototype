const editBioBtn = document.querySelector('#edit-bio');
const editBioModal = document.querySelector('.edit-bio-modal');
const nicknameInput = document.querySelector('#nickname');
const nameInput = document.querySelector('#name');
const bioTextArea = document.querySelector('#bio');
const accountNickname = document.querySelector('#account-nickname');
const accountName = document.querySelector('#account-name');
const accountDescription = document.querySelector('#description');
const saveBioBtn = document.querySelector('#bio-save');
const cancelBioBtn = document.querySelector('#bio-discard');
const requiredFieldText = document.querySelector('.required-field');
const textCounterBio = document.querySelector('.bio-count span');
const maxCapacityText = document.querySelector('.max-capacity');
const spinner = document.querySelector('.lds-spinner');
const uploadAvatarInput = document.querySelector('#file-bio-upload');
const avatarImg = document.querySelector('#profile-avatar');


import { openWindow } from "./addPost.js";
import { closePost } from "./showPosts.js";
import { baseUrl, token, bioTextLimit } from "./constants.js";
import { showSuccessNotification, showErrorNotification } from "./helpers.js";
export let currentBioData;
let imgFile;


export async function templateCurrentBio() {
    const currentBioUrl = `${baseUrl}users/me/`;
    fetch(currentBioUrl, {
        method: 'GET',
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            avatarImg.src = data.photo;
            accountNickname.textContent = data.nickname;
            accountName.textContent = data.name;
            accountDescription.textContent = data.biography;
            currentBioData = data;
        })
}


async function sendBioInfoToServer() {
    const bioTextData = new FormData();
    bioTextData.set('nickname', nicknameInput.value);
    bioTextData.set('name', nameInput.value)
    bioTextData.set('biography', bioTextArea.value);
    const bioUrl = `${baseUrl}users/me/`;
    fetch(bioUrl, {
        method: 'PATCH',
        body: bioTextData,
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    })
        .then((response) => {
            if (response.status === 200) {
                closePost();
                showSuccessNotification('Данные сохранены', 'Профиль успешно обновлен');
            }
            return response.json()
        })
        .then((data) => {
            accountNickname.textContent = data.nickname;
            accountName.textContent = data.name;
            accountDescription.textContent = data.biography;
            currentBioData = data;
            return data;
        })
        .catch((err) => {
            closePost();
            showErrorNotification('Не удалось обновить данные профиля')
            return err;
        })
}

async function sendBioImgToServer() {
    spinner.classList.remove('hidden');
    avatarImg.classList.add('hidden');

    const bioImgData = new FormData();
    bioImgData.set('photo', imgFile);
    const bioUrl = `${baseUrl}users/me/`;
    fetch(bioUrl, {
        method: 'PATCH',
        body: bioImgData,
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    })
        .then((response) => {
            if (response.status === 200) {
                showSuccessNotification('Данные сохранены!', 'Аватарка успешно обновлена');
            }
            return response.json()
        })
        .then((data) => {
            avatarImg.src = data.photo;
            currentBioData.photo = data.photo;
            return data;
        })
        .catch((err) => {
            showErrorNotification('Не удалось обновить аватарку')
            return err;
        })
        .finally(() => {
            spinner.classList.add('hidden');
            avatarImg.classList.remove('hidden');
        })
}


export function initListenersEditBioFile() {

    editBioBtn.addEventListener('click', function () {
        const openEditBioWindow = openWindow.bind(editBioModal);
        openEditBioWindow();
        nicknameInput.value = accountNickname.textContent;
        nameInput.value = accountName.textContent;
    });

    cancelBioBtn.addEventListener('click', closePost);

    nicknameInput.addEventListener('input', function () {
        if (nicknameInput.value !== '') {
            saveBioBtn.classList.remove('edit-bio-modal__button-save--inactive');
            requiredFieldText.classList.add('hidden');
        } else {
            saveBioBtn.classList.add('edit-bio-modal__button-save--inactive');
            requiredFieldText.classList.remove('hidden');
        }
    })

    bioTextArea.addEventListener('input', function () {
        textCounterBio.textContent = bioTextArea.value.length;
        maxCapacityText.classList.add('v-hidden');
        saveBioBtn.classList.remove('edit-bio-modal__button-save--inactive');

        if (bioTextArea.value.length > bioTextLimit) {
            maxCapacityText.classList.remove('v-hidden');
            saveBioBtn.classList.add('edit-bio-modal__button-save--inactive');
        }
    })


    saveBioBtn.addEventListener('click', function () {
        sendBioInfoToServer()
    })

    uploadAvatarInput.addEventListener('change', function () {
        imgFile = uploadAvatarInput.files[0];
        sendBioImgToServer()
    })

}








