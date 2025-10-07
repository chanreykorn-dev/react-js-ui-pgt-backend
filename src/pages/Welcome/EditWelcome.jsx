import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    Modal,
    OutlinedInput,
    FormLabel
} from "@mui/material";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from "../../components/Gallery";
import Header from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { NavTabsSingle } from "../../components/GallerySingle";

const EditWelcome = () => {
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [detail, setDetail] = useState("");
    const [title, setTitle] = useState("");
    const [banners, setBanners] = useState([]);
    const [selectedBanner, setSelectedBanner] = useState("");
    const { id } = useParams(); // ✅ get id from URL
    const navigate = useNavigate();

    // ✅ Fetch banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("User not logged in");
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/banners`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch banners");
                const data = await response.json();
                setBanners(data?.banners || data || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load banners");
            }
        };

        fetchBanners();
    }, []);

    // ✅ Fetch existing welcome by id
    useEffect(() => {
        const fetchWelcome = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("User not logged in");
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/welcome/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch welcome");
                const data = await response.json();

                // Prefill form fields
                setTitle(data.title || "");
                setDetail(data.detail || "");
                setStatus(data.status ?? 1);
                setSelectedBanner(data.banner_id || "");
                setSelectedImageId(data.image_id || null);
                setSelectedImagePath(data.path || "");
            } catch (err) {
                console.error(err);
                toast.error("Failed to load welcome data");
            }
        };

        if (id) fetchWelcome();
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
                detail: detail,
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                banner_id: selectedBanner,
                user_id,
            };

            console.log("Updating welcome with payload:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/welcome/update/${id}`, {
                method: "PUT", // ✅ update
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update welcome");
            }

            toast.success("Welcome updated successfully!");

            setTimeout(() => {
                navigate("/welcome");
            }, 3000);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating welcome");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Welcome"} endpoint={"Edit Welcome"} />
            <Header name={"Edit Welcome"} description={"Update existing welcome"} />

            <form onSubmit={handleSubmit}>
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ my: 2 }}>
                    <FormLabel>Details</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={detail}
                        placeholder="Details"
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDetail(newContent)}
                    />
                </Box>

                {/* ✅ Banner Select */}
                <Box sx={{ my: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Banner</InputLabel>
                        <Select
                            value={selectedBanner}
                            onChange={(e) => setSelectedBanner(e.target.value)}
                            label="Select Banner"
                        >
                            {banners.map((banner) => (
                                <MenuItem key={banner.id} value={banner.id}>
                                    {banner.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* ✅ Status */}
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
                    {loading ? "Updating..." : "Update Welcome"}
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

export default EditWelcome;
