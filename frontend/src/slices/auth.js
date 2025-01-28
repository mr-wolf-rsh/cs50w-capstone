import {
    createAsyncThunk,
    createSlice
} from '@reduxjs/toolkit';

import {
    axiosSession,
    handleValidStatus,
    handleError
} from '../api';

import {
    AUTH_TOKEN,
    CSRF_TOKEN,
    UserSession,
    TokenSession,
    convertArrayToObject
} from '../utils';

import { open } from './alert';

export const loginAsync = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { dispatch, rejectWithValue }) => {
        try {
            const body = {
                user: { email, password }
            };

            const response = await axiosSession.post('/auth/login/', body);

            return handleValidStatus(response,
                ({ data }) => dispatch(setCurrentUserSession(data)),
                ({ data }) => handleUserError(data, dispatch, rejectWithValue));
        } catch (err) {
            const { response: { data } } = err;
            return handleUserError(data, dispatch, rejectWithValue);
        }
    }
);

export const logoutAsync = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/auth/logout/');

            return handleValidStatus(response,
                () => dispatch(removeCurrentUserSession()),
                ({ data }) => handleUserError(data, dispatch, rejectWithValue));
        } catch (err) {
            const { response: { data } } = err;
            return handleUserError(data, dispatch, rejectWithValue);
        }
    }
);

export const setCurrentUserSession = ({ voter, authtoken, csrftoken }) =>
    (dispatch) => {
        const {
            user: {
                email,
                firstName,
                lastName
            },
            color,
            voterInterests
        } = voter;

        const currentUser = {
            email,
            firstName,
            lastName,
            color,
            voterInterests
        };

        UserSession.set(currentUser);
        TokenSession.set(AUTH_TOKEN, authtoken);
        TokenSession.set(CSRF_TOKEN, csrftoken);
        dispatch(getCurrentUserSession());
    }

export const getCurrentUserSession = () => (dispatch) => {
    const currentUser = UserSession.get();
    dispatch(authSlice.actions.setCurrentUser(currentUser));
}

export const removeCurrentUserSession = () => (dispatch) => {
    UserSession.remove();
    TokenSession.remove(AUTH_TOKEN);
    TokenSession.remove(CSRF_TOKEN);
    dispatch(authSlice.actions.reset());
}

export const handleUserError = (data, dispatch, rejectWithValue) => {
    dispatch(removeCurrentUserSession());
    return handleError(data,
        (data) => {
            const { message } = data;
            dispatch(open({ message }));
            return rejectWithValue(data);
        });
};

export const LOGIN_PENDING = loginAsync.pending.toString();
export const LOGOUT_PENDING = logoutAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    LOGIN_PENDING,
    LOGOUT_PENDING
];

const initialState = {
    currentUser: null,
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCurrentUser: (state, { payload }) => {
            state.currentUser = payload;
        },
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(loginAsync.pending, (state, _) => {
            state.isLoading[LOGIN_PENDING] = true;
        }).addCase(loginAsync.fulfilled, (state, _) => {
            state.isLoading[LOGIN_PENDING] = false;
        })
        builder.addCase(logoutAsync.pending, (state, _) => {
            state.isLoading[LOGOUT_PENDING] = true;
        }).addCase(logoutAsync.fulfilled, (state, _) => {
            state.isLoading[LOGOUT_PENDING] = false;
        })
    }
});

export const {
    setCurrentUser,
    reset
} = authSlice.actions;

export const authSelector = ({ auth }) => auth;

export default authSlice.reducer;
