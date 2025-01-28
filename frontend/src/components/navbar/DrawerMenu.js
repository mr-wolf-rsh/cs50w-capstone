import React from "react";

import { Link as RouterLink } from "react-router-dom";

import {
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader
} from "@mui/material";

import GroupsIcon from '@mui/icons-material/Groups';
import Groups2Icon from '@mui/icons-material/Groups2';
import Groups3Icon from '@mui/icons-material/Groups3';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PollIcon from '@mui/icons-material/Poll';

import { useElectionTypes } from '../../hooks';

const allIcons = [<GroupsIcon />, <Groups2Icon />, <Groups3Icon />];

export default function DrawerMenu() {
    const [allElectionTypes, isLoadingElectionTypes] = useElectionTypes();

    const menuInfo = [
        {
            icon: <PeopleAltIcon />,
            title: "Parties",
            navigateRoute: '/app/party',
        },
        {
            icon: <PollIcon />,
            title: "Polls",
            navigateRoute: '/app/poll',
        }
    ];

    if (allElectionTypes.length > 0 && !isLoadingElectionTypes) {
        const candidatesMenu = allElectionTypes.map(({ type, typeName }) => ({
            icon: allIcons[Math.floor(Math.random() * allIcons.length)],
            title: `${typeName} candidates`,
            navigateRoute: `/app/candidate?electionType=${type}`
        }));

        menuInfo.unshift(...candidatesMenu);
    }

    return (
        <>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to={'/'}>
                        <ListItemText primary={'Home'} inset />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListSubheader>{'Available reports'}</ListSubheader>
                {
                    menuInfo.map(
                        ({ icon, title, navigateRoute }, i) => (
                            <ListItem key={i} disablePadding>
                                <ListItemButton component={RouterLink} to={navigateRoute}>
                                    <ListItemIcon>
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText primary={title} />
                                </ListItemButton>
                            </ListItem>
                        ))
                }
            </List>
        </>
    );
}
