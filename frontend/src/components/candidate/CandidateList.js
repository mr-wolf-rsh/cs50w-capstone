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
    Typography,
    useMediaQuery
} from "@mui/material";

import json2mq from 'json2mq';

import {
    candidateSelector,
    getCampaignCandidatesAsync,
    GET_CAMPAIGN_CANDIDATES_PENDING,
    reset
} from '../../slices/candidate';

import { removeFieldsFromObject } from '../../utils';

import CandidateCard from "./CandidateCard";

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

export default function CandidateList({ candidateFilter, setCandidateFilter }) {
    const dispatch = useDispatch();

    const {
        campaignCandidates: {
            totalPages,
            page: candidatesPage
        },
        isLoading: {
            [GET_CAMPAIGN_CANDIDATES_PENDING]: isLoadingCampaignCandidates
        }
    } = useSelector(candidateSelector);

    const [currentPage, setCurrentPage] = React.useState(1);

    const isTabletOrMobile = useMediaQuery(json2mq({ maxWidth: 600 }));
    const gridTemplateColumns = isTabletOrMobile ? "1fr" : "repeat(auto-fill, minmax(25em, 1fr))";
    const rootWithGridTemplate = classes.root({ gridTemplateColumns });

    React.useEffect(() => {
        const page = candidateFilter.page;
        setCurrentPage(!page ? 1 : +page);
    }, [candidateFilter.page]);

    React.useEffect(() => {
        if (!isLoadingCampaignCandidates) {
            const newParams = {
                page: currentPage,
                ...candidateFilter
            };
            dispatch(getCampaignCandidatesAsync(newParams));
        }
        return () => dispatch(reset());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, candidateFilter, currentPage]);

    const handlePageChange = (_, value) => {
        if (currentPage !== value) {
            setCurrentPage(value);
            setCandidateFilter((prevCandidateFilter) => removeFieldsFromObject({
                ...prevCandidateFilter,
                ...{ page: !value || value === 1 ? '' : value.toString() }
            }));
        }
    }

    return (
        <>
            <Box sx={rootWithGridTemplate}>
                {
                    (isLoadingCampaignCandidates) ?
                        Array.from({ length: 6 }, (_, i) => (
                            <Collapse in key={i} >
                                <Skeleton
                                    sx={{ margin: 'auto' }}
                                    variant="rectangular"
                                    width="25em" height="40em"
                                    animation="wave" />
                            </Collapse>
                        )) :
                        (candidatesPage.length > 0) ?
                            candidatesPage.map((cand) =>
                                <CandidateCard key={cand.uuid} candidateFromCampaign={cand} />) :
                            <Typography variant="h6" gutterBottom>
                                {'**No candidates from campaigns available**'}
                            </Typography>
                }
            </Box>
            {
                (candidatesPage.length > 0) &&
                <Pagination count={totalPages}
                    size="large"
                    page={currentPage} onChange={handlePageChange}
                    sx={classes.paginator}
                    showFirstButton showLastButton />
            }
        </>
    );
}
