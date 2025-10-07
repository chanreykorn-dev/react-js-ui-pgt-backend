import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    Modal,
    OutlinedInput
} from '@mui/material';
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { GalleryContent } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
// import { set } from 'jodit/types/core/helpers';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AddPermission = () => {
    const theme = useTheme();
    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return toast.error("Name is required");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            // Payload with multi-image array
            const payload = {
                name: name,
                status,
                user_id
            };

            console.log("Payload:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/permissions/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add permission");
            }

            toast.success("Permission added successfully!");
            setTimeout(() => navigate("/permission"), 3000);

            // Reset form
            setName("");
            setStatus(1);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding permission");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label="Product" endpoint="Create Product" />
            <Header name="Create Product" description="Create a new product" />

            <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Product Name"
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
                    {loading ? "Saving..." : "Add Permission"}
                </Button>
            </form>
        </Box>
    );
};

export default AddPermission;
