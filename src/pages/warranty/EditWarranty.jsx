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
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { NavTabsSingle } from '../../components/GallerySingle';

const EditWarranty = () => {
    const editor = useRef(null);
    const { id } = useParams(); // warranty id from route
    const [descriptions, setDescriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    // Fetch warranty details
    useEffect(() => {
        const fetchWarranty = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const response = await fetch(`${import.meta.env.VITE_API_URL}/warranties/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch warranty");
                const data = await response.json();

                setTitle(data.title || "");
                setDescriptions(data.descriptions || "");
                setStatus(data.status ?? 1);
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                console.error(err);
                toast.error("Failed to load warranty details");
            }
        };
        fetchWarranty();
    }, [id]);

    // Select image
    const handleImageSelect = (imageId, path) => {
        setSelectedImageId(imageId);
        setSelectedImagePath(path);
        setOpen(false);
        toast.success("Image selected successfully!");
    };

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
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                user_id,
            };

            console.log("Updating warranty:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/warranties/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update warranty");
            }

            toast.success("Warranty updated successfully!");

            setTimeout(() => {
                navigate("/warranty");
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating warranty");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Warranty'} endpoint={'Edit Warranty'} />
            <Header name="Edit Warranty" description="Update warranty details" />

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
                        value={descriptions}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDescriptions(newContent)}
                    />
                </Box>

                {/* Image */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={() => setOpen(true)}
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
                    {loading ? 'Saving...' : 'Update Warranty'}
                </Button>
            </form>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
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

export default EditWarranty;
