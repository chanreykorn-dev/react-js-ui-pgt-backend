import * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ActionDelete({ link, onDelete, message, disabled }) {
    const [loading, setLoading] = React.useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");
            const response = await fetch(link, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                toast.success(`${message}`);
                if (onDelete) onDelete(); // Reload data after delete
            } else {
                const errorText = await response.text();
                toast.error('Delete failed');
                console.error('Delete failed:', response.status, errorText);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title="Delete">
            <span>
                <IconButton onClick={handleDelete} disabled={disabled}>
                    <DeleteIcon sx={{ color: '#D42C0D' }} />
                </IconButton>
            </span>
        </Tooltip>
    );
}