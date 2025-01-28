import React from 'react';

import Container from '@mui/material/Container';

import { DeviceContext } from '../../contexts/Device';

const classes = {
    root: {
        padding: '2em'
    }
};

const ContainerMain = React.memo(
    function ContainerMain({ children, sx: parentSx, ...rest }) {
        const { height, width } = React.useContext(DeviceContext);

        const rootWithContainerHeight = {
            ...classes.root,
            height,
            width
        };

        const newSx = [...(Array.isArray(parentSx) ? parentSx : [parentSx])];

        return (
            <Container component="main" maxWidth={false} disableGutters
                sx={[rootWithContainerHeight, ...newSx]} {...rest}>
                {children}
            </Container>
        );
    }
);

export default ContainerMain;
