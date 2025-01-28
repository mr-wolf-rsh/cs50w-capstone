import React from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import { useLocation } from "react-router-dom";

import {
    Card,
    CardContent,
    CardMedia,
    Grid,
    Link,
    Typography
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { authSelector } from '../../slices/auth';

import { updatePartyLikeRatingAsync } from '../../slices/party';

import { useNavigateSearch } from '../../hooks';

import {
    FavoriteCheckbox,
    StarRating,
    SubtitleShadow
} from '../common';

const classes = {
    card: ({ spacing }) => ({
        "& .MuiGrid-item": {
            padding: spacing(1.75)
        }
    }),
    image: ({ primaryColor }) => ({ spacing }) => ({
        border: `5px outset ${primaryColor}`,
        borderRadius: spacing(2),
        maxWidth: '17em',
        objectFit: 'fill',
        margin: 'auto',
        width: '100%',
        height: 'auto'
    }),
    centerCell: {
        alignSelf: 'center',
        textAlign: 'center'
    },
    paragraph: {
        textAlign: 'justify',
        whiteSpace: 'break-spaces'
    },
    banner: {
        maxHeight: '25em',
        maxWidth: '100% !important'
    },
    likeCheckbox: (color, checkedColor) => ({
        display: 'flex',
        width: 'fit-content',
        margin: 'auto',
        '& svg': {
            fontSize: '2.25em'
        },
        color,
        '&.Mui-checked': {
            color: checkedColor
        }
    })
};

export default function PartyInfo({ party }) {
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
        uuid,
        name,
        logo, banner,
        foundationDate,
        background,
        leader, governmentPlan,
        headquarters, spectrum, ideologies,
        primaryColor,
        liked, totalLikes,
        rating, averageRating
    } = party;

    const [likeRatingOptions, setLikeRatingOptions] = React.useState({
        liked, totalLikes,
        rating, averageRating
    });

    const {
        palette: {
            text: { primary: textPrimary }
        }
    } = useTheme();

    const imageWithPartyColor = classes.image({ primaryColor });

    const userExists = !!currentUser;
    const govPlanFilename = name.toLowerCase().replace(' ', '_')
        .concat('_gov_plan', '.', governmentPlan.split('.').pop());

    const partyInfo = {
        'Headquarters': headquarters,
        'Foundation Date': foundationDate,
        'Political Position': spectrum,
        'Government Plan':
            <Link href={governmentPlan}
                color={primaryColor}>
                {govPlanFilename}
            </Link>
    };

    const likeRatingCallback =
        (type) => (e) => {
            if (userExists) {
                const { target: { value } } = e;
                dispatch(updatePartyLikeRatingAsync({
                    uuid,
                    type,
                    value
                })).unwrap()
                    .then((results) => setLikeRatingOptions(results))
                    .catch(() => null);
            }
            else {
                navigateSearch('/login', { next: currentPathname + currentSearch });
            }
        }

    return (
        <Card sx={classes.card} elevation={0} square>
            <CardContent>
                <Grid container>
                    <Grid item container xs={12}>
                        <Grid item xs={12} sm>
                            <SubtitleShadow variant="h2" align="center"
                                color={primaryColor}>
                                {name}
                            </SubtitleShadow>
                        </Grid>
                        <Grid item xs={12} sm={5} sx={classes.centerCell}>
                            {
                                React.cloneElement(
                                    <FavoriteCheckbox />,
                                    {
                                        liked: likeRatingOptions.liked,
                                        totalLikes: likeRatingOptions.totalLikes,
                                        classLikeCheckbox: classes.likeCheckbox(textPrimary, primaryColor),
                                        isValid: userExists,
                                        tooltipPlacement: 'right',
                                        callback: likeRatingCallback('liked')
                                    }
                                )
                            }
                            {
                                React.cloneElement(
                                    <StarRating />,
                                    {
                                        rating: likeRatingOptions.rating,
                                        averageRating: likeRatingOptions.averageRating,
                                        color: primaryColor,
                                        callback: likeRatingCallback('rating')
                                    }
                                )
                            }
                        </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                        <Grid item container xs={12} md={7} order={{ xs: 2, md: 1 }}>
                            <Grid item xs={12}>
                                <SubtitleShadow variant="h5" color={primaryColor}>
                                    {'Background'}
                                </SubtitleShadow>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={classes.paragraph}>
                                    {background}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={5} sx={classes.centerCell} order={{ xs: 1, md: 2 }}>
                            <Grid item xs={12}>
                                <CardMedia
                                    component="img"
                                    image={logo}
                                    sx={imageWithPartyColor}
                                />
                            </Grid>
                            <Grid item container xs={12}>
                                <Grid item xs={12} sx={classes.centerCell}>
                                    <SubtitleShadow variant="h5" color={primaryColor}>
                                        {'President/Leader'}
                                    </SubtitleShadow>
                                </Grid>
                                <Grid item xs={12} sx={classes.centerCell}>
                                    <Typography variant="h6">
                                        {leader}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                        <Grid item container xs={12} md={7}>
                            {
                                Object.entries(partyInfo).map(
                                    ([key, value], i) =>
                                        <Grid item container xs={12} key={i}>
                                            <Grid item xs={5} sx={classes.centerCell}>
                                                <SubtitleShadow variant="h5" color={primaryColor}>
                                                    {key}
                                                </SubtitleShadow>
                                            </Grid>
                                            <Grid item xs={7} sx={classes.centerCell}>
                                                <Typography variant="h6">
                                                    {value}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                )
                            }
                        </Grid>
                        <Grid item container xs={12} md={5}>
                            <Grid item xs={12} sx={classes.centerCell}>
                                <SubtitleShadow variant="h5" color={primaryColor}>
                                    {'Ideologies'}
                                </SubtitleShadow>
                            </Grid>
                            <Grid item xs={12} sx={classes.centerCell}>
                                {
                                    ideologies.map((val, i) =>
                                        <Typography key={i} variant="h6">
                                            {val}
                                        </Typography>
                                    )
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                        <CardMedia
                            component="img"
                            image={banner}
                            sx={[imageWithPartyColor, classes.banner]}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
