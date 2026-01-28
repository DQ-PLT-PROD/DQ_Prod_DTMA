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
  ChevronLeft,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { COURSE_CATEGORIES } from "../../../constants/navigation";
import { ExploreDropdown } from "../../../components/Header/components/ExploreDropdown";
import { ProfileDropdown } from "../../../components/Header/ProfileDropdown";
import { FEATURES } from "../../../config/features";
import { useAuth } from "@/lib/auth";
import { getLearnerProfile } from "@/lib/learner";

interface PortalLayoutProps {
  children?: React.ReactNode;
  isTheaterMode?: boolean; // To hide sidebar/header if needed
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  isTheaterMode = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  /* State for Mobile Right Drawer (Explore) */
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();
  const { databaseUser, isDatabaseUserLoading, logout } = useAuth();

  // Highlight active link
  const isMyCoursesActive =
    location.pathname.includes("/portal/my-courses") ||
    location.search.includes("view=my-courses");
  const isProfileActive = location.pathname.startsWith("/portal/profile");

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingStatus = async () => {
      if (!databaseUser?.azure_user_id || isDatabaseUserLoading) {
        return;
      }

      const { profile, error } = await getLearnerProfile(
        databaseUser.azure_user_id
      );
      if (!isMounted) {
        return;
      }

      if (error) {
        console.warn(
          "Portal onboarding status check failed; hiding onboarding nav.",
          error
        );
        return;
      }

      setShowOnboarding(!profile?.onboardingCompleted);
    };

    loadOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, [databaseUser?.azure_user_id, isDatabaseUserLoading]);

  // Close drawers on route change
  useEffect(() => {
    // Only auto-close on mobile when navigating
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    setRightDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* ... header ... */}

      {!isTheaterMode && (
        <header
          className="sticky top-0 z-30 shadow-md"
          style={{
            background:
              "linear-gradient(90deg, #092893 0%, #1A3592 16.12%, #2D4492 29.33%, #33478E 39.99%, #3C4E8F 48.46%, #495995 55.11%, #4C5A8E 60.28%, #525F91 64.34%, #556293 67.66%, #566293 70.58%, #596594 73.46%, #5E6996 76.68%, #677195 80.58%, #737A96 85.53%, #7E8398 91.88%, #868B9E 100%)",
          }}
        >
          <div className="px-6 py-3 flex items-center gap-6">

            {/* Logo */}
            <a href="/" className="flex items-center">
              <img
                src="/logo/dtma-logo-white.svg"
                alt="DTMA"
                className="h-8 w-auto"
              />
            </a>

            {/* Navigation */}
            <div className="hidden md:flex items-center">
              {FEATURES.COURSE_MARKETPLACE && <ExploreDropdown />}
            </div>

            {/* Profile Dropdown - Visible on Mobile now */}
            <div className="ml-auto flex items-center gap-4">
              <ProfileDropdown />
            </div>
          </div>
        </header>
      )}

      {/* Content Area Below Header */}
      <div
        className={`flex-1 flex ${isTheaterMode
          ? "h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] w-full"
          : ""
          }`}
      >
        {/* Minimal Side Navigation - Portal Sidebar (Desktop) */}
        {!isTheaterMode && (
          <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-56" : "w-14"
              } hidden lg:flex flex-col shrink-0`}
          >
            {/* Sidebar Header - Hamburger menu */}
            <div
              className={`flex items-center justify-center px-3 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Collapse menu" : "Expand menu"}
            >
              <span className="w-8 flex items-center justify-center text-[#1839AD]">
                <Menu size={20} />
              </span>
              {sidebarOpen && (
                <ChevronLeft size={16} className="ml-auto text-gray-400" />
              )}
            </div>

            {/* Navigation Items (Desktop) */}
            <nav className="flex-1 py-3 overflow-y-auto">
              {/* My Courses Section */}
              <div className="mx-2 space-y-1">
                <div className="px-2 py-1 text-xs text-gray-400 uppercase font-semibold tracking-wide">
                  {sidebarOpen ? "My Courses" : ""}
                </div>

                {showOnboarding && (
                  <Link
                    to="/portal/onboarding"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[#1839AD] bg-[#1839AD]/10 transition ${!sidebarOpen ? "justify-center" : ""
                      }`}
                    title="Onboarding"
                  >
                    <CheckCircle size={16} className="shrink-0" />
                    {sidebarOpen && <span className="text-sm">Onboarding</span>}
                  </Link>
                )}

                {/* In Progress */}
                <Link
                  to="/portal/my-courses/in-progress"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isMyCoursesActive
                    ? "text-[#1839AD] bg-[#1839AD]/10"
                    : "text-[#1839AD] bg-[#1839AD]/5 hover:bg-[#1839AD]/10"
                    } transition ${!sidebarOpen ? "justify-center" : ""}`}
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? "justify-center" : ""
                    }`}
                  title="Profile - Coming Soon"
                >
                  <User size={16} className="shrink-0" />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm">Profile</span>
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Saved */}
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? "justify-center" : ""
                    }`}
                  title="Saved - Coming Soon"
                >
                  <Bookmark size={16} className="shrink-0" />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm">Saved</span>
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 mx-3 border-t border-gray-200" />

              {/* Badges - Coming Soon */}
              <div
                className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? "justify-center" : ""
                  }`}
                title="Badges - Coming Soon"
              >
                <Award size={16} className="shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-sm">Badges</span>
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>

              {/* Career Coach - Coming Soon */}
              <div
                className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-400 cursor-not-allowed ${!sidebarOpen ? "justify-center" : ""
                  }`}
                title="AI Career Coach - Coming Soon"
              >
                <Sparkles size={16} className="shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-sm">Career Coach</span>
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </nav>
          </aside>
        )}

        {/* --------------------------- */}
        {/* MOBILE RIGHT DRAWER (EXPLORE) */}
        {/* --------------------------- */}

        {/* Overlay for Right Drawer */}
        {rightDrawerOpen && !isTheaterMode && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setRightDrawerOpen(false)}
          />
        )}

        {/* Right Drawer Content */}
        {!isTheaterMode && (
          <aside
            className={`fixed inset-y-0 right-0 z-[70] bg-white w-[85vw] max-w-[320px] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${rightDrawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-gray-900">Explore Catalog</span>
                <button
                  onClick={() => setRightDrawerOpen(false)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 py-4 overflow-y-auto bg-gray-50">
              {/* Always Expanded List of Categories */}
              <div className="px-3 space-y-2">
                {FEATURES.COURSE_MARKETPLACE && COURSE_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    to={category.href}
                    className="w-full text-left px-4 py-3.5 bg-white text-sm text-gray-700 hover:text-[#1839AD] hover:bg-blue-50 flex items-center gap-4 transition-all border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200"
                    onClick={() => setRightDrawerOpen(false)}
                  >
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:text-[#1839AD]">
                      <category.icon size={20} />
                    </div>
                    <span className="font-medium">{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Floating Button REMOVED */}

        {/* --------------------------- */}
        {/* MOBILE LEFT SIDEBAR (APP)   */}
        {/* --------------------------- */}

        {/* Overlay for Left Sidebar */}
        {sidebarOpen && !isTheaterMode && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Content */}
        {!isTheaterMode && (
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-white w-[85vw] max-w-[300px] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto px-2">

              {/* My Courses Section */}
              <div className="mb-6">
                <div className="px-2 py-1 text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">
                  Learning
                </div>

                <div className="space-y-1">
                  {showOnboarding && (
                    <Link
                      to="/portal/onboarding"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#1839AD] bg-[#1839AD]/10 font-medium"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <CheckCircle size={18} />
                      <span className="text-sm">Onboarding</span>
                    </Link>
                  )}

                  <Link
                    to="/portal/my-courses/in-progress"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#1839AD] bg-[#1839AD]/5 hover:bg-[#1839AD]/10 font-medium"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Play size={18} />
                    <span className="text-sm">My Courses (In Progress)</span>
                  </Link>
                </div>
              </div>

              {/* Tools & Settings */}
              <div className="mb-6">
                <div className="px-2 py-1 text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">
                  Tools
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <User size={18} />
                    <span className="text-sm">Profile</span>
                    <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <Bookmark size={18} />
                    <span className="text-sm">Saved Items</span>
                    <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </nav>

            {/* Mobile Sidebar Footer - Sign Out */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
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
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0 flex-col pb-16 lg:pb-0">
          {children || <Outlet />}
        </div>

        {/* Mobile Bottom Navigation Bar - Best Practice for App Context Switching */}
        {!isTheaterMode && (
          <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl z-[40] flex items-center justify-around py-2.5 safe-area-bottom">
            {/* 1. My Learning (Primary) */}
            <Link
              to="/portal/my-courses/in-progress"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isMyCoursesActive ? 'text-[#1839AD] bg-blue-50' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => {
                setSidebarOpen(false);
                setRightDrawerOpen(false);
              }}
            >
              <Play size={20} className={isMyCoursesActive ? "fill-current" : ""} />
              <span className="text-[10px] font-medium">Learning</span>
            </Link>

            {/* 2. Explore (Marketplace) */}
            {FEATURES.COURSE_MARKETPLACE && (
              <button
                onClick={() => {
                  setRightDrawerOpen(true);
                  setSidebarOpen(false);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${rightDrawerOpen ? 'text-[#1839AD] bg-blue-50' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Search size={20} />
                <span className="text-[10px] font-medium">Explore</span>
              </button>
            )}

            {/* 3. Menu (Tools/More) */}
            <button
              onClick={() => {
                setSidebarOpen(true);
                setRightDrawerOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${sidebarOpen ? 'text-[#1839AD] bg-blue-50' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Menu size={20} />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
