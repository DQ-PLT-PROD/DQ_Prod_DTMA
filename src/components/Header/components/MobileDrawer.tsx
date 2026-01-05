import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, ChevronRightIcon, User, LogOut, ChevronDownIcon } from "lucide-react";
import {
  BRAND_GRADIENT,
  BRAND_BACKDROP_BLUR,
  BRAND_PRIMARY,
} from "../../../constants/branding";
import { useAuth } from "../context/AuthContext";

interface MobileDrawerProps {
  onSignIn: () => void;
  isSignedIn: boolean;
  onJoinAcademy?: () => void;
  onBrowseCourses?: () => void;
  onBrowseCategories?: () => void;
}

const COURSE_CATEGORIES = [
  { id: "d1", name: "Mastering Economy 4.0", href: "/courses?category=economy-4-0" },
  { id: "d2", name: "Building Tomorrow’s Organisations", href: "/courses?category=digital-cognitive-organization" },
  { id: "d3", name: "Mastering Digital Transformation", href: "/courses?category=digital-business-platform" },
  { id: "d4", name: "Designing for the Future", href: "/courses?category=digital-transformation-2-0" },
  { id: "d5", name: "Architecting Change", href: "/courses?category=digital-worker-workspace" },
  { id: "d6", name: "Empowering Change", href: "/courses?category=digital-accelerators-tools" },
];

export function MobileDrawer({
  onSignIn,
  isSignedIn,
  onJoinAcademy,
  onBrowseCourses,
  onBrowseCategories,
}: MobileDrawerProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { user, login, logout } = useAuth();

  useEffect(() => {
    if (isDrawerOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [isDrawerOpen]);

  const handleSignIn = () => {
    onSignIn();
    setIsDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      logout();
      setIsDrawerOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleCTAClick = (action: string) => {
    if (action === "Join the Academy") {
      onJoinAcademy && onJoinAcademy();
    } else if (action === "Browse Courses") {
      if (onBrowseCourses) {
        onBrowseCourses();
      } else {
        navigate("/courses");
      }
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Always visible primary CTA + hamburger menu for Mobile (<768px) */}
      <div className="flex items-center space-x-2 md:hidden">
        {/* Hamburger menu button */}
        <button
          className="p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
        >
          {isDrawerOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Tablet hamburger menu (768px - 1023px) */}
      <div className="hidden md:flex lg:hidden items-center">
        <button
          className="p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
        >
          {isDrawerOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile and Tablet drawer overlay */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Mobile and Tablet drawer */}
          <div
            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] shadow-lg z-50 lg:hidden transform transition-transform duration-300 ease-in-out bg-[#f9f9fb] text-gray-900"
          >
            <div className="flex flex-col h-full">
              {/* Drawer header */}
              <div className="flex items-center justify-end px-3 py-3 border-b border-gray-200 bg-white/80 backdrop-blur">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <XIcon size={18} className="text-gray-700" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                <div className="space-y-2">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-semibold tracking-tight md:text-[13px] sm:text-xs"
                    onClick={() => setShowCategories((v) => !v)}
                    aria-expanded={showCategories}
                    aria-controls="drawer-course-categories"
                  >
                    <span>Explore Courses</span>
                    <ChevronDownIcon
                      size={16}
                      className={`text-gray-500 transition-transform ${showCategories ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showCategories && (
                    <div
                      id="drawer-course-categories"
                      className="mt-2 space-y-1 rounded-lg border border-gray-200 bg-white"
                    >
                      {COURSE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => {
                            navigate(cat.href);
                            setIsDrawerOpen(false);
                          }}
                        >
                          <span className="truncate">{cat.name}</span>
                          <ChevronRightIcon size={14} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sign In at bottom */}
              <div className="px-4 py-4 border-t border-gray-200 bg-[#f9f9fb]">
                {user ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {user.name || 'Learner'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      className="w-full px-4 py-3 text-[#1839AD] rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1839AD]/20 font-semibold text-sm tracking-tight border border-gray-200 bg-white"
                      onClick={handleSignIn}
                    >
                      Sign In to Get Started
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2 md:text-[11px] sm:text-[10px]">
                      Access your personalized dashboard
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
