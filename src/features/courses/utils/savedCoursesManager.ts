/**
 * Saved Courses Manager (Dev D - Feature D2)
 *
 * LocalStorage-based persistence for saved courses (MVP workaround)
 * Will be replaced with database persistence post-MVP
 *
 * @see docs/DTMA_DevD_Technical_Audit.md Section 4
 */

const STORAGE_KEY_PREFIX = "dtma_saved_courses_";

/**
 * Get the storage key for a specific user
 */
function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/**
 * Get all saved course slugs for a user
 */
export function getSavedCourses(userId: string): string[] {
  try {
    const key = getStorageKey(userId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error reading saved courses from localStorage:", error);
    return [];
  }
}

/**
 * Check if a course is saved
 */
export function isCourseSaved(userId: string, courseSlug: string): boolean {
  const saved = getSavedCourses(userId);
  return saved.includes(courseSlug);
}

/**
 * Save a course
 */
export function saveCourse(userId: string, courseSlug: string): boolean {
  try {
    const saved = getSavedCourses(userId);

    // Don't add if already saved
    if (saved.includes(courseSlug)) {
      return true;
    }

    saved.push(courseSlug);
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(saved));

    console.log("✅ Course saved:", courseSlug);
    return true;
  } catch (error) {
    console.error("Error saving course to localStorage:", error);
    return false;
  }
}

/**
 * Unsave a course
 */
export function unsaveCourse(userId: string, courseSlug: string): boolean {
  try {
    const saved = getSavedCourses(userId);
    const filtered = saved.filter((slug) => slug !== courseSlug);

    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(filtered));

    console.log("✅ Course unsaved:", courseSlug);
    return true;
  } catch (error) {
    console.error("Error unsaving course from localStorage:", error);
    return false;
  }
}

/**
 * Toggle saved state for a course
 */
export function toggleSavedCourse(userId: string, courseSlug: string): boolean {
  const isSaved = isCourseSaved(userId, courseSlug);

  if (isSaved) {
    return unsaveCourse(userId, courseSlug);
  } else {
    return saveCourse(userId, courseSlug);
  }
}

/**
 * Clear all saved courses for a user
 */
export function clearSavedCourses(userId: string): boolean {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
    console.log("✅ All saved courses cleared for user:", userId);
    return true;
  } catch (error) {
    console.error("Error clearing saved courses:", error);
    return false;
  }
}

/**
 * Get count of saved courses
 */
export function getSavedCoursesCount(userId: string): number {
  return getSavedCourses(userId).length;
}

/**
 * Export saved courses (for future migration to database)
 */
export function exportSavedCourses(userId: string): {
  userId: string;
  courses: string[];
  exportedAt: string;
} {
  return {
    userId,
    courses: getSavedCourses(userId),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import saved courses (for future migration from database)
 */
export function importSavedCourses(userId: string, courses: string[]): boolean {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(courses));
    console.log("✅ Imported saved courses:", courses.length);
    return true;
  } catch (error) {
    console.error("Error importing saved courses:", error);
    return false;
  }
}
