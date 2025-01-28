import React from 'react';

import { useNavigate } from "react-router-dom";

import { useDispatch } from 'react-redux';

import {
    Avatar,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';

import Logout from '@mui/icons-material/Logout';

import { logoutAsync } from '../../slices/auth';

const classes = {
    avatar: ({ userColor }) => ({
        fontSize: '0.75em',
        fontWeight: 'bold',
        background: `radial-gradient(ellipse, white -15%,
            ${userColor} 70%)`
    }),
    menuItem: ({ palette: { primary } }) => ({
        opacity: 'initial !important',
        color: primary.main
    })
};

export default function AccountMenu({ currentUser }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const avatarWithColor = classes.avatar({ userColor: currentUser.color })

    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = !!anchorEl;
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () =>
        dispatch(logoutAsync())
            .then(() => navigate('/'));

    return (
        <React.Fragment>
            <Tooltip title="Account" placement="right" arrow>
                <IconButton
                    onClick={handleClick}
                    size="large"
                    sx={{ p: 0 }}
                >
                    <Avatar sx={avatarWithColor} fontSize="inherit">
                        {currentUser.firstName[0] + currentUser.lastName[0]}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                disableScrollLock={true}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem disabled>
                    {`${currentUser.firstName} ${currentUser.lastName}`}
                </MenuItem>
                <MenuItem disabled style={{ fontSize: '0.9em' }}>
                    {currentUser.email}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    {'Logout'}
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};