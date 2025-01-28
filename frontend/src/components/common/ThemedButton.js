import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';

const ThemedButton = styled(Button)(
    ({ theme: { palette: { primary }, spacing } }) => ({
        background: `linear-gradient(45deg,
        ${primary.dark} 30%, ${primary.light} 90%)`,
        borderRadius: '30px 30px',
        margin: spacing(5, 0, 3),
        padding: spacing(2),
        color: primary.contrastText,
        fontSize: "20px",
        width: '80%'
    })
);

export default ThemedButton;
