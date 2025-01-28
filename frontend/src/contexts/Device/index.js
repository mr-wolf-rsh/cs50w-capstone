import React from 'react';

import { useDispatch } from 'react-redux';

import { useMediaQuery } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import json2mq from 'json2mq';

import { getCurrentUserSession } from '../../slices/auth';

const DeviceContext = React.createContext();

const DeviceContextProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { spacing } = useTheme();

    const isTabletOrMobile = useMediaQuery(json2mq({ maxWidth: 600 }));
    const height = isTabletOrMobile ? 'auto' : `calc(100vh - ${spacing(12.8)})`
    const width = isTabletOrMobile ? '100vw' : 'auto'

    React.useEffect(() => {
        dispatch(getCurrentUserSession());
    }, [dispatch]);

    const context = {
        height,
        width
    };

    return (
        <DeviceContext.Provider value={context}>
            {children}
        </DeviceContext.Provider>
    );
};

export {
    DeviceContext,
    DeviceContextProvider
};
