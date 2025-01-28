import React from 'react';

import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';

import { motion } from 'framer-motion';

import {
    useElectionTypes,
    useNavigateSearch
} from '../../hooks';

const classes = {
    cardImage: {
        filter: 'invert(100%)',
        margin: 'auto',
        maxWidth: 125,
        padding: ({ spacing }) => spacing(4)
    },
    panel: {
        width: '50%',
        margin: 'auto'
    },
    card: ({ palette: { primary, secondary } }) => ({
        height: '100%',
        background: `radial-gradient(ellipse, ${secondary.dark} 25%,
            ${secondary.light} 175%)`,
        color: primary.contrastText
    }),
    fullWidthHeight: {
        height: '100%',
        width: '100%'
    },
    loading: ({ palette: { secondary } }) => ({
        color: secondary.main
    })
};

const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

export default function MainButtonMenu() {
    const navigateSearch = useNavigateSearch();

    const [allElectionTypes, isLoadingElectionTypes] = useElectionTypes();

    const handleMenuButtonClick = (electionType) => () =>
        navigateSearch('/app/candidate', { electionType });

    const setMenuButton = ({ type, typeName, image }, i) => {
        return (
            <Grid item xs={12} sm={6} key={i}>
                <motion.div
                    variants={item}
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 1 }}
                    style={classes.fullWidthHeight}
                >
                    <Card sx={classes.card} elevation={5} square>
                        <CardActionArea
                            onClick={handleMenuButtonClick(type)}
                            sx={classes.fullWidthHeight}>
                            <CardMedia
                                component="img"
                                alt={typeName}
                                src={image}
                                title={typeName}
                                sx={classes.cardImage}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2" align="center">
                                    {typeName}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </motion.div>
            </Grid>
        );
    };

    return (
        <Grid container sx={classes.panel}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                style={classes.fullWidthHeight}
            >
                {
                    (!(allElectionTypes.length > 0) && isLoadingElectionTypes) ?
                        <Grid item xs={12}>
                            <Box sx={{
                                width: 'fit-content',
                                margin: 'auto'
                            }}>
                                <CircularProgress sx={classes.loading} />
                            </Box>
                        </Grid> :
                        <Grid container item xs={12}>
                            {
                                allElectionTypes.map((typeItem, i) => setMenuButton(typeItem, i))
                            }
                        </Grid>
                }
            </motion.div>
        </Grid>
    );
}
