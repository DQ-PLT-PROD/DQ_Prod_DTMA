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
    console.log('🖱️ Sign In button clicked!');
    console.log('🔍 Current auth state before login:', { user: !!user, userEmail: user?.email });

    // Prevent multiple clicks
    if (user) {
      console.log('⚠️ User already logged in, ignoring click');
      return;
    }

    console.log('🎓 Will redirect to learning page after successful authentication');
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

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${isSticky
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
          className={`flex w-full items-center justify-between text-white transition-all duration-300 ${isSticky ? "px-5 py-2.5" : "px-8 py-4"
            }`}
        >
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center transition-all duration-300">
              <img
                src="/logo/dtma-logo-white.svg"
                alt="DTMA Logo"
                className="object-contain w-[130px] h-[36px]"
              />
            </Link>

            {/* Primary navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {FEATURES.COURSE_MARKETPLACE && <ExploreDropdown />}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 relative">
            {/* ProfileDropdown - hidden on mobile, shown on md+ */}
            {user ? (
              <div className="hidden md:block">
                <ProfileDropdown />
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
                <button
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 h-11 bg-[color:var(--md-surface)] text-[color:var(--md-primary)] font-medium hover:bg-[color:var(--md-surface-variant)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 shadow-md-1"
                  onClick={handleSignIn}
                >
                  <UserIcon size={18} className="text-[color:var(--md-primary)]" />
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
            />
          </div>
        </div>
      </header>
      {/* Spacer for sticky header */}
      {isSticky && <div className="h-16"></div>}

      {/* MVP: Notifications components commented out for lean release */}
      {/* 
      {showNotificationsMenu && user && (
        <NotificationsMenu
          onViewAll={openNotificationCenter}
          onClose={() => setShowNotificationsMenu(false)}
        />
      )}
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
      */}
    </>
  );
}
