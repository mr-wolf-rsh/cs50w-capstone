import React from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Collapse,
    Pagination,
    Skeleton,
    Typography
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
    getPollsAsync,
    GET_POLLS_PENDING,
    pollSelector,
    reset
} from '../../slices/poll';

import { removeFieldsFromObject } from '../../utils';

import PollResult from './PollResult';

const classes = {
    root: ({ spacing }) => ({
        padding: spacing(5),
        display: 'flex',
        flexDirection: 'column',
        gridGap: spacing(4)
    }),
    paginator: ({ palette: { secondary, mode } }) => ({
        width: 'fit-content',
        margin: '10px auto',
        '& .MuiPaginationItem-root.Mui-selected': {
            color: secondary.contrastText,
            backgroundColor: secondary[mode]
        }
    }),
    chartContainer: {
        minHeight: '25em',
        justifyContent: 'center'
    }
};

export default function PollList({ pollFilter, setPollFilter }) {
    const dispatch = useDispatch();

    const {
        polls: {
            totalPages,
            page: pollsPage
        },
        isLoading: {
            [GET_POLLS_PENDING]: isLoadingPolls
        }
    } = useSelector(pollSelector);

    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        const page = pollFilter.page;
        setCurrentPage(!page ? 1 : +page);
    }, [pollFilter.page]);

    React.useEffect(() => {
        if (!isLoadingPolls) {
            const newParams = {
                page: currentPage
            };
            dispatch(getPollsAsync(newParams));
        }
        return () => dispatch(reset());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, currentPage]);

    const handlePageChange = (_, value) => {
        if (currentPage !== value) {
            setCurrentPage(value);
            setPollFilter((prevPollFilter) => removeFieldsFromObject({
                ...prevPollFilter,
                ...{ page: !value || value === 1 ? '' : value.toString() }
            }));
        }
    }

    return (
        <>
            <Box sx={classes.root}>
                {
                    (isLoadingPolls) ?
                        Array.from({ length: 6 }, (_, i) => (
                            <Collapse in key={i}>
                                <Skeleton
                                    variant="rectangular"
                                    height="3.5em"
                                    animation="wave" />
                            </Collapse>
                        )) :
                        (pollsPage.length > 0) ?
                            pollsPage.map(
                                ({ week, startDate, endDate, campaigns }, i) =>
                                    <Accordion key={i} defaultExpanded={i === 0}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex' }}>{`Week ${week}`}</Typography>
                                            <Typography variant="h5">{`${startDate} - ${endDate}`}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={classes.chartContainer}>
                                            <PollResult campaigns={campaigns} width="100%" height="100%" />
                                        </AccordionDetails>
                                    </Accordion>
                            ) :
                            <Typography variant="h6" gutterBottom>
                                {'**No polls available**'}
                            </Typography>
                }
            </Box>
            {
                (pollsPage.length > 0) &&
                <Pagination count={totalPages}
                    size="large"
                    page={currentPage} onChange={handlePageChange}
                    sx={classes.paginator}
                    showFirstButton showLastButton />
            }
        </>
    );
}
