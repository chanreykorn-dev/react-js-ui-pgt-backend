import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
    Modal,
    FormLabel
} from '@mui/material';
import React, { useRef, useState } from "react";
import { ActiveLastBreadcrumb } from '../../components/Breadcrumbs';
import JoditEditor from "jodit-react";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import BackupIcon from "@mui/icons-material/Backup";
import { NavTabs } from '../../components/Gallery';
import Header from '../../components/Header';
import { set } from 'jodit/esm/core/helpers';
import { useNavigate } from 'react-router-dom';

const AddSpecification = () => {
    const editor = useRef(null);
    const [descriptions, setDescriptions] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [sub_category, setSubCategory] = useState("");
    const navigate = useNavigate();




    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Category name is required");
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
                descriptions: descriptions,
                category: category,
                category_sub: sub_category,
                status,
                user_id,
            };

            // console.log(payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/spicifications/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add spicifications");
            }

            toast.success("Specification added successfully!");

            setTimeout(() => {
                navigate("/specification");
            }, 3000);

            // Reset form
            setTitle("");
            setDescriptions("");
            setStatus(1);
            setCategory("");
            setSubCategory("");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding spicifications");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={'Specification'} endpoint={'Create Specification'} />
            <Header name="Add Specification" description="Create a new Specification entry" />

            <form onSubmit={handleSubmit} className='px-[16px] md:px-[16px'>
                {/* Category Name */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: '100%' }}>
                        <OutlinedInput
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ my: 2 }}>
                    <FormLabel>Description</FormLabel>
                    <JoditEditor
                        ref={editor}
                        placeholder="Description"
                        value={descriptions}
                        config={{ height: 400 }}
                        onBlur={(newContent) => setDescriptions(newContent)}
                    />
                </Box>

                <Box sx={{ my: 2 }}>
                    <FormLabel>Category</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={category}
                        placeholder="Category"
                        config={{ height: 400 }}
                        onBlur={(newContent) => setCategory(newContent)}
                    />
                </Box>

                {/* Descriptions with JoditEditor */}
                <Box sx={{ my: 2 }}>
                    <FormLabel>Sub Category</FormLabel>
                    <JoditEditor
                        ref={editor}
                        value={sub_category}
                        config={{ height: 400 }}
                        placeholder="Sub Category"
                        onBlur={(newContent) => setSubCategory(newContent)}
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

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{ marginBottom: 3 }}
                >
                    {loading ? 'Saving...' : 'Add Specification'}
                </Button>
            </form>
        </Box>
    );
};

export default AddSpecification;
