/**
 * Progress Service for managing course progress and lesson completion
 * Works alongside enrollmentService.ts for complete learning management
 * 
 * Feature 02.1 Hardening: All operations now go through backend APIs
 */
import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";

// Types
export interface Enrollment {
    id: string;
    userId: string;
    courseSlug: string;
    startedAt: string;
    completedAt?: string;
    lastAccessedAt: string;
    progressPct: number;
}

export interface LessonProgress {
    id: string;
    enrollmentId: string;
    lessonId: string;
    completed: boolean;
    watchTimeSeconds: number;
    completedAt?: string;
}

export interface LocalLesson {
    id: string | number;
    completed: boolean;
}

// No direct database access - all operations via API

/**
 * Get or create an enrollment for a user in a course
 * Feature 02.1: Uses backend API
 */
export const getOrCreateEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    try {
        // Try to get existing enrollment
        let enrollment = await enrollmentApiClient.getEnrollment(courseSlug, userId);
        
        if (enrollment) {
            return enrollment as Enrollment;
        }

        // Create new enrollment via API
        const result = await enrollmentApiClient.enrollInCourse(courseSlug, 'auto', userId);
        
        if (result.success && result.enrollment) {
            return result.enrollment as Enrollment;
        }

        return null;
    } catch (err) {
        console.error("Unexpected error in getOrCreateEnrollment:", err);
        return null;
    }
};

/**
 * Get user's course progress including lesson completion
 * Feature 02.1: Uses backend API
 */
export const getUserCourseProgress = async (
    userId: string,
    courseSlug: string
): Promise<{
    enrollment: Enrollment | null;
    lessonProgress: LessonProgress[];
}> => {
    try {
        // Get enrollment from API
        const enrollment = await enrollmentApiClient.getEnrollment(courseSlug, userId);
        
        if (!enrollment) {
            return { enrollment: null, lessonProgress: [] };
        }

        // Get course access summary which includes progress info
        const accessSummary = await lessonAccessApiClient.getCourseAccessSummary(courseSlug);
        
        // Convert to LessonProgress format (simplified - backend should provide this)
        const lessonProgress: LessonProgress[] = [];
        
        return { 
            enrollment: enrollment as Enrollment, 
            lessonProgress 
        };
    } catch (err) {
        console.error("Error getting user course progress:", err);
        return { enrollment: null, lessonProgress: [] };
    }
};

/**
 * Update lesson progress for a user
 * Feature 02.1: Uses backend API
 */
export const updateLessonProgress = async (
    userId: string,
    courseSlug: string,
    lessonId: string,
    completed: boolean,
    watchTimeSeconds?: number
): Promise<boolean> => {
    try {
        const result = await lessonAccessApiClient.updateLessonProgress(
            courseSlug,
            lessonId,
            completed,
            watchTimeSeconds || 0
        );

        return result.success;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
        return false;
    }
};

/**
 * Update overall enrollment progress percentage
 * Feature 02.1: Calculated on backend, no direct update needed
 */
export const updateEnrollmentProgress = async (
    userId: string,
    courseSlug: string,
    progressPct: number
): Promise<boolean> => {
    // Backend automatically calculates progress based on lesson completions
    // This function is kept for backward compatibility but does nothing
    console.log('updateEnrollmentProgress: Progress calculated automatically on backend');
    return true;
};

/**
 * Sync local progress (from localStorage) to server
 * Feature 02.1: Uses backend API
 */
export const syncLocalProgressToServer = async (
    userId: string,
    courseSlug: string,
    localLessons: { id: string; completed: boolean }[]
): Promise<boolean> => {
    if (localLessons.length === 0) {
        return false;
    }

    try {
        // Update each completed lesson via API
        const updatePromises = localLessons
            .filter(lesson => lesson.completed)
            .map(lesson =>
                lessonAccessApiClient.updateLessonProgress(courseSlug, lesson.id, true, 0)
            );

        await Promise.all(updatePromises);

        // Backend automatically updates enrollment progress
        return true;
    } catch (err) {
        console.error("Error syncing local progress to server:", err);
        return false;
    }
};

/**
 * Get all enrollments for a user (for dashboard/profile)
 * Feature 02.1: Uses backend API (authenticated user from token)
 */
export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
    try {
        // Backend uses authenticated user from token, don't pass userId
        const enrollments = await enrollmentApiClient.getUserEnrollments();
        return enrollments as Enrollment[];
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

/**
 * Get actual progress stats by counting lesson completions (source of truth)
 * Feature 02.1: Uses backend API
 */
export const getActualProgressStats = async (
    userId: string,
    courseSlug: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    const defaultResult = { completedCount: 0, totalCount: 0, progressPct: 0 };

    try {
        // Get enrollment which has the progress_pct
        const enrollment = await enrollmentApiClient.getEnrollment(courseSlug, userId);
        
        if (!enrollment) {
            return defaultResult;
        }

        // Get course access summary to get total lesson count
        const summary = await lessonAccessApiClient.getCourseAccessSummary(courseSlug);
        
        if (!summary) {
            return defaultResult;
        }

        const totalCount = summary.summary.totalLessons;
        const progressPct = (enrollment as any).progressPct || 0;
        const completedCount = Math.round((progressPct / 100) * totalCount);

        return { completedCount, totalCount, progressPct };
    } catch (err) {
        console.error("Error getting actual progress stats:", err);
        return defaultResult;
    }
};
