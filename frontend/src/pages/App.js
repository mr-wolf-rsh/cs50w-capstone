import React from 'react';

import { Outlet } from "react-router-dom";

import {
    Box,
    Drawer,
    IconButton
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { NavBar, DrawerMenu } from '../components/navbar';

const drawerWidth = 240;

const classes = {
    root: {
        width: '100%',
        display: 'flex'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
        }
    },
    drawerHeader: ({ mixins, spacing }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: spacing(0, 1),
        ...mixins.toolbar,
        justifyContent: 'flex-end',
    }),
    panel: ({ open }) => ({ transitions }) => ({
        flexGrow: 1,
        transition: transitions.create('margin', {
            easing: transitions.easing.sharp,
            duration: transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            marginLeft: 0,
            transition: transitions.create('margin', {
                easing: transitions.easing.easeOut,
                duration: transitions.duration.enteringScreen,
            })
        }),
    }),
};

function App() {
    const [open, setOpen] = React.useState(false);

    const panelOpen = classes.panel({ open });

    const handleDrawerOpen = () => setOpen(true);

    const handleDrawerClose = () => setOpen(false);

    return (
        <Box sx={classes.root}>
            <NavBar open={open} handleDrawerOpen={handleDrawerOpen} />
            <Drawer
                sx={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <Box sx={classes.drawerHeader}>
                    <IconButton size="large" onClick={handleDrawerClose}>
                        <ChevronLeftIcon fontSize="inherit" />
                    </IconButton>
                </Box>
                <DrawerMenu />
            </Drawer>
            <Box sx={panelOpen}>
                <Box sx={classes.drawerHeader} />
                <Outlet />
            </Box>
        </Box>
    );
}

export default App;
