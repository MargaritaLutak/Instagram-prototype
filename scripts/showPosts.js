const emptyPhotosContent = document.querySelector('.photos__empty-content');
const postTemplate = document.querySelector('#post-template');
const postsContainer = document.querySelector('.photos__content');
const postCounter = document.querySelector('#photo-count');
const previewPostModal = document.querySelector('.preview-post-modal');
const bodyOverlay = document.querySelector('.body-overlay');
const body = document.querySelector('body');
const tagsContainer = previewPostModal.querySelector('.post-hashtags');
const editBioModal = document.querySelector('.edit-bio-modal');
const likesContainer = document.querySelector('.statistics__likes');
const commentsContainer = document.querySelector('.comments__container');
const commentTemplate = document.querySelector('#comment-template');
const bioTextArea = document.querySelector('#bio');

import { token, baseUrl } from "./constants.js";
import { currentBioData } from "./editBio.js";
import { editPublishedPostTime, editPublishedCommentTime } from "./helpers.js";

export const map = new Map();

export function closePost() {
    bioTextArea.value = ' ';
    editBioModal.classList.remove('active');
    previewPostModal.classList.remove('active');
    body.classList.remove('with-overlay');
    bodyOverlay.classList.remove('active');
}

export async function getPostsFromServer() {
    const getPostUrl = `${baseUrl}users/me/posts/`;
    fetch(getPostUrl, {
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

            data.forEach((post) => {
                post.editedTime = new Date(post.created_at).getTime();
            })
            data.sort((a, b) => b.editedTime - a.editedTime);
            showPosts(data);
        })
        .catch((error) => {
            return (error);
        })

};


export function initListenersShowPostFile() {
    bodyOverlay.addEventListener('click', closePost);

    postsContainer.addEventListener('click', function (event) {
        const element = event.target.closest('.post');
        if (!element) {
            return;
        }
        previewPostModal.classList.add('active');
        body.classList.add('with-overlay');
        bodyOverlay.classList.add('active');

        const elementId = +element.dataset.postId;
        const currentPost = map.get(elementId);
        getPostInfo(currentPost);
    })

}



function getPostInfo(post) {
    previewPostModal.dataset.previewPostId = post.id;

    const time = post.dataCreated;
    previewPostModal.querySelector('.account-info__time').textContent = editPublishedPostTime(time);
    previewPostModal.querySelector('#post-photo').src = post.image;
    previewPostModal.querySelector('.post-text').textContent = post.text;
    previewPostModal.querySelector('.statistics__likes').classList.remove('liked');
    previewPostModal.querySelector('.statistics__likes span').textContent = post.likes;

    if (currentBioData) {
        previewPostModal.querySelector('.preview-post-modal-nickname').textContent = currentBioData.nickname;
        previewPostModal.querySelector('.preview-post-modal-avatar').src = currentBioData.photo;
        previewPostModal.querySelector('.comments__add img').src = currentBioData.photo;
    }

    if (post.likes > 0) {
        likesContainer.classList.add('liked');
    }
    previewPostModal.querySelector('.statistics__comments span').textContent = post.comments.length;

    const tags = post.tags;
    tagsContainer.innerHTML = ' ';

    for (let tag of tags) {
        const tagLink = document.createElement('a');
        tagLink.href = '#';
        tagLink.innerHTML = tag;
        tagsContainer.append(tagLink);
    }

    const commentsArr = post.comments;
    commentsArr.forEach((comment) => {
        comment.editedTime = new Date(comment.created_at).getTime();
    })
    commentsArr.sort((a, b) => a.editedTime - b.editedTime);

    const fragment = new DocumentFragment();
    commentsContainer.innerHTML = '';
    commentsArr.forEach((commentItem) => {
        const { text, created_at: dataCommentCreated, id } = commentItem;
        const comment = commentTemplate.content.cloneNode(true);
        comment.querySelector('.comments__item').dataset.commentId = id;
        comment.querySelector('.comments__item-comment').textContent = text;
        comment.querySelector('.comments__item-time').textContent = editPublishedCommentTime(dataCommentCreated);
        if (currentBioData) {
            comment.querySelector('.comments__item-nickname').textContent = currentBioData.nickname;
            comment.querySelector('.comments__item-avatar').src = currentBioData.photo;
        }
        fragment.append(comment);

    })
    commentsContainer.append(fragment)
}

function showPosts(arr) {
    postsContainer.innerHTML = ' ';
    postCounter.textContent = arr.length;
    if (arr.length == 0) {
        emptyPhotosContent.classList.remove('hidden');
    } else {
        map.clear();
        emptyPhotosContent.classList.add('hidden');
        const fragment = new DocumentFragment();

        arr.forEach((post) => {
            const { comments, created_at: dataCreated, id, image, likes, tags, text } = post;
            map.set(id, { comments, dataCreated, image, likes, tags, text, id });
            const card = postTemplate.content.cloneNode(true);
            card.querySelector('img').src = image;
            card.querySelector('.post-likes-counter').textContent = likes;
            card.querySelector('.post-comments-counter').textContent = comments.length;
            card.querySelector('.post').dataset.postId = id;
            fragment.append(card);
        })
        postsContainer.append(fragment);
    }
}







