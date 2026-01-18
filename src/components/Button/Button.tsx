import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[var(--md-radius-md)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--md-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--md-surface)] disabled:opacity-60 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-[color:var(--md-primary)] text-white shadow-md-1 hover:bg-[color:var(--md-primary-hover)] hover:shadow-md-2 active:bg-[color:var(--md-primary-active)]',
        secondary: 'bg-[color:var(--md-primary-container)] text-[color:var(--md-on-primary-container)] hover:bg-[color:var(--md-primary-container-hover)]',
        ghost: 'bg-transparent text-[color:var(--md-on-surface-variant)] hover:bg-[color:var(--md-surface-variant-hover)]',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md-1',
        outline: 'border border-[color:var(--md-outline)] text-[color:var(--md-on-surface)] hover:bg-[color:var(--md-surface-variant)]',
    };

    const sizeStyles = {
        sm: 'px-3.5 py-2 text-xs gap-1.5',
        md: 'px-4.5 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-4 w-4"
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
        </button>
    );
};

export default Button;
