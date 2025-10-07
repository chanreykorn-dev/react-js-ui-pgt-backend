import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Modal,
    Tabs,
    Tab,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CollectionsIcon from '@mui/icons-material/Collections';
import { ActiveLastBreadcrumb } from '../components/Breadcrumbs';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';


// Upload Gallery Component
export const UploadGallery = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const previewFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );
        setFiles((prev) => [...prev, ...previewFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
        },
    });

    const handleUpload = async () => {
        if (files.length === 0) return alert("Please select an image first.");

        const token = localStorage.getItem("token");
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("file", files[0]); // only first file
            formData.append("user_id", "1");
            formData.append("image_id", "1"); // optional

            const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery/create`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || "Upload failed");
            }

            setFiles([]);
            toast.success("Image uploaded successfully!");
            navigator("/gallery");

        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <form encType="multipart/form-data">
                <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center transition ${isDragActive ? 'bg-blue-50 border-blue-400' : 'bg-gray-100 border-gray-400'
                        }`}
                >
                    <input {...getInputProps()} />
                    <CloudUpload size={40} className="text-blue-800 mb-2" />
                    <p className="text-blue-900">Drag & drop some images here, or click to select images</p>
                </div>

                {/* Preview section */}
                {files.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                            {files.map((file, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={file.preview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded shadow"
                                        onLoad={() => URL.revokeObjectURL(file.preview)}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="mt-4"
                        >
                            {uploading ? 'Uploading...' : 'Upload Images'}
                        </Button>
                    </>
                )}
            </form>
        </div>
    );
};


export const GalleryContent = ({ onSelectImages }) => {
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState({});
    const [selectedImages, setSelectedImages] = useState([]); // <-- store multi-selected images

    const fetchImages = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch images");

            const result = await response.json();
            const dataArray = Array.isArray(result.gallery) ? result.gallery : [];

            const formatted = dataArray.map((img) => ({
                id: img.id,
                name: img.path,
                src: `${import.meta.env.VITE_API_URL}/uploads/${img.path}`,
            }));

            const initialLoading = {};
            formatted.forEach((img) => (initialLoading[img.id] = true));
            setLoadingImages(initialLoading);

            setImages(formatted);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleDelete = async (id) => {
        try {
            setImages((prev) => prev.filter((img) => img.id !== id));
            setSelectedImages((prev) => prev.filter((i) => i.id !== id)); // remove if selected

            const response = await fetch(`${import.meta.env.VITE_API_URL}/gallery/delete/${id}`, {
                method: "PUT",
            });

            if (!response.ok) throw new Error("Failed to delete image on server");

            toast.success(`Image ${id} deleted successfully`);
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image. Please try again.");
            fetchImages();
        }
    };

    // Toggle image selection
    const toggleSelect = (img) => {
        setSelectedImages((prev) => {
            const exists = prev.find((i) => i.id === img.id);
            if (exists) return prev.filter((i) => i.id !== img.id);
            return [...prev, { id: img.id, path: img.name }];
        });
    };

    // Send selected images to parent
    useEffect(() => {
        if (onSelectImages) onSelectImages(selectedImages);
    }, [selectedImages]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4 p-4">
            {images.map((item) => {
                const isLoading = loadingImages[item.id];
                const isSelected = selectedImages.some((i) => i.id === item.id);

                return (
                    <div
                        key={item.id}
                        className={`relative bg-white rounded shadow overflow-hidden group cursor-pointer border-4 ${isSelected ? "border-blue-500" : "border-transparent"}`}
                        onClick={() => toggleSelect(item)}
                    >
                        {!isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <Loading />
                            </div>
                        )}

                        <img
                            src={item.src}
                            alt={item.name}
                            className={`w-full h-48 object-cover transition-opacity duration-500 ${!isLoading ? "opacity-0" : "opacity-100"}`}
                            onLoad={() => setLoadingImages((prev) => ({ ...prev, [item.id]: false }))}
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-white opacity-70 text-sm flex justify-between items-center p-2">
                            <span className="truncate">{item.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="cursor-pointer"
                            >
                                <DeleteIcon style={{ color: "red" }} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};





// ✅ Custom Tab Link Component
function LinkTab(props) {
    return (
        <Tab
            component="a"
            onClick={(event) => {
                if (
                    !event.defaultPrevented &&
                    event.button === 0 &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.altKey &&
                    !event.shiftKey
                ) {
                    event.preventDefault();
                }
            }}
            aria-current={props.selected ? 'page' : undefined}
            {...props}
        />
    );
}

LinkTab.propTypes = {
    selected: PropTypes.bool,
};

// Navigation Tabs Component
export const NavTabs = ({ onSelectImage }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label="navigation tabs"
                role="navigation"
            >
                <LinkTab label="Gallery" to="/page-one" selected={value === 0} />
                <LinkTab label="Upload" to="/page-two" selected={value === 1} />
            </Tabs>

            <Box sx={{ p: 2 }}>
                {value === 0 && <GalleryContent onSelectImage={onSelectImage} />}
                {value === 1 && <UploadGallery />}
            </Box>
        </Box>
    );
};

// Main Gallery Component with Modal
export const Gallery = () => {
    const [open, setOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [loading, setLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        width: isMobile ? '90%' : 900,
        height: isMobile ? '80%' : 500,
        overflowY: 'auto',
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

            <ActiveLastBreadcrumb label={'Gallery'} endpoint={'Uploads'} />
            <Button
                variant="contained"
                startIcon={<CollectionsIcon />}
                onClick={handleOpen}
            >
                Open Gallery
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <NavTabs />
                </Box>
            </Modal>

            <GalleryContent />
        </div>
    );
};
