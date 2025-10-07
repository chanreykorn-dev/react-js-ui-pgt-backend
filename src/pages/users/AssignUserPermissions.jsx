import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
    Box, List, ListItem, Checkbox, Button, FormControlLabel, Tooltip
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

export default function AssignUserPermissionsSimple() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found");

                // Get user details
                const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = await userRes.json();
                setUsername(userData.username);

                // Get all permissions with assigned info
                const permRes = await fetch(`${import.meta.env.VITE_API_URL}/role-permissions/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let allPermissions = await permRes.json();
                if (!Array.isArray(allPermissions)) allPermissions = [];

                setPermissions(allPermissions);

                // Initialize selectedPermissions with **already assigned** permissions
                const initiallySelected = allPermissions.filter(p => p.assigned).map(p => p.id);
                setSelectedPermissions(initiallySelected);

            } catch (error) {
                console.error(error);
                toast.error(error.message || "Failed to load data");
                setPermissions([]);
            }
        };
        fetchData();
    }, [userId]);

    const handlePermissionToggle = (id) => {
        setSelectedPermissions(prev =>
            prev.includes(id)
                ? prev.filter(pid => pid !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/role-permissions/assign/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    permission_id: selectedPermissions
                })
            });

            if (!res.ok) throw new Error("Failed to update user permissions");

            // Update local permissions array
            setPermissions(prev =>
                prev.map(p => ({
                    ...p,
                    assigned: selectedPermissions.includes(p.id)
                }))
            );

            toast.success("Permissions updated successfully");

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update permissions");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <h2>Assign Permissions for: {username}</h2>
            <List>
                {permissions.map(p => (
                    <ListItem key={p.id}>
                        <Tooltip title={p.assigned ? "Already assigned" : "Click to assign"}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedPermissions.includes(p.id)}
                                        onChange={() => handlePermissionToggle(p.id)}
                                        disabled={loading}
                                    />
                                }
                                label={`${p.name}${p.description ? ` - ${p.description}` : ""}`}
                            />
                        </Tooltip>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/users")}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Permissions"}
                </Button>
            </Box>
        </Box>
    );
}
