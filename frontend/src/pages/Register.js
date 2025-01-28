import React from 'react';

import {
    useDispatch
} from 'react-redux';

import {
    Link as RouterLink,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    Link,
    Stepper,
    Step,
    StepLabel,
    Typography
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { reset } from '../slices/registration';

import { ContainerMain, Transition } from '../components/common';

import {
    PersonalInfo,
    VoterInfo,
    Review
} from '../components/register';

const classes = {
    root: {
        height: 'auto',
        margin: 'auto'
    },
    stepper: ({ spacing }) => ({
        padding: spacing(4)
    }),
    content: ({ spacing }) => ({
        padding: spacing(2)
    }),
    avatar: ({ spacing, palette: { secondary } }) => ({
        margin: spacing(2, 'auto'),
        backgroundColor: secondary.main
    }),
    buttonActions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    button: ({ spacing }) => ({
        marginTop: spacing(1),
        marginBottom: spacing(1),
        fontSize: 16
    })
};

export default function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();

    const {
        next = null
    } = Object.fromEntries(searchParams);

    const [activeStep, setActiveStep] = React.useState(0);

    const currentRef = {
        personalInfoRef: React.useRef(),
        voterInfoRef: React.useRef(),
        reviewRef: React.useRef()
    };

    const steps = [
        {
            label: 'General Information',
            component: <PersonalInfo ref={currentRef.personalInfoRef} />,
            handleAction: () => currentRef.personalInfoRef.current.handlePersonalInfoSubmit(handleNext)
        },
        {
            label: 'Other Details',
            component: <VoterInfo ref={currentRef.voterInfoRef} />,
            handleAction: () => currentRef.voterInfoRef.current.handleVoterInfoSubmit(handleNext)
        },
        {
            label: 'Create account!',
            component: <Review ref={currentRef.reviewRef} />,
            handleAction: () => currentRef.reviewRef.current.handleReviewSubmit(
                () => navigate(next ?? '/app', { replace: true }))
        }
    ];

    React.useEffect(() => {
        return () => dispatch(reset());
        // eslint-disable-next-line
    }, [])

    const handleKeyPress = (action) =>
        ({ key }) => (key === 'Enter') ? action() : null

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);

    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    return (
        <ContainerMain sx={classes.root} maxWidth="sm">
            <Transition>
                <Card sx={classes.content} elevation={5}>
                    <CardContent>
                        <Avatar sx={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="h4" align="center">
                            {'Register now!'}
                        </Typography>
                        <Stepper sx={classes.stepper}
                            activeStep={activeStep} alternativeLabel>
                            {steps.map(({ label }) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {React.cloneElement(
                            steps[activeStep].component,
                            {
                                handleKeyPress: handleKeyPress(steps[activeStep].handleAction)
                            }
                        )}
                    </CardContent>
                    <CardActions sx={classes.buttonActions}>
                        {activeStep !== 0 && (
                            <Button sx={classes.button}
                                onClick={handleBack}>
                                {'Back'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            sx={classes.button}
                            onClick={steps[activeStep].handleAction}
                        >
                            {activeStep === steps.length - 1 ? 'CONFIRM' : 'NEXT'}
                        </Button>
                    </CardActions>
                    <Typography component="div" variant="h6" align="center" gutterBottom>
                        {'Already have an account? '}
                        <Link component={RouterLink} to="/login"
                            color="secondary"
                            sx={{ textDecoration: 'none' }}>
                            {'Sign in here!'}
                        </Link>
                    </Typography>
                </Card>
            </Transition>
        </ContainerMain>
    );
}
