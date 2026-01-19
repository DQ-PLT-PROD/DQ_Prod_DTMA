import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    Play,
    Bookmark,
    Award,
    Sparkles,
    CheckCircle,
    User,
    ChevronLeft
} from "lucide-react";
import { ExploreDropdown } from "../../../components/Header/components/ExploreDropdown";
import { ProfileDropdown } from "../../../components/Header/ProfileDropdown";
import { FEATURES } from "../../../config/features";
import { useAuth } from "@/lib/auth";
import { getLearnerProfile } from "@/lib/learner";

interface PortalLayoutProps {
    children?: React.ReactNode;
    isTheaterMode?: boolean; // To hide sidebar/header if needed
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children, isTheaterMode = false }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const location = useLocation();
    const { databaseUser, isDatabaseUserLoading } = useAuth();

    // Highlight active link
    const isMyCoursesActive = location.pathname.includes("/portal/my-courses") || location.search.includes("view=my-courses");
    const isProfileActive = location.pathname.startsWith("/portal/profile");

    useEffect(() => {
        let isMounted = true;

        const loadOnboardingStatus = async () => {
            if (!databaseUser?.azure_user_id || isDatabaseUserLoading) {
                return;
            }

            const { profile, error } = await getLearnerProfile(databaseUser.azure_user_id);
            if (!isMounted) {
                return;
            }

            if (error) {
                console.warn('Portal onboarding status check failed; hiding onboarding nav.', error);
                return;
            }

            setShowOnboarding(!profile?.onboardingCompleted);
        };

        loadOnboardingStatus();

        return () => {
            isMounted = false;
        };
    }, [databaseUser?.azure_user_id, isDatabaseUserLoading]);

    return (
        <div className="min-h-screen bg-surface-container-low text-on-surface font-sans flex flex-col">
            {/* Full-Width Header with Gradient - hidden in theater mode when requested. */}
            {!isTheaterMode && (
                <header
                    className="sticky top-0 z-30 shadow-md"
                    style={{
                        background: "linear-gradient(90deg, #092893 0%, #1A3592 16.12%, #2D4492 29.33%, #33478E 39.99%, #3C4E8F 48.46%, #495995 55.11%, #4C5A8E 60.28%, #525F91 64.34%, #556293 67.66%, #566293 70.58%, #596594 73.46%, #5E6996 76.68%, #677195 80.58%, #737A96 85.53%, #7E8398 91.88%, #868B9E 100%)"
                    }}
                >
                    <div className="px-6 py-3 flex items-center gap-6">
                        {/* Logo */}
                        <a href="/" className="flex items-center">
                            <img src="/logo/dtma-logo-white.svg" alt="DTMA" className="h-8 w-auto" />
                        </a>

                        {/* Navigation */}
                        <div className="hidden md:flex items-center">
                            {FEATURES.COURSE_MARKETPLACE && <ExploreDropdown />}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="ml-auto">
                            <ProfileDropdown />
                        </div>
                    </div>
                </header>
            )}

            {/* Content Area Below Header */}
            <div className={`flex-1 flex ${isTheaterMode ? "h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] w-full" : ""}`}>
                {/* Minimal Side Navigation - Portal Sidebar */}
                {!isTheaterMode && (
                    <aside
                        className={`bg-surface border-r border-outline-variant transition-all duration-300 ease-in-out ${sidebarOpen ? "w-56" : "w-14"
                            } hidden lg:flex flex-col shrink-0`}
                    >
                        {/* Sidebar Header - Hamburger menu */}
                        <div
                            className={`flex items-center justify-center px-3 py-3 bg-surface border-b border-outline-variant cursor-pointer hover:bg-surface-container-high transition`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title={sidebarOpen ? "Collapse menu" : "Expand menu"}
                        >
                            <span className="w-8 flex items-center justify-center text-primary">
                                <Menu size={20} />
                            </span>
                            {sidebarOpen && (
                                <ChevronLeft size={16} className="ml-auto text-on-surface-variant" />
                            )}
                        </div>

                        {/* Navigation Items */}
                        <nav className="flex-1 py-3 overflow-y-auto">
                            {/* My Courses Section */}
                            <div className="mx-2 space-y-1">
                                <div className="px-2 py-1 text-label-sm text-on-surface-variant uppercase font-bold tracking-wide">
                                    {sidebarOpen ? "My Courses" : ""}
                                </div>

                                {showOnboarding && (
                                    <Link
                                        to="/portal/onboarding"
                                        className={`flex items-center gap-3 px-3 py-2 rounded-full text-primary bg-primary-container/20 hover:bg-primary-container/30 transition ${!sidebarOpen ? 'justify-center' : ''}`}
                                        title="Onboarding"
                                    >
                                        <CheckCircle size={16} className="shrink-0" />
                                        {sidebarOpen && (
                                            <span className="text-sm">Onboarding</span>
                                        )}
                                    </Link>
                                )}

                                {/* In Progress */}
                                <Link
                                    to="/portal/my-courses/in-progress"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-full ${isMyCoursesActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-highest'} transition ${!sidebarOpen ? 'justify-center' : ''}`}
                                    title="In Progress"
                                >
                                    <Play size={16} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm">In Progress</span>
                                            {/* TODO: Fetch actual count or pass as prop? For now static or managed by page context */}
                                            {/* <span className="text-xs font-bold bg-[#1839AD] text-white px-1.5 py-0.5 rounded-full">1</span> */}
                                        </div>
                                    )}
                                </Link>

                                {/* Profile - now disabled/coming soon */}
                                <div
                                    className={`flex items-center gap-3 px-3 py-2 rounded-full text-on-surface-variant/60 cursor-not-allowed ${!sidebarOpen ? 'justify-center' : ''}`}
                                    title="Profile - Coming Soon"
                                >
                                    <User size={16} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <span className="text-sm">Profile</span>
                                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                        </div>
                                    )}
                                </div>

                                {/* Saved */}
                                <div
                                    className={`flex items-center gap-3 px-3 py-2 rounded-full text-on-surface-variant/60 cursor-not-allowed ${!sidebarOpen ? 'justify-center' : ''}`}
                                    title="Saved - Coming Soon"
                                >
                                    <Bookmark size={16} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <span className="text-sm">Saved</span>
                                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="my-3 mx-3 border-t border-outline-variant" />

                            {/* Badges - Coming Soon */}
                            <div
                                className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? 'justify-center' : ''}`}
                                title="Badges - Coming Soon"
                            >
                                <Award size={16} className="shrink-0" />
                                {sidebarOpen && (
                                    <div className="flex-1 flex items-center justify-between gap-2">
                                        <span className="text-sm">Badges</span>
                                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                    </div>
                                )}
                            </div>

                            {/* Career Coach - Coming Soon */}
                            <div
                                className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? 'justify-center' : ''}`}
                                title="AI Career Coach - Coming Soon"
                            >
                                <Sparkles size={16} className="shrink-0" />
                                {sidebarOpen && (
                                    <div className="flex-1 flex items-center justify-between gap-2">
                                        <span className="text-sm">Career Coach</span>
                                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </aside>
                )}

                {/* Mobile toggle button */}
                {!isTheaterMode && (
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="fixed bottom-4 left-4 z-40 p-3 rounded-full bg-[#1839AD] text-white shadow-lg lg:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                )}

                {/* Mobile sidebar overlay */}
                {sidebarOpen && !isTheaterMode && (
                    <div
                        className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                {!isTheaterMode && (
                    <aside
                        className={`fixed inset-y-0 left-0 z-30 bg-surface w-56 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                            }`}
                        style={{ top: '56px' }}
                    >
                        {/* Mobile Nav Header */}
                        <div className="flex items-center justify-between px-3 py-3 bg-surface border-b border-outline-variant">
                            <span className="text-sm font-semibold text-on-surface">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-surface-container-high">
                                <X size={18} className="text-on-surface-variant" />
                            </button>
                        </div>

                        <nav className="py-3 overflow-y-auto">
                            {/* My Courses */}
                            <div className="mx-2 space-y-1">
                                <div className="px-2 py-1 text-label-sm text-on-surface-variant uppercase font-bold tracking-wide">My Courses</div>

                                {showOnboarding && (
                                    <Link to="/portal/onboarding" className="flex items-center gap-3 px-3 py-2 rounded-full text-primary bg-primary-container/20">
                                        <CheckCircle size={16} />
                                        <span className="text-sm">Onboarding</span>
                                    </Link>
                                )}

                                <Link to="/portal/my-courses/in-progress" className="flex items-center gap-3 px-3 py-2 rounded-full text-primary bg-primary-container/20">
                                    <Play size={16} />
                                    <span className="text-sm">In Progress</span>
                                </Link>

                                <div className="flex items-center gap-3 px-3 py-2 rounded-full text-gray-400 cursor-not-allowed">
                                    <User size={16} />
                                    <span className="text-sm">Profile</span>
                                    <span className="ml-auto text-[10px] bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                </div>

                                <div className="flex items-center gap-3 px-3 py-2 rounded-full text-gray-400 cursor-not-allowed">
                                    <Bookmark size={16} />
                                    <span className="text-sm">Saved</span>
                                    <span className="ml-auto text-[10px] bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                                </div>
                            </div>

                            <div className="my-3 mx-3 border-t border-outline-variant" />

                            <div className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed">
                                <Award size={16} />
                                <span className="text-sm">Badges</span>
                                <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                            </div>

                            <div className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed">
                                <Sparkles size={16} />
                                <span className="text-sm">Career Coach</span>
                                <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
                            </div>
                        </nav>
                    </aside>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex min-w-0">
                    {children || <Outlet />}
                </div>
            </div>
        </div>
    );
};
