import React from "react";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    commonSelector,
    getElectionTypesAsync,
    GET_ELECTION_TYPES_PENDING
} from '../slices/common';

export default function useElectionTypes() {
    const dispatch = useDispatch();

    const {
        electionTypes,
        isLoading: {
            [GET_ELECTION_TYPES_PENDING]: isLoadingElectionTypes
        }
    } = useSelector(commonSelector);

    const [allElectionTypes, setAllElectionTypes] = React.useState(electionTypes);

    React.useEffect(() => {
        if (isLoadingElectionTypes || !(electionTypes.length > 0)) {
            dispatch(getElectionTypesAsync());
        }
    }, [dispatch, isLoadingElectionTypes, electionTypes]);

    React.useEffect(() => {
        setAllElectionTypes(electionTypes);
    }, [electionTypes]);

    return [allElectionTypes, isLoadingElectionTypes];
}
