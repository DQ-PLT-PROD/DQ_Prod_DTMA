import React from 'react';
import { BRAND_PRIMARY } from '../../constants/branding';

export interface LoadingSpinnerProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Color variant */
    variant?: 'primary' | 'white';
    /** Optional label below spinner */
    label?: string;
    /** Additional CSS classes */
    className?: string;
}

const sizeMap = {
    sm: { spinner: 'h-4 w-4', border: 'border-2' },
    md: { spinner: 'h-6 w-6', border: 'border-2' },
    lg: { spinner: 'h-8 w-8', border: 'border-[3px]' },
    xl: { spinner: 'h-12 w-12', border: 'border-4' },
};

/**
 * Unified loading spinner component with brand styling.
 * Use for inline, section, or modal loading states.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    label,
    className = '',
}) => {
    const { spinner, border } = sizeMap[size];
    const colorClass = variant === 'white'
        ? 'border-white/30 border-t-white'
        : 'border-gray-200';

    const spinnerStyle = variant === 'primary'
        ? { borderTopColor: BRAND_PRIMARY }
        : undefined;

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${spinner} ${border} ${colorClass} rounded-full animate-spin`}
                style={spinnerStyle}
                role="status"
                aria-label={label || 'Loading'}
            />
            {label && (
                <p className={`mt-2 text-sm ${variant === 'white' ? 'text-white/80' : 'text-gray-600'}`}>
                    {label}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
