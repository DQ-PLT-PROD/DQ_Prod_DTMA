/**
 * Instructor Dashboard Page
 *
 * Overview page for instructors showing key metrics and quick actions.
 * Stats are pulled from Supabase: live course counts and active students.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpenIcon,
    UsersIcon,
    PlusIcon,
    TrendingUpIcon,
    ClockIcon,
} from 'lucide-react';
import { fetchInstructorDashboardStats } from '../lib/instructorDashboardStatsService';

export function InstructorDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCourses: 0,
        draftCourses: 0,
        publishedCourses: 0,
        activeStudents: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstructorDashboardStats()
            .then((data) =>
                setStats({
                    totalCourses: data.totalCourses,
                    draftCourses: data.draftCourses,
                    publishedCourses: data.publishedCourses,
                    activeStudents: data.activeStudents,
                })
            )
            .catch((err) => console.error('Failed to load dashboard stats:', err))
            .finally(() => setLoading(false));
    }, []);

    const totalCoursesDisplay = loading
        ? '—'
        : stats.totalCourses === 0
          ? '0'
          : `${stats.totalCourses}`;
    const coursesSubtext =
        !loading && stats.totalCourses > 0
            ? `${stats.publishedCourses} published, ${stats.draftCourses} draft`
            : null;
    const activeStudentsDisplay = loading ? '—' : String(stats.activeStudents);

    const statCards = [
        {
            label: 'Total Courses',
            value: totalCoursesDisplay,
            subtext: coursesSubtext,
            icon: BookOpenIcon,
            color: 'bg-blue-500',
        },
        {
            label: 'Active Students',
            value: activeStudentsDisplay,
            subtext: null,
            icon: UsersIcon,
            color: 'bg-green-500',
        },
        {
            label: 'Completion Rate',
            value: 'Soon',
            icon: TrendingUpIcon,
            color: 'bg-gray-400',
            comingSoon: true,
        },
    ];

    const quickActions = [
        {
            label: 'Create Course',
            description: 'Add a new course to your catalog',
            icon: PlusIcon,
            action: () => navigate('/instructor/course-management/course/new'),
        },
        {
            label: 'Manage Courses',
            description:
                stats.totalCourses === 0
                    ? 'View and edit your courses'
                    : `View and edit ${stats.totalCourses} course${stats.totalCourses !== 1 ? 's' : ''} (${stats.publishedCourses} published, ${stats.draftCourses} draft)`,
            icon: BookOpenIcon,
            action: () => navigate('/instructor/course-management'),
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 relative overflow-hidden">
                            <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                {stat.subtext && (
                                    <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                                )}
                            </div>
                            {stat.comingSoon && (
                                <div className="absolute top-2 right-2">
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                        Coming Soon
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.label}
                                onClick={action.action}
                                className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-[var(--md-primary)] hover:bg-[var(--md-primary)]/5 transition-all group text-left"
                            >
                                <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-lg group-hover:scale-110 transition-transform">
                                    <Icon className="h-6 w-6 text-[var(--md-primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--md-primary)] transition-colors">{action.label}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
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
