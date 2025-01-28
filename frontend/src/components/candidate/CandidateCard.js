import React from 'react';

import { useSelector } from 'react-redux';

import {
    Box,
    Zoom
} from '@mui/material';

import Flippy, {
    FrontSide,
    BackSide
} from 'react-flippy';

import { authSelector } from '../../slices/auth';

import FrontCard from './FrontCard';
import BackCard from './BackCard';

const classes = {
    root: {
        width: 'fit-content',
        margin: 'auto'
    },
    side: {
        padding: 0,
        boxShadow: 'none'
    },
    candidateCard: ({ primaryColor }) => ({
        cursor: 'pointer',
        textAlign: 'center',
        height: '100%',
        maxWidth: '22em',
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
    }
}

export default function CandidateCard({ candidateFromCampaign }) {
    const {
        currentUser
    } = useSelector(authSelector);

    const {
        candidate,
        campaignPlace,
        ticketType
    } = candidateFromCampaign;

    const {
        uuid: candidateUuid,
        firstName, lastName,
        birthday, birthplace,
        career, lastJob,
        image,
        party: {
            uuid: partyUuid, name: partyName, logo: partyLogo,
            primaryColor, secondaryColor
        },
        liked, totalLikes,
        candidateInterests
    } = candidate;

    const candidateCardWithColor = classes.candidateCard({ primaryColor });

    const [flipped, setFlipped] = React.useState(false);

    const handleFlipClick = () => setFlipped(flipped => !flipped);

    const fullName = `${firstName} ${lastName}`;

    const otherData = {
        currentUser,
        candidateCard: candidateCardWithColor,
        cardText: classes.cardText,
        handleFlipClick
    };

    return (
        <Zoom in>
            <Box sx={classes.root}>
                <Flippy flipDirection="horizontal" isFlipped={flipped} >
                    <FrontSide style={classes.side}>
                        <FrontCard
                            candidateData={{
                                campaignPlace, ticketType,
                                candidateUuid,
                                fullName,
                                image,
                                partyUuid, partyName, partyLogo,
                                primaryColor, secondaryColor,
                                liked, totalLikes
                            }}
                            {...otherData} />
                    </FrontSide>
                    <BackSide style={classes.side}>
                        <BackCard
                            candidateData={{
                                fullName,
                                birthday, birthplace,
                                career, lastJob,
                                primaryColor, secondaryColor,
                                candidateInterests
                            }}
                            {...otherData} />
                    </BackSide>
                </Flippy>
            </Box>
        </Zoom>
    );
}
