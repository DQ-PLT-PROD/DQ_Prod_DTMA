import React from 'react';

type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    variant?: ChipVariant;
    icon?: React.ReactNode;
    selected?: boolean;
    onDelete?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    variant = 'assist',
    icon,
    selected = false,
    onDelete,
    className = '',
    disabled,
    ...props
}) => {
    // M3 Specs
    // Height: 32px
    // Border Radius: 8px (Assistant/Filter/Suggestion) or 25% (Input - Wait check stats. M3 uses rounded-lg usually 8dp)
    // Actually M3 chips are rounded-md (8dp) usually. Let's check spec.
    // M3 spec says Corner radius 8dp. Input chips Corner radius 8dp. All chips 8dp.

    const baseStyles = 'inline-flex items-center h-8 px-4 rounded-lg text-label-lg font-medium transition-all duration-200 border relative overflow-hidden disabled:opacity-38 disabled:pointer-events-none';

    const variants = {
        assist: 'bg-surface border-outline text-on-surface hover:bg-on-surface/8 focus:bg-on-surface/12 active:bg-on-surface/12 shadow-sm',
        filter: selected
            ? 'bg-secondary-container border-transparent text-on-secondary-container hover:bg-on-secondary-container/8'
            : 'bg-surface border-outline text-on-surface-variant hover:bg-on-surface-variant/8',
        input: 'bg-surface border-outline text-on-surface hover:bg-on-surface/8',
        suggestion: 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container shadow-elevation-1',
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${className}
            `}
            disabled={disabled}
            {...props}
        >
            {/* State layer overlay */}
            <span className="absolute inset-0 bg-current opacity-0 hover:opacity-[0.08] pointer-events-none transition-opacity"></span>

            {/* Leading Icon / Checkmark for filter */}
            {(icon || (variant === 'filter' && selected)) && (
                <span className="mr-2 -ml-1">
                    {variant === 'filter' && selected ? (
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                        </svg>
                    ) : icon}
                </span>
            )}

            <span>{label}</span>

            {/* Trailing Icon (Close for Input chips) */}
            {variant === 'input' && onDelete && (
                <span
                    className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-on-surface/10 cursor-pointer z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                    </svg>
                </span>
            )}
        </button>
    );
};
