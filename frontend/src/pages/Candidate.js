import React from 'react';

import { useParams } from "react-router-dom";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    CircularProgress
} from '@mui/material';

import { ContainerMain } from '../components/common';

import { CandidateInfo } from '../components/candidate';

import {
    candidateSelector,
    getCandidateAsync,
    GET_CANDIDATE_PENDING,
    reset
} from '../slices/candidate';

const classes = {
    root: {
        height: 'auto',
        padding: 0
    },
    loading: ({ palette: { secondary } }) => ({
        color: secondary.main
    })
};

export default function Candidate() {
    const { uuid } = useParams();

    const dispatch = useDispatch();

    const {
        candidate,
        isLoading: {
            [GET_CANDIDATE_PENDING]: isLoadingCandidate
        }
    } = useSelector(candidateSelector);

    React.useEffect(() => {
        return () => dispatch(reset());
        // eslint-disable-next-line
    }, [])

    React.useEffect(() => {
        if (!!uuid && !isLoadingCandidate) {
            dispatch(getCandidateAsync({ uuid }));
        }
        // eslint-disable-next-line
    }, [dispatch, uuid]);

    return (
        <ContainerMain sx={classes.root}>
            {
                (isLoadingCandidate || !candidate) ?
                    <Box sx={{
                        width: 'fit-content',
                        margin: '50px auto'
                    }}>
                        <CircularProgress sx={classes.loading} />
                    </Box> :
                    <CandidateInfo candidate={candidate} />
            }
        </ContainerMain >
    );
}
