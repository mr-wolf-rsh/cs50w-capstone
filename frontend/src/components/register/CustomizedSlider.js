import React from 'react';

import {
    Grid,
    Input,
    Slider,
    Typography
} from '@mui/material';

const classes = {
    root: ({ color }) => ({
        color,
        height: 5,
        '& .MuiSlider-track': {
            border: 'none',
        },
        '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: `2px solid ${color}`,
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit',
            },
            '&:before': {
                display: 'none',
            },
        },
        '& .MuiSlider-valueLabel': {
            lineHeight: 1.2,
            fontSize: 12,
            background: 'unset',
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: '50% 50% 50% 0',
            backgroundColor: `${color}`,
            transformOrigin: 'bottom left',
            transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
            '&:before': { display: 'none' },
            '&.MuiSlider-valueLabelOpen': {
                transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
            },
            '& > *': {
                transform: 'rotate(45deg)',
            }
        }
    })
};

export default function CustomizedSlider({ setAllSliders, totalAvailable, color,
    upperBound, lowerBound, initialSliderItem }) {
    const fillBounds = (bound) => Array.from({ length: bound + 1 }, (_, i) => ({ value: i }));
    const setBounds = (value) => Math.max(Math.min(upperBound, value), lowerBound);
    const setAvailableBounds = (oldValue, newValue) =>
        (totalAvailable < 1 && oldValue < newValue) ?
            oldValue + totalAvailable : setBounds(newValue);

    const rootWithColor = classes.root({ color });

    const [sliderItem, setSliderItem] = React.useState(initialSliderItem);
    const [marks, setMarks] = React.useState(fillBounds(upperBound));

    const sliderName = sliderItem.name;
    const sliderValue = sliderItem.value;

    React.useEffect(() => setAllSliders((prevSliders) =>
        prevSliders.map((currentSlider) =>
            (currentSlider.uuid === sliderItem.uuid) ? sliderItem : currentSlider)),
        [sliderItem, setAllSliders]);

    const handleSliderChange = (_, newValue) => {
        setSliderItem(
            (prevSlider) => ({
                ...prevSlider,
                value: setAvailableBounds(prevSlider.value, newValue)
            }));
        setMarks(fillBounds(upperBound).slice(lowerBound,
            ((totalAvailable < 1) ? sliderValue : upperBound) + 1))
    };

    const handleInputChange = ({ target: { value } }) => {
        setSliderItem(
            (prevSlider) => ({
                ...prevSlider,
                value: (value && setAvailableBounds(prevSlider.value, +value)) ?? 0
            }));
    };

    return (
        <React.Fragment>
            <Typography gutterBottom>
                {sliderName}
            </Typography>
            <Grid container spacing={4} alignItems="center">
                <Grid item xs>
                    <Slider sx={rootWithColor}
                        marks={marks}
                        step={null}
                        valueLabelDisplay="auto"
                        value={typeof sliderValue === 'number' ? sliderValue : lowerBound}
                        onChange={handleSliderChange}
                        min={lowerBound}
                        max={upperBound} />
                </Grid>
                <Grid item>
                    <Input
                        value={sliderValue}
                        margin="dense"
                        onChange={handleInputChange}
                        inputProps={{
                            step: 1,
                            min: lowerBound,
                            max: upperBound,
                            type: 'number',
                            style: { fontSize: '1.1em' }
                        }}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
