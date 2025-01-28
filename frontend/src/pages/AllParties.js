import React from 'react';

import { useSearchParams } from "react-router-dom";

import { Grid } from '@mui/material';

import {
    ContainerMain,
    PeriodTitle
} from '../components/common';

import {
    PartyList,
    PartySearchBar
} from '../components/party';

import { removeFieldsFromObject } from '../utils';

const classes = {
    root: {
        height: 'auto',
        margin: 'auto'
    }
}

export default function AllParties() {
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        name = '',
        page = ''
    } = Object.fromEntries(searchParams);

    const [partyFilter, setPartyFilter] = React.useState(removeFieldsFromObject({ name, page }));

    React.useEffect(() => {
        setPartyFilter((prevPartyFilter) => removeFieldsFromObject({
            ...prevPartyFilter,
            ...{ name, page }
        }))
    }, [name, page]);

    React.useEffect(() => {
        setSearchParams((prevSearchParams) => ({ ...prevSearchParams, ...partyFilter }));
    }, [setSearchParams, partyFilter]);

    return (
        <ContainerMain sx={classes.root}>
            <Grid container spacing={5}>
                <Grid item container xs={12}>
                    <PeriodTitle title={'Parties'} />
                </Grid>
                <Grid item container xs={12}>
                    <PartySearchBar
                        partyFilter={partyFilter}
                        setPartyFilter={setPartyFilter} />
                </Grid>
                <Grid item container xs={12}
                    sx={{ display: "initial" }}>
                    <PartyList partyFilter={partyFilter}
                        setPartyFilter={setPartyFilter} />
                </Grid>
            </Grid>
        </ContainerMain>
    );
}
