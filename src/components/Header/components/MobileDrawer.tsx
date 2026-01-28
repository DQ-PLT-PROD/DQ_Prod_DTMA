import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, ChevronRightIcon, User, LogOut, ChevronDownIcon, Layers, BookOpen } from "lucide-react";
import {
  BRAND_GRADIENT,
  BRAND_BACKDROP_BLUR,
  BRAND_PRIMARY,
} from "../../../constants/branding";
import { useAuth } from "@/lib/auth";
import { COURSE_CATEGORIES } from "../../../constants/navigation";

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

  return (
    <>
      {/* Menu Toggle Button - stays in header */}
      <button
        className="p-2 text-white hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none md:hidden active:scale-95"
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <MenuIcon size={26} />
      </button>

      {/* Portal: Backdrop and Drawer rendered at document.body to escape header's stacking context */}
      {createPortal(
        <>
          {/* Backdrop */}
          {isDrawerOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-[color:var(--md-surface)] shadow-md-3 z-[101] transform transition-transform duration-300 ease-out border-l border-[color:var(--md-outline-variant)] ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <div className="flex flex-col h-full bg-[color:var(--md-background)]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface)]">
                <span className="font-semibold text-[color:var(--md-on-surface)] text-lg tracking-tight">Menu</span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 -mr-2 text-[color:var(--md-on-surface-variant)] hover:text-[color:var(--md-on-surface)] hover:bg-[color:var(--md-surface-variant)] rounded-full transition-colors"
                >
                  <XIcon size={20} />
                </button>
              </div>

              {/* User Profile Section - At Top for Prominence */}
              {user && (
                <div className="px-5 py-4 border-b border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface-variant)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[color:var(--md-on-surface)] truncate">
                        {user.name || 'Learner'}
                      </p>
                      <p className="text-xs text-[color:var(--md-on-surface-variant)] truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

                {/* My Learning - Primary Action (logged in users only) */}
                {user && (
                  <button
                    onClick={() => {
                      navigate('/portal/my-courses/in-progress');
                      setIsDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-[color:var(--md-primary)] text-white rounded-xl shadow-md-1 hover:shadow-md-2 transition-all duration-200"
                  >
                    <BookOpen size={20} />
                    <span className="font-semibold">My Learning</span>
                    <ChevronRightIcon size={18} className="ml-auto" />
                  </button>
                )}

                {/* Explore Courses */}
                <div className="space-y-4">
                  <div className="md-card overflow-hidden">
                    <div className="px-4 py-3.5 bg-[color:var(--md-surface-variant)] border-b border-[color:var(--md-outline-variant)] flex items-center gap-3">
                      <div className="p-1.5 bg-[color:var(--md-primary-container)] text-[color:var(--md-primary)] rounded-[var(--md-radius-sm)]">
                        <Layers size={18} />
                      </div>
                      <span className="font-medium text-[color:var(--md-on-surface)]">Explore Courses</span>
                    </div>

                    <div className="py-1">
                      {COURSE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon || Layers;
                        return (
                          <button
                            key={cat.slug}
                            className="w-full text-left px-4 py-3 text-sm text-[color:var(--md-on-surface-variant)] hover:text-[color:var(--md-primary)] hover:bg-[color:var(--md-primary-container)] flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-[color:var(--md-primary)]"
                            onClick={() => {
                              navigate(cat.href);
                              setIsDrawerOpen(false);
                            }}
                          >
                            <Icon size={18} className="text-[color:var(--md-on-surface-variant)]" />
                            <span className="truncate">{cat.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Sign Out or Sign In */}
              <div className="p-5 border-t border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface)]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-full transition-colors text-sm font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      className="w-full px-4 py-3 bg-[color:var(--md-primary)] text-white rounded-full shadow-md-1 hover:shadow-md-2 hover:bg-[color:var(--md-primary-hover)] transition-all duration-300 font-semibold text-sm"
                      onClick={handleSignIn}
                    >
                      Sign In
                    </button>
                    <p className="text-center text-xs text-[color:var(--md-on-surface-variant)]">
                      Join to access your personalized dashboard
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
