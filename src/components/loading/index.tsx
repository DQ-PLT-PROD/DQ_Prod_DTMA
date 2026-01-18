import React from 'react';

/**
 * Loading components barrel file
 * Provides unified loading components for the application
 */

// ============================================================================
// PageLoader - Full page loading indicator
// ============================================================================
interface PageLoaderProps {
    variant?: 'default' | 'minimal' | 'overlay';
    message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
    variant = 'default',
    message = 'Loading...'
}) => {
    if (variant === 'minimal') {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="w-10 h-10 border-4 border-[color:var(--md-outline-variant)] border-t-[color:var(--md-primary)] rounded-full animate-spin" />
                {message && <p className="mt-4 text-[color:var(--md-on-surface-variant)] text-sm">{message}</p>}
            </div>
        );
    }

    if (variant === 'overlay') {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[color:var(--md-outline-variant)] border-t-[color:var(--md-primary)] rounded-full animate-spin" />
                    {message && <p className="mt-4 text-[color:var(--md-on-surface-variant)] font-medium">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[color:var(--md-outline-variant)] border-t-[color:var(--md-primary)] rounded-full animate-spin" />
            {message && <p className="mt-4 text-[color:var(--md-on-surface-variant)]">{message}</p>}
        </div>
    );
};

// ============================================================================
// ContentSkeleton - Skeleton loader for content areas
// ============================================================================
interface ContentSkeletonProps {
    lines?: number;
    className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
    lines = 3,
    className = ''
}) => {
    return (
        <div className={`animate-pulse space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 rounded"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
};

// ============================================================================
// Spinner - Simple inline spinner
// ============================================================================
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };

    return (
        <div
            className={`${sizeClasses[size]} border-[color:var(--md-outline-variant)] border-t-[color:var(--md-primary)] rounded-full animate-spin ${className}`}
        />
    );
};

// ============================================================================
// CardSkeleton - Skeleton for card components
// ============================================================================
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`md-card overflow-hidden animate-pulse ${className}`}>
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    );
};

// ============================================================================
// LoadingSpinner - Spinner with optional label (used by portal pages)
// ============================================================================
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    label?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    label,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`${sizeClasses[size]} border-[color:var(--md-outline-variant)] border-t-[color:var(--md-primary)] rounded-full animate-spin`}
            />
            {label && <p className="text-[color:var(--md-on-surface-variant)] text-sm font-medium">{label}</p>}
        </div>
    );
};

// Default export for backward compatibility
export default ContentSkeleton;

