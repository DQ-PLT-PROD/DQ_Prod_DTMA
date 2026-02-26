/**
 * Save Course Button Component
 *
 * Allows users to save/bookmark courses for later.
 * Uses SavedCoursesContext for shared state backed by Supabase persistence.
 * Unauthenticated users are redirected to login on click.
 */

import React, { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSavedCourses } from "../context/SavedCoursesContext";

interface SaveCourseButtonProps {
  courseSlug: string;
  courseTitle?: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
  onSaveChange?: (isSaved: boolean) => void;
}

export const SaveCourseButton: React.FC<SaveCourseButtonProps> = ({
  courseSlug,
  courseTitle,
  variant = "icon",
  size = "md",
  className = "",
  onSaveChange,
}) => {
  const { user, login } = useAuth();
  const { isSaved: checkSaved, toggleSave } = useSavedCourses();
  const saved = checkSaved(courseSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Auth gating: redirect to login if not authenticated
    if (!user) {
      sessionStorage.setItem("pendingSaveCourseId", courseSlug);
      sessionStorage.setItem("returnUrl", window.location.pathname);
      login();
      return;
    }

    setIsLoading(true);
    try {
      const didSync = await toggleSave(courseSlug);
      if (!didSync) return;
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      onSaveChange?.(!saved);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Icon variant
  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleSave}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${
            saved
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
          ${isAnimating ? "scale-110" : "scale-100"}
          cursor-pointer
          ${className}
        `}
        disabled={isLoading}
        title={
          !user
            ? "Sign in to save courses"
            : saved
            ? `Remove "${courseTitle || "course"}" from saved`
            : `Save "${courseTitle || "course"}" for later`
        }
        aria-label={saved ? "Unsave course" : "Save course"}
      >
        {isLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : saved ? (
          <BookmarkCheck size={iconSizes[size]} className="fill-current" />
        ) : (
          <Bookmark size={iconSizes[size]} />
        )}
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleToggleSave}
      className={`
        flex items-center gap-2 px-4 py-2
        rounded-lg font-medium
        transition-all duration-200
        ${
          saved
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300"
            : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300"
        }
        ${isAnimating ? "scale-105" : "scale-100"}
        cursor-pointer
        ${className}
      `}
      disabled={isLoading}
      title={
        !user
          ? "Sign in to save courses"
          : saved
          ? "Remove from saved"
          : "Save for later"
      }
    >
      {isLoading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Saving...</span>
        </>
      ) : saved ? (
        <>
          <BookmarkCheck size={20} className="fill-current" />
          <span>Saved</span>
        </>
      ) : (
        <>
          <Bookmark size={20} />
          <span>Save</span>
        </>
      )}
    </button>
  );
};

/**
 * Compact save button for course cards
 */
export const SaveCourseIconButton: React.FC<{
  courseSlug: string;
  courseTitle?: string;
  className?: string;
}> = ({ courseSlug, courseTitle, className }) => {
  return (
    <SaveCourseButton
      courseSlug={courseSlug}
      courseTitle={courseTitle}
      variant="icon"
      size="md"
      className={className}
    />
  );
};

/**
 * Full save button for course details page
 */
export const SaveCourseFullButton: React.FC<{
  courseSlug: string;
  courseTitle?: string;
  className?: string;
}> = ({ courseSlug, courseTitle, className }) => {
  return (
    <SaveCourseButton
      courseSlug={courseSlug}
      courseTitle={courseTitle}
      variant="button"
      size="md"
      className={className}
    />
  );
};
