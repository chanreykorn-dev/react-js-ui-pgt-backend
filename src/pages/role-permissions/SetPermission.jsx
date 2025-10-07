import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import Header from '../../components/Header';

// Helpers to work with arrays of objects by id
function not(a, b) {
    return a.filter(value => !b.some(item => item.id === value.id));
}

function intersection(a, b) {
    return a.filter(value => b.some(item => item.id === value.id));
}

function union(a, b) {
    return [...a, ...not(b, a)];
}

export default function SetPermission() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([]); // Available permissions
    const [right, setRight] = useState([]); // Assigned permissions
    const [roleName, setRoleName] = useState("");

    // Fetch role and permissions data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                // Fetch role details
                const roleResponse = await fetch(`${import.meta.env.VITE_API_URL}/roles/${roleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!roleResponse.ok) throw new Error('Failed to fetch role');
                const roleData = await roleResponse.json();
                setRoleName(roleData.name);

                // Fetch all permissions
                const allPermissionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!allPermissionsResponse.ok) throw new Error('Failed to fetch permissions');
                const allPermissions = await allPermissionsResponse.json();

                // Fetch role's current permissions
                const rolePermissionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/role-permissions/${roleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!rolePermissionsResponse.ok) throw new Error('Failed to fetch role permissions');
                const rolePermissions = await rolePermissionsResponse.json();

                // Normalize role permissions to full objects
                const assignedPermissions = rolePermissions.map(rp => {
                    const perm = allPermissions.find(p => p.id === rp.permission_id);
                    return perm ? { id: perm.id, name: perm.name, description: perm.description } : null;
                }).filter(p => p !== null);

                const availablePermissions = allPermissions.filter(p => !assignedPermissions.some(ap => ap.id === p.id));

                setLeft(availablePermissions);
                setRight(assignedPermissions);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.message || 'Failed to load data');
            }
        };

        fetchData();
    }, [roleId]);

    // Checkbox helpers
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.findIndex(c => c.id === value.id);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            // Prepare the permissions data
            const permissionIds = right.map(p => p.id);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/role-permissions/update/${roleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ permission_ids: permissionIds })
            });

            if (!response.ok) throw new Error('Failed to update permissions');

            toast.success('Permissions updated successfully');
            setTimeout(() => navigate('/role'), 2000);

        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error(error.message || 'Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const customList = (title, items) => (
        <Card>
            <CardHeader
                sx={{ px: 2, py: 1 }}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List sx={{ width: 300, height: 400, bgcolor: 'background.paper', overflow: 'auto' }} dense component="div" role="list">
                {items.map((item) => {
                    const labelId = `transfer-list-item-${item.id}-label`;

                    return (
                        <ListItemButton key={item.id} role="listitem" onClick={handleToggle(item)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.some(c => c.id === item.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={item.name} secondary={item.description} />
                        </ListItemButton>
                    );
                })}
            </List>
        </Card>
    );

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Role'} endpoint={`Set Permissions - ${roleName}`} />
            <Header name={'Set Role Permissions'} description={`Manage permissions for role: ${roleName}`} />

            <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Grid item>{customList('Available Permissions', left)}</Grid>
                <Grid item>
                    <Grid container direction="column" sx={{ alignItems: 'center' }}>
                        <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedRight} disabled={leftChecked.length === 0}>&gt;</Button>
                        <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedLeft} disabled={rightChecked.length === 0}>&lt;</Button>
                    </Grid>
                </Grid>
                <Grid item>{customList('Assigned Permissions', right)}</Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/role')}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Permissions'}</Button>
            </Box>
        </Box>
    );
}
