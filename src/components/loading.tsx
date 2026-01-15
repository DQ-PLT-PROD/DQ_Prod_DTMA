import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'minimal';
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  subMessage,
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-4">
        <div className="mb-8">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
        {subMessage && (
          <p className="text-gray-600 text-lg">{subMessage}</p>
        )}
      </div>
    </div>
  );
};
