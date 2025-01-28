import React from 'react';

import { useParams } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';

import {
    Box,
    CircularProgress
} from '@mui/material';

import { ContainerMain } from '../components/common';

import { PartyInfo } from '../components/party';

import {
    partySelector,
    getPartyAsync,
    GET_PARTY_PENDING,
    reset
} from '../slices/party';

const classes = {
    root: {
        height: 'auto',
        padding: 0
    },
    loading: ({ palette: { secondary } }) => ({
        color: secondary.main
    })
};

export default function Party() {
    const { uuid } = useParams();

    const dispatch = useDispatch();

    const {
        party,
        isLoading: {
            [GET_PARTY_PENDING]: isLoadingParty
        }
    } = useSelector(partySelector);

    React.useEffect(() => {
        return () => dispatch(reset());
        // eslint-disable-next-line
    }, [])

    React.useEffect(() => {
        if (!!uuid && !isLoadingParty) {
            dispatch(getPartyAsync({ uuid }));
        }
        // eslint-disable-next-line
    }, [dispatch, uuid]);

    return (
        <ContainerMain sx={classes.root}>
            {
                (isLoadingParty || !party) ?
                    <Box sx={{
                        width: 'fit-content',
                        margin: '50px auto'
                    }}>
                        <CircularProgress sx={classes.loading} />
                    </Box> :
                    <PartyInfo party={party} />
            }
        </ContainerMain >
    );
}
