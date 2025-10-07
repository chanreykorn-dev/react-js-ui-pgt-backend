import React from 'react';

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🟡 Runs once on page load (after refresh)
    useEffect(() => {
        // Decode JWT to restore user info on refresh
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                email: payload.sub,
                role: payload.role,
                id: payload.user_id,
                permissions: payload.permissions || [],
            });
        } catch (err) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const { token, role, user_id, permissions } = res.data;
        localStorage.setItem("token", token);
        setUser({
            email,
            role,
            id: user_id,
            permissions: permissions || [],
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            hasPermission: (perm) => {
                if (!user || !user.permissions) return false;
                return user.permissions.includes(perm);
            }
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);