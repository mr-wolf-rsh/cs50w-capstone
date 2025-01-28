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
    convertArrayToObject,
    removeFieldsFromObject
} from '../utils';

export const getCurrentPollAsync = createAsyncThunk(
    'poll/poll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/poll/current/');
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

export const getPollsAsync = createAsyncThunk(
    'poll/polls',
    async ({ page }, { rejectWithValue }) => {
        try {
            const params = removeFieldsFromObject({ page });

            const response = await axiosSession.get('/poll/', { params });

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

export const createPollAsync = createAsyncThunk(
    'poll/pollCreation',
    async ({ uuid }, { rejectWithValue }) => {
        try {
            const body = {
                poll: {
                    campaignUuid: uuid
                }
            };

            const response = await axiosSession.post('/poll/', body);

            return handleValidStatus(response,
                () => null,
                ({ data }) => handleError(data, () => null));
        } catch (err) {
            const { response: { data } } = err;
            return handleError(data,
                (data) => rejectWithValue(data));
        }
    }
);

export const GET_CURRENT_POLL_PENDING = getCurrentPollAsync.pending.toString();
export const GET_POLLS_PENDING = getPollsAsync.pending.toString();
export const CREATE_POLL_PENDING = createPollAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    GET_CURRENT_POLL_PENDING,
    GET_POLLS_PENDING,
    CREATE_POLL_PENDING
];

const initialState = {
    poll: null,
    polls: {
        totalPages: 0,
        page: []
    },
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const pollSlice = createSlice({
    name: 'poll',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(getCurrentPollAsync.pending, (state, _) => {
            state.isLoading[GET_CURRENT_POLL_PENDING] = true;
        }).addCase(getCurrentPollAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_CURRENT_POLL_PENDING] = false;
            state.poll = payload;
        });
        builder.addCase(getPollsAsync.pending, (state, _) => {
            state.isLoading[GET_POLLS_PENDING] = true;
        }).addCase(getPollsAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_POLLS_PENDING] = false;
            state.polls = payload;
        });
        builder.addCase(createPollAsync.pending, (state, _) => {
            state.isLoading[CREATE_POLL_PENDING] = true;
        }).addCase(createPollAsync.fulfilled, (state, _) => {
            state.isLoading[CREATE_POLL_PENDING] = false;
        });
    }
});

export const {
    reset
} = pollSlice.actions;

export const pollSelector = ({ poll }) => poll;

export default pollSlice.reducer;
