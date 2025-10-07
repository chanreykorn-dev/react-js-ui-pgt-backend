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
import React, { useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { set } from 'jodit/esm/core/helpers';
import { NavTabsSingle } from '../../components/GallerySingle';


const AddDevelopment = () => {
    const editor = useRef(null);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState("");
    const [year, setYear] = useState("");
    const [title, setTitle] = useState("");
    const navigate = useNavigate();
    const [value, setValue] = React.useState(null);



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
                title: title,
                year: value ? value.year() : null,
                image_id: selectedImageId,
                path: selectedImagePath,
                status,
                user_id,
            };

            console.log(payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/industry/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add development");
            }

            toast.success("Development added successfully!");

            setTimeout(() => {
                navigate("/development");
            }, 3000);

            // Reset form
            setTitle("");
            setStatus(1);
            setSelectedImageId(null);
            setSelectedImagePath("");
            setValue(null);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding development");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Development'} endpoint={'Create Development'} />
            <Header name={'Create Development'} description={'Create a new development'} />
            <form onSubmit={handleSubmit}>
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ my: 2, width: "100%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            views={["year"]}
                            label="Select year"
                            value={value}
                            onChange={(newValue) => setValue(newValue)}
                            slotProps={{ textField: { fullWidth: true } }} // makes input take full width
                        />
                    </LocalizationProvider>
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
                    {loading ? 'Saving...' : 'Add Category'}
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
                    {/* Pass both id and path from Gallery */}
                    <NavTabsSingle onSelectImage={(id, path) => handleImageSelect(id, path)} />
                </Box>
            </Modal>
        </Box>
    );
};

export default AddDevelopment;
