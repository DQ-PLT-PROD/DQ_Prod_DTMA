import React from 'react';

interface ListItemProps {
    headline: string;
    supportingText?: string;
    leadingElement?: React.ReactNode;
    trailingElement?: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    disabled?: boolean;
    className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
    headline,
    supportingText,
    leadingElement,
    trailingElement,
    onClick,
    isActive = false,
    disabled = false,
    className = ''
}) => {
    // M3 Specs
    // Height: One-line (56px), Two-line (72px), Three-line (88px)
    // Horizontal Padding: 16px (px-4)

    const baseStyles = 'flex items-center w-full px-4 py-3 min-h-[56px] transition-colors duration-200';
    const interactiveStyles = onClick && !disabled ? 'cursor-pointer hover:bg-on-surface/8 active:bg-on-surface/12' : '';
    const activeStyles = isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-transparent text-on-surface';
    const disabledStyles = disabled ? 'opacity-38 pointer-events-none' : '';

    return (
        <div
            className={`${baseStyles} ${interactiveStyles} ${activeStyles} ${disabledStyles} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            {/* Leading Element (Icon/Avatar/Image) 24x24 or 40x40 */}
            {leadingElement && (
                <div className="mr-4 text-on-surface-variant flex items-center justify-center">
                    {leadingElement}
                </div>
            )}

            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-center">
                <div className={`text-body-lg font-normal ${isActive ? 'text-on-secondary-container' : 'text-on-surface'}`}>
                    {headline}
                </div>
                {supportingText && (
                    <div className={`text-body-md ${isActive ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                        {supportingText}
                    </div>
                )}
            </div>

            {/* Trailing Element (Meta/Icon/Checkbox) */}
            {trailingElement && (
                <div className="ml-4 text-on-surface-variant flex items-center">
                    {trailingElement}
                </div>
            )}
        </div>
    );
};
