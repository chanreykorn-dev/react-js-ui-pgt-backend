import { Box } from '@mui/material';
import React from 'react';

const Header = ({ name, description }) => {
    return (
        <Box>
            <h1 className='text-3xl'>{name}</h1>
            <p className='mt-1'>{description}</p>
        </Box>
    );
}

export default Header;
