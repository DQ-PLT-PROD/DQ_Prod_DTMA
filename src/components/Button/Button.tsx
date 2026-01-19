import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'outline' | 'elevated';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}) => {
    // M3 Base: relative for state layer positioning, overflow-hidden for ripple clips
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden disabled:opacity-38 disabled:cursor-not-allowed disabled:shadow-none';

    // M3 Variants
    const variantStyles = {
        primary: 'bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2', // Filled
        secondary: 'bg-secondary text-on-secondary shadow-elevation-1 hover:shadow-elevation-2', // Filled Secondary
        tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1', // Tonal
        ghost: 'bg-transparent text-primary hover:bg-primary/10', // Text
        danger: 'bg-error text-on-error shadow-elevation-1 hover:shadow-elevation-2', // Error
        outline: 'border border-outline text-primary hover:bg-primary/10 focus:border-primary', // Outlined
        elevated: 'bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2 hover:bg-surface-container', // Elevated
    };

    // State Layer (Overlay) - simplifies hover/focus/active visual logic
    // We use a pseudo-element or a nested span. Here using Tailwind utilities on content primarily.
    // For specific M3 state layers (white overlay on primary), we can use:
    // 'after:absolute after:inset-0 after:bg-white/0 hover:after:bg-white/10 active:after:bg-white/12 after:transition-colors'
    // But ensuring text color contrast is key.

    // Simplification for this implementation plan:
    // Primary: hover is handled by shadow/opacity or slight tint. M3 recommends state layer.
    // Let's add a generic state layer class to all clickable buttons.
    const stateLayer = 'after:absolute after:inset-0 after:bg-current after:opacity-0 hover:after:opacity-[0.08] focus:after:opacity-[0.12] active:after:opacity-[0.12] after:transition-opacity after:pointer-events-none';

    const sizeStyles = {
        sm: 'h-8 px-3 text-label-md gap-1.5', // Compact (32px)
        md: 'h-10 px-6 text-label-lg gap-2',   // Standard (40px) - M3 spec
        lg: 'h-12 px-8 text-label-lg gap-2.5', // Large (48px) - Touch friendly
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                ${stateLayer}
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Content Container to ensure z-index above state layer */}
            <span className="relative z-10 flex items-center gap-inherit">
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </span>
        </button>
    );
};

export default Button;
