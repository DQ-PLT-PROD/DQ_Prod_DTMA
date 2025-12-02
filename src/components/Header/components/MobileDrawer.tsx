import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, ChevronRightIcon, User, LogOut } from "lucide-react";
import {
  BRAND_GRADIENT,
  BRAND_BACKDROP_BLUR,
  BRAND_PRIMARY,
} from "../../../constants/branding";
import { useLearningAuth } from "../../../contexts/LearningAuthContext";
import { AuthModal } from "../../auth/AuthModal";

interface MobileDrawerProps {
  onSignIn: () => void;
  isSignedIn: boolean;
  onJoinAcademy?: () => void;
  onBrowseCourses?: () => void;
  onBrowseCategories?: () => void;
}

export function MobileDrawer({
  onSignIn,
  isSignedIn,
  onJoinAcademy,
  onBrowseCourses,
  onBrowseCategories,
}: MobileDrawerProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useLearningAuth();

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
    setShowAuthModal(true);
    setIsDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
        navigate("/marketplace/courses");
      }
    }
    setIsDrawerOpen(false);
  };

  const handleBrowseCategories = () => {
    if (onBrowseCategories) {
      onBrowseCategories();
    } else {
      navigate("/growth-areas-marketplace");
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Mobile and Tablet drawer */}
          <div
            className="fixed top-0 right-0 h-full w-80 shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out"
            style={{
              background: BRAND_GRADIENT,
              backdropFilter: BRAND_BACKDROP_BLUR,
              WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
            }}
          >
            <div className="flex flex-col h-full">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-800 md:text-base sm:text-sm">
                  Menu
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <XIcon size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Drawer content - scrollable area */}
              <div className={`flex-1 overflow-y-auto ${!isSignedIn ? "pb-20" : ""}`}>
                {/* Navigation Section - Show for Mobile only, Tablet has these in header */}
                <div className="px-4 py-3 md:hidden">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:text-[11px] sm:text-[10px]">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5"
                      onClick={handleBrowseCategories}
                    >
                      <span>Browse D6 Categories</span>
                      <ChevronRightIcon
                        size={14}
                        className="text-gray-400 md:w-3 md:h-3 sm:w-3 sm:h-3"
                      />
                    </button>
                  </div>
                </div>

                {/* Divider - Only show for mobile */}
                <div className="border-t border-gray-200 mx-4 my-2 md:hidden"></div>

                {/* Get Started Section - Always visible, contains both CTAs */}
                <div className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:text-[11px] sm:text-[10px]">
                    Get Started
                  </h3>
                  <div className="space-y-1">
                    {/* Join the Academy CTA */}
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5"
                      onClick={() => handleCTAClick("Join the Academy")}
                    >
                      <span>Join the Academy</span>
                      <ChevronRightIcon
                        size={14}
                        className="text-gray-400 md:w-3 md:h-3 sm:w-3 sm:h-3"
                      />
                    </button>

                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left text-white rounded-lg transition-all text-sm font-semibold tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5 hover:opacity-90"
                      style={{ backgroundColor: BRAND_PRIMARY }}
                      onClick={() => handleCTAClick("Browse Courses")}
                    >
                      <span>Browse Courses</span>
                      <ChevronRightIcon
                        size={14}
                        className="text-white md:w-3 md:h-3 sm:w-3 sm:h-3"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* User Profile or Sign In at bottom */}
              <div className="sticky bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white shadow-lg">
                {user && profile ? (
                  // Signed in - show profile
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {profile.full_name || 'Learner'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stage {profile.current_stage} • {profile.total_score} pts
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
                  // Not signed in - show sign in button
                  <div>
                    <button
                      className="w-full px-4 py-3 text-white rounded-lg transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 font-bold text-base tracking-tight shadow-md md:text-[15px] sm:text-sm"
                      style={{ backgroundColor: BRAND_PRIMARY }}
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
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
