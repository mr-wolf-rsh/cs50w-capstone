import React from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    Grid,
    TextField,
    Typography
} from '@mui/material';

import { useForm } from "react-hook-form";

import {
    registrationSelector,
    setPersonalInfo
} from '../../slices/registration';

const classes = {
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    form: {
        width: '100%'
    }
};

function PersonalInfo({ handleKeyPress }, parentRef) {
    const dispatch = useDispatch();

    const {
        personalInfo: {
            email,
            firstName,
            lastName
        }
    } = useSelector(registrationSelector);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: '',
            passwordConfirmation: ''
        }
    });

    const handleSubmitButton = React.useCallback(
        (successCallback) => (registerForm) => {
            dispatch(setPersonalInfo(registerForm));
            successCallback();
        }, [dispatch]);

    React.useImperativeHandle(parentRef, () => ({
        handlePersonalInfoSubmit: (successCallback) =>
            handleSubmit(handleSubmitButton(successCallback))()
    }), [handleSubmit, handleSubmitButton]);

    return (
        <Box sx={classes.root}
            onKeyPress={handleKeyPress} tabIndex="0">
            <Typography variant="h5">
                {'Fill this form:'}
            </Typography>
            <form sx={classes.form}>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="firstName"
                            label="First Name"
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName && errors.firstName.message}
                            variant="outlined"
                            margin="normal"
                            {...register("firstName", {
                                required: {
                                    value: true,
                                    message: "First name is required."
                                }
                            })}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="lastName"
                            label="Last Name"
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName && errors.lastName.message}
                            variant="outlined"
                            margin="normal"
                            {...register("lastName", {
                                required: {
                                    value: true,
                                    message: "Last name is required."
                                }
                            })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="email"
                            label="Email Address"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email && errors.email.message}
                            variant="outlined"
                            margin="normal"
                            type="email"
                            {...register("email", {
                                required: {
                                    value: true,
                                    message: "Email address is required."
                                },
                                pattern: {
                                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
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
                            type="password"
                            {...register("password", {
                                required: {
                                    value: true,
                                    message: "Password is required."
                                }
                            })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="passwordConfirmation"
                            label="Password Confirmation"
                            fullWidth
                            error={!!errors.passwordConfirmation}
                            helperText={errors.passwordConfirmation && errors.passwordConfirmation.message}
                            variant="outlined"
                            margin="normal"
                            type="password"
                            {...register("passwordConfirmation", {
                                required: {
                                    value: true,
                                    message: "Password confirmation is required."
                                },
                                validate: value => value === watch("password") ||
                                    "Password confirmation must be the same as Password."
                            })}
                        />
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}

export default React.forwardRef(PersonalInfo);
