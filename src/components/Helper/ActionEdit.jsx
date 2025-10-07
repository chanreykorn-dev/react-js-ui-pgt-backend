import { IconButton, Tooltip } from '@mui/material';
// import { ActionButtonEdite } from '../components/ActionButtonEdite';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import React from 'react';

export const ActionEdit = ({ onEdit, disabled }) => {
    onEdit = onEdit || (() => console.log('Edit action not defined'));

    return (
        <Tooltip title="Update">
            <span>
                <IconButton disabled={disabled} onClick={onEdit}>
                    <EditDocumentIcon sx={{ color: '#1f3858' }} />
                </IconButton>
            </span>
        </Tooltip>
    );
};