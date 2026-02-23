import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have this, or use clsx/template strings

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
    as: Component = 'div',
    ...props
}) => {
    return (
        <Component
            className={cn(
                "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};
