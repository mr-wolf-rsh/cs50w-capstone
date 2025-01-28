import React from 'react';

import {
    Card,
    Grid,
    IconButton,
    InputAdornment,
    TextField
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

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

function PartyNameControl({
    currentName,
    setCurrentName,
    handleSearchClick
}) {
    const handleNameChange = ({ target: { value } }) => setCurrentName(value);

    return (
        <TextField
            color="primary"
            variant="outlined"
            value={currentName ?? ''}
            onChange={handleNameChange}
            type="search"
            InputProps={{
                sx: { borderRadius: '0 4px 4px 0', p: 0 },
                placeholder: 'Search for a party...',
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton sx={{ mx: 2 }}
                            onClick={handleSearchClick}>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            sx={{ width: '100%' }}
        />
    );
}

export default function PartySearchBar({ setPartyFilter }) {
    const [currentName, setCurrentName] = React.useState('');

    const handleSearchClick = () => setPartyFilter({ name: currentName });

    return (
        <Grid item container spacing={2}>
            <Card sx={classes.searchBar}>
                <PartyNameControl
                    currentName={currentName}
                    setCurrentName={setCurrentName}
                    handleSearchClick={handleSearchClick}
                />
            </Card>
        </Grid >
    )
}
