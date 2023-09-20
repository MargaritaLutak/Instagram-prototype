const alertSuccess = document.querySelector('.alert--success');
const alertError = document.querySelector('.alert--error');

export function showSuccessNotification(headerText, mainText) {
    const timer = 4000;
    alertSuccess.classList.remove('hidden');
    alertSuccess.querySelector('h4').textContent = headerText;
    alertSuccess.querySelector('.alert__info').textContent = mainText;
    setTimeout(() => alertSuccess.classList.add('hidden'), timer);
}

export function showErrorNotification(mainText) {
    const timer = 4000;
    alertError.classList.remove('hidden');
    alertError.querySelector('.alert__info').textContent = mainText;
    setTimeout(() => alertError.classList.add('hidden'), timer);
}

export function editPublishedPostTime(serverTime) {
    const serverTimeEdited = new Date(serverTime.slice(0, 19))
    const postTime = new Intl.DateTimeFormat('ru-RU', { month: 'long', day: 'numeric' }).format(serverTimeEdited);
    return postTime;
}

export function editPublishedCommentTime(serverTime) {
    const commentTime = new Date(serverTime.slice(0, 19) + 'Z')
    const commentTimeEddited = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'long' }).format(commentTime);
    const yearText = commentTimeEddited.indexOf('г');
    const commentTimeFinal = commentTimeEddited.slice(0, yearText - 5) + commentTimeEddited.slice(yearText + 4, yearText + 10);
    return commentTimeFinal;
}


