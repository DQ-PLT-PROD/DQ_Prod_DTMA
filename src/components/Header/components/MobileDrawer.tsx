import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, ChevronRightIcon, User, LogOut, ChevronDownIcon, Layers } from "lucide-react";
import {
  BRAND_GRADIENT,
  BRAND_BACKDROP_BLUR,
  BRAND_PRIMARY,
} from "../../../constants/branding";
import { useAuth } from "../../../features/auth/context/AuthContext";
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
      {/* Menu Toggle Button */}
      <button
        className="p-2 text-white hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none md:hidden active:scale-95"
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <MenuIcon size={26} />
      </button>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-100 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full bg-[#FAFAFA]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
            <span className="font-bold text-gray-900 text-lg tracking-tight">Menu</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

            {/* Main Navigation */}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                <div className="px-4 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Layers size={18} />
                  </div>
                  <span className="font-medium text-gray-900">Explore Courses</span>
                </div>

                <div className="py-1">
                  {COURSE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon || Layers;
                    return (
                      <button
                        key={cat.id}
                        className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-blue-600"
                        onClick={() => {
                          navigate(cat.href);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <Icon size={18} className="text-gray-400" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer / User Profile */}
          <div className="p-5 border-t border-gray-100 bg-white">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.name || 'Learner'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 bg-[#1839AD] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-800 transition-all duration-300 font-semibold text-sm"
                  onClick={handleSignIn}
                >
                  Sign In
                </button>
                <p className="text-center text-xs text-gray-400">
                  Join to access your personalized dashboard
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
