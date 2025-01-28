import React from 'react';

import { Grid } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Chart from 'react-apexcharts';

const classes = {
    chartContainer: {
        height: '35em'
    }
};

export default function PollResult({ campaigns, width, height }) {
    const { typography,
        palette: { mode } } = useTheme();

    const primaryColors = campaigns.map(({ primaryColor }) => primaryColor);
    const names = campaigns.map(({ firstName, lastName }) => `${firstName} ${lastName}`);
    const series = campaigns.map(({ result }) => result);

    const chartOptions = {
        legend: {
            position: 'bottom',
            fontWeight: 'bold',
            fontSize: '14px'
        },
        labels: names,
        colors: primaryColors,
        chart: {
            fontFamily: typography.fontFamily,
            toolbar: {
                show: false
            },
            type: 'pie',
            dropShadow: {
                enabled: true
            }
        },
        theme: {
            mode
        },
        stroke: {
            width: 2,
            colors: primaryColors,
            curve: ['smooth', 'straight', 'stepline']
        }
    };

    return (
        <Grid container>
            <Grid item xs sx={classes.chartContainer}>
                <Chart width={width} height={height} options={chartOptions} series={series} type="pie" />
            </Grid>
        </Grid>
    );
}
