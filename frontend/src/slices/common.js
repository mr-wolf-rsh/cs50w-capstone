import {
    createAsyncThunk,
    createSlice
} from '@reduxjs/toolkit';

import {
    axiosSession,
    handleValidStatus,
    handleError
} from '../api';

import { convertArrayToObject } from '../utils';

export const getCurrentPeriodAsync = createAsyncThunk(
    'common/period',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/period/current/');
            return handleValidStatus(response,
                ({ data }) => data,
                ({ data }) => handleError(data, () => null));
        } catch (err) {
            const { response: { data } } = err;
            return handleError(data,
                (data) => rejectWithValue(data));
        }
    }
);

export const getPoliticalInterestsAsync = createAsyncThunk(
    'common/politicalInterests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/political-interest/');
            return handleValidStatus(response,
                ({ data }) => data,
                ({ data }) => handleError(data, () => null));
        } catch (err) {
            const { response: { data } } = err;
            return handleError(data,
                (data) => rejectWithValue(data));
        }
    }
);

export const getElectionTypesAsync = createAsyncThunk(
    'common/electionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/election-type/');
            return handleValidStatus(response,
                ({ data }) => data,
                ({ data }) => handleError(data, () => null));
        } catch (err) {
            const { response: { data } } = err;
            return handleError(data,
                (data) => rejectWithValue(data));
        }
    }
);

export const GET_CURRENT_PERIOD_PENDING = getCurrentPeriodAsync.pending.toString();
export const GET_POLITICAL_INTERESTS_PENDING = getPoliticalInterestsAsync.pending.toString();
export const GET_ELECTION_TYPES_PENDING = getElectionTypesAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    GET_CURRENT_PERIOD_PENDING,
    GET_POLITICAL_INTERESTS_PENDING,
    GET_ELECTION_TYPES_PENDING
];

const initialState = {
    period: null,
    politicalInterests: [],
    electionTypes: [],
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(getCurrentPeriodAsync.pending, (state, _) => {
            state.isLoading[GET_CURRENT_PERIOD_PENDING] = true;
        }).addCase(getCurrentPeriodAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_CURRENT_PERIOD_PENDING] = false;
            state.period = payload;
        });
        builder.addCase(getPoliticalInterestsAsync.pending, (state, _) => {
            state.isLoading[GET_POLITICAL_INTERESTS_PENDING] = true;
        }).addCase(getPoliticalInterestsAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_POLITICAL_INTERESTS_PENDING] = false;
            state.politicalInterests = payload;
        });
        builder.addCase(getElectionTypesAsync.pending, (state, _) => {
            state.isLoading[GET_ELECTION_TYPES_PENDING] = true;
        }).addCase(getElectionTypesAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_ELECTION_TYPES_PENDING] = false;
            state.electionTypes = payload;
        });
    }
});

export const {
    reset
} = commonSlice.actions;

export const commonSelector = ({ common }) => common;

export default commonSlice.reducer;
