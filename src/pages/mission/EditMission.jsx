import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    Modal
} from '@mui/material';
import React, { useEffect, useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { NavTabsSingle } from '../../components/GallerySingle';

const EditMission = () => {
    const { id } = useParams(); // Get mission ID from URL
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [mission, setMission] = useState("");
    const [history, setHistory] = useState("");
    const [value, setValue] = useState("");
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch existing mission
    useEffect(() => {
        const fetchMission = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const response = await fetch(`${import.meta.env.VITE_API_URL}/missions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Failed to fetch mission");

                const data = await response.json();
                setMission(data.mission || "");
                setValue(data.value || "");
                setHistory(data.history || "");
                setStatus(data.status ?? 1);
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                console.error(err);
                toast.error(err.message || "Error fetching mission");
            }
        };
        fetchMission();
    }, [id]);

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

        if (!mission.trim()) return toast.error("Mission is required");
        if (!value.trim()) return toast.error("Value is required");
        if (!history.trim()) return toast.error("History is required");
        if (!selectedImageId) return toast.error("Please select an image");

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                mission,
                value,
                history,
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                user_id,
            };

            console.log("Payload for update:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/missions/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update mission");
            }

            toast.success("Mission updated successfully!");
            setTimeout(() => {
                navigate(`/mission`);
            }, 3000);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating mission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Mission'} endpoint={'Edit Mission'} />
            <Header name={'Edit Mission'} description={'Update mission details'} />

            <form onSubmit={handleSubmit}>
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Mission</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={mission}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setMission(newContent)}
                    />
                </Box>
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Value</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={value}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setValue(newContent)}
                    />
                </Box>
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>History</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={history}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setHistory(newContent)}
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
                    {loading ? 'Updating...' : 'Update Mission'}
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
                    <NavTabsSingle onSelectImage={(id, path) => handleImageSelect(id, path)} />
                </Box>
            </Modal>
        </Box>
    );
};

export default EditMission;
