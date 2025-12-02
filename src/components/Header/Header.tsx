import React, { useEffect, useState } from "react";
import { MobileDrawer } from "./components/MobileDrawer";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationsMenu } from "./notifications/NotificationsMenu";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { mockNotifications } from "./utils/mockNotifications";
import { useAuth } from "./context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserIcon, ArrowRight } from "lucide-react";
import { ExploreDropdown } from "./components/ExploreDropdown";
import { BRAND_BACKDROP_BLUR } from "../../constants/branding";
import { LearningAuthButton } from "../auth/LearningAuthButton";

const HEADER_GRADIENT =
  "linear-gradient(90deg, #0a32a0 0%, #2a4090 40%, #4e5a8b 70%, #8b90a3 100%)";

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
  "data-id"?: string;
  transparent?: boolean;
}

export function Header({
  toggleSidebar,
  sidebarOpen,
  "data-id": dataId,
  transparent = false,
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

  const isTransparent = transparent && !isSticky;

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${isSticky
          ? "fixed top-0 left-0 right-0 z-50 shadow-lg"
          : isTransparent
            ? "absolute top-0 left-0 right-0 z-50"
            : "relative z-50"
          }`}
        data-id={dataId}
        style={{
          background: isTransparent ? "transparent" : HEADER_GRADIENT,
          backdropFilter: isTransparent ? "none" : BRAND_BACKDROP_BLUR,
          WebkitBackdropFilter: isTransparent ? "none" : BRAND_BACKDROP_BLUR,
        }}
      >
        <div
          className={`flex w-full items-center text-white transition-all duration-300 ${isSticky ? "px-5 py-2.5" : "px-8 py-4"
            }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center transition-all duration-300">
            <img
              src="/DTMA%20LOGO%20WHITE.svg"
              alt="DTMA Logo"
              className="object-contain w-[130px] h-[36px]"
            />
          </Link>

          {/* Primary navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-8">
            <ExploreDropdown />
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4 ml-auto relative">
            {/* Learning Auth Button - Show on all screens */}
            <LearningAuthButton showProgress={true} />
            
            {/* Keep Azure auth for admin/enterprise features */}
            {user && (
              <ProfileDropdown
                onViewNotifications={toggleNotificationsMenu}
                unreadNotifications={unreadCount}
              />
            )}
            
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
