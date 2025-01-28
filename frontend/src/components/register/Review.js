import React from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    Grid,
    Typography
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Chart from "react-apexcharts";

import {
    registrationSelector,
    registerAsync
} from '../../slices/registration';

import { SubtitleShadow } from '../common';

const classes = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    chartContainer: {
        height: '25em'
    },
    centerCell: {
        alignSelf: 'center',
        textAlign: 'center'
    }
};

function Review({ handleKeyPress }, parentRef) {
    const dispatch = useDispatch();

    const {
        personalInfo: {
            firstName,
            lastName,
            email
        },
        voterInfo: {
            color,
            voterInterests
        }
    } = useSelector(registrationSelector);

    const { typography: { fontFamily },
        palette: { mode } } = useTheme();

    const series = [{
        name: 'Me',
        data: voterInterests.map((interest) => interest.value)
    }];

    const chartOptions = {
        legend: {
            fontWeight: 'bold',
            fontSize: '14px'
        },
        colors: [color],
        chart: {
            fontFamily: fontFamily,
            toolbar: {
                show: false
            },
            type: 'radar',
            dropShadow: {
                enabled: true
            }
        },
        stroke: {
            width: 2,
            curve: ['smooth', 'straight', 'stepline']
        },
        fill: {
            opacity: 0.3
        },
        xaxis: {
            categories: voterInterests.map((interest) => interest.name),
            labels: {
                show: true,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold'
                }
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

    const handleSubmitButton = React.useCallback(
        (successCallback) => {
            dispatch(registerAsync()).unwrap()
                .then(() => successCallback())
                .catch(() => null);
        }, [dispatch]);

    React.useImperativeHandle(parentRef, () => ({
        handleReviewSubmit: (successCallback) =>
            handleSubmitButton(successCallback)
    }), [handleSubmitButton]);

    return (
        <Box sx={classes.root}
            onKeyPress={handleKeyPress} tabIndex="0">
            <Grid container item xs={12} spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        {'Summary'}
                    </Typography>
                </Grid>
                <Grid container item xs={12}>
                    <Grid item xs={12} sm={6} sx={classes.centerCell}>
                        <SubtitleShadow variant="h6" color={color}>
                            {'Full Name'}
                        </SubtitleShadow>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={classes.centerCell}>
                        <Typography variant="subtitle1">
                            {`${firstName} ${lastName}`}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container item xs={12}>
                    <Grid item xs={12} sm={6} sx={classes.centerCell}>
                        <SubtitleShadow variant="h6" color={color}>
                            {'E-mail'}
                        </SubtitleShadow>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={classes.centerCell}>
                        <Typography variant="subtitle1">
                            {email}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        {'And your chart:'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={classes.chartContainer}>
                    <Chart width="100%" height="100%" options={chartOptions} series={series} type="radar" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default React.forwardRef(Review);
