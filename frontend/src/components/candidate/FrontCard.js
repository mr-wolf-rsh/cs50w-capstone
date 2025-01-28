import React from 'react';

import { useDispatch } from 'react-redux';

import {
    Link as RouterLink,
    useLocation
} from "react-router-dom";

import {
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    Divider,
    Typography
} from '@mui/material';

import { updateCandidateLikeRatingAsync } from '../../slices/candidate';

import { useNavigateSearch } from '../../hooks';

import { preventPropagation } from '../../utils';

import { FavoriteCheckbox } from '../common';

const classes = {
    logo: {
        width: '100%',
        margin: '5px auto',
        borderRadius: '4px'
    },
    boxLogo: {
        display: 'flex',
        width: '30%',
        margin: '5px auto',
    },
    headerFooter: ({ palette: { neutral } }) => ({
        color: neutral.contrastText,
        background: `linear-gradient(50deg,
            ${neutral.dark} 30%, ${neutral.light} 90%)`
    }),
    linkImage: {
        display: 'flex',
        width: 'fit-content',
        height: '15.5em',
        margin: 'auto'
    },
    image: {
        objectFit: 'contain',
        borderRadius: '4px'
    },
    commonBorder: ({ primaryColor, secondaryColor }) => ({
        border: `3px outset ${secondaryColor}`,
        outline: `3px outset ${primaryColor}`,
        transition: '0.3s all ease-in'
    }),
    divider: {
        borderColor: 'transparent'
    },
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
};

export default function FrontCard({ candidateData, ...otherData }) {
    const dispatch = useDispatch();
    const navigateSearch = useNavigateSearch();

    const {
        pathname: currentPathname,
        search: currentSearch
    } = useLocation();

    const {
        campaignPlace, ticketType,
        candidateUuid,
        fullName,
        image,
        partyUuid, partyName, partyLogo,
        primaryColor, secondaryColor,
        liked, totalLikes
    } = candidateData;

    const {
        currentUser,
        candidateCard,
        cardText,
        handleFlipClick
    } = otherData;

    const [likeOptions, setLikeOptions] = React.useState({ liked, totalLikes });

    const imageWithCommonBorder = classes.commonBorder({ primaryColor, secondaryColor });

    const {
        liked: currentLiked,
        totalLikes: currentTotalLikes
    } = likeOptions;

    const upperCampaignPlace = campaignPlace.toUpperCase();
    const electionTypeCandidate = `${ticketType} Candidate`;
    const userExists = !!currentUser;

    const handleLike = (e) => {
        preventPropagation(e);
        if (userExists) {
            const { target: { value } } = e;
            dispatch(updateCandidateLikeRatingAsync({
                uuid: candidateUuid,
                type: 'liked',
                value: value
            })).unwrap()
                .then((results) => setLikeOptions(results))
                .catch(() => null);
        }
        else {
            navigateSearch('/login',
                { next: currentPathname + currentSearch });
        }
    };

    return (
        <Card sx={candidateCard}
            elevation={5}
            onClick={handleFlipClick}>
            <CardActions>
                {
                    React.cloneElement(
                        <FavoriteCheckbox />,
                        {
                            liked: currentLiked,
                            totalLikes: currentTotalLikes,
                            classLikeCheckbox: classes.likeCheckbox,
                            isValid: userExists,
                            tooltipPlacement: 'right',
                            callback: handleLike
                        }
                    )
                }
            </CardActions>
            <CardHeader
                title={
                    <Typography variant="h5">
                        {fullName}
                    </Typography>
                }
                subheader={
                    <Typography component="span" variant="body1">
                        {electionTypeCandidate}
                    </Typography>
                }
                sx={cardText}
            />
            <Box component={RouterLink} to={`/app/candidate/${candidateUuid}`}
                sx={classes.linkImage}>
                <CardMedia
                    component="img"
                    image={image}
                    alt={fullName}
                    sx={[classes.image, imageWithCommonBorder]}
                />
            </Box>
            <CardContent sx={cardText}>
                <Box style={{ padding: 20 }}>
                    <Divider sx={classes.divider} />
                    <Typography variant="body1">
                        {'Party'}
                    </Typography>
                    <Box component={RouterLink} to={`/app/party/${partyUuid}`}
                        sx={classes.boxLogo}>
                        <CardMedia
                            component="img"
                            image={partyLogo}
                            alt={partyName}
                            sx={[classes.logo, imageWithCommonBorder]}
                        />
                    </Box>
                    <Typography component="span" variant="body1">
                        {partyName}
                    </Typography>
                    <Divider sx={classes.divider} />
                </Box>
            </CardContent>
            <Typography variant="subtitle2" sx={classes.headerFooter}>
                {upperCampaignPlace}
            </Typography>
        </Card>
    );
}
