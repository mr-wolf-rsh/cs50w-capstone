import React from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';

import {
    commonSelector,
    getPoliticalInterestsAsync,
    GET_POLITICAL_INTERESTS_PENDING
} from '../../slices/common';

import {
    registrationSelector,
    setVoterInfo
} from '../../slices/registration';

import { ColorPicker } from '../common';

import { DEFAULT_USER_COLOR } from '../../utils';

import CustomizedSlider from './CustomizedSlider';

const classes = {
    root: {
        display: 'flex',
        flexDirection: 'column',
    }
};

function VoterInfo({ handleKeyPress }, parentRef) {
    const upperBound = 10;
    const lowerBound = 0;

    const setLimit = (array) => array.length * (upperBound / 2);

    const dispatch = useDispatch();

    const {
        voterInfo: {
            color,
            voterInterests
        }
    } = useSelector(registrationSelector);

    const {
        politicalInterests,
        isLoading: {
            [GET_POLITICAL_INTERESTS_PENDING]: isLoadingPoliticalInterests
        }
    } = useSelector(commonSelector);

    const [currentColor, setCurrentColor] = React.useState(color ?? DEFAULT_USER_COLOR);
    const [currentInterests, setCurrentInterests] = React.useState(voterInterests);
    const [currentLimit, setCurrentLimit] = React.useState(setLimit(voterInterests));

    React.useEffect(() => {
        if (!voterInterests.length) {
            dispatch(getPoliticalInterestsAsync());
        }
    }, [dispatch, voterInterests]);

    React.useEffect(() => {
        if (!voterInterests.length) {
            setCurrentInterests(
                politicalInterests.map(
                    ({ uuid, interest }) => ({
                        uuid,
                        name: interest,
                        value: 0
                    }))
            );
            setCurrentLimit(
                setLimit(politicalInterests)
            );
        }
    }, [voterInterests, politicalInterests]);

    const totalAvailable = currentLimit - currentInterests.reduce(
        (result, element) => result + element.value, 0)

    const handleSubmitButton = React.useCallback(
        (successCallback) => {
            const voterInfo = {
                color: currentColor,
                voterInterests: currentInterests
            };
            dispatch(setVoterInfo(voterInfo));
            successCallback();
        }, [dispatch, currentColor, currentInterests]);

    React.useImperativeHandle(parentRef, () => ({
        handleVoterInfoSubmit: (successCallback) =>
            handleSubmitButton(successCallback)
    }), [handleSubmitButton]);

    return (
        <Box sx={classes.root}
            onKeyPress={handleKeyPress} tabIndex="0">
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        {'Choose a color!'}
                    </Typography>
                    <ColorPicker setParentColor={setCurrentColor}
                        initialColor={currentColor} />
                </Grid>
                <Grid container item xs={12} spacing={4}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            {'Now, your political interests'}
                        </Typography>
                    </Grid>
                    {
                        (!(currentInterests.length > 0) && isLoadingPoliticalInterests) ?
                            <Grid item xs={12}>
                                <Box sx={{
                                    width: 'fit-content',
                                    margin: 'auto'
                                }}>
                                    <CircularProgress sx={{ color: currentColor }} />
                                </Box>
                            </Grid> :
                            currentInterests.map((interestItem) => (
                                <Grid key={interestItem.uuid} item xs={12}>
                                    <CustomizedSlider
                                        setAllSliders={setCurrentInterests}
                                        totalAvailable={totalAvailable}
                                        color={currentColor}
                                        upperBound={upperBound}
                                        lowerBound={lowerBound}
                                        initialSliderItem={interestItem} />
                                </Grid>
                            ))
                    }
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        {'Available Points: ' + totalAvailable}
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default React.forwardRef(VoterInfo);
