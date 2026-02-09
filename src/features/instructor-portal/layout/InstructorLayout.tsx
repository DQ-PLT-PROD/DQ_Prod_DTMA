import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    BarChart,
    Settings,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    Image as ImageIcon
} from 'lucide-react';
import { ProfileDropdown } from '@/components/Header/ProfileDropdown';
import { useAuth } from '@/lib/auth';

const navItems = [
    {
        path: '/instructor/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
    },
    {
        path: '/instructor/course-management',
        label: 'Courses',
        icon: GraduationCap
    },
    {
        path: '/instructor/media',
        label: 'Media Library',
        icon: ImageIcon
    },
    {
        path: '/instructor/students',
        label: 'Students',
        icon: Users,
        comingSoon: true
    },
    {
        path: '/instructor/analytics',
        label: 'Analytics',
        icon: BarChart,
        comingSoon: true
    },
    {
        path: '/instructor/settings',
        label: 'Settings',
        icon: Settings,
        comingSoon: true
    },
];

export function InstructorLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Close sidebar on mobile when navigating
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
            {/* Header with Brand Gradient */}
            <header
                className="sticky top-0 z-30 shadow-md"
                style={{
                    background:
                        "linear-gradient(90deg, #092893 0%, #1A3592 16.12%, #2D4492 29.33%, #33478E 39.99%, #3C4E8F 48.46%, #495995 55.11%, #4C5A8E 60.28%, #525F91 64.34%, #556293 67.66%, #566293 70.58%, #596594 73.46%, #5E6996 76.68%, #677195 80.58%, #737A96 85.53%, #7E8398 91.88%, #868B9E 100%)",
                }}
            >
                <div className="px-6 py-3 flex items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img
                            src="/logo/dtma-logo-white.svg"
                            alt="DTMA"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Instructor Badge */}
                    <div className="hidden md:flex items-center px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                        Instructor Portal
                    </div>

                    {/* Profile Dropdown */}
                    <div className="ml-auto flex items-center gap-4 text-white">
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex-1 flex h-[calc(100vh-64px)]">
                {/* Desktop Sidebar */}
                <aside
                    className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-16"
                        } hidden lg:flex flex-col shrink-0`}
                >
                    {/* Toggle Button */}
                    <div
                        className="flex items-center justify-center px-4 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition text-[#1839AD]"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={sidebarOpen ? "Collapse menu" : "Expand menu"}
                    >
                        <Menu size={20} />
                        {sidebarOpen && (
                            <ChevronLeft size={16} className="ml-auto text-gray-400" />
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);

                            if (item.comingSoon) {
                                return (
                                    <div
                                        key={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? "justify-center" : ""}`}
                                        title={`${item.label} - Coming Soon`}
                                    >
                                        <item.icon size={20} className="shrink-0 opacity-50" />
                                        {sidebarOpen && (
                                            <div className="flex-1 flex items-center justify-between overflow-hidden">
                                                <span className="truncate">{item.label}</span>
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2">
                                                    Soon
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${isActive
                                        ? "text-[#1839AD] bg-[#1839AD]/10 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        } ${!sidebarOpen ? "justify-center" : ""}`}
                                    title={!sidebarOpen ? item.label : ""}
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div className="flex-1 flex items-center justify-between overflow-hidden">
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Sign Out */}
                    <div className="p-4 border-t border-gray-200">
                        {/* Optional footer content */}
                    </div>
                </aside>

                {/* Mobile Sidebar (Drawer) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-50 bg-white w-[85vw] max-w-[300px] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Instructor Menu</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                    <nav className="flex-1 py-4 px-2 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);

                            if (item.comingSoon) {
                                return (
                                    <div
                                        key={item.path}
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 cursor-not-allowed"
                                        title={`${item.label} - Coming Soon`}
                                    >
                                        <item.icon size={20} className="opacity-50" />
                                        <div className="flex-1 flex items-center justify-between">
                                            <span>{item.label}</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">
                                                Soon
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive
                                        ? "text-[#1839AD] bg-[#1839AD]/10 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <div className="flex-1 flex items-center justify-between">
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                logout();
                                setSidebarOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 bg-white border border-red-100 rounded-xl shadow-sm hover:bg-red-50 transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl z-30 flex items-center justify-around py-2.5 safe-area-bottom">
                    {navItems.slice(0, 3).map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-[#1839AD] bg-blue-50' : 'text-gray-500'}`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-gray-500`}
                    >
                        <Menu size={20} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InstructorLayout;
