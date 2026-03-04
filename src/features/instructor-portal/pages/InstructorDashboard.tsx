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
    FileTextIcon,
    PlayCircleIcon,
    TagIcon,
    HelpCircleIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchInstructorDashboardStats } from '../lib/instructorDashboardStatsService';
import { fetchRecentActivity, type RecentActivityItem } from '../lib/instructorRecentActivityService';

export function InstructorDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCourses: 0,
        draftCourses: 0,
        publishedCourses: 0,
        activeStudents: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

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

    useEffect(() => {
        fetchRecentActivity()
            .then(setRecentActivity)
            .catch((err) => console.error('Failed to load recent activity:', err));
    }, []);

    const getEditPath = (item: RecentActivityItem) => {
        switch (item.type) {
            case 'course':
                return `/instructor/course-management/course/${item.id}`;
            case 'module':
                return `/instructor/course-management/module/${item.id}`;
            case 'lesson':
                return `/instructor/course-management/lesson/${item.id}`;
            case 'quiz':
                return `/instructor/course-management/quiz/${item.id}`;
            case 'category':
                return '/instructor/course-management?tab=classifications';
            default:
                return '/instructor/course-management';
        }
    };

    const getActivityIcon = (type: RecentActivityItem['type']) => {
        switch (type) {
            case 'course':
                return BookOpenIcon;
            case 'module':
                return FileTextIcon;
            case 'lesson':
                return PlayCircleIcon;
            case 'quiz':
                return HelpCircleIcon;
            case 'category':
                return TagIcon;
            default:
                return ClockIcon;
        }
    };

    const getActivityContext = (item: RecentActivityItem) => {
        const timeAgo = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true });
        if (item.type === 'course' && item.context) {
            const status = (item.context as string).charAt(0).toUpperCase() + (item.context as string).slice(1);
            return `${status} • ${timeAgo}`;
        }
        return timeAgo;
    };

    const totalCoursesDisplay = loading
        ? '—'
        : stats.totalCourses === 0
          ? '0'
          : `${stats.totalCourses}`;
    const coursesSubtext =
        !loading && stats.totalCourses > 0
            ? `${stats.publishedCourses} published, ${stats.draftCourses} draft`
            : null;
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
            value: 'Soon',
            icon: UsersIcon,
            color: 'bg-gray-400',
            comingSoon: true,
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
            <div className="bg-gradient-to-r from-[var(--md-primary)] to-[var(--md-primary-hover)] rounded-xl p-6 text-white">
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

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                </div>
                {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity to display.</p>
                        <p className="text-sm mt-1">Start by creating your first course!</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {recentActivity.map((item) => {
                            const Icon = getActivityIcon(item.type);
                            return (
                                <li key={`${item.type}-${item.id}`}>
                                    <button
                                        onClick={() => navigate(getEditPath(item))}
                                        className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-100 hover:border-[var(--md-primary)] hover:bg-[var(--md-primary)]/5 transition-all text-left group"
                                    >
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[var(--md-primary)]/10">
                                            <Icon className="h-4 w-4 text-gray-600 group-hover:text-[var(--md-primary)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-500">{getActivityContext(item)}</p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default InstructorDashboard;
