import React from 'react';

import { useTheme } from '@mui/material/styles';

import { useCurrentPeriod } from '../../hooks';

import SubtitleShadow from './SubtitleShadow';

export default function PeriodTitle({ title }) {
    const [currentPeriod, isLoadingCurrentPeriod] = useCurrentPeriod();
    const { palette: { secondary, mode } } = useTheme();

    return (
        <SubtitleShadow variant="h3" align="center"
            sx={{ mx: 'auto', my: 5 }}
            color={secondary[mode]}>
            {
                title +
                ((currentPeriod !== "" && !isLoadingCurrentPeriod) ?
                    ` for ${currentPeriod}` : '')
            }
        </SubtitleShadow>
    );
}
