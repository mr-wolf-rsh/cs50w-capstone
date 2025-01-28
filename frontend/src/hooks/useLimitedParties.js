import React from "react";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    partySelector,
    getLimitedPartiesAsync,
    GET_LIMITED_PARTIES_PENDING
} from '../slices/party';

export default function useLimitedParties() {
    const dispatch = useDispatch();

    const {
        limitedParties,
        isLoading: {
            [GET_LIMITED_PARTIES_PENDING]: isLoadingLimitedParties
        }
    } = useSelector(partySelector);

    const [allLimitedParties, setAllLimitedParties] = React.useState(limitedParties);

    React.useEffect(() => {
        if (isLoadingLimitedParties || !(limitedParties.length > 0)) {
            dispatch(getLimitedPartiesAsync());
        }
    }, [dispatch, isLoadingLimitedParties, limitedParties]);

    React.useEffect(() => {
        setAllLimitedParties(limitedParties);
    }, [limitedParties]);

    return [allLimitedParties, isLoadingLimitedParties];
}
