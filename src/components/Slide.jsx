import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import iconLogo from '../../public/assets/image/Artboard 12.png';

export const Slide = ({ isOpen, toggleSidebar }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [ingredientOpen, setIngredientOpen] = useState(false);
    const [sizeOpen, setSizeOpen] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);
    // import iconLogo from '../../public/assets/images/Artboard 3.png';



    const handleLinkClick = () => {
        setProfileOpen(false); // Close the dropdown when a main link is clicked
        setUserOpen(false); // Close the dropdown when a main link is clicked
        setProductOpen(false); // Close the dropdown when a main link is clicked
        setCategoryOpen(false); // Close the dropdown when a main link is clicked
        setIngredientOpen(false); // Close the dropdown when a main link is clicked
        setSizeOpen(false); // Close the dropdown when a main link is clicked
        setOrderOpen(false); // Close the dropdown when a main link is clicked
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 w-74 bg-gray-100 shadow-md text-gray-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
        >
            <div className="p-4">
                {/* <a href="#" className="text-2xl font-bold text-center">Dashboard Admin</a> */}
                <div className='flex justify-center w-full'>
                    <img src={iconLogo} alt="" className='mb-6 w-[180px]' />
                </div>
                <nav className="mt-6">
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className="block py-2 px-4 hover:bg-gray-200 rounded"
                    >
                        Dashboard
                    </Link>

                    {/* products */}
                    <div>
                        <button
                            onClick={() => setProductOpen(!productOpen)}
                            className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-200 rounded"
                        >
                            <span>Banner</span>
                            <svg
                                className={`w-4 h-4 transform transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {productOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link
                                    to="/banners"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    All
                                </Link>
                                <Link
                                    to="/banners/add"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Add
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* categories */}
                    <div>
                        <button
                            onClick={() => setCategoryOpen(!categoryOpen)}
                            className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-200 rounded"
                        >
                            <span>Categories</span>
                            <svg
                                className={`w-4 h-4 transform transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {categoryOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link
                                    to="/categories"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    All
                                </Link>
                                <Link
                                    to="/categories/add"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Add
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ingredient */}
                    <div>
                        <button
                            onClick={() => setIngredientOpen(!ingredientOpen)}
                            className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-200 rounded"
                        >
                            <span>Components</span>
                            <svg
                                className={`w-4 h-4 transform transition-transform ${ingredientOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {ingredientOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link
                                    to="/product"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Product
                                </Link>
                                <Link
                                    to="/choose-us"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Choose Us
                                </Link>
                                <Link
                                    to="/specification"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Specification
                                </Link>
                                <Link
                                    to="/mission"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Mission
                                </Link>
                                <Link
                                    to="/solution"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Solution
                                </Link>
                                <Link
                                    to="/development"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    History of Development
                                </Link>
                                <Link
                                    to="/welcome"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Welcome
                                </Link>
                                <Link
                                    to="/warranty"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Warranty
                                </Link>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={() => setUserOpen(!userOpen)}
                            className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-200 rounded"
                        >
                            <span>Users</span>
                            <svg
                                className={`w-4 h-4 transform transition-transform ${userOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {userOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                                <Link
                                    to="/users"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Users
                                </Link>
                                <Link
                                    to="/roles"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Role
                                </Link>
                                <Link
                                    to="/permission"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Permission
                                </Link>
                                <Link
                                    to="/role-permission"
                                    onClick={handleLinkClick}
                                    className="block py-2 px-4 hover:bg-gray-200 rounded text-sm"
                                >
                                    Role & Permission
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/gallery"
                        onClick={handleLinkClick}
                        className="block py-2 px-4 hover:bg-gray-200 rounded"
                    >
                        Gallery
                    </Link>
                </nav>
            </div>
        </div>
    );
};