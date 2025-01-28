import React from 'react';

import {
    Link as RouterLink,
    useLocation
} from "react-router-dom";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Chart from "react-apexcharts";

import { authSelector } from '../../slices/auth';

import { updateCandidateLikeRatingAsync } from '../../slices/candidate';

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
        maxWidth: '20em',
        maxHeight: '25em',
        objectFit: 'fill',
        margin: 'auto',
        width: '100%',
        height: 'auto'
    }),
    chartContainer: {
        height: '35em'
    },
    logo: {
        maxWidth: '10.5em !important'
    },
    linkLogo: {
        display: 'flex',
        width: 'fit-content',
        margin: 'auto',
    },
    centerCell: {
        alignSelf: 'center',
        textAlign: 'center'
    },
    paragraph: {
        textAlign: 'justify',
        whiteSpace: 'break-spaces'
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

export default function CandidateInfo({ candidate }) {
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
        firstName, lastName,
        birthday, birthplace,
        background,
        career, lastJob,
        image,
        party: {
            uuid: partyUuid, name: partyName, logo: partyLogo,
            primaryColor, secondaryColor
        },
        liked, totalLikes,
        rating, averageRating,
        candidateInterests
    } = candidate;

    const [likeRatingOptions, setLikeRatingOptions] = React.useState({
        liked, totalLikes,
        rating, averageRating
    });

    const {
        typography: { fontFamily },
        palette: {
            mode,
            text: { primary: textPrimary }
        }
    } = useTheme();

    const imageWithCandidateColor = classes.image({ primaryColor });

    const fullName = `${firstName} ${lastName}`;
    const userExists = !!currentUser;

    const categories = candidateInterests.map(
        (candInt) => candInt.politicalInterest.interest);

    const getInterestValues = (interests) => interests.map((int) => int.value)

    const series = [{
        name: fullName,
        data: getInterestValues(candidateInterests)
    }];

    const primaryColors = [primaryColor];
    const secondaryColors = [secondaryColor];

    if (!!currentUser) {
        const {
            color: voterColor,
            voterInterests
        } = currentUser;

        series.push({
            name: 'Me',
            data: getInterestValues(voterInterests)
        });
        primaryColors.push(voterColor);
        secondaryColors.push(voterColor);
    }

    const chartOptions = {
        legend: {
            position: 'bottom',
            fontWeight: 'bold',
            fontSize: '14px'
        },
        colors: primaryColors,
        chart: {
            fontFamily: fontFamily,
            toolbar: {
                show: false
            },
            type: 'radar',
            dropShadow: {
                enabled: true
            },
            background: 'transparent'
        },
        stroke: {
            width: 2,
            curve: ['smooth', 'straight', 'stepline']
        },
        fill: {
            opacity: 0.3,
            colors: secondaryColors
        },
        xaxis: {
            categories,
            labels: {
                show: true,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold'
                },
                rotate: 45
            }
        },
        yaxis: {
            show: false
        },
        plotOptions: {
            radar: {
                polygons: {
                    strokeWidth: 3,
                    fill: {
                        colors: ['transparent']
                    }
                }
            }
        },
        theme: {
            mode
        }
    };

    const personalInfo = {
        'Birthplace': birthplace,
        'Birthday': birthday,
        'Career': career,
        'Last Job': lastJob
    };

    const likeRatingCallback =
        (type) => (e) => {
            if (userExists) {
                const { target: { value } } = e;
                dispatch(updateCandidateLikeRatingAsync({
                    uuid,
                    type,
                    value
                })).unwrap()
                    .then((results) => setLikeRatingOptions(results))
                    .catch(() => null);
            }
            else {
                navigateSearch('/login',
                    { next: currentPathname + currentSearch });
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
                                {fullName}
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
                                    {'Bio'}
                                </SubtitleShadow>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={classes.paragraph}>
                                    {background}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={5} sx={classes.centerCell} order={{ xs: 1, md: 2 }}>
                            <CardMedia
                                component="img"
                                image={image}
                                sx={imageWithCandidateColor}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                        <Grid item container xs={12} md={7}>
                            <Grid item xs={12}>
                                <SubtitleShadow variant="h5" color={primaryColor}>
                                    {'Party'}
                                </SubtitleShadow>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h5" align="center"
                                    style={{ color: primaryColor, fontWeight: 'bold' }}>
                                    {partyName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Box component={RouterLink} to={`/app/party/${partyUuid}`}
                                    sx={classes.linkLogo}>
                                    <CardMedia
                                        component="img"
                                        image={partyLogo}
                                        alt={fullName}
                                        sx={[imageWithCandidateColor, classes.logo]}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={5}>
                            {
                                Object.entries(personalInfo).map(
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
                    </Grid>
                    <Grid item container xs={12}>
                        <Grid item xs={12} md={5}>
                            <SubtitleShadow variant="h5" color={primaryColor}>
                                {`Comparison between ${firstName} and Me`}
                            </SubtitleShadow>
                        </Grid>
                        <Grid item container xs={12}>
                            <Grid item xs sx={classes.chartContainer}>
                                <Chart width="100%" height="100%" options={chartOptions} series={series} type="radar" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
