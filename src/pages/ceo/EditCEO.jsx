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
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';

const EditCEO = () => {
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [detail, setDetail] = useState("");
    const navigate = useNavigate();
    const { id } = useParams(); // CEO ID from route

    // Fetch CEO data on mount
    useEffect(() => {
        const fetchCEO = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/ceo/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch CEO details");
                }

                const data = await response.json();
                setName(data.name || "");
                setDetail(data.detail || "");
                setStatus(data.status ?? 1);
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                console.error(err);
                toast.error("Error fetching CEO details");
            }
        };

        fetchCEO();
    }, [id]);

    // Handle image selection from Gallery
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

        if (!name.trim()) {
            toast.error("Name is required");
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
                name,
                detail,
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                user_id,
            };

            console.log("Updating CEO:", payload);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/ceo/update/${id}`,
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
                throw new Error(errorText || "Failed to update CEO");
            }

            toast.success("CEO updated successfully!");

            setTimeout(() => {
                navigate("/ceo");
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating CEO");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'CEO'} endpoint={'Edit CEO'} />
            <Header name={'Edit CEO'} description={'Update CEO information'} />
            <form onSubmit={handleSubmit}>
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="CEO Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Description</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={detail}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDetail(newContent)}
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

                {/* Choose Image */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    {selectedImageId ? "Change Image" : "Choose Image"}
                </Button>

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? 'Saving...' : 'Update CEO'}
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

export default EditCEO;
