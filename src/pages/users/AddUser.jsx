import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Button,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import { ActiveLastBreadcrumb } from "../../components/Breadcrumbs";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [status, setStatus] = useState(1);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Fetch roles from API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not logged in");

                const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch roles");

                const data = await res.json();
                setRoles(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load roles");
            }
        };

        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim() || !roleId) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not logged in");

            const decoded = jwtDecode(token);
            const created_by = decoded.user_id;

            const payload = {
                username,
                email,
                password,
                role_id: roleId,
                status,
                created_by,
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to add user");
            }

            toast.success("User added successfully!");

            setTimeout(() => {
                navigate("/users");
            }, 2000);

            // Reset form
            setUsername("");
            setEmail("");
            setPassword("");
            setRoleId("");
            setStatus(1);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error adding user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer position="top-right" autoClose={3000} />
            <ActiveLastBreadcrumb label={"User"} endpoint={"Create User"} />
            <Header name="Add User" description="Create a new User" />

            <form onSubmit={handleSubmit}>
                {/* Username */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Email */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Password */}
                <Box sx={{ my: 2 }}>
                    <FormControl sx={{ width: "100%" }}>
                        <OutlinedInput
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                </Box>

                {/* Role */}
                <Box sx={{ my: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            label="Role"
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                    {loading ? "Saving..." : "Add User"}
                </Button>
            </form>
        </Box>
    );
};

export default AddUser;
