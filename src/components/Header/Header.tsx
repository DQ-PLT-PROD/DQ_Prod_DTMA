import React, { useEffect, useState } from "react";
import { MobileDrawer } from "./components/MobileDrawer";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationsMenu } from "./notifications/NotificationsMenu";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { mockNotifications } from "./utils/mockNotifications";
import { useAuth } from "./context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BRAND_BACKDROP_BLUR,
  BRAND_GRADIENT,
  BRAND_PRIMARY,
} from "../../constants/branding";

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
  "data-id"?: string;
}

export function Header({
  toggleSidebar,
  sidebarOpen,
  "data-id": dataId,
}: HeaderProps) {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Count unread notifications
  const unreadCount = mockNotifications.filter((notif) => !notif.read).length;

  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle notifications menu
  const toggleNotificationsMenu = () => {
    setShowNotificationsMenu(!showNotificationsMenu);
    if (showNotificationCenter) setShowNotificationCenter(false);
  };

  // Open notification center
  const openNotificationCenter = () => {
    setShowNotificationCenter(true);
    setShowNotificationsMenu(false);
  };

  // Close notification center
  const closeNotificationCenter = () => {
    setShowNotificationCenter(false);
  };

  // Handle sign in
  const handleSignIn = () => {
    login();
  };

  const handleBrowseCourses = () => {
    navigate("/marketplace/courses");
  };

  // Reset notification states when user logs out
  useEffect(() => {
    if (!user) {
      setShowNotificationsMenu(false);
      setShowNotificationCenter(false);
    }
  }, [user]);

  // Smooth scroll to D6 categories section
  const scrollToCategories = () => {
    const targetHash = "#d6-categories";
    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash: targetHash });
      return;
    }
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    const el = document.getElementById("d6-categories");
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Smooth scroll to final CTA block
  const scrollToFinalCTA = () => {
    const targetHash = "#final-cta";
    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash: targetHash });
      return;
    }
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    const el = document.getElementById("final-cta");
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`flex items-center w-full transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 right-0 z-40 shadow-lg"
            : "relative"
        }`}
        data-id={dataId}
        style={{
          background: BRAND_GRADIENT,
          backdropFilter: BRAND_BACKDROP_BLUR,
          WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
        }}
      >
        {/* Logo Section */}
        <Link
          to="/"
          className={`text-white py-2 px-4 flex items-center transition-all duration-300 ${
            isSticky ? "h-16" : "h-20"
          }`}
          style={{ background: BRAND_GRADIENT }}
        >
          <img
            src="/dtma_logo.png"
            alt="DTMA Logo"
            className={`transition-all duration-300 object-contain w-auto ${
              isSticky ? "h-12" : "h-16"
            }`}
          />
        </Link>
        {/* Main Navigation */}
        <div
          className={`flex-1 flex justify-between items-center text-white px-4 transition-all duration-300 ${
            isSticky ? "h-16" : "h-20"
          }`}
        >
          {/* Left Navigation - Desktop and Tablet */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to={"/growth-areas-marketplace"}
              className={`hover:text-gray-200 transition-colors duration-200 cursor-pointer ${
                isSticky ? "text-sm" : ""
              }`}
            >
              Explore the AI Working Era
            </Link>
          </div>
          {/* Right Side - Conditional based on auth state and screen size */}
          <div className="flex items-center ml-auto relative">
            {user ? (
              <ProfileDropdown
                onViewNotifications={toggleNotificationsMenu}
                unreadNotifications={unreadCount}
              />
            ) : (
              <>
                {/* Desktop CTAs (>=1024px) */}
                <div className="hidden lg:flex items-center space-x-3">
                  <button
                    className={`px-4 py-2 text-white border border-white/30 rounded-md hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                      isSticky ? "text-sm px-3 py-1.5" : ""
                    }`}
                    onClick={scrollToFinalCTA}
                  >
                    Join the Academy
                  </button>
                  <button
                    className={`px-4 py-2 text-white rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium hover:opacity-90 ${
                      isSticky ? "text-sm px-3 py-1.5" : ""
                    }`}
                    style={{ backgroundColor: BRAND_PRIMARY }}
                    onClick={handleBrowseCourses}
                  >
                    Browse Courses
                  </button>
                  <button
                    className={`px-4 py-2 text-white border border-white/50 rounded-md hover:bg-white hover:text-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                      isSticky ? "text-sm px-3 py-1.5" : ""
                    }`}
                    onClick={handleSignIn}
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}
            {/* Mobile and Tablet Drawer - Show for screens <1024px */}
            <MobileDrawer
              onSignIn={handleSignIn}
              isSignedIn={!!user}
              onJoinAcademy={scrollToFinalCTA}
              onBrowseCourses={handleBrowseCourses}
              onBrowseCategories={scrollToCategories}
            />
          </div>
        </div>
      </header>
      {/* Spacer for sticky header */}
      {isSticky && <div className="h-16"></div>}

      {/* Notifications Menu */}
      {showNotificationsMenu && user && (
        <NotificationsMenu
          onViewAll={openNotificationCenter}
          onClose={() => setShowNotificationsMenu(false)}
        />
      )}
      {/* Notification Center Modal */}
      {showNotificationCenter && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeNotificationCenter}
          ></div>
          <div className="relative bg-white shadow-xl rounded-lg max-w-2xl w-full max-h-[90vh] m-4 transform transition-all duration-300">
            <NotificationCenter onBack={closeNotificationCenter} />
          </div>
        </div>
      )}
    </>
  );
}
