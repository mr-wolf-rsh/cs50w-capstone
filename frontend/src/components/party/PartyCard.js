import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from "react-router-dom";

import {
    Box,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
    Zoom
} from '@mui/material';

import { authSelector } from '../../slices/auth';
import { updatePartyLikeRatingAsync } from '../../slices/party';

import { useNavigateSearch } from '../../hooks';

import { preventPropagation } from '../../utils';

import { FavoriteCheckbox } from '../common';

const classes = {
    root: {
        width: 'fit-content',
        margin: 'auto'
    },
    partyCard: ({ primaryColor }) => ({
        cursor: 'pointer',
        textAlign: 'center',
        height: '100%',
        maxWidth: '15em',
        background: `radial-gradient(circle, #fff -150%, ${primaryColor} 180%)`
    }),
    cardText: {
        "& h5,p,span": {
            fontWeight: 'bold',
            color: '#000'
        },
        "& span": {
            color: '#0000008a'
        }
    },
    logo: {
        width: '100%',
        margin: '5px auto',
        borderRadius: '4px'
    },
    boxLogo: {
        display: 'flex',
        width: '50%',
        margin: '5px auto',
    },
    side: {
        padding: 0,
        boxShadow: 'none'
    },
    commonBorder: ({ primaryColor, secondaryColor }) => ({
        border: `3px outset ${secondaryColor}`,
        outline: `3px outset ${primaryColor}`,
        transition: '0.3s all ease-in'
    }),
    likeCheckbox: ({ palette: { neutral } }) => ({
        display: 'flex',
        marginLeft: 'auto',
        '& svg': {
            fontSize: '2.25em'
        },
        color: neutral.main,
        '&.Mui-checked': {
            color: neutral.main,
        }
    })
}

export default function PartyCard({ party }) {
    const dispatch = useDispatch();
    const navigateSearch = useNavigateSearch();

    const {
        pathname: currentPathname,
        search: currentSearch
    } = useLocation();

    const {
        currentUser
    } = useSelector(authSelector);

    const {
        uuid: partyUuid,
        name: partyName,
        logo,
        primaryColor, secondaryColor,
        liked, totalLikes
    } = party;

    const [likeOptions, setLikeOptions] = React.useState({ liked, totalLikes });

    const partyCardWithColor = classes.partyCard({ primaryColor });

    const imageWithCommonBorder = classes.commonBorder({ primaryColor, secondaryColor });

    const {
        liked: currentLiked,
        totalLikes: currentTotalLikes
    } = likeOptions;

    const userExists = !!currentUser;

    const handleLike = (e) => {
        preventPropagation(e);
        if (userExists) {
            const { target: { value } } = e;
            dispatch(updatePartyLikeRatingAsync({
                uuid: partyUuid,
                type: 'liked',
                value: value
            })).unwrap()
                .then((results) => setLikeOptions(results))
                .catch(() => null);
        }
        else {
            navigateSearch('/login', { next: currentPathname + currentSearch });
        }
    };

    const handleClick = () => navigateSearch(`/app/party/${partyUuid}`);

    return (
        <Zoom in>
            <Box sx={classes.root}>
                <Card sx={[partyCardWithColor, classes.side]}
                    elevation={5}>
                    <CardActions>
                        {
                            React.cloneElement(
                                <FavoriteCheckbox />,
                                {
                                    liked: currentLiked,
                                    totalLikes: currentTotalLikes,
                                    classLikeCheckbox: classes.likeCheckbox,
                                    isValid: userExists,
                                    tooltipPlacement: 'left',
                                    callback: handleLike
                                }
                            )
                        }
                    </CardActions>
                    <CardActionArea
                        onClick={handleClick}>
                        <CardContent sx={classes.cardText}>
                            <Box>
                                <Typography variant="h5">
                                    {partyName}
                                </Typography>
                                <Box sx={classes.boxLogo}>
                                    <CardMedia
                                        component="img"
                                        image={logo}
                                        alt={partyName}
                                        sx={[classes.logo, imageWithCommonBorder]}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        </Zoom>
    );
}
