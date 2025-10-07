import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
    Modal,
    IconButton
} from '@mui/material';
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import DeleteIcon from "@mui/icons-material/Delete";
import { GalleryContent } from '../../components/Gallery';
import { useParams, useNavigate } from "react-router-dom";
import Header from '../../components/Header';

const EditCategories = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const editor = useRef(null);

    const [discriptions, setDiscriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    // Removed image modal state

    // Fetch category details
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch category");

                const data = await res.json();

                setName(data.name);
                setDiscriptions(data.discriptions || "");
                setStatus(data.status);
            } catch (err) {
                console.error(err);
                toast.error("Error loading category");
            }
        };
        fetchCategory();
    }, [id]);



    // Submit update
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
                discriptions,
                status,
                user_id
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update category");
            }

            toast.success("Category updated successfully!");
            setTimeout(() => {
                navigate("/categories");
            }, 3000);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Edit Category"} endpoint={"Update Category"} />

            <Header name={"Edit Category"} description={"Update your category details here."} />

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

                {/* Descriptions */}
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
                    {loading ? 'Saving...' : 'Update Category'}
                </Button>
            </form>
        </Box>
    );
};

export default EditCategories;
