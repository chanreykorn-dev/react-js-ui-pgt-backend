import React from 'react';
import Avatar from '@mui/material/Avatar';
import { jwtDecode } from 'jwt-decode'; // default import

// Generate a consistent color from a string
function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

// Create initials and style for Avatar
function stringAvatar(name) {
    const nameParts = name.trim().split(' ');
    const initials = nameParts
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: initials,
    };
}

// Avatar component that reads username from token
export default function BackgroundLetterAvatars() {
    const token = localStorage.getItem('token');
    let username = 'Guest User';

    if (token) {
        try {
            const decoded = jwtDecode(token);
            username = decoded.username || decoded.name || 'Guest User';
        } catch (err) {
            console.error('Invalid token', err);
        }
    }

    return <Avatar {...stringAvatar(username)} />;
}

// Header component
export const NavigatorBar = ({ toggleSidebar }) => {
    return (
        <header className="bg-gray-100 shadow-md p-4 flex justify-between items-center md:ml-full">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-gray-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold ml-2">Dashboard</h1>
            </div>
            <div>
                <BackgroundLetterAvatars />
            </div>
        </header>
    );
};
