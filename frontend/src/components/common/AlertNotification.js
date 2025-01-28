import React from 'react';

import {
    useSelector,
    useDispatch
} from 'react-redux';

import {
    Alert,
    Snackbar
} from '@mui/material';

import {
    close,
    alertSelector
} from '../../slices/alert';

export default function AlertNotification() {
    const dispatch = useDispatch();
    const { message, type, anchorOrigin, open } = useSelector(alertSelector);

    if (!open) return <React.Fragment></React.Fragment>;

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(close());
    };

    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}
            anchorOrigin={anchorOrigin}>
            <Alert variant="filled" onClose={handleClose}
                severity={type} style={{ fontSize: 16 }}>
                {message}
            </Alert>
        </Snackbar>
    );
};
