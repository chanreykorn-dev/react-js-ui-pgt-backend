import React, { useState, useEffect } from "react";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Modal,
    Box,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import { jwtDecode } from "jwt-decode";
import { NavTabsSingle } from "../../components/GallerySingle";
import { toast, ToastContainer } from "react-toastify";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import JoditEditor from "jodit-react";

export const EditBanner = () => {
    const { id } = useParams();
    const [banner, setBanner] = useState(null);
    const [status, setStatus] = useState(1);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const editor = React.useRef(null);
    const navigate = useNavigate();

    // ✅ Fetch banner by ID
    const fetchBanner = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/banners/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch banner");

            const data = await response.json();
            setBanner(data);
            setStatus(data.status);
            setSelectedImageId(data.image_id);
            setSelectedImagePath(data.path);
            setTitle(data.title || "");
        } catch (err) {
            console.error(err);
            toast.error("Error loading banner");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchBanner();
    }, [id]);

    // ✅ When user selects an image
    const handleImageSelect = (imageOrId, maybePath) => {
        if (typeof imageOrId === "object" && imageOrId !== null) {
            // Case: passed an object { image_id, path }
            setSelectedImageId(imageOrId.image_id);
            setSelectedImagePath(imageOrId.path);
        } else {
            // Case: passed id + path separately
            setSelectedImageId(imageOrId);
            setSelectedImagePath(maybePath || "");
        }
        setOpen(false);
        toast.success("Image selected successfully!");
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // ✅ Submit updated banner
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!banner || !banner.id) {
            toast.error("Banner data is missing");
            return;
        }

        if (!selectedImageId) {
            toast.error("Please select an image first");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            const payload = {
                image_id: selectedImageId,
                path: selectedImagePath,
                title: title,
                status: status,
                user_id: user_id,
            };

            console.log("Payload to be sent:", payload);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/banners/update/${banner.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update banner");

            toast.success("Banner updated successfully!");
            setTimeout(() => {
                navigate("/banners");
            }, 3000);
        } catch (err) {
            console.error(err);
            toast.error("Error updating banner");
        }
    };

    if (loading) return <p>Loading banner...</p>;
    if (!banner) return <p>Banner not found.</p>;

    return (
        <div className="container mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"Banner"} endpoint={"Update Banner"} />
            <Header
                name={"Update Banner"}
                description={"Update your banner details here."}
            />

            <form className="mt-3" onSubmit={handleSubmit}>
                {/* ✅ Image Selection */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                >
                    Change Image
                </Button>
                <Box sx={{ my: 2 }}>
                    <JoditEditor
                        ref={editor}
                        value={title}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setTitle(newContent)}
                    />
                </Box>

                {/* ✅ Status Select */}
                <div className="mt-4">
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
                </div>

                {/* ✅ Submit Button */}
                <div className="mt-4">
                    <Button variant="contained" type="submit">
                        Update Banner
                    </Button>
                </div>
            </form>

            {/* ✅ Image Picker Modal */}
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
        </div>
    );
};
