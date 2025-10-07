import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
    Modal,
    FormLabel
} from '@mui/material';
import React, { useEffect, useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useParams, useNavigate } from "react-router-dom";
import { set } from 'jodit/esm/core/helpers';

const EditChooseUs = () => {
    const { id } = useParams(); // get id from URL
    const navigate = useNavigate();
    const editor = useRef(null);

    const [descriptions, setDescriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [category, setCategory] = useState("");
    const [sub_category, setSubCategory] = useState("");

    // Fetch existing data for edit
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL}/choose-us/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();
                setTitle(data.title || "");
                setDescriptions(data.descriptions || "");
                setCategory(data.category || "");
                setSubCategory(data.category_sub || "");
                setStatus(data.status ?? 1);
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                toast.error("Error fetching data");
            }
        };
        fetchData();
    }, [id]);

    // Handle image selection
    const handleImageSelect = (imgId, path) => {
        setSelectedImageId(imgId);
        setSelectedImagePath(path);
        setOpen(false);
        toast.success("Image selected successfully!");
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Handle update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!selectedImageId) {
            toast.error("Please select an image first");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                title,
                image_id: selectedImageId,
                path: selectedImagePath,
                descriptions,
                category,
                category_sub: sub_category,
                status,
                user_id,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/choose-us/update/${id}`, {
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
                navigate("/choose-us");
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
            <ActiveLastBreadcrumb label={'Choose Us'} endpoint={'Edit Choose Us'} />
            <Header name="Edit Choose Us" description="Update an existing Choose Us entry" />

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Description */}
                <Box sx={{ my: 2 }}>
                    <FormLabel>Description</FormLabel>
                    <JoditEditor
                        ref={editor}
                        placeholder="Description"
                        value={descriptions}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDescriptions(newContent)}
                    />
                </Box>

                {/* Category */}
                <Box sx={{ my: 2 }}>
                    <FormLabel>Category</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={category}
                        placeholder="Category"
                        config={{ height: 400 }}
                        onBlur={(newContent) => setCategory(newContent)}
                    />
                </Box>

                {/* Sub Category */}
                <Box sx={{ my: 2 }}>
                    <FormLabel>Sub Category</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={sub_category}
                        config={{ height: 400 }}
                        placeholder="Sub Category"
                        onBlur={(newContent) => setSubCategory(newContent)}
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

                {/* Image Picker */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    {selectedImageId ? "Change Icon" : "Upload Icon"}
                </Button>

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

            {/* Modal with Gallery */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 24,
                        maxHeight: "90vh",
                        overflowY: "auto",
                        width: "80%",
                    }}
                >
                    <NavTabs onSelectImage={(id, path) => handleImageSelect(id, path)} />
                </Box>
            </Modal>
        </Box>
    );
};

export default EditChooseUs;
