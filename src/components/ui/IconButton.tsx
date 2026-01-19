import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
    children,
    variant = 'standard',
    size = 'md',
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'relative inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden disabled:opacity-38 disabled:cursor-not-allowed';

    // M3 Variants for Icon Buttons
    const variantStyles = {
        standard: 'bg-transparent text-on-surface-variant hover:bg-on-surface-variant/8 active:bg-on-surface-variant/12',
        filled: 'bg-primary text-on-primary hover:shadow-elevation-1',
        tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1',
        outlined: 'border border-outline text-on-surface-variant hover:bg-on-surface-variant/8 focus:border-primary',
    };

    const sizeStyles = {
        sm: 'w-8 h-8', // 32px
        md: 'w-10 h-10', // 40px (Standard)
        lg: 'w-12 h-12', // 48px (Touch recommended)
    };

    // State layer handled by variant hover/active utilities or specific class
    // Reusing the logic from Button but simplified for icon circular shape

    return (
        <button
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
            disabled={disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center">
                {children}
            </span>
        </button>
    );
};
