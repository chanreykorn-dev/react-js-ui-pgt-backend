import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import iconLogo from '../../../public/assets/image/Artboard 12.png';


// SignIn component for user authentication
export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!email || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }
        try {
            // Use AuthContext login for authentication and permission setup
            await login(email, password);
            toast.success('Login successful!');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Login failed');
            toast.error(err.message || 'Login failed');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full h-screen flex items-center justify-center bg-gray-100 p-8'>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
            <div className="bg-white p-6 rounded shadow-md w-full max-w-[22rem]">
                {/* <h1 className='text-3xl font-bold</div> mb-6'>Login</h1> */}
                <div className="flex justify-center p-6">
                    <img src={iconLogo} alt="Logo" className="mb-6 w-[250px]" />
                </div>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ '& > :not(style)': { width: '100%', marginBottom: 3 } }}>
                        <TextField
                            id="email"
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            // required
                            autoComplete="email"
                        />
                    </Box>
                    <Box sx={{ '& > :not(style)': { width: '100%', marginBottom: 3 } }}>
                        <TextField
                            id="password"
                            label="Password"
                            variant="outlined"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            // required
                            autoComplete="current-password"
                        />
                    </Box>
                    {error && <div className="text-red-600 p-3 text-center">{error}</div>}
                    <Button variant="contained" fullWidth type="submit" disabled={loading} sx={{ marginBottom: 3 }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </div>
        </div>
    );
}