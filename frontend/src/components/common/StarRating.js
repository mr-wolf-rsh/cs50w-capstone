import React from 'react';

import {
    Badge,
    Rating,
} from '@mui/material';

import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function StarRating({
    rating, averageRating,
    color,
    callback
}) {
    return (
        React.cloneElement(
            <Badge />,
            {
                badgeContent: (averageRating > 0 &&
                    averageRating.toFixed(1)) || 0,
                color: 'primary',
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }
            },
            React.cloneElement(
                <Rating />,
                {
                    precision: 0.5,
                    value: rating,
                    onChange: callback,
                    emptyIcon: React.cloneElement(
                        <StarBorderIcon />,
                        {
                            sx: {
                                color: ({ palette: { text: { primary: textPrimary } } }) => textPrimary,
                                fontSize: 'inherit'
                            }
                        }
                    ),
                    sx: { color, fontSize: '2.5em' }
                }
            )
        )
    );
}
