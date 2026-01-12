import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    /**
     * Variant styling:
     * - 'default': Dark text for solid/light backgrounds (e.g., Course Catalog hero)
     * - 'overlay': White text with shadows for video/image backgrounds (e.g., Course Details hero)
     */
    variant?: 'default' | 'overlay';
    className?: string;
}

/**
 * Reusable Breadcrumb component with two visual variants.
 * Use 'default' for pages with solid backgrounds.
 * Use 'overlay' for pages with video or image backgrounds.
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    variant = 'default',
    className = '',
}) => {
    const isOverlay = variant === 'overlay';

    // Base styles for the nav container
    const navStyles = isOverlay
        ? 'flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity duration-300'
        : 'flex items-center gap-2 text-sm';

    // Styles for non-current (clickable) items
    const linkStyles = isOverlay
        ? 'text-white hover:text-blue-200 inline-flex items-center transition-colors drop-shadow-md'
        : 'text-blue-100 hover:text-white inline-flex items-center transition-colors';

    // Styles for the current (last) item
    const currentStyles = isOverlay
        ? 'text-white font-medium drop-shadow-md line-clamp-1 max-w-[200px] sm:max-w-none'
        : 'text-white font-medium';

    // Chevron separator styles
    const chevronStyles = isOverlay
        ? 'text-white/80 drop-shadow-md'
        : 'text-blue-300';

    // Home icon styles
    const homeIconStyles = isOverlay
        ? 'mr-1.5 drop-shadow-md'
        : 'mr-1';

    return (
        <nav aria-label="Breadcrumb" className={`${navStyles} ${className}`}>
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {items.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === items.length - 1;
                    const isCurrent = item.current || isLast;

                    return (
                        <li key={index} className="inline-flex items-center" aria-current={isCurrent ? 'page' : undefined}>
                            {/* Separator (not shown for first item) */}
                            {!isFirst && (
                                <ChevronRight size={14} className={chevronStyles} />
                            )}

                            {/* Item content */}
                            {isCurrent ? (
                                <span className={`${!isFirst ? 'ml-1 md:ml-2' : ''} ${currentStyles}`}>
                                    {isFirst && <Home size={14} className={homeIconStyles} />}
                                    <span>{item.label}</span>
                                </span>
                            ) : (
                                <Link
                                    to={item.href || '/'}
                                    className={`${!isFirst ? 'ml-1 md:ml-2' : ''} ${linkStyles}`}
                                >
                                    {isFirst && <Home size={14} className={homeIconStyles} />}
                                    <span className={isOverlay ? 'drop-shadow-md' : ''}>{item.label}</span>
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
