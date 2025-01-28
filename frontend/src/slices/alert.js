import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    message: '',
    type: 'error',
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center'
    },
    open: false
}

export const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        open: (state, { payload }) => {
            const {
                message,
                type = initialState.type,
                anchorOrigin = initialState.anchorOrigin,
                open = true
            } = payload;
            state.message = message;
            state.type = type;
            state.anchorOrigin = anchorOrigin
            state.open = open;
        },
        close: () => initialState
    }
});

export const { open, close } = alertSlice.actions;

export const alertSelector = ({ alert }) => alert;

export default alertSlice.reducer;
