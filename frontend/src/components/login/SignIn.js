import React from 'react';

import { useDispatch } from 'react-redux';

import {
    Box,
    Button,
    Grid,
    TextField
} from '@mui/material';

import { useForm } from "react-hook-form";

import { loginAsync } from '../../slices/auth';

const classes = {
    flexContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonSubmit: ({ spacing }) => ({
        margin: spacing(5, 0, 3),
        padding: spacing(2),
        fontSize: 16
    }),
    form: {
        width: '100%'
    }
};

export default function SignIn({ successCallback }) {
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleSubmitButton = (loginForm) =>
        dispatch(loginAsync(loginForm)).unwrap()
            .then(() => successCallback())
            .catch(() => null);

    return (
        <Box sx={classes.flexContainer}>
            <form sx={classes.form} noValidate
                onSubmit={handleSubmit(handleSubmitButton)} method="POST">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            id="email"
                            label="Email Address"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email && errors.email.message}
                            variant="outlined"
                            margin="normal"
                            inputProps={{ style: { textAlign: 'center' } }}
                            type="email"
                            {...register("email", {
                                required: {
                                    value: true,
                                    message: "Email address is required."
                                },
                                pattern: {
                                    value: /^[a-zA-Z0-9,.-]+@\w+\.\w+$/,
                                    message: "Must be a valid email address."
                                }
                            })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="password"
                            label="Password"
                            fullWidth
                            error={!!errors.password}
                            helperText={errors.password && errors.password.message}
                            variant="outlined"
                            margin="normal"
                            inputProps={{ style: { textAlign: 'center' } }}
                            type="password"
                            {...register("password", {
                                required: {
                                    value: true,
                                    message: "Password is required."
                                }
                            })}
                        />
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    sx={classes.buttonSubmit}
                >
                    {'Sign In'}
                </Button>
            </form>
        </Box>
    );
};
