/**
 * Instructor Dashboard Page
 * 
 * Overview page for instructors showing key metrics and quick actions.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpenIcon,
    UsersIcon,
    BarChartIcon,
    PlusIcon,
    TrendingUpIcon,
    ClockIcon,
    AwardIcon
} from 'lucide-react';

export function InstructorDashboard() {
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Courses', value: '—', icon: BookOpenIcon, color: 'bg-blue-500' },
        { label: 'Active Students', value: '—', icon: UsersIcon, color: 'bg-green-500' },
        { label: 'Completion Rate', value: '—', icon: TrendingUpIcon, color: 'bg-purple-500' },
        { label: 'Avg. Rating', value: '—', icon: AwardIcon, color: 'bg-orange-500' },
    ];

    const quickActions = [
        {
            label: 'Create Course',
            description: 'Add a new course to your catalog',
            icon: PlusIcon,
            action: () => navigate('/instructor/course-management/course/new')
        },
        {
            label: 'Manage Courses',
            description: 'View and edit existing courses',
            icon: BookOpenIcon,
            action: () => navigate('/instructor/course-management')
        },
        {
            label: 'View Analytics',
            description: 'Check student progress and engagement',
            icon: BarChartIcon,
            action: () => navigate('/instructor/analytics')
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[var(--md-primary)] to-[var(--md-primary-dark)] rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Welcome to Instructor Portal</h1>
                <p className="text-white/80">
                    Create and manage your courses, track student progress, and analyze engagement.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-3">
                                <div className={`${stat.color} p-2 rounded-lg`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={action.action}
                                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--md-primary)] hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="p-2 bg-[var(--md-primary)]/10 rounded-lg">
                                    <Icon className="h-5 w-5 text-[var(--md-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{action.label}</h3>
                                    <p className="text-sm text-gray-500">{action.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <p>No recent activity to display.</p>
                    <p className="text-sm mt-1">Start by creating your first course!</p>
                </div>
            </div>
        </div>
    );
}

export default InstructorDashboard;
