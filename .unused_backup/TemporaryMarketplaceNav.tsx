import React from 'react';
import { Link, useLocation } from 'react-router-dom';
/**
 * TEMPORARY COMPONENT
 *
 * This is a temporary navigation component to facilitate testing and development
 * of the marketplace sections. It should be removed or commented out once proper
 * navigation is integrated with the main application header.
 *
 * To remove:
 * 1. Delete or comment out the import in App.tsx
 * 2. Delete this file
 */
export const TemporaryMarketplaceNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  // Determine which link is active
  const isActive = (path: string) => {
    return currentPath.includes(path);
  };
  return <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b-2 border-yellow-400 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">
              TEMPORARY
            </span>
            <span className="font-medium text-yellow-800">
              Marketplace Navigation
            </span>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Link to="/" className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currentPath === '/' || isActive('/courses') && !isActive('/marketplace') ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
              Home/Courses
            </Link>
            <Link to="/marketplace/courses" className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isActive('/marketplace/courses') ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
              Courses Marketplace
            </Link>
            <Link to="/marketplace/financial" className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isActive('/marketplace/financial') ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
              Financial Services
            </Link>
            <Link to="/marketplace/non-financial" className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isActive('/marketplace/non-financial') ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
              Business Services
            </Link>
          </div>
        </div>
      </div>
    </div>;
};