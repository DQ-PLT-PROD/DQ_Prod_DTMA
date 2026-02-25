import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Page not found</h1>
                <p className="text-gray-600 mb-6">The page you are looking for doesn’t exist or has been moved.</p>
                <div className="flex items-center justify-center gap-3">
                    <Link to="/" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Go Home</Link>
                    <Link to="/dashboard" className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Dashboard</Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;


