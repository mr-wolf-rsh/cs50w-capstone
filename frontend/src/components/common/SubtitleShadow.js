import React from 'react';

import Typography from '@mui/material/Typography';

const classes = {
    root: ({ color }) => ({ palette: { mode, text: { primary: textPrimary } } }) => {
        // Bitwise OR operator: true | 0 = 1; false | 0 = 0;
        const isDarkMode = (mode === 'dark') | 0;
        return {
            textShadow: `0.15em 0.15em 0.25em ${[textPrimary, color][isDarkMode]}`,
            color: [color, textPrimary][isDarkMode]
        }
    }
};

const SubtitleShadow = React.memo(
    function SubtitleShadow({ color, children, ...rest }) {
        const rootWithColor = classes.root({ color });

        const { sx, ...newRest } = rest;

        return (
            <Typography sx={[rootWithColor, sx]} {...newRest}>
                {children}
            </Typography>
        );
    }
);

export default SubtitleShadow;
