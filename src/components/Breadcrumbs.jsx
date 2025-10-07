import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

function handleClick(event) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
}

export const ActiveLastBreadcrumb = ({ label, endpoint }) => {
    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link underline="none" color="inherit">
                    Home
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                // href={`${link}`}
                >
                    {label}
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    aria-current="page"
                >
                    {endpoint}
                </Link>
            </Breadcrumbs>
        </div>
    );
}
