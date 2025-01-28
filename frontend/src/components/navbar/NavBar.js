import React from "react";

import {
    Link as RouterLink,
    useLocation
} from "react-router-dom";

import { useSelector } from "react-redux";

import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import MenuIcon from "@mui/icons-material/Menu";

import { authSelector } from "../../slices/auth";

import AccountMenu from "./AccountMenu";

const drawerWidth = 240;

const classes = {
    menuButton:
        ({ open }) =>
            ({ spacing }) => ({
                marginRight: spacing(2),
                ...(open && { display: "none" }),
            }),
    flexGrowOne: {
        flexGrow: 1,
    },
    navbar:
        ({ open }) =>
            ({ palette: { primary, mode }, transitions }) => ({
                backgroundColor: primary[mode],
                transition: transitions.create(["margin", "width"], {
                    easing: transitions.easing.sharp,
                    duration: transitions.duration.leavingScreen,
                }),
                ...(open && {
                    width: `calc(100% - ${drawerWidth}px)`,
                    marginLeft: `${drawerWidth}px`,
                    transition: transitions.create(["margin", "width"], {
                        easing: transitions.easing.easeOut,
                        duration: transitions.duration.enteringScreen,
                    }),
                }),
            }),
};

export default function NavBar({ open, handleDrawerOpen }) {
    const { currentUser } = useSelector(authSelector);

    const { pathname } = useLocation();
    const elevation = pathname.replaceAll("/", "") === "app" ? 0 : 4;

    const navbarOpen = classes.navbar({ open });
    const menuButtonOpen = classes.menuButton({ open });

    return (
        <AppBar position="fixed" sx={navbarOpen} elevation={elevation}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={menuButtonOpen}
                >
                    <MenuIcon fontSize="inherit" />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component={RouterLink}
                        to="/app"
                        sx={{
                            mr: 2,
                            display: 'flex',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        {'VOTER AID'}
                    </Typography>
                    <HowToVoteIcon sx={{ display: 'flex', mr: 1 }} />
                </Box>
                <Box sx={{ flexGrow: 0 }}>
                    {
                        !!currentUser ?
                            <AccountMenu currentUser={currentUser} /> :
                            <Tooltip title="Login" placement="bottom-start" arrow>
                                <IconButton
                                    color="inherit"
                                    size="large"
                                    component={RouterLink}
                                    to="/login"
                                    sx={{ p: 0 }}
                                >
                                    <AccountCircleIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>

                    }
                </Box>
            </Toolbar>
        </AppBar>
    );
}
