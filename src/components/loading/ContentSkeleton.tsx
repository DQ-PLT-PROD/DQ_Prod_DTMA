import React from 'react';

export interface ContentSkeletonProps {
    /** Type of skeleton to render */
    variant: 'course-card' | 'text' | 'metric-card' | 'table-row';
    /** Number of skeleton items to render */
    count?: number;
    /** Additional CSS classes */
    className?: string;
}

const CourseCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
        <div className="p-4">
            <div className="flex items-center mb-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
            <div className="flex space-x-2 mb-3">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="flex justify-between mt-4">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
        </div>
    </div>
);

const TextSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-4/6 bg-gray-200 rounded" />
    </div>
);

const MetricCardSkeleton: React.FC = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
);

const TableRowSkeleton: React.FC = () => (
    <div className="flex items-center space-x-4 py-3 animate-pulse border-b border-gray-100">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/6 bg-gray-200 rounded" />
        <div className="h-4 w-1/6 bg-gray-200 rounded" />
    </div>
);

/**
 * Content skeleton placeholders for loading states.
 * Use to maintain layout structure while content loads.
 */
export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
    variant,
    count = 1,
    className = '',
}) => {
    const items = Array.from({ length: count }, (_, i) => i);

    const renderSkeleton = () => {
        switch (variant) {
            case 'course-card':
                return items.map((i) => <CourseCardSkeleton key={i} />);
            case 'text':
                return items.map((i) => <TextSkeleton key={i} />);
            case 'metric-card':
                return items.map((i) => <MetricCardSkeleton key={i} />);
            case 'table-row':
                return items.map((i) => <TableRowSkeleton key={i} />);
            default:
                return null;
        }
    };

    return <div className={className}>{renderSkeleton()}</div>;
};

export default ContentSkeleton;
