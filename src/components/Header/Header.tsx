import React, { useEffect, useState } from "react";
import { MobileDrawer } from "./components/MobileDrawer";
import { ProfileDropdown } from "./ProfileDropdown";
// MVP: Notifications commented out for lean release
// import { NotificationsMenu } from "./notifications/NotificationsMenu";
// import { NotificationCenter } from "./notifications/NotificationCenter";
// import { mockNotifications } from "./utils/mockNotifications";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserIcon, ArrowRight } from "lucide-react";
import { ExploreDropdown } from "./components/ExploreDropdown";
import { BRAND_BACKDROP_BLUR } from "../../constants/branding";
import { FEATURES } from "../../config/features";

const HEADER_GRADIENT = "var(--brand-gradient)";

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
  // MVP: Notification states commented out
  // const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  // const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // MVP: Notification count commented out
  // const unreadCount = mockNotifications.filter((notif) => !notif.read).length;

  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // MVP: Notification functions commented out
  // const toggleNotificationsMenu = () => {
  //   setShowNotificationsMenu(!showNotificationsMenu);
  //   if (showNotificationCenter) setShowNotificationCenter(false);
  // };

  // const openNotificationCenter = () => {
  //   setShowNotificationCenter(true);
  //   setShowNotificationsMenu(false);
  // };

  // const closeNotificationCenter = () => {
  //   setShowNotificationCenter(false);
  // };

  // Handle sign in - direct Microsoft auth
  const handleSignIn = () => {
    console.log("🖱️ Sign In button clicked!");
    console.log("🔍 Current auth state before login:", {
      user: !!user,
      userEmail: user?.email,
    });

    // Prevent multiple clicks
    if (user) {
      console.log("⚠️ User already logged in, ignoring click");
      return;
    }

    console.log(
      "🎓 Will redirect to learning page after successful authentication",
    );
    login();
  };

  const handleBrowseCourses = () => {
    navigate("/courses");
  };

  // MVP: Notification reset commented out
  // useEffect(() => {
  //   if (!user) {
  //     setShowNotificationsMenu(false);
  //     setShowNotificationCenter(false);
  //   }
  // }, [user]);

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomeActive = location.pathname === "/";
  const isExploreActive = location.pathname.startsWith("/courses");

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 right-0 z-50 shadow-md-2"
            : isTransparent
              ? "absolute top-0 left-0 right-0 z-50"
              : "relative z-50"
        }`}
        data-id={dataId}
        style={{
          background: isTransparent ? "rgba(0, 0, 0, 0.3)" : HEADER_GRADIENT,
          backdropFilter: BRAND_BACKDROP_BLUR,
          WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
        }}
      >
        <div
          className={`flex w-full items-center justify-between text-white transition-all duration-300 ${
            isSticky ? "px-5 py-2.5" : "px-8 py-4"
          }`}
        >
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center transition-all duration-300"
            >
              <img
                src="/logo/dtma-logo-white.svg"
                alt="DTMA Logo"
                className="object-contain w-[130px] h-[36px]"
              />
            </Link>

            {/* Primary navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {FEATURES.COURSE_MARKETPLACE && <ExploreDropdown />}

              <Link
                to="/about"
                className="text-white/80 hover:text-white font-medium text-sm transition-colors"
              >
                About Us
              </Link>

              {/* Desktop Learning Link (Pre-login Access) - REMOVED per request */}
              {/* <button
                onClick={() => {
                  if (user) {
                    window.location.href = '/portal/my-courses/in-progress';
                  } else {
                    handleSignIn();
                  }
                }}
                className="text-white/80 hover:text-white font-medium text-sm transition-colors flex items-center gap-2"
              >
                Learning
              </button> */}
            </nav>
          </div>

          {/* Right side actions */}
          {/* Right side actions */}
          <div className="flex items-center gap-4 relative">
            {/* User State Handling */}
            {user ? (
              <>
                {/* Desktop: Profile Dropdown */}
                <div className="hidden lg:block">
                  <ProfileDropdown />
                </div>
                {/* Mobile: Avatar Trigger for Drawer */}
                <button
                  className="lg:hidden w-8 h-8 rounded-full bg-[color:var(--md-surface)] text-[color:var(--md-primary)] flex items-center justify-center font-bold shadow-sm overflow-hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium">
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 h-10 bg-[color:var(--md-surface)] text-[color:var(--md-primary)] font-medium hover:bg-[color:var(--md-surface-variant)] transition-all shadow-sm"
                  onClick={handleSignIn}
                >
                  <UserIcon
                    size={18}
                    className="text-[color:var(--md-primary)]"
                  />
                  {/* Hide text on extremely small screens if needed */}
                  <span>Sign In</span>
                </button>
              </div>
            )}

            <MobileDrawer
              onSignIn={handleSignIn}
              isSignedIn={!!user}
              onJoinAcademy={scrollToFinalCTA}
              onBrowseCourses={handleBrowseCourses}
              onBrowseCategories={scrollToCategories}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      </header>
      {/* Spacer for sticky header */}
      {isSticky && <div className="h-16"></div>}

      {/* Public Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl z-[40] flex items-center justify-around py-2.5 safe-area-bottom">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isHomeActive ? "text-[#1839AD] bg-blue-50" : "text-gray-500 hover:text-gray-900"}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Simple Home Icon SVG since lucide imports might need check */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* 2. Explore (Catalog) */}
        <Link
          to="/courses"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isExploreActive ? "text-[#1839AD] bg-blue-50" : "text-gray-500 hover:text-gray-900"}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* 3. Learning (Gatekept -> Sign In) */}
        <button
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-gray-500 hover:text-gray-900`}
          onClick={() => {
            setMobileMenuOpen(false);
            if (user) {
              navigate("/portal/my-courses/in-progress");
            } else {
              handleSignIn();
            }
          }}
        >
          {/* Play Icon to match Portal */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[10px] font-medium">Learning</span>
        </button>
      </div>
    </>
  );
}
