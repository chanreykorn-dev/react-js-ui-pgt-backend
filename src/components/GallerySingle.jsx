import { UploadGallery } from "./Gallery";
import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './Loading';

// ----------------- NavTabsSingle -----------------
export const NavTabsSingle = ({ onSelectImage }) => {
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
                <Tab label="Gallery" />
                <Tab label="Upload" />
            </Tabs>

            <Box sx={{ p: 2 }}>
                {value === 0 && <GalleryContent onSelectImage={onSelectImage} />}
                {value === 1 && <UploadGallery />}
            </Box>
        </Box>
    );
};

// ----------------- GalleryContent -----------------
export const GalleryContent = ({ onSelectImage }) => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // single selected image

    // Fetch images
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

            // ...existing code...

            setImages(formatted);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Delete image
    const handleDelete = async (id) => {
        try {
            setImages((prev) => prev.filter((img) => img.id !== id));
            if (selectedImage?.id === id) setSelectedImage(null);

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

    // Select image (single)
    const selectImage = (img) => {
        const isSame = selectedImage?.id === img.id;
        const newSelection = isSame ? null : {
            id: img.id,
            path: img.name
        };
        setSelectedImage(newSelection);
        if (onSelectImage) {
            onSelectImage(img.id, img.name);
        }
    };



    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4 p-4">
            {images.map((item) => {
                const isSelected = selectedImage?.id === item.id;
                return (
                    <div
                        key={item.id}
                        className={`relative bg-white rounded shadow overflow-hidden group cursor-pointer border-4 ${isSelected ? "border-blue-500" : "border-transparent"}`}
                        onClick={() => selectImage(item)}
                        title={`ID: ${item.id}, Path: ${item.name}`}
                    >
                        <img
                            src={item.src}
                            alt={item.name}
                            className="w-full h-48 object-cover transition-opacity duration-500 opacity-100"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white opacity-70 text-sm flex justify-between items-center p-2">
                            <span className="truncate">{item.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                }}
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
