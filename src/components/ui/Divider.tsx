import React from 'react';

type DividerVariant = 'full-width' | 'inset' | 'middle-inset';

interface DividerProps {
    variant?: DividerVariant;
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({
    variant = 'full-width',
    className = ''
}) => {
    const baseStyles = 'h-[1px] bg-outline-variant w-full';

    const variantStyles = {
        'full-width': '',
        'inset': 'ml-4', // 16dp start margin
        'middle-inset': 'mx-4', // 16dp start and end margin
    };

    return (
        <div
            role="separator"
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
        />
    );
};
