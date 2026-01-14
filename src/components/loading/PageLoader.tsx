import React from 'react';
import { BRAND_GRADIENT, BRAND_BACKDROP_BLUR, BRAND_PRIMARY } from '../../constants/branding';

export interface PageLoaderProps {
    /** Main loading message */
    message?: string;
    /** Secondary message below the main one */
    subMessage?: string;
    /** Variant style */
    variant?: 'branded' | 'minimal';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Full-page loader for authentication, initial load, and major transitions.
 * Use 'branded' for home/landing, 'minimal' for internal pages.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
    message = 'Loading...',
    subMessage,
    variant = 'branded',
    className = '',
}) => {
    if (variant === 'minimal') {
        return (
            <div className={`flex items-center justify-center min-h-[300px] ${className}`}>
                <div className="text-center">
                    <div
                        className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
                        style={{
                            borderColor: '#e5e7eb',
                            borderTopColor: BRAND_PRIMARY,
                        }}
                    />
                    <p className="text-gray-600">{message}</p>
                    {subMessage && (
                        <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
                    )}
                </div>
            </div>
        );
    }

    // Branded full-page variant
    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 ${className}`}
            style={{
                background: BRAND_GRADIENT,
                backdropFilter: BRAND_BACKDROP_BLUR,
                WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
            }}
        >
            <div className="text-center">
                <div
                    className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                    style={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                    }}
                />
                <h2 className="text-white text-xl font-bold">{message}</h2>
                {subMessage && (
                    <p className="text-blue-200 mt-2">{subMessage}</p>
                )}
            </div>
        </div>
    );
};

export default PageLoader;
