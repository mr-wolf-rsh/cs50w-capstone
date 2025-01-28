import React from 'react';

import {
    Card,
    Collapse,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';

import ClearIcon from '@mui/icons-material/Clear';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

import {
    useElectionTypes,
    useLimitedParties
} from '../../hooks';

import { removeFieldsFromObject } from '../../utils';

const classes = {
    searchBar: {
        width: '100%',
        maxWidth: '50em',
        margin: 'auto'
    },
    radio: (primaryColor) => ({
        color: primaryColor,
        '&.Mui-checked': {
            color: primaryColor,
        },
        padding: 2
    }),
    expandMore: (expand) => ({
        mx: 2,
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.5s'
    })
}

function CandidateNameControl({
    currentName,
    setCurrentName,
    expanded,
    handleExpandClick,
    handleSearchClick
}) {
    const iconWithExpandedMore = classes.expandMore(expanded);

    const handleNameChange =
        ({ target: { value } }) => setCurrentName(value);

    return (
        <TextField
            color="primary"
            variant="outlined"
            value={currentName ?? ''}
            onChange={handleNameChange}
            type="search"
            InputProps={{
                sx: { borderRadius: '0 4px 4px 0', p: 0 },
                placeholder: 'Search for a candidate...',
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton sx={{ mx: 2 }}
                            onClick={handleSearchClick}>
                            <SearchIcon />
                        </IconButton>
                        <Divider sx={{ height: 30 }} orientation="vertical" />
                        <IconButton sx={iconWithExpandedMore}
                            onClick={handleExpandClick}>
                            <ExpandMoreIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            sx={{ width: '100%' }}
        />
    );
}

function ElectionTypeControl({
    electionTypeParam,
    currentElectionType,
    setCurrentElectionType
}) {
    const [allElectionTypes, isLoadingElectionTypes] = useElectionTypes();

    React.useEffect(() => {
        if (allElectionTypes.length > 0) {
            setCurrentElectionType(electionTypeParam);
        }
    }, [allElectionTypes, setCurrentElectionType, electionTypeParam]);

    const handleElectionTypeChange =
        ({ target: { value } }) => setCurrentElectionType(value);

    return (
        (allElectionTypes.length > 0 && !isLoadingElectionTypes) &&
        <TextField
            color="primary"
            variant="outlined"
            value={currentElectionType ?? ''}
            onChange={handleElectionTypeChange}
            select
            SelectProps={{
                sx: { borderRadius: '4px 0 0 4px' },
                startAdornment: (
                    <InputAdornment position="start">
                        <GroupsIcon />
                    </InputAdornment>
                ),
                displayEmpty: true,
                autoWidth: true
            }}
            sx={{ width: '100%' }}
        >
            <MenuItem value="" divider dense>
                {'All'}
            </MenuItem>
            {
                allElectionTypes.map(
                    ({ type, typeName }, i) =>
                        <MenuItem value={type} divider dense key={i}>{typeName}</MenuItem>
                )
            }
        </TextField>
    );
}

function PartyControl({
    partyParam,
    currentParty,
    setCurrentParty
}) {
    const [allLimitedParties, isLoadingLimitedParties] = useLimitedParties();

    React.useEffect(() => {
        if (allLimitedParties.length > 0) {
            setCurrentParty(partyParam);
        }
    }, [allLimitedParties, setCurrentParty, partyParam]);

    const handlePartyChange =
        ({ target: { value } }) => setCurrentParty(value);

    return (
        (allLimitedParties.length > 0 && !isLoadingLimitedParties) &&
        <>
            <FormControl sx={{ border: 'solid 1.75px #e2e2e1' }}>
                <Typography variant="subtitle1" ml={5} mt={2}>
                    {'Parties available'}
                    <Tooltip title={'Clear party'} placement="right" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setCurrentParty('')}
                            sx={{ ml: 'inherit' }}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                </Typography>
                <RadioGroup row
                    value={currentParty || ''}
                    onChange={handlePartyChange}
                >
                    {
                        allLimitedParties.map(
                            ({ uuid, name, primaryColor }, i) =>
                                <FormControlLabel value={uuid}
                                    control={<Radio sx={classes.radio(primaryColor)} />}
                                    sx={{ margin: 1, px: 2 }}
                                    labelPlacement="end"
                                    label={name} key={i} />)
                    }
                </RadioGroup>
            </FormControl>
        </>
    );
}

export default function CandidateSearchBar({ candidateFilter, setCandidateFilter }) {
    const {
        electionType: electionTypeParam,
        name: nameParam,
        party: partyParam
    } = candidateFilter;

    const [currentElectionType, setCurrentElectionType] = React.useState(electionTypeParam || '');
    const [currentName, setCurrentName] = React.useState(nameParam || '');
    const [currentParty, setCurrentParty] = React.useState(partyParam || '');

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => setExpanded(!expanded);

    const handleSearchClick = () =>
        setCandidateFilter(removeFieldsFromObject({
            electionType: currentElectionType,
            name: currentName,
            party: currentParty
        }));

    return (
        <Grid item container spacing={2}>
            <Card sx={classes.searchBar}>
                <Grid item container>
                    <Grid item xs={12} sm="auto">
                        <ElectionTypeControl
                            electionTypeParam={electionTypeParam}
                            currentElectionType={currentElectionType}
                            setCurrentElectionType={setCurrentElectionType}
                        />
                    </Grid>
                    <Grid item xs={12} sm>
                        <CandidateNameControl
                            currentName={currentName}
                            setCurrentName={setCurrentName}
                            expanded={expanded}
                            handleExpandClick={handleExpandClick}
                            handleSearchClick={handleSearchClick}
                        />
                    </Grid>
                </Grid>
            </Card>
            <Grid item container>
                <Card sx={classes.searchBar}>
                    <Collapse in={expanded} timeout="auto">
                        <Grid item container>
                            <PartyControl
                                partyParam={partyParam}
                                currentParty={currentParty}
                                setCurrentParty={setCurrentParty}
                            />
                        </Grid>
                    </Collapse>
                </Card>
            </Grid>
        </Grid >
    )
}
