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
import React, { useEffect, useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { NavTabsSingle } from '../../components/GallerySingle';

const EditSolution = () => {
    const { id } = useParams(); // get solution id from route
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [category_sub, setCategorySub] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const navigate = useNavigate();

    // Fetch existing solution details
    useEffect(() => {
        const fetchSolution = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const res = await fetch(`${import.meta.env.VITE_API_URL}/solutions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Failed to fetch solution");

                const data = await res.json();

                setTitle(data.title || "");
                setCategory(data.category || "");
                setCategorySub(data.category_sub || "");
                setStatus(data.status ?? 1);
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                console.error(err);
                toast.error(err.message);
            }
        };

        fetchSolution();
    }, [id]);

    // Handle image selection from Gallery
    const handleImageSelect = (imgId, path) => {
        setSelectedImageId(imgId);
        setSelectedImagePath(path);
        setOpen(false);
        toast.success("Image selected successfully!");
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Update solution
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                category,
                category_sub,
                title,
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                user_id,
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/solutions/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update solution");
            }

            toast.success("Solution updated successfully!");
            setTimeout(() => {
                navigate("/solution");
            }, 3000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating solution");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Solution'} endpoint={'Edit Solution'} />
            <Header name={'Edit Solution'} description={'Update an existing solution'} />

            <form onSubmit={handleSubmit}>
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="Solution Name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Category</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={category}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setCategory(newContent)}
                    />
                </Box>

                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Sub Category</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={category_sub}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setCategorySub(newContent)}
                    />
                </Box>

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

                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    {selectedImageId ? "Change Image" : "Choose Image"}
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? 'Saving...' : 'Update Solution'}
                </Button>
            </form>

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
                    <NavTabsSingle onSelectImage={(id, path) => handleImageSelect(id, path)} />
                </Box>
            </Modal>
        </Box>
    );
};

export default EditSolution;
