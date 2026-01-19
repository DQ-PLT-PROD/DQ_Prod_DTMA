import React from 'react';

type LabelSize = 'sm' | 'md' | 'lg';

interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
    size?: LabelSize;
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    const sizeStyles = {
        sm: 'text-label-sm',
        md: 'text-label-md',
        lg: 'text-label-lg',
    };

    return (
        <label
            className={`
        font-medium text-on-surface 
        ${sizeStyles[size]}
        ${className}
      `}
            {...props}
        >
            {children}
        </label>
    );
};
