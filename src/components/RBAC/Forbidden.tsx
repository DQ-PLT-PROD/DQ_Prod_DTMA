import React from 'react';
import { Link } from 'react-router-dom';

export function Forbidden({ message = 'You do not have permission to view this page.' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center bg-white shadow rounded-lg p-6">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
