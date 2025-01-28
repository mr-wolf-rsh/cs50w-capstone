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

export const getCandidateAsync = createAsyncThunk(
    'candidate/candidate',
    async ({ uuid }, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get(`/candidate/${uuid}/`);
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

export const getLimitedCandidatesAsync = createAsyncThunk(
    'candidate/limitedCandidates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosSession.get('/candidate/limited/');
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

export const getCampaignCandidatesAsync = createAsyncThunk(
    'candidate/campaignCandidates',
    async ({ page, electionType, name, party }, { rejectWithValue }) => {
        try {
            const params = removeFieldsFromObject({ page, electionType, name, party });

            const response = await axiosSession.get('/candidate/', { params });

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

export const updateCandidateLikeRatingAsync = createAsyncThunk(
    'candidate/candidateLikeRatingUpdate',
    async ({ uuid, type, value }, { rejectWithValue }) => {
        try {
            const body = {
                candidate: { [type]: value }
            };

            const response = await axiosSession.patch(`/candidate/${uuid}/`, body);

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

export const GET_CANDIDATE_PENDING = getCandidateAsync.pending.toString();
export const GET_LIMITED_CANDIDATES_PENDING = getLimitedCandidatesAsync.pending.toString();
export const GET_CAMPAIGN_CANDIDATES_PENDING = getCampaignCandidatesAsync.pending.toString();
export const UPDATE_CANDIDATE_LIKE_RATING_PENDING = updateCandidateLikeRatingAsync.pending.toString();

const THUNK_PENDING_ARRAY = [
    GET_CANDIDATE_PENDING,
    GET_LIMITED_CANDIDATES_PENDING,
    GET_CAMPAIGN_CANDIDATES_PENDING,
    UPDATE_CANDIDATE_LIKE_RATING_PENDING
];

const initialState = {
    candidate: null,
    limitedCandidates: [],
    campaignCandidates: {
        totalPages: 0,
        page: []
    },
    isLoading: convertArrayToObject(THUNK_PENDING_ARRAY, false)
};

export const candidateSlice = createSlice({
    name: 'candidate',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(getCandidateAsync.pending, (state, _) => {
            state.isLoading[GET_CANDIDATE_PENDING] = true;
        }).addCase(getCandidateAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_CANDIDATE_PENDING] = false;
            state.candidate = payload;
        });
        builder.addCase(getLimitedCandidatesAsync.pending, (state, _) => {
            state.isLoading[GET_LIMITED_CANDIDATES_PENDING] = true;
        }).addCase(getLimitedCandidatesAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_LIMITED_CANDIDATES_PENDING] = false;
            state.limitedCandidates = payload;
        });
        builder.addCase(getCampaignCandidatesAsync.pending, (state, _) => {
            state.isLoading[GET_CAMPAIGN_CANDIDATES_PENDING] = true;
        }).addCase(getCampaignCandidatesAsync.fulfilled, (state, { payload }) => {
            state.isLoading[GET_CAMPAIGN_CANDIDATES_PENDING] = false;
            state.campaignCandidates = payload;
        });
        builder.addCase(updateCandidateLikeRatingAsync.pending, (state, _) => {
            state.isLoading[UPDATE_CANDIDATE_LIKE_RATING_PENDING] = true;
        }).addCase(updateCandidateLikeRatingAsync.fulfilled, (state, _) => {
            state.isLoading[UPDATE_CANDIDATE_LIKE_RATING_PENDING] = false;
        });
    }
});

export const {
    reset
} = candidateSlice.actions;

export const candidateSelector = ({ candidate }) => candidate;

export default candidateSlice.reducer;
