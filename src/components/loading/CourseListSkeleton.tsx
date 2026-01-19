import React from 'react';

export const CourseListSkeleton: React.FC = () => {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
                >
                    <div className="flex items-start gap-4">
                        {/* Thumbnail Skeleton */}
                        <div className="w-24 h-16 rounded-lg bg-gray-200 shrink-0" />

                        {/* Content Skeleton */}
                        <div className="flex-1 min-w-0 space-y-3">
                            {/* Title */}
                            <div className="h-5 bg-gray-200 rounded w-1/3" />

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                                <div className="w-8 h-4 bg-gray-200 rounded" />
                            </div>

                            {/* Meta */}
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>

                        {/* Button Skeleton */}
                        <div className="w-24 h-9 bg-gray-200 rounded-full shrink-0" />
                    </div>
                </div>
            ))}
        </div>
    );
};
