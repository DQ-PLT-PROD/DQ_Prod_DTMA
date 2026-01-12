import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
    className = "",
    variant = "default",
    children,
    ...props
}) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
    };

    const variantStyles = variants[variant] || variants.default;

    return (
        <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
            {children}
        </span>
    );
};
