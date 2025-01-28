import axios from 'axios';

import {
    CSRF_TOKEN,
    AUTH_TOKEN,
    TokenSession
} from '../utils';

const API_SERVER_PROTOCOL = "http";
const API_SERVER_HOST = "127.0.0.1";
const API_SERVER_PORT = 8000;
const API_SERVER_RESOURCE = "api";

const API_SERVER_URL = `${API_SERVER_PROTOCOL}://${API_SERVER_HOST}:${API_SERVER_PORT}/${API_SERVER_RESOURCE}`;

const axiosConfig = {
    baseURL: API_SERVER_URL,
    responseType: "json",
    proxy: {
        protocol: API_SERVER_PROTOCOL,
        host: API_SERVER_HOST,
        port: API_SERVER_PORT
    },
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
};

export const axiosSession = axios.create(axiosConfig);

axiosSession.interceptors.request.use(
    async (config) => {
        const csrfToken = TokenSession.get(CSRF_TOKEN);
        const authToken = TokenSession.get(AUTH_TOKEN);
        config = {
            ...config,
            withCredentials: !!csrfToken && !!authToken,
            headers: {
                ...config.headers,
                ...(!!csrfToken && ({ "X-CSRFToken": csrfToken } || {})),
                ...(!!authToken && ({ "Authorization": `Token ${authToken}` } || {}))
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

export const handleValidStatus = (response, successCallback, failureCallback) => {
    const { data, status } = response;
    const isValid = 200 <= status && status <= 299;
    return isValid ? successCallback(data) : failureCallback(data);
};

export const handleError = (error, callback = null) => {
    const { message } = error;
    console.warn(message);
    if (!!callback) {
        return callback(error);
    }
}
