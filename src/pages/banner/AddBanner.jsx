import React, { useState } from "react";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Modal,
    Box,
    patch,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import { jwtDecode } from "jwt-decode";
import { NavTabs } from "../../components/Gallery";
// import { toast } from "react-toastify";
import { toast, ToastContainer } from 'react-toastify';
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import Header from "../../components/Header";
import { NavTabsSingle } from "../../components/GallerySingle";

export const AddBanner = () => {
    const [status, setStatus] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");

    const handleImageSelect = (id, path) => {
        setSelectedImageId(id);
        setSelectedImagePath(path);
        setOpen(false);
        toast.success(`Image selected successfully!`);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                image_id: selectedImageId.image_id, // ✅ number only
                path: selectedImageId.path,         // ✅ string
                status,
                user_id,
            };

            console.log("Payload to be sent:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/banners/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save banner");

            toast.success("Banner created successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Error creating banner");
        }
    };

    return (
        <div className="container mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />

            <ActiveLastBreadcrumb label={'Banner'} endpoint={'Create Banner'} />

            <Header name={"Add Banner"} description={"Create a new banner here."} />

            <form className="mt-3" onSubmit={handleSubmit}>
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={handleOpen}
                >
                    Choose Image
                </Button>

                {/* {selectedImageId && (
                    <p className="mt-2 text-green-600">
                        Selected Image ID: {selectedImageId}
                    </p>
                )} */}

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

                <div className="mt-4">
                    <Button variant="contained" type="submit">
                        Create Banner
                    </Button>
                </div>
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
                    <NavTabsSingle onSelectImage={handleImageSelect} />
                </Box>
            </Modal>
        </div>
    );
};
