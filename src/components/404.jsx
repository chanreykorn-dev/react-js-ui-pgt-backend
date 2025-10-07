import React from 'react';
import icomSvg from '../../public/assets/image/broken-link-svgrepo-com.svg'

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen text-center">
            <img src={icomSvg} alt="404 Not Found" className="mb-4 w-40 h-40" />
            <h1 className="text-4xl font-bold mb-2">404 - Not Found</h1>
            <p className="text-gray-600">The page you are looking for does not exist.</p>
        </div>
    );
}

export default NotFound;
