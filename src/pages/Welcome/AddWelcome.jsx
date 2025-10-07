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
import { useNavigate } from "react-router-dom";
import { NavTabsSingle } from "../../components/GallerySingle";

const AddWelcome = () => {
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [detail, setDetail] = useState("");
    const [title, setTitle] = useState("");
    const [banners, setBanners] = useState([]); // ✅ store banner list
    const [selectedBanner, setSelectedBanner] = useState(""); // ✅ selected banner
    const navigate = useNavigate();

    // Fetch banners from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const token = localStorage.getItem("token"); // ✅ get token here
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

                // ✅ adjust depending on your backend response
                setBanners(data?.banners || data || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load banners");
            }
        };

        fetchBanners();
    }, []);


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

        if (!selectedBanner) {
            toast.error("Please select a banner");
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
                banner_id: selectedBanner, // ✅ send selected banner id
                user_id,
            };

            console.log("Payload:", payload); // Debugging line

            const response = await fetch(`${import.meta.env.VITE_API_URL}/welcome/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add welcome");
            }

            toast.success("Welcome added successfully!");

            setTimeout(() => {
                navigate("/welcome");
            }, 3000);

            // Reset form
            setTitle("");
            setDetail("");
            setStatus(1);
            setSelectedBanner("");
            setSelectedImageId(null);
            setSelectedImagePath("");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding welcome");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Welcome"} endpoint={"Create Welcome"} />
            <Header name={"Create Welcome"} description={"Create a new welcome"} />

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
                    <FormLabel>Detail</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={detail}
                        placeholder="Detail"
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDetail(newContent)}
                    />
                </Box>

                {/* ✅ Banner Select from API */}
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
                    {loading ? "Saving..." : "Add Development"}
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

export default AddWelcome;
