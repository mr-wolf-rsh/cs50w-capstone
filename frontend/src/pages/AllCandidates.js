import React from 'react';

import { useSearchParams } from "react-router-dom";

import { Grid } from '@mui/material';

import {
    ContainerMain,
    PeriodTitle
} from '../components/common';

import {
    CandidateList,
    CandidateSearchBar
} from '../components/candidate';

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

export default function AllCandidates() {
    const [searchParams, setSearchParams] = useSearchParams();

    const unwrappedSearchParams = Object.fromEntries(searchParams);

    const {
        electionType = '',
        name = '',
        party = '',
        page = ''
    } = unwrappedSearchParams;

    const [candidateFilter, setCandidateFilter] = React.useState(removeFieldsFromObject({ electionType, name, party, page }));

    React.useEffect(() => {
        if (!isEqual(candidateFilter, unwrappedSearchParams)) {
            setCandidateFilter((prevCandidateFilter) => removeFieldsFromObject({
                ...prevCandidateFilter,
                ...unwrappedSearchParams
            }));
        }
        // eslint-disable-next-line
    }, [searchParams]);

    React.useEffect(() => {
        if (!isEqual(candidateFilter, unwrappedSearchParams)) {
            setSearchParams((prevSearchParams) => ({
                ...prevSearchParams,
                ...candidateFilter
            }));
        }
        // eslint-disable-next-line
    }, [candidateFilter]);

    return (
        <ContainerMain sx={classes.root}>
            <Grid container spacing={5}>
                <Grid item container xs={12}>
                    <PeriodTitle title={'Candidates'} />
                </Grid>
                <Grid item container xs={12}>
                    <CandidateSearchBar
                        candidateFilter={candidateFilter}
                        setCandidateFilter={setCandidateFilter} />
                </Grid>
                <Grid item container xs={12}
                    sx={{ display: "initial" }}>
                    <CandidateList candidateFilter={candidateFilter}
                        setCandidateFilter={setCandidateFilter} />
                </Grid>
            </Grid>
        </ContainerMain>
    );
}
