import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    Modal,
    OutlinedInput,
    IconButton
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import DeleteIcon from "@mui/icons-material/Delete";
import { GalleryContent } from "../../components/Gallery";
import Header from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

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

const EditProduct = () => {
    const { id } = useParams();
    const theme = useTheme();
    const editor = useRef(null);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [detail, setDetail] = useState("");
    const [category_id, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [specificationId, setSpecificationId] = useState([]);
    const [spicification, setSpicification] = useState([]);
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // All images (existing + new)
    const [selectedImages, setSelectedImages] = useState([]);

    // Fetch product details
    const fetchProduct = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/products/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error("Failed to fetch product");
            const data = await response.json();

            setName(data.name || "");
            setDetail(data.detail || "");
            setCategoryId(data.category_id || "");
            setCategory(data.category || "");
            setSubCategory(data.category_sub || "");
            setSpecificationId(data.spicifications || []);
            setStatus(data.status || 1);
            setSelectedImages(data.images || []);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching product");
        }
    };

    // Fetch specifications
    const fetchSpicification = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/spicifications`, {
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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
        fetchProduct();
        fetchSpicification();
        fetchCategory();
    }, [id]);

    // Remove image by index
    const handleRemoveImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Add images from Gallery, prevent duplicates
    const handleAddImages = (images) => {
        const newImages = images.filter(
            (img) => !selectedImages.some((i) => i.id === img.id && i.path === img.path)
        );
        setSelectedImages((prev) => [...prev, ...newImages]);
    };

    // Handle update
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Name is required");
        if (!category_id) return toast.error("Please select a category");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");
            const decoded = jwtDecode(token);

            const payload = {
                id,
                name,
                detail,
                category_id,
                spicification_id: specificationId,
                images: selectedImages.map((img) => ({
                    id: img.id || null,
                    path: img.path
                }))
                ,
                category,
                category_sub: subCategory,
                status,
                user_id: decoded.user_id
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/products/update/${id}`,
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
                throw new Error(errorText || "Failed to update product");
            }

            toast.success("Product updated successfully!");
            setTimeout(() => navigate("/product"), 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error updating product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label="Product" endpoint="Edit Product" />
            <Header name="Edit Product" description="Update product details" />

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

                {/* Category / SubCategory Editors */}
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Category</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={category}
                        config={{ height: 200 }}
                        onBlur={(newContent) => setCategory(newContent)}
                    />
                </Box>
                <Box sx={{ my: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>Sub Category</InputLabel>
                    <JoditEditor
                        ref={editor}
                        value={subCategory}
                        config={{ height: 200 }}
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
                <FormControl sx={{ width: "100%" }}>
                    <InputLabel>Specifications</InputLabel>
                    <Select
                        multiple
                        value={specificationId}
                        onChange={(e) => {
                            const { value } = e.target;
                            setSpecificationId(
                                typeof value === "string"
                                    ? value.split(",").map(Number)
                                    : value
                            );
                        }}
                        input={<OutlinedInput label="Specifications" />}
                        renderValue={(selected) =>
                            selected
                                .map((id) => spicification.find((s) => s.id === id)?.title)
                                .filter(Boolean)
                                .join(", ")
                        }
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

                {/* Images Grid */}
                <Box sx={{ my: 2 }}>
                    <InputLabel>Images</InputLabel>
                    <div className="flex flex-wrap gap-3">
                        {selectedImages.map((img, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${img.path}`}
                                    alt="product"
                                    style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        top: -10,
                                        right: -10,
                                        bgcolor: "white",
                                    }}
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))}
                    </div>
                </Box>

                {/* Add new images */}
                <Button
                    variant="contained"
                    endIcon={<BackupIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ my: 2 }}
                    fullWidth
                >
                    Add More Images
                </Button>

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? "Saving..." : "Update Product"}
                </Button>
            </form>

            {/* Gallery Modal */}
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
                    <GalleryContent onSelectImages={handleAddImages} />

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

export default EditProduct;
