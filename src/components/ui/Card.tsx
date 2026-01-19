import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'filled' | 'outlined';
    interactive?: boolean; // If true, adds hover states and clickable cursor
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    interactive = false,
    padding = 'md',
    className = '',
    onClick,
    ...props
}) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200';

    // M3 Card Variants
    const variantStyles = {
        elevated: 'bg-surface-container-low shadow-elevation-1',
        filled: 'bg-surface-container-highest', // or surface-variant
        outlined: 'bg-surface border border-outline-variant',
    };

    const interactiveStyles = interactive
        ? 'cursor-pointer hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
        : '';

    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${paddingStyles[padding]}
                ${interactiveStyles}
                ${className}
            `}
            onClick={onClick}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? 'button' : undefined}
            {...props}
        >
            {children}
        </div>
    );
};
