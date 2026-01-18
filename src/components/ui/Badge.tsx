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
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--md-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--md-surface)]";

    const variants = {
        default: "border border-[color:var(--md-outline-variant)] bg-[color:var(--md-primary-container)] text-[color:var(--md-on-primary-container)]",
        secondary: "border border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface-variant)] text-[color:var(--md-on-surface-variant)]",
        outline: "border border-[color:var(--md-outline)] text-[color:var(--md-on-surface-variant)]",
    };

    const variantStyles = variants[variant] || variants.default;

    return (
        <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
            {children}
        </span>
    );
};
