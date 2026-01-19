import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    supportingText?: string;
    variant?: 'filled' | 'outlined';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    supportingText,
    variant = 'outlined',
    startIcon,
    endIcon,
    className = '',
    id,
    disabled,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isError = !!error;

    // Base Styles
    const baseWrapper = 'relative flex items-center w-full transition-colors duration-200';

    // M3 Input Specs
    // Height: 56px (h-14)
    // Label: Label Large (14px)
    // Text: Body Large (16px)

    // Filled Variant
    const filledStyles = `
        bg-surface-container-highest rounded-t-sm border-b border-on-surface-variant
        hover:bg-surface-container-high focus-within:border-primary focus-within:border-b-2
        ${isError ? 'border-error focus-within:border-error bg-error-container/10' : ''}
    `;

    // Outlined Variant
    const outlinedStyles = `
        bg-transparent rounded-sm border border-outline 
        hover:border-on-surface focus-within:border-2 focus-within:border-primary
        ${isError ? 'border-error hover:border-error focus-within:border-error' : ''}
    `;

    const variantWrapper = variant === 'filled' ? filledStyles : outlinedStyles;
    const disabledStyles = disabled ? 'opacity-38 cursor-not-allowed pointer-events-none' : '';

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            <div className={`${baseWrapper} ${variantWrapper} ${disabledStyles} h-14`}>
                {startIcon && <div className="pl-3 text-on-surface-variant">{startIcon}</div>}

                <div className="relative flex-1 h-full">
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        placeholder=" " // Required for the peer-placeholder-shown trick
                        className={`
                            peer w-full h-full bg-transparent border-none outline-none 
                            px-4 pt-5 pb-1 text-body-lg text-on-surface 
                            placeholder-transparent caret-primary
                            ${startIcon ? 'pl-2' : ''}
                            ${endIcon ? 'pr-2' : ''}
                        `}
                        {...props}
                    />

                    {/* Floating Label */}
                    <label
                        htmlFor={inputId}
                        className={`
                            absolute left-4 top-4 text-body-lg text-on-surface-variant transition-all duration-200
                            peer-focus:top-1 peer-focus:text-label-sm peer-focus:text-primary
                            peer-placeholder-shown:top-4 peer-placeholder-shown:text-body-lg
                            peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-label-sm
                            pointer-events-none
                            ${startIcon ? 'left-2' : ''}
                            ${isError ? 'text-error peer-focus:text-error' : ''}
                        `}
                    >
                        {label}
                    </label>
                </div>

                {endIcon && <div className="pr-3 text-on-surface-variant">{endIcon}</div>}
            </div>

            {/* Supporting Text / Error Message */}
            {(supportingText || error) && (
                <div className={`px-4 text-body-sm ${isError ? 'text-error' : 'text-on-surface-variant'}`}>
                    {error || supportingText}
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';
