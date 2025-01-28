import React from "react";

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Box,
    Collapse,
    Pagination,
    Skeleton,
    useMediaQuery,
    Typography
} from "@mui/material";

import json2mq from 'json2mq';

import {
    partySelector,
    getPartiesAsync,
    GET_PARTIES_PENDING,
    reset
} from '../../slices/party';

import { removeFieldsFromObject } from '../../utils';

import PartyCard from "./PartyCard";

const classes = {
    root: ({ gridTemplateColumns }) =>
        ({ spacing }) => ({
            padding: spacing(5),
            display: "grid",
            gridTemplateColumns,
            gridGap: spacing(4),
        }),
    paginator: ({ palette: { secondary, mode } }) => ({
        width: 'fit-content',
        margin: '10px auto',
        '& .MuiPaginationItem-root.Mui-selected': {
            color: secondary.contrastText,
            backgroundColor: secondary[mode]
        }
    })
};

export default function PartyList({ partyFilter, setPartyFilter }) {
    const dispatch = useDispatch();

    const {
        parties: {
            totalPages,
            page: partiesPage
        },
        isLoading: {
            [GET_PARTIES_PENDING]: isLoadingParties
        }
    } = useSelector(partySelector);

    const [currentPage, setCurrentPage] = React.useState(1);

    const isTabletOrMobile = useMediaQuery(json2mq({ maxWidth: 600 }));
    const gridTemplateColumns = isTabletOrMobile ? "1fr" : "repeat(auto-fill, minmax(25em, 1fr))";
    const rootWithGridTemplate = classes.root({ gridTemplateColumns });

    React.useEffect(() => {
        const page = partyFilter.page;
        setCurrentPage(!page ? 1 : +page);
    }, [partyFilter.page]);

    React.useEffect(() => {
        if (!isLoadingParties) {
            const newParams = {
                page: currentPage,
                ...partyFilter
            };
            dispatch(getPartiesAsync(newParams));
        }
        return () => dispatch(reset());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, partyFilter, currentPage]);

    const handlePageChange = (_, value) => {
        if (currentPage !== value) {
            setCurrentPage(value);
            setPartyFilter((prevPartyFilter) => removeFieldsFromObject({
                ...prevPartyFilter,
                ...{ page: !value || value === 1 ? '' : value.toString() }
            }));
        }
    }

    return (
        <>
            <Box sx={rootWithGridTemplate}>
                {
                    (isLoadingParties) ?
                        Array.from({ length: 6 }, (_, i) => (
                            <Collapse in key={i}>
                                <Skeleton
                                    sx={{ margin: 'auto' }}
                                    variant="rectangular"
                                    width="15em" height="15em"
                                    animation="wave" />
                            </Collapse>
                        )) :
                        (partiesPage.length > 0) ?
                            partiesPage.map((party) =>
                                <PartyCard party={party} key={party.uuid} />) :
                            <Typography variant="h6" gutterBottom>
                                {'**No parties available**'}
                            </Typography>
                }
            </Box>
            {
                (partiesPage.length > 0) &&
                <Pagination count={totalPages}
                    size="large"
                    page={currentPage} onChange={handlePageChange}
                    sx={classes.paginator}
                    showFirstButton showLastButton />
            }
        </>
    );
}
