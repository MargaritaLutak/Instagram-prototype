const deletePostBtn = document.querySelector('#delete-post');
const likesOnPost = document.querySelector('.statistics__likes span');
const likesContainer = document.querySelector('.statistics__likes');
const likeBtn = document.querySelector('.fa-heart-btn');
const commentsOnPostPreview = document.querySelector('.statistics__comments span');
const commentArea = document.querySelector('#post-comment');
const addCommentBtn = document.querySelector('.comments-button');
const commentsContent = document.querySelector('.comments__container');
const commentTemplate = document.querySelector('#comment-template');

import { token, baseUrl } from "./constants.js";
import { map, closePost, getPostsFromServer } from "./showPosts.js";
import { currentBioData } from "./editBio.js";
import { showSuccessNotification, showErrorNotification, editPublishedCommentTime} from "./helpers.js";


async function deletePost(url) {
    return fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    })
}

async function setLike(url) {
    return fetch(url, {
        method: 'POST',
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    })
}

async function sendCommentToServer() {
    const text = commentArea.value;
    const post = +commentArea.closest('.preview-post-modal').dataset.previewPostId;
    const dataComment = { post, text };

    const url = `${baseUrl}comments/`;
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(dataComment),
        headers: {
            Authorization:
                `Bearer ${token}`,
            "Content-Type":
                "application/json"
        },
    })
        .then((response) => {
            if (response.status === 201) {
                commentArea.value = '';

            }
            return response.json();
        })
        .then((data) => {
            showCommentData(data);
            const postPreview = map.get(data.post);;
            postPreview.comments.push(data);
            commentsOnPostPreview.textContent = postPreview.comments.length;
            const postSmall = document.querySelector(`[data-post-id = '${data.post}']`);
            postSmall.querySelector('.overlay__content .comments span').textContent = postPreview.comments.length;

        })
        .catch((err) => {
            return err;
        })
}


function showCommentData(commentData) {
    const { text, created_at: dataCreated, id } = commentData;
    const comment = commentTemplate.content.cloneNode(true);
    if (currentBioData) {
        comment.querySelector('.comments__item-nickname').textContent = currentBioData.nickname;
        comment.querySelector('.comments__item-avatar').src = currentBioData.photo;
    }
    comment.querySelector('.comments__item').dataset.commentId = id;
    comment.querySelector('.comments__item-comment').textContent = text;
    comment.querySelector('.comments__item-time').textContent = editPublishedCommentTime(dataCreated);
    commentsContent.append(comment);
}




export function initListenersPostInterectionFile() {

    deletePostBtn.addEventListener('click', function () {
        const previewId = +this.closest('.preview-post-modal').dataset.previewPostId;
        const deletePostUrl = `${baseUrl}posts/${previewId}/`;
        deletePost(deletePostUrl)
            .then((response) => {
                if (response.status === 204) {
                    showSuccessNotification('Данные удалены', 'Мы удалили ваш пост');
                    getPostsFromServer();
                }
                return response;
            })
            .catch((err) => {
                showErrorNotification('Не удалось удалить пост, попробуйте снова');
                return err;
            })
            .finally(() => {
                closePost();
            })
    })


    likeBtn.addEventListener('click', function () {

        const postId = +this.closest('.preview-post-modal').dataset.previewPostId;
        const sendLikeUrl = `${baseUrl}posts/${postId}/like/`;
        setLike(sendLikeUrl)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                likesContainer.classList.add('liked');
                likesOnPost.textContent = data.likes;
                const postSmall = document.querySelector(`[data-post-id = '${data.id}']`);
                postSmall.querySelector('.overlay__content span').textContent = data.likes;
                const postPreview = map.get(data.id);
                postPreview.likes = data.likes;
            })
    })


    commentArea.addEventListener('keydown', function (event) {
        const str = commentArea.value;
        const strTrimmed = str.trim();

        if (event.key === 'Enter' && strTrimmed.length > 0) {
            sendCommentToServer()
        }
    })

    addCommentBtn.addEventListener('click', function(){
        const str = commentArea.value;
        const strTrimmed = str.trim();
        if (strTrimmed.length === 0) {
            return;
        }
        sendCommentToServer();
    })




    commentsContent.addEventListener('click', function (event) {
        const deleteCommentBtn = event.target;
        if (!deleteCommentBtn.classList.contains('comments__item-delete-btn')) {
            return;
        }
        const commentContainer = event.target.closest('.comments__item');
        const deletedCommentId = +commentContainer.dataset.commentId;
        const postPreview = commentContainer.closest('.preview-post-modal');
        const previewId = +postPreview.dataset.previewPostId;

        const deleteCommentUrl = `${baseUrl}comments/${deletedCommentId}/`;
        fetch(deleteCommentUrl, {
            method: 'DELETE',
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        })
            .then((response) => {
                if (response.status === 204) {
                    commentContainer.remove();
                    const currentPost = map.get(previewId);
                    const comments = currentPost.comments;
                    const deletedComment = comments.findIndex((comment) => comment.id === deletedCommentId)
                    if (deletedComment !== -1) {
                        comments.splice(deletedComment, 1);
                    }
                    postPreview.querySelector('.statistics__comments span').textContent = comments.length;
                    const postSmall = document.querySelector(`[data-post-id = '${previewId}']`);
                    postSmall.querySelector('.overlay__content .comments span').textContent = comments.length;

                }
                return response;
            })
            .catch((err) => {
                return err;
            })

    })
}

