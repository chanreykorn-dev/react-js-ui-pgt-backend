import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";

const EditRole = () => {
    const { id } = useParams(); // ✅ role id from URL
    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch role details by id
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/roles/${id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch role");

                const role = await response.json();
                setName(role.name);
                setStatus(role.status);
            } catch (err) {
                console.error(err);
                toast.error(err.message || "Error loading role data");
            }
        };

        fetchRole();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const updated_by = decoded.user_id;

            const payload = {
                name,
                status,
                updated_by,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/roles/update/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update role");
            }

            toast.success("Role updated successfully!");

            setTimeout(() => {
                navigate("/roles"); // ✅ back to roles list
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Role"} endpoint={"Edit Role"} />
            <Header name="Edit Role" description="Update existing Role" />

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Status */}
                <Box sx={{ my: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                            label="Status"
                        >
                            <MenuItem value={1}>Active</MenuItem>
                            <MenuItem value={0}>Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? "Updating..." : "Update Role"}
                </Button>
            </form>
        </Box>
    );
};

export default EditRole;
