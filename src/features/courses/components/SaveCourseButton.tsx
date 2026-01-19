/**
 * Save Course Button Component (Dev D - Feature D2)
 *
 * Allows users to save/bookmark courses for later
 * Uses localStorage for MVP (will be migrated to database post-MVP)
 *
 * @see docs/DTMA_DevD_Technical_Audit.md Section 4
 */

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { isCourseSaved, toggleSavedCourse } from "../utils/savedCoursesManager";

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
  const { user, databaseUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check saved status on mount and when user changes
  useEffect(() => {
    if (databaseUser?.id) {
      const saved = isCourseSaved(databaseUser.id, courseSlug);
      setIsSaved(saved);
    } else {
      setIsSaved(false);
    }
  }, [databaseUser?.id, courseSlug]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    e.preventDefault();

    // Require authentication
    if (!databaseUser?.id) {
      console.log("⚠️ User must be logged in to save courses");
      // Could show a toast or modal here
      return;
    }

    // Toggle saved state
    const success = toggleSavedCourse(databaseUser.id, courseSlug);

    if (success) {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      // Notify parent component
      if (onSaveChange) {
        onSaveChange(newSavedState);
      }

      console.log(
        newSavedState ? "✅ Course saved" : "❌ Course unsaved",
        courseSlug
      );
    }
  };

  // Size classes
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
            isSaved
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
          ${isAnimating ? "scale-110" : "scale-100"}
          ${
            !databaseUser?.id
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
          ${className}
        `}
        disabled={!databaseUser?.id}
        title={
          !databaseUser?.id
            ? "Sign in to save courses"
            : isSaved
            ? `Remove "${courseTitle || "course"}" from saved`
            : `Save "${courseTitle || "course"}" for later`
        }
        aria-label={isSaved ? "Unsave course" : "Save course"}
      >
        {isSaved ? (
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
          isSaved
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300"
            : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300"
        }
        ${isAnimating ? "scale-105" : "scale-100"}
        ${
          !databaseUser?.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }
        ${className}
      `}
      disabled={!databaseUser?.id}
      title={
        !databaseUser?.id
          ? "Sign in to save courses"
          : isSaved
          ? "Remove from saved"
          : "Save for later"
      }
    >
      {isSaved ? (
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
