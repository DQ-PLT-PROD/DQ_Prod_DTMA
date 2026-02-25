import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, ChevronDownIcon, UserIcon, BookOpenIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useAdminAuthOptional } from '@/lib/admin-auth';

// Simplified for MVP - removed notifications.
export function ProfileDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const {
    user,
    logout,
    isLoading
  } = useAuth();
  const adminAuth = useAdminAuthOptional();
  const adminUser = adminAuth?.user ?? null;
  const isAdminSession = Boolean(adminAuth?.session && adminUser);
  const effectiveUser = isAdminSession && adminUser
    ? {
      id: adminUser.id,
      name: (adminUser.user_metadata?.full_name as string) || adminUser.email || 'Admin User',
      email: adminUser.email || '',
    } as any
    : user;

  // Generate initials from user name if no avatar is available
  const getInitials = () => {
    if (!effectiveUser || !effectiveUser.name) return '?';
    if ((effectiveUser as any).givenName && (effectiveUser as any).familyName) {
      return `${(effectiveUser as any).givenName.charAt(0)}${(effectiveUser as any).familyName.charAt(0)}`;
    }
    const nameParts = effectiveUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
    }
    return effectiveUser.name.substring(0, 2).toUpperCase();
  };
  // Get user's first name for greeting
  const getFirstName = () => {
    if (!effectiveUser) return '';
    return (effectiveUser as any).givenName || effectiveUser.name.split(' ')[0];
  };
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsOpen(false);
  };
  // Show logout confirmation dialog
  const showLogoutConfirm = () => {
    setShowLogoutConfirmation(true);
  };
  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };
  // Handle logout
  const handleLogout = () => {
    closeDropdown();
    setShowLogoutConfirmation(false);
    if (isAdminSession && adminAuth) {
      adminAuth.signOut().then(() => {
        navigate('/admin/login', { replace: true });
      });
      return;
    }
    logout();
  };
  // MVP: Profile navigation disabled for now
  // const navigateToUserProfile = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   closeDropdown();
  // };
  // If still loading user data, show loading state
  if (isLoading) {
    return <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="ml-2 w-16 h-4 bg-gray-200 animate-pulse"></div>
    </div>;
  }
  // If no user is authenticated, don't show the dropdown
  if (!effectiveUser) {
    return null;
  }
  return <div className="relative">
    <button className="flex items-center" onClick={toggleDropdown} aria-label="User menu">
      <div className="relative w-10 h-10 rounded-full bg-[color:var(--md-surface)] text-[color:var(--md-primary)] flex items-center justify-center font-bold shadow-md-1">
        {(effectiveUser as any).picture ? <img src={(effectiveUser as any).picture} alt={effectiveUser.name} className="w-full h-full rounded-full object-cover" /> : getInitials()}
        {/* MVP: Removed notification indicator */}
      </div>
      <div className="flex items-center ml-2">
        <span className="hidden sm:inline text-white">
          Hi, {getFirstName()}
        </span>
        <ChevronDownIcon size={16} className="ml-1 text-white" />
      </div>
    </button>
    {isOpen && <>
      <div className="fixed inset-0 z-30" onClick={closeDropdown}></div>
      <div className="absolute right-0 mt-2 w-56 md-card shadow-md-2 z-40">
        {/* MVP: User info display only (no navigation) */}
        <div className="p-3 border-b border-[color:var(--md-outline-variant)]">
          <div className="flex items-center">
            <UserIcon size={18} className="text-[color:var(--md-on-surface-variant)] mr-2" />
            <div className="ml-1">
              <p className="text-sm font-medium text-[color:var(--md-on-surface)]">
                {effectiveUser.name}
              </p>
              <p className="text-xs text-[color:var(--md-on-surface-variant)]">{effectiveUser.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Restored for Desktop */}
        <div className="py-1 border-b border-[color:var(--md-outline-variant)]">
          <a href={isAdminSession ? "/instructor/dashboard" : "/portal/my-courses/in-progress"} className="flex items-center w-full text-left px-4 py-2 text-sm text-[color:var(--md-on-surface-variant)] hover:bg-[color:var(--md-surface-variant)]">
            <div className="mr-3 text-[color:var(--md-primary)]">
              <BookOpenIcon size={16} className="text-[color:var(--md-primary)]" />
            </div>
            {isAdminSession ? 'Instructor Dashboard' : 'My Learning'}
          </a>
        </div>

        {/* MVP: Notifications section commented out */}
        {/* 
        <div className="py-1">
          <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={e => {
            e.preventDefault();
            closeDropdown();
            onViewNotifications();
          }}>
            <BellIcon size={16} className="mr-3 text-gray-500" />
            <span>Notifications</span>
            {unreadNotifications > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
              {unreadNotifications}
            </span>}
          </button>
        </div>
        */}

        {/* Essential: Logout functionality */}
        <div className="py-1 border-t border-[color:var(--md-outline-variant)]">
          <button className="flex items-center w-full text-left px-4 py-2 text-sm text-[color:var(--md-on-surface-variant)] hover:bg-[color:var(--md-surface-variant)]" onClick={e => {
            e.preventDefault();
            showLogoutConfirm();
          }}>
            <LogOutIcon size={16} className="mr-3 text-[color:var(--md-on-surface-variant)]" />
            Log Out
          </button>
        </div>
      </div>
    </>}
    {/* Logout Confirmation Dialog */}
    {showLogoutConfirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="md-card-elevated p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-[color:var(--md-on-surface)] mb-4">
          Confirm Logout
        </h3>
        <p className="text-sm text-[color:var(--md-on-surface-variant)] mb-5">
          Are you sure you want to log out? You will need to sign in again
          to access your account.
        </p>
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-[color:var(--md-on-surface)] bg-[color:var(--md-surface-variant)] rounded-full hover:bg-[color:var(--md-surface-variant-hover)]" onClick={cancelLogout}>
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700" onClick={handleLogout}>
            Confirm
          </button>
        </div>
      </div>
    </div>}
  </div>;
}
