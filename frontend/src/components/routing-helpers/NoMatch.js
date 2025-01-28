import React from "react";

import { Link as RouterLink } from "react-router-dom";

import {
    Box,
    Grid,
    Link
} from '@mui/material';

import { motion } from "framer-motion";

const loadingContainer = {
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-around',
    overflow: 'visible'
};

const loadingContainerVariants = {
    start: {
        transition: {
            staggerChildren: 0.2
        }
    },
    end: {
        transition: {
            staggerChildren: 0.2
        }
    }
};

const loadingCircleVariants = {
    start: {
        y: "-20%"
    },
    end: {
        y: "30%"
    }
};

const loadingCircleTransition = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
};

const classes = {
    root: ({ spacing }) => ({
        margin: spacing(4),
        width: '100%'
    }),
    gridRoot: {
        margin: 0,
        width: '100%'
    },
    boxRoot: ({ palette: { secondary: { main: secondaryMain } } }) => ({
        fontSize: '20em',
        color: secondaryMain,
        alignSelf: 'center',
        justifySelf: 'center',
        "&>div": {
            overflow: 'visible',
            userSelect: 'none',
            justifyContent: 'center !important'
        },
        WebkitTextStrokeWidth: '0.1px',
        WebkitTextStrokeColor: '#000'
    }),
    gridLink: {
        justifyContent: 'center',
        marginTop: '3em'
    }
};

const NoMatch = React.memo(
    function NoMatch() {
        return (
            <Box sx={classes.root}>
                <Grid container direction="column" spacing={2} sx={classes.gridRoot}>
                    <Grid item>
                        <Box sx={classes.boxRoot}>
                            <motion.div
                                style={loadingContainer}
                                variants={loadingContainerVariants}
                                initial="start"
                                animate="end"
                            >
                                {
                                    ["4", "0", "4"].map(
                                        (digit, i) =>
                                            <motion.span key={i}
                                                variants={loadingCircleVariants}
                                                transition={loadingCircleTransition}
                                            >
                                                {digit}
                                            </motion.span>
                                    )
                                }
                            </motion.div>
                        </Box>
                    </Grid>
                    <Grid item container spacing={2} style={classes.gridLink}>
                        <Grid item>
                            <h3>
                                {'Well, this is unexpected...'}
                            </h3>
                        </Grid>
                        <Grid item>
                            <h3>
                                <Link component={RouterLink} to="/" replace>
                                    {"Go to main page!"}
                                </Link>
                            </h3>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        );
    }
);

export default NoMatch;
