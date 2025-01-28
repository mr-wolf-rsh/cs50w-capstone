import React from "react";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    candidateSelector,
    getLimitedCandidatesAsync,
    GET_LIMITED_CANDIDATES_PENDING
} from '../slices/candidate';

export default function useLimitedCandidates() {
    const dispatch = useDispatch();

    const {
        limitedCandidates,
        isLoading: {
            [GET_LIMITED_CANDIDATES_PENDING]: isLoadingLimitedCandidates
        }
    } = useSelector(candidateSelector);

    const [allLimitedCandidates, setAllLimitedCandidates] = React.useState(limitedCandidates);

    React.useEffect(() => {
        if (isLoadingLimitedCandidates || !(limitedCandidates.length > 0)) {
            dispatch(getLimitedCandidatesAsync());
        }
    }, [dispatch, isLoadingLimitedCandidates, limitedCandidates]);

    React.useEffect(() => {
        setAllLimitedCandidates(limitedCandidates);
    }, [limitedCandidates]);

    return [allLimitedCandidates, isLoadingLimitedCandidates];
}
