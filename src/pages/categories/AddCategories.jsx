import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
    Modal
} from '@mui/material';
import React, { useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { GalleryContent, NavTabs } from '../../components/Gallery';
import { set } from 'jodit/esm/core/helpers';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const AddCategories = () => {
    const editor = useRef(null);
    const [discriptions, setDiscriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                name,
                discriptions: discriptions,
                status,
                user_id,
            };

            console.log(payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add category");
            }

            toast.success("Category added successfully!");

            setTimeout(() => {
                navigate("/categories");
            }, 3000);

            // Reset form
            setName("");
            setDiscriptions("");
            setStatus(1);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Add Category"} endpoint={"Create Category"} />

            <Header name={"Add Category"} description={"Create a new category here."} />
            <form onSubmit={handleSubmit}>
                {/* Category Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Descriptions with JoditEditor */}
                <Box sx={{ my: 2 }}>
                    <JoditEditor
                        ref={editor}
                        value={discriptions}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDiscriptions(newContent)}
                    />
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
                    {loading ? 'Saving...' : 'Add Category'}
                </Button>
            </form>
        </Box>
    );
};

export default AddCategories;
