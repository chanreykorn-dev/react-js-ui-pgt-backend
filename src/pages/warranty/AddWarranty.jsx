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
import React, { useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { NavTabsSingle } from '../../components/GallerySingle';

const AddWarranty = () => {
    const editor = useRef(null);
    const [descriptions, setDescriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const navigate = useNavigate();
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [open, setOpen] = useState(false); // ✅ FIX: modal state

    const handleImageSelect = (id, path) => {
        setSelectedImageId(id);
        setSelectedImagePath(path);
        setOpen(false);
        toast.success("Image selected successfully!");
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Warranty name is required");
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
                descriptions,
                image_id: selectedImageId,    // ✅ send image id
                path: selectedImagePath,      // ✅ send path too if API needs it
                status,
                user_id,
            };

            console.log("Submitting payload:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/warranties/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add warranty");
            }

            toast.success("Warranty added successfully!");

            setTimeout(() => {
                navigate("/warranty");
            }, 3000);

            // Reset form
            setTitle("");
            setDescriptions("");
            setStatus(1);
            setSelectedImageId(null);
            setSelectedImagePath("");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding warranty");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Warranty'} endpoint={'Create Warranty'} />
            <Header name="Add Warranty" description="Create a new Warranty entry" />

            <form onSubmit={handleSubmit}>
                {/* Warranty Title */}
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

                {/* Image Selection */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    {selectedImageId ? "Change Image" : "Choose Image"}
                </Button>

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
                    {loading ? 'Saving...' : 'Add Warranty'}
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
                    <NavTabsSingle onSelectImage={handleImageSelect} />
                </Box>
            </Modal>
        </Box>
    );
};

export default AddWarranty;
