import React from 'react';

import {
    Badge,
    Checkbox,
    Tooltip
} from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function FavoriteCheckbox({
    liked, totalLikes,
    classLikeCheckbox,
    isValid, tooltipPlacement,
    callback
}) {
    const setBadge = (iconComponent) =>
        React.cloneElement(
            <Badge />,
            {
                badgeContent: totalLikes,
                color: 'primary',
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }
            },
            iconComponent
        );

    return (
        React.cloneElement(
            <Tooltip><></></Tooltip>,
            {
                title: isValid ?
                    (liked ?
                        'Unlike' : 'Like!') :
                    'Sign in to like this!',
                placement: tooltipPlacement,
                arrow: true
            },
            React.cloneElement(
                <Checkbox />,
                {
                    checked: isValid && liked,
                    onClick: callback,
                    checkedIcon: setBadge(<FavoriteIcon />),
                    icon: setBadge(<FavoriteBorderIcon />),
                    sx: classLikeCheckbox
                }
            )
        )
    );
}
