import React from 'react';

import {
    Box,
    Paper,
    Popover
} from '@mui/material';

import { ChromePicker } from 'react-color';

const classes = {
    root: {
        width: 'fit-content',
        margin: 'auto'
    },
    colorPanel: {
        padding: 5,
        cursor: 'pointer'
    },
    color: ({ currentColor }) => ({
        width: 40,
        height: 20,
        borderRadius: 2,
        background: currentColor,
    })
};

export default function ColorPicker({ setParentColor, initialColor = '#000' }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [currentColor, setCurrentColor] = React.useState(initialColor);

    const colorWithCurrentColor = classes.color({ currentColor });

    const handleClick = ({ currentTarget }) => setAnchorEl(currentTarget);

    const handleClose = () => setAnchorEl(null);

    const handleChange = (color) => setCurrentColor(color.hex);

    React.useEffect(() => setParentColor(currentColor), [currentColor, setParentColor]);

    return (
        <Paper sx={classes.root}>
            <Box sx={classes.colorPanel} onClick={handleClick}>
                <Box sx={colorWithCurrentColor} />
            </Box>
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <ChromePicker color={currentColor} onChange={handleChange} />
            </Popover>
        </Paper>
    )
}
