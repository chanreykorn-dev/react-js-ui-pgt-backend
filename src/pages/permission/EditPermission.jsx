import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    OutlinedInput
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const EditPermission = () => {
    const theme = useTheme();
    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams(); // permission ID from URL

    // ✅ Fetch permission data when page loads
    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/permissions/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch permission");

                const data = await response.json();
                setName(data.name || "");
                setStatus(data.status ?? 1);
            } catch (err) {
                console.error(err);
                toast.error(err.message || "Error fetching permission");
            }
        };

        if (id) fetchPermission();
    }, [id]);

    // ✅ Handle update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return toast.error("Name is required");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                name,
                status,
                user_id,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/permissions/update/${id}`,
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
                throw new Error(errorText || "Failed to update permission");
            }

            toast.success("Permission updated successfully!");
            setTimeout(() => navigate("/permission"), 3000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating permission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label="Permission" endpoint="Edit Permission" />
            <Header name="Edit Permission" description="Update an existing permission" />

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Permission Name"
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
                    {loading ? "Updating..." : "Update Permission"}
                </Button>
            </form>
        </Box>
    );
};

export default EditPermission;
