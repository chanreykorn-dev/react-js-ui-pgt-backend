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
import { GalleryContent } from '../../components/Gallery';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
// import { set } from 'jodit/types/core/helpers';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AddProduct = () => {
    const theme = useTheme();
    const [name, setName] = useState("");
    const [detail, setDetail] = useState("");
    const [category_id, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [subCategory, setSubCategory] = useState("");
    const [category, setCategory] = useState("");
    const [specificationId, setSpecificationId] = useState([]);
    const [spicification, setSpicification] = useState([]);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const editor = useRef(null);
    const navigate = useNavigate();

    const [selectedImages, setSelectedImages] = useState([]); // array of selected images

    // Fetch specifications
    const fetchSpicification = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/spicifications`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch specifications");
            const data = await response.json();
            setSpicification(data);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching specifications");
        }
    };

    // Fetch categories
    const fetchCategory = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        fetchSpicification();
        fetchCategory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return toast.error("Name is required");
        if (!selectedImages || selectedImages.length === 0)
            return toast.error("Please select at least one image");
        if (!category_id) return toast.error("Please select a category");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            // Payload with multi-image array
            const payload = {
                name: name,
                detail: detail,
                category_id,
                spicification_id: specificationId,
                images: selectedImages.map(img => ({
                    id: img.id || null,
                    path: img.path
                })),
                category: category,
                category_sub: subCategory,
                status,
                user_id
            };

            console.log("Payload:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add product");
            }

            toast.success("Product added successfully!");
            setTimeout(() => navigate("/product"), 2000);

            // Reset form
            setName("");
            setDetail("");
            setCategoryId("");
            setSpecificationId([]);
            setSubCategory("");
            setCategory("");
            setStatus(1);
            setSelectedImages([]);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding product");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label="Product" endpoint="Create Product" />
            <Header name="Create Product" description="Create a new product" />

            <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Product Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Description */}
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Description</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={detail}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDetail(newContent)}
                    />
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
                        value={subCategory}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setSubCategory(newContent)}
                    />
                </Box>

                {/* Category Dropdown */}
                <Box sx={{ my: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select Category</InputLabel>
                        <Select
                            value={category_id}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Multi-Select Specifications */}
                <FormControl sx={{ width: '100%' }}>
                    <InputLabel>Specifications</InputLabel>
                    <Select
                        multiple
                        value={specificationId}
                        onChange={(e) => {
                            const { value } = e.target;
                            setSpecificationId(
                                typeof value === "string" ? value.split(",").map(Number) : value
                            );
                        }}
                        input={<OutlinedInput label="Specifications" />}
                        renderValue={(selected) => {
                            if (!selected.length) return <em>Select Specifications</em>;
                            return selected
                                .map((id) => spicification.find((spec) => spec.id === id)?.title)
                                .filter(Boolean)
                                .join(", ");
                        }}
                        MenuProps={MenuProps}
                    >
                        {spicification.map((spec) => (
                            <MenuItem
                                key={spec.id}
                                value={spec.id}
                                style={{
                                    fontWeight: specificationId.includes(spec.id)
                                        ? theme.typography.fontWeightMedium
                                        : theme.typography.fontWeightRegular,
                                }}
                            >
                                {spec.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Status */}
                <Box sx={{ my: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                        >
                            <MenuItem value={1}>Active</MenuItem>
                            <MenuItem value={0}>Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Choose Images */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    {selectedImages.length > 0
                        ? `${selectedImages.length} image(s) selected`
                        : "Choose Images"}
                </Button>

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? "Saving..." : "Add Solution"}
                </Button>
            </form>

            {/* Modal with Gallery */}
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
                    <GalleryContent
                        onSelectImages={(images) => setSelectedImages(images)}
                    />

                    {/* OK button */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (selectedImages.length === 0) {
                                    toast.error("Please select at least one image!");
                                    return;
                                }
                                setOpen(false);
                                toast.success(`${selectedImages.length} image(s) selected!`);
                            }}
                        >
                            OK
                        </Button>
                    </div>
                </Box>
            </Modal>
        </Box>
    );
};

export default AddProduct;
