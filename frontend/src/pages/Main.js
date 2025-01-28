import React from 'react';

import { Box } from '@mui/material';

import {
    MainButtonMenu,
    ContainerMain,
    Transition
} from '../components/common';

import { VotePoll } from '../components/poll';

const classes = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    navbarColor: ({ palette: { primary, mode } }) => ({
        backgroundColor: primary[mode]
    })
}

export default function Main() {
    return (
        <Box>
            <ContainerMain sx={[classes.root, classes.navbarColor]}>
                <MainButtonMenu />
            </ContainerMain>
            <ContainerMain sx={classes.root}>
                <Transition>
                    <VotePoll />
                </Transition>
            </ContainerMain>
        </Box>
    );
}
