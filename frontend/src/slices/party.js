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

export const getPartyAsync = createAsyncThunk(
    'party/party',
    async ({ uuid }, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get(`/party/${uuid}/`);
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

export const getLimitedPartiesAsync = createAsyncThunk(
    'party/limitedParties',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/party/limited/');

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

export const getPartiesAsync = createAsyncThunk(
    'party/parties',
    async ({ page, electionType, name, party }, { rejectWithValue }) => {
        try {
            const params = removeFieldsFromObject({ page, electionType, name, party });

            const response = await axiosSession.get('/party/', { params });

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

export const updatePartyLikeRatingAsync = createAsyncThunk(
    'party/partyLikeRatingUpdate',
    async ({ uuid, type, value }, { rejectWithValue }) => {
        try {
            const body = {
                party: { [type]: value }
            };

            const response = await axiosSession.patch(`/party/${uuid}/`, body);

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

export const GET_PARTY_PENDING = getPartyAsync.pending.toString();
export const GET_LIMITED_PARTIES_PENDING = getLimitedPartiesAsync.pending.toString();
export const GET_PARTIES_PENDING = getPartiesAsync.pending.toString();
export const UPDATE_PARTY_LIKE_RATING_PENDING = updatePartyLikeRatingAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    GET_PARTY_PENDING,
    GET_LIMITED_PARTIES_PENDING,
    GET_PARTIES_PENDING,
    UPDATE_PARTY_LIKE_RATING_PENDING
];

const initialState = {
    party: null,
    limitedParties: [],
    parties: {
        totalPages: 0,
        page: []
    },
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const partySlice = createSlice({
    name: 'party',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(getPartyAsync.pending, (state, _) => {
            state.isLoading[GET_PARTY_PENDING] = true;
        }).addCase(getPartyAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_PARTY_PENDING] = false;
            state.party = payload;
        });
        builder.addCase(getLimitedPartiesAsync.pending, (state, _) => {
            state.isLoading[GET_LIMITED_PARTIES_PENDING] = true;
        }).addCase(getLimitedPartiesAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_LIMITED_PARTIES_PENDING] = false;
            state.limitedParties = payload;
        });
        builder.addCase(getPartiesAsync.pending, (state, _) => {
            state.isLoading[GET_PARTIES_PENDING] = true;
        }).addCase(getPartiesAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_PARTIES_PENDING] = false;
            state.parties = payload;
        });
        builder.addCase(updatePartyLikeRatingAsync.pending, (state, _) => {
            state.isLoading[UPDATE_PARTY_LIKE_RATING_PENDING] = true;
        }).addCase(updatePartyLikeRatingAsync.fulfilled, (state, { payload }) => {
            state.isLoading[UPDATE_PARTY_LIKE_RATING_PENDING] = false;
        });
    }
});

export const {
    reset
} = partySlice.actions;

export const partySelector = ({ party }) => party;

export default partySlice.reducer;
