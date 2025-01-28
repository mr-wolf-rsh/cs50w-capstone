import _ from 'lodash';

import Cookies from 'js-cookie';

const CSRF_TOKEN = 'voteraid-csrftoken';
const AUTH_TOKEN = 'voteraid-authtoken';

const CURRENT_USER = 'voteraid-currentuser';

const DEFAULT_USER_COLOR = process.env.REACT_APP_DEFAULT_USER_COLOR;

const TokenSession = {
    set: (token, tokenValue) => Cookies.set(token, tokenValue),
    get: (token) => Cookies.get(token) ?? null,
    remove: (token) => Cookies.remove(token)
}

const UserSession = {
    set: (currentUser) => Cookies.set(CURRENT_USER, JSON.stringify(currentUser)),
    get: () => JSON.parse(Cookies.get(CURRENT_USER) ?? null),
    remove: () => Cookies.remove(CURRENT_USER)
}
const convertArrayToObject = (array, defaultValue) =>
    array.reduce((obj, item) =>
        ({ ...obj, [item]: defaultValue }), {});

const isEqual = (val1, val2) => _.isEqual(val1, val2);

const preventPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const removeFieldsFromObject = (obj) => {
    Object.keys(obj).forEach(key => !obj[key] && delete obj[key]);
    return obj;
}

export {
    CSRF_TOKEN,
    AUTH_TOKEN,
    DEFAULT_USER_COLOR,
    TokenSession,
    UserSession,
    convertArrayToObject,
    isEqual,
    preventPropagation,
    removeFieldsFromObject
};
