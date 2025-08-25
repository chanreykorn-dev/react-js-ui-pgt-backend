import * as React from 'react';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Box, Button, Chip, FormControl, InputAdornment, InputLabel, MenuItem,
    OutlinedInput, Select, Stack, SvgIcon, TextField, Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Quill.register('modules/imageResize', ImageResize);
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'roboto', 'mirza', 'georgia', 'impact'];
Quill.register(Font, true);

export const CreateProduct = () => {
    const [descriptions, setDescriptions] = useState('');
    const [size, setSize] = useState([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [ingredient, setIngredient] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState([]);
    const [pickupTime, setPickupTime] = React.useState(dayjs().startOf('hour'));
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [rate, setRate] = useState('');
    const [status, setStatus] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [file, setFile] = useState(null);

    const customColors = [
        '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00',
        '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc',
        '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff'
    ];

    const modules = {
        toolbar: [
            [{ 'font': Font.whitelist }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': customColors }, { 'background': customColors }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video', 'formula'],
            ['clean']
        ],
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar']
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('descriptions', descriptions);
            formData.append('price', price);
            formData.append('rate', rate);
            formData.append('pickup_time', pickupTime.format('HH:mm:ss'));
            formData.append('categories_id', selectedCategory);
            formData.append('size_id', selectedSize);
            formData.append('ingridient_id', JSON.stringify(selectedIngredient));
            formData.append('status', status);

            if (file) {
                formData.append('image', file);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/products/create`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Product created successfully');
            setTimeout(() => window.location.href = '/product', 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        }
    };

    const fetchSize = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/size`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSize(res.data);
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
    };

    const fetchIngredient = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/ingredient`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setIngredient(res.data);
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
    };

    useEffect(() => {
        fetchCategories();
        fetchSize();
        fetchIngredient();
    }, []);

    return (
        <div className="container mx-auto">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-4xl mb-4">Create Product</h1>

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />

                <div className="mt-4">
                    <ReactQuill
                        theme="snow"
                        value={descriptions}
                        onChange={setDescriptions}
                        modules={modules}
                        style={{ height: '300px', width: '100%' }}
                    />
                </div>

                <div className="mt-4">
                    <TextField
                        label="Price"
                        fullWidth
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                </div>

                <div className="mt-4">
                    <TextField
                        label="Rate"
                        fullWidth
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                            <TimePicker
                                label="Pickup Minute"
                                views={['minutes']} // Only allow minute selection
                                value={pickupTime}
                                onChange={(newValue) => {
                                    const currentHour = dayjs().hour();
                                    const updated = newValue.minute()
                                        ? dayjs().hour(currentHour).minute(newValue.minute())
                                        : newValue;
                                    setPickupTime(updated);
                                }}
                            />
                        </Stack>
                    </LocalizationProvider>
                </div>
                <div className="mt-4">
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            label="Category"
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="mt-4">
                    <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>
                        <Select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            label="Size"
                        >
                            {size.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="mt-4">
                    <FormControl fullWidth>
                        <InputLabel>Ingredients</InputLabel>
                        <Select
                            multiple
                            value={selectedIngredient}
                            onChange={(e) => setSelectedIngredient(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                            input={<OutlinedInput label="Ingredients" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((id) => {
                                        const item = ingredient.find((ing) => ing.id === id);
                                        return <Chip key={id} label={item ? item.name : id} />;
                                    })}
                                </Box>
                            )}
                        >
                            {ingredient.map((ing) => (
                                <MenuItem key={ing.id} value={ing.id}>
                                    {ing.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

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
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={
                            <SvgIcon>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775
                    5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752
                    3.752 0 0118 19.5H6.75z" />
                                </svg>
                            </SvgIcon>
                        }
                    >
                        Upload Image
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>
                </div>

                {previewUrl && (
                    <div style={{ marginTop: '10px' }}>
                        <Typography>Selected: {file?.name}</Typography>
                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px' }} />
                    </div>
                )}

                <div className="mt-4">
                    <Button variant="contained" type="submit">
                        Create Product
                    </Button>
                </div>
            </form>
        </div>
    );
};
