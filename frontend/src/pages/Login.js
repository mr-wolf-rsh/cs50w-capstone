import React from 'react';

import {
    Link as RouterLink,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    Avatar,
    Card,
    CardContent,
    Link,
    Typography
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import {
    ContainerMain,
    Transition
} from '../components/common';

import { SignIn } from '../components/login';

const classes = {
    root: {
        height: 'auto',
        margin: 'auto'
    },
    content: ({ spacing }) => ({
        padding: spacing(2)
    }),
    avatar: ({ spacing, palette: { secondary } }) => ({
        margin: spacing(2, 'auto'),
        backgroundColor: secondary.main
    })
};

export default function Login() {
    const navigate = useNavigate();

    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();

    const {
        next = null
    } = Object.fromEntries(searchParams);

    const handleSuccessCallback = () => navigate(next ?? '/app', { replace: true });

    return (
        <ContainerMain sx={classes.root} maxWidth="sm">
            <Transition>
                <Card sx={classes.content} elevation={5}>
                    <CardContent>
                        <Avatar sx={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="h4" align="center">
                            {'Account Login'}
                        </Typography>
                        <SignIn successCallback={handleSuccessCallback} />
                    </CardContent>
                    <Typography component="div" variant="h6" align="center" gutterBottom>
                        {"Don't have an account? "}
                        <Link component={RouterLink}
                            to={'/register' + (!!next ? `?next=${next}` : '')}
                            color="secondary" sx={{ textDecoration: 'none' }}>
                            {"Register here!"}
                        </Link>
                    </Typography>
                </Card>
            </Transition>
        </ContainerMain>
    );
}
