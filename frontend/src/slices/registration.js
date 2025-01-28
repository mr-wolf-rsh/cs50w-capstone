import {
    createAsyncThunk,
    createSlice
} from '@reduxjs/toolkit';

import {
    axiosSession,
    handleValidStatus
} from '../api';

import { convertArrayToObject } from '../utils';

import {
    handleUserError,
    setCurrentUserSession
} from './auth';

export const registerAsync = createAsyncThunk(
    'registration/registration',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const { registration } = getState();
            const { personalInfo, voterInfo } = registration;
            const { color, voterInterests } = voterInfo;
            const body = {
                user: personalInfo,
                voter: {
                    color
                },
                voterInterests: voterInterests.map(
                    ({ uuid, value }) => ({
                        politicalInterestUuid: uuid,
                        value
                    })
                )
            };

            const response = await axiosSession.post('/auth/register/', body);

            return handleValidStatus(response,
                ({ data }) => dispatch(setCurrentUserSession(data)),
                ({ data }) => handleUserError(data, dispatch, rejectWithValue));
        } catch (err) {
            const { response: { data } } = err;
            return handleUserError(data, dispatch, rejectWithValue);
        }
    }
);

export const REGISTER_PENDING = registerAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    REGISTER_PENDING
];

const initialState = {
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    },
    voterInfo: {
        color: null,
        voterInterests: []
    },
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {
        setPersonalInfo: (state, { payload }) => {
            const { firstName, lastName, email,
                password, passwordConfirmation } = payload;
            state.personalInfo = {
                email,
                firstName,
                lastName,
                password,
                passwordConfirmation
            };
        },
        setVoterInfo: (state, { payload }) => {
            const { color, voterInterests } = payload;
            state.voterInfo = {
                color,
                voterInterests
            };
        },
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(registerAsync.pending, (state, _) => {
            state.isLoading[REGISTER_PENDING] = true;
        }).addCase(registerAsync.fulfilled, (state, _) => {
            state.isLoading[REGISTER_PENDING] = false;
        })
    }
});

export const {
    setPersonalInfo,
    setVoterInfo,
    reset
} = registrationSlice.actions;

export const registrationSelector = ({ registration }) => registration;

export default registrationSlice.reducer;
