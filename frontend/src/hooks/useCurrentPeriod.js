import React from "react";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    commonSelector,
    getCurrentPeriodAsync,
    GET_CURRENT_PERIOD_PENDING
} from '../slices/common';

export default function useCurrentPeriod() {
    const dispatch = useDispatch();

    const {
        period,
        isLoading: {
            [GET_CURRENT_PERIOD_PENDING]: isLoadingCurrentPeriod
        }
    } = useSelector(commonSelector);

    const [currentPeriod, setCurrentPeriod] = React.useState(period);

    React.useEffect(() => {
        if (isLoadingCurrentPeriod || !period) {
            dispatch(getCurrentPeriodAsync());
        }
    }, [dispatch, period, isLoadingCurrentPeriod]);

    React.useEffect(() => {
        setCurrentPeriod(period);
    }, [period]);

    return [currentPeriod, isLoadingCurrentPeriod];
}
