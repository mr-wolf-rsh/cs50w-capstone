import React from 'react';

import { Link as RouterLink } from "react-router-dom";

import {
    Box,
    Grid,
    Link,
    Typography
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { useSelector } from "react-redux";

import ParticlesBg from 'particles-bg';

import { authSelector } from "../slices/auth";

import {
    ContainerMain,
    ThemedButton,
    Transition
} from '../components/common';

const classes = {
    root: {
        margin: 'auto',
        height: 'auto'
    },
    boxContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    grid: ({ spacing }) => ({
        margin: spacing(5, 0, 3)
    }),
    title: ({ palette: { secondary }, breakpoints }) => ({
        fontWeight: 'bold',
        userSelect: 'none',
        textAlign: 'center',
        background: `radial-gradient(ellipse, ${secondary.light} 25%,
            ${secondary.dark} 75%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        [breakpoints.between(0, 331)]: {
            fontSize: '2.5em',
        }
    })
};

export default function Home() {
    const { currentUser } = useSelector(authSelector);

    const { palette: { primary, secondary, mode: contrastMode } } = useTheme();

    return (
        <ContainerMain sx={classes.root} maxWidth="sm">
            <Transition>
                <Box sx={classes.boxContainer}>
                    <Grid container direction="column"
                        justify="center" alignItems="center"
                        sx={classes.grid}>
                        <Grid item>
                            <Typography component="div" variant="h1" sx={classes.title}>
                                <Grid item>
                                    {'V O T E R'}
                                </Grid>
                                <Grid item>
                                    {'A I D'}
                                </Grid>
                            </Typography>
                        </Grid>
                    </Grid>
                    {
                        !!currentUser ?
                            <ThemedButton variant="contained"
                                component={RouterLink} to="/app">
                                {'GO TO APP'}
                            </ThemedButton> :
                            <>
                                <ThemedButton variant="contained"
                                    component={RouterLink} to="/login">
                                    {'LOGIN'}
                                </ThemedButton>
                                <Link component={RouterLink} to="/app"
                                    color="secondary"
                                    sx={{ textDecoration: 'none' }}>
                                    {"Or skip logging in..."}
                                </Link>
                            </>

                    }
                </Box>
            </Transition>
            <ParticlesBg color={primary[contrastMode]}
                num={50} type="cobweb" bg={true} />
            <ParticlesBg color={secondary[contrastMode]}
                num={50} type="cobweb" bg={true} />
        </ContainerMain>
    );
}
