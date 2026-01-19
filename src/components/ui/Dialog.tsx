import React, { useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    headline?: string;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
    open,
    onClose,
    title,
    icon,
    children,
    actions,
    headline,
    className = "",
}) => {
    useEffect(() => {
        // Lock body scroll when locked
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Scrim */}
            <div
                className="absolute inset-0 bg-scrim/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Container */}
            <div
                className={`relative w-full max-w-md bg-surface-container-high rounded-[28px] shadow-elevation-3 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header Section (Icon + Headline) */}
                {(icon || title || headline) && (
                    <div className="flex flex-col items-center pt-6 px-6 pb-0 text-center">
                        {icon && (
                            <div className="mb-4 text-secondary">
                                {icon}
                            </div>
                        )}
                        {headline && (
                            <h2 className="text-headline-sm text-on-surface mb-2">{headline}</h2>
                        )}
                        {title && (
                            <h3 className="text-title-lg text-on-surface">{title}</h3>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-4 text-body-md text-on-surface-variant">
                    {children}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center justify-end px-6 pb-6 gap-2 pt-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
