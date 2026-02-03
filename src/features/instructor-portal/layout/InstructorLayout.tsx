/**
 * InstructorLayout Component
 * 
 * Main layout wrapper for the Instructor Portal.
 * Provides navigation and structure for instructor-specific pages.
 */

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboardIcon,
    GraduationCapIcon,
    UsersIcon,
    BarChartIcon,
    SettingsIcon,
    ArrowLeftIcon
} from 'lucide-react';

const navItems = [
    {
        path: '/instructor/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboardIcon
    },
    {
        path: '/instructor/course-management',
        label: 'Courses',
        icon: GraduationCapIcon
    },
    {
        path: '/instructor/students',
        label: 'Students',
        icon: UsersIcon
    },
    {
        path: '/instructor/analytics',
        label: 'Analytics',
        icon: BarChartIcon
    },
    {
        path: '/instructor/settings',
        label: 'Settings',
        icon: SettingsIcon
    },
];

export function InstructorLayout() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-[var(--md-primary)] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                <span className="hidden sm:inline text-sm">Back to Learning</span>
                            </button>
                            <div className="h-6 w-px bg-white/30" />
                            <h1 className="text-lg font-semibold">Instructor Portal</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                                Instructor Mode
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Secondary Navigation */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                            ? 'bg-[var(--md-primary)] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
}

export default InstructorLayout;
