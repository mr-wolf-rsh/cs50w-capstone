import React from 'react';

import { useSearchParams } from "react-router-dom";

import { Grid } from '@mui/material';

import {
    ContainerMain,
    PeriodTitle
} from '../components/common';

import { PollList } from '../components/poll';

import {
    isEqual,
    removeFieldsFromObject
} from '../utils';

const classes = {
    root: {
        height: 'auto',
        margin: 'auto'
    }
}

export default function AllPolls() {
    const [searchParams, setSearchParams] = useSearchParams();

    const unwrappedSearchParams = Object.fromEntries(searchParams);

    const {
        page = ''
    } = unwrappedSearchParams;

    const [pollFilter, setPollFilter] = React.useState(removeFieldsFromObject({ page }));

    React.useEffect(() => {
        if (!isEqual(pollFilter, unwrappedSearchParams)) {
            setPollFilter((prevPollFilter) => removeFieldsFromObject({
                ...prevPollFilter,
                ...{ page }
            }));
        }
        // eslint-disable-next-line
    }, [searchParams]);

    React.useEffect(() => {
        if (!isEqual(pollFilter, unwrappedSearchParams)) {
            setSearchParams((prevSearchParams) =>
                ({ ...prevSearchParams, ...pollFilter }));
        }
        // eslint-disable-next-line
    }, [pollFilter]);

    return (
        <ContainerMain sx={classes.root}>
            <Grid container spacing={5}>
                <Grid item container xs={12}>
                    <PeriodTitle title={'Polls'} />
                </Grid>
                <Grid item container xs={12}
                    sx={{ display: "initial" }}>
                    <PollList pollFilter={pollFilter}
                        setPollFilter={setPollFilter} />
                </Grid>
            </Grid>
        </ContainerMain>
    );
}
