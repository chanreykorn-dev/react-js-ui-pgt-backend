import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const AddRole = () => {
    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const created_by = decoded.user_id;

            const payload = {
                name,
                status,
                created_by,
            };

            console.log(payload);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/roles/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add role");
            }

            toast.success("User added successfully!");

            setTimeout(() => {
                navigate("/users");
            }, 2000);

            // Reset form
            setName("");
            setStatus(1);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"User"} endpoint={"Create Role"} />
            <Header name="Add Role" description="Create a new Role" />

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
                    {loading ? "Saving..." : "Add Role"}
                </Button>
            </form>
        </Box>
    );
};

export default AddRole;
