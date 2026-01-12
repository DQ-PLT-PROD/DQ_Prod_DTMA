import React, { useState } from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
interface MetricsOverviewProps {
    isLoading: boolean;
}
export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
    isLoading,
}) => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    // Mock KPI data with trend information (no icons)
    const kpiCards = [
        {
            id: 'service-requests',
            label: 'Active Service Requests',
            value: 12,
            trend: {
                direction: 'up',
                value: '+3',
                period: 'from last month',
                icon: <TrendingUpIcon className="h-4 w-4 text-gray-500" />,
            },
        },
        {
            id: 'pending-applications',
            label: 'Pending Applications',
            value: 3,
            trend: {
                direction: 'down',
                value: '-2',
                period: 'from last month',
                icon: <TrendingDownIcon className="h-4 w-4 text-gray-500" />,
            },
        },
        {
            id: 'reporting-obligations',
            label: 'Reporting Obligations',
            value: 5,
            trend: {
                direction: 'neutral',
                value: '0',
                period: 'no change',
                icon: null,
            },
        },
        {
            id: 'approvals',
            label: 'Approvals Pending',
            value: 7,
            trend: {
                direction: 'up',
                value: '+1',
                period: 'from last month',
                icon: <TrendingUpIcon className="h-4 w-4 text-gray-500" />,
            },
        },
    ];
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
                    >
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">Last 30 days</div>
                <button className="text-sm text-gray-600 hover:text-blue-600 flex items-center">
                    <span>Change time period</span>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {kpiCards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                        <div className="text-sm text-gray-600 mb-1">{card.label}</div>
                        <div className="text-2xl font-semibold text-gray-800 mb-2">
                            {card.value}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                            {card.trend.icon && (
                                <span className="mr-1">{card.trend.icon}</span>
                            )}
                            <span>
                                {card.trend.value} {card.trend.period}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
