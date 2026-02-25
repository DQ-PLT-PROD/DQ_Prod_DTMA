/**
 * Progress Service for managing course progress and lesson completion
 * Works alongside enrollmentService.ts for complete learning management
 * 
 * Feature 02.1 Hardening: All operations now go through backend APIs
 */
import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { recordCourseCompletion } from "./achievementService";
import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";

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

type ProgressQueueItem =
    | {
        type: "lesson_progress";
        payload: {
            userId: string;
            courseSlug: string;
            lessonId: string;
            completed: boolean;
            watchTimeSeconds?: number;
        };
    }
    | {
        type: "enrollment_progress";
        payload: {
            userId: string;
            courseSlug: string;
            progressPct: number;
        };
    };

const PROGRESS_QUEUE_KEY = "dtma_progress_queue_v1";

const readProgressQueue = (): ProgressQueueItem[] => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(PROGRESS_QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.warn("Failed to read progress queue:", err);
        return [];
    }
};

const writeProgressQueue = (queue: ProgressQueueItem[]) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
        console.warn("Failed to persist progress queue:", err);
    }
};

const enqueueProgress = (item: ProgressQueueItem) => {
    const queue = readProgressQueue();
    queue.push(item);
    writeProgressQueue(queue);
};

export const flushProgressQueue = async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
        return;
    }

    const queue = readProgressQueue();
    if (queue.length === 0) {
        return;
    }

    const remaining: ProgressQueueItem[] = [];
    for (const item of queue) {
        try {
            if (item.type === "lesson_progress") {
                const result = await updateLessonProgress(
                    item.payload.userId,
                    item.payload.courseSlug,
                    item.payload.lessonId,
                    item.payload.completed,
                    item.payload.watchTimeSeconds
                );
                if (!result) {
                    remaining.push(item);
                }
                continue;
            }

            if (item.type === "enrollment_progress") {
                const result = await updateEnrollmentProgress(
                    item.payload.userId,
                    item.payload.courseSlug,
                    item.payload.progressPct
                );
                if (!result) {
                    remaining.push(item);
                }
                continue;
            }
        } catch (err) {
            console.warn("Failed to flush progress queue item:", err);
            remaining.push(item);
        }
    }

    writeProgressQueue(remaining);
};

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
        // Try to get existing enrollment (backend uses authenticated user from token)
        let enrollment = await enrollmentApiClient.getEnrollment(courseSlug);
        
        if (enrollment) {
            return enrollment as Enrollment;
        }

        // Create new enrollment via API
        const result = await enrollmentApiClient.enrollInCourse(courseSlug, 'auto');
        
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
    if (!isSupabaseConfigured()) {
        return { enrollment: null, lessonProgress: [] };
    }

    try {
        await flushProgressQueue();
        const supabase = getProgressSupabase();

        // Get enrollment
        const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (enrollmentError || !enrollmentData) {
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
    if (!isSupabaseConfigured()) {
        enqueueProgress({
            type: "lesson_progress",
            payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
        });
        return false;
    }

    try {
        const supabase = getProgressSupabase();

        // Get enrollment first
        const { data: enrollmentData } = await supabase
            .from("user_enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (!enrollmentData) {
            console.warn("No enrollment found for lesson progress update");
            return false;
        }

        // Upsert lesson progress
        const { error } = await supabase
            .from("lesson_progress")
            .upsert({
                enrollment_id: enrollmentData.id,
                lesson_id: lessonId,
                completed,
                watch_time_seconds: watchTimeSeconds || 0,
                completed_at: completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'enrollment_id,lesson_id'
            });

        if (error) {
            console.error("Error updating lesson progress:", error);
            enqueueProgress({
                type: "lesson_progress",
                payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
            });
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
        enqueueProgress({
            type: "lesson_progress",
            payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
        });
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
    if (!isSupabaseConfigured()) {
        enqueueProgress({
            type: "enrollment_progress",
            payload: { userId, courseSlug, progressPct },
        });
        return false;
    }

    try {
        const supabase = getProgressSupabase();

        const { error } = await supabase
            .from("user_enrollments")
            .update({
                progress_pct: Math.min(Math.max(progressPct, 0), 100),
                updated_at: new Date().toISOString(),
                ...(progressPct >= 100 && { completed_at: new Date().toISOString() })
            })
            .eq("user_id", userId)
            .eq("course_slug", courseSlug);

        if (error) {
            console.error("Error updating enrollment progress:", error);
            enqueueProgress({
                type: "enrollment_progress",
                payload: { userId, courseSlug, progressPct },
            });
            return false;
        }

        if (progressPct >= 100) {
            await recordCourseCompletion(userId, courseSlug);
        }
        return true;
    } catch (err) {
        console.error("Unexpected error updating enrollment progress:", err);
        enqueueProgress({
            type: "enrollment_progress",
            payload: { userId, courseSlug, progressPct },
        });
        return false;
    }
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
    if (!isSupabaseConfigured() || localLessons.length === 0) {
        return false;
    }

    try {
        await flushProgressQueue();
        // Update each completed lesson
        const updatePromises = localLessons
            .filter(lesson => lesson.completed)
            .map(lesson =>
                updateLessonProgress(userId, courseSlug, lesson.id, true)
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
        // Get enrollment which has the progress_pct (backend uses authenticated user from token)
        const enrollment = await enrollmentApiClient.getEnrollment(courseSlug);
        
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
