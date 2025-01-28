import React from 'react';

import { useLocation } from 'react-router-dom';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Avatar,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Radio,
    Typography
} from '@mui/material';

import moment from 'moment';

import { authSelector } from '../../slices/auth';

import {
    createPollAsync,
    getCurrentPollAsync,
    GET_CURRENT_POLL_PENDING,
    pollSelector,
    reset
} from '../../slices/poll';

import {
    useLimitedCandidates,
    useNavigateSearch,
    useScrollPercentage
} from '../../hooks';

import { preventPropagation } from '../../utils';

import PollResult from './PollResult';

const classes = {
    root: ({ percentage }) => ({ palette: { mode, primary } }) => {
        let darkOrLight = '';

        if (mode === 'dark') {
            const darkPercentage = Math.max(0, (percentage * 2) - 10);
            darkOrLight = `${primary['dark']} ${darkPercentage / 9}%, transparent ${darkPercentage}%`;
        }
        else {
            darkOrLight = `transparent ${percentage}%, ${primary['light']} ${percentage * 3}%`;
        }

        return {
            height: 'fit-content',
            maxHeight: '42.5em',
            padding: 10,
            background: `linear-gradient(${darkOrLight})`
        }
    },
    avatar: {
        '&.MuiAvatar-root img': {
            objectFit: 'fill'
        }
    }
};

export default function VotePoll() {
    const [ref, percentage] = useScrollPercentage();

    const dispatch = useDispatch();
    const navigateSearch = useNavigateSearch();

    const {
        pathname: currentPathname,
        search: currentSearch
    } = useLocation();

    const {
        currentUser
    } = useSelector(authSelector);

    const {
        poll,
        isLoading: {
            [GET_CURRENT_POLL_PENDING]: isLoadingCurrentPoll
        }
    } = useSelector(pollSelector);

    const [allLimitedCandidates, isLoadingLimitedCandidates] = useLimitedCandidates();

    const [campaignCandidate, setCampaignCandidate] = React.useState("");

    const rootWithPercentage = classes.root({ percentage: percentage.toPrecision(4) * 100 });

    const now = moment().clone()

    const startDayOfWeek = now.startOf('week').format('ll');
    const endDayOfWeek = now.endOf('week').format('ll');

    const userExists = !!currentUser;

    React.useEffect(() => {
        return () => dispatch(reset());
        // eslint-disable-next-line
    }, [])

    React.useEffect(() => {
        if (userExists && !isLoadingCurrentPoll) {
            dispatch(getCurrentPollAsync());
        }
        // eslint-disable-next-line
    }, [dispatch, userExists]);

    const handleClick = (e) => {
        preventPropagation(e);
        if (userExists) {
            dispatch(createPollAsync({ uuid: campaignCandidate })).unwrap()
                .then(() => dispatch(getCurrentPollAsync()))
                .then(() => null)
                .catch(() => null);
        }
        else {
            navigateSearch('/login', { next: currentPathname + currentSearch });
        }
    };

    const handleCandidateSelection = (campaignUuid) => (_) => setCampaignCandidate(campaignUuid);

    return (
        <Card ref={ref} sx={rootWithPercentage}
            elevation={5} square>
            <CardHeader
                title={
                    <>
                        {
                            ['Presidential', 'Weekly Poll'].map((phrase, i) =>
                                <Typography align="center" variant="h3" key={i}>
                                    {phrase}
                                </Typography>)
                        }
                    </>
                }
                subheader={
                    <Typography align="center" variant="h6">
                        {`${startDayOfWeek} - ${endDayOfWeek}`}
                    </Typography>
                } />
            <CardContent>
                {
                    (!!poll) ?
                        <PollResult campaigns={poll.campaigns} width="120%" height="75%" /> :
                        (allLimitedCandidates.length > 0 && !isLoadingLimitedCandidates) &&
                        <List>
                            {
                                allLimitedCandidates.map(
                                    ({ uuid: campaignUuid, candidate: {
                                        firstName, lastName,
                                        image, party: {
                                            name: partyName, logo
                                        }
                                    } }) => {
                                        const fullName = `${firstName} ${lastName}`;
                                        return (
                                            <ListItem key={campaignUuid} dense button onClick={handleCandidateSelection(campaignUuid)}>
                                                <ListItemAvatar>
                                                    <Avatar variant="rounded" alt={partyName}
                                                        src={logo} />
                                                </ListItemAvatar>
                                                <ListItemAvatar>
                                                    <Avatar sx={classes.avatar} variant="rounded" alt={fullName} src={image} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={fullName}
                                                    secondary={partyName}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Radio
                                                        edge="end"
                                                        onChange={handleCandidateSelection(campaignUuid)}
                                                        checked={campaignCandidate === campaignUuid}
                                                        value={campaignUuid}
                                                        size="small"
                                                    />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    }
                                )
                            }
                        </List>
                }
            </CardContent>
            <CardActions>
                {
                    !poll &&
                    <Button fullWidth onClick={handleClick}
                        disabled={!campaignCandidate}
                        color="secondary" variant="contained">
                        {'VOTE NOW!'}
                    </Button>
                }
            </CardActions>
        </Card>
    );
}