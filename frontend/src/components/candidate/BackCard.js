import React from 'react';

import {
    Card,
    CardContent,
    Divider,
    Grid,
    Typography
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Chart from "react-apexcharts";

const classes = {
    fullHeight: {
        height: '100%'
    },
    halfHeight: {
        height: '50%'
    },
    gridDisplay: {
        display: 'grid',
        marginLeft: 0
    },
    divider: {
        borderColor: 'transparent'
    }
};

export default function BackCard({ candidateData, ...otherData }) {
    const {
        fullName,
        birthday, birthplace,
        career, lastJob,
        primaryColor, secondaryColor,
        candidateInterests
    } = candidateData;

    const {
        currentUser,
        candidateCard,
        cardText,
        handleFlipClick
    } = otherData;

    const { typography: { fontFamily },
        palette: { mode } } = useTheme();

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
            fontSize: '14px',
            labels: {
                colors: '#000'
            }
        },
        colors: primaryColors,
        chart: {
            fontFamily,
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
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    colors: new Array(6).fill('#0000008a')
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
                    strokeColors: '#0000008a',
                    connectorColors: '#0000008a',
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
        'Birthday': birthday,
        'Birthplace': birthplace,
        'Career': career,
        'Last Job': lastJob
    };

    return (
        <Card sx={candidateCard}
            elevation={5}
            onClick={handleFlipClick}>
            <CardContent sx={classes.fullHeight}
                style={{ padding: 10 }}>
                <Grid container direction="column"
                    justify="space-evenly" alignItems="center"
                    sx={classes.fullHeight}
                >
                    <Grid item container
                        spacing={2}
                        sx={[
                            classes.halfHeight,
                            classes.gridDisplay,
                            cardText
                        ]}
                    >
                        {
                            Object.entries(personalInfo).map(
                                ([key, value], i) =>
                                    <Grid item key={i}>
                                        <Typography variant="body1">
                                            {key}
                                        </Typography>
                                        <Typography component="span" variant="body1">
                                            {value}
                                        </Typography>
                                    </Grid>
                            )
                        }
                    </Grid>
                    <Divider sx={classes.divider} />
                    <Grid item sx={classes.halfHeight}>
                        <Chart width="100%" height="90%" options={chartOptions} series={series} type="radar" />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
