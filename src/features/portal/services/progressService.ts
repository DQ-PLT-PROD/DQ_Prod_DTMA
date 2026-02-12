/**
 * Progress Service for managing course progress and lesson completion
 * Works alongside enrollmentService.ts for complete learning management
 * 
 * Uses service role for database operations to work with Azure AD authentication
 */
import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { recordCourseCompletion } from "./achievementService";

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

// Helper to map database row to Enrollment type
const mapRowToEnrollment = (row: any): Enrollment => ({
    id: row.id,
    userId: row.user_id,
    courseSlug: row.course_slug,
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    lastAccessedAt: row.last_accessed_at,
    progressPct: parseFloat(row.progress_pct) || 0,
});

// Helper to map database row to LessonProgress type
const mapRowToLessonProgress = (row: any): LessonProgress => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    watchTimeSeconds: row.watch_time_seconds || 0,
    completedAt: row.completed_at || undefined,
});

/**
 * Helper to get Supabase client for progress tables
 */
const getProgressSupabase = (): any => {
    return getSupabaseForEnrollment();
};

/**
 * Get or create an enrollment for a user in a course
 * This is for backward compatibility - new code should use enrollmentService
 */
export const getOrCreateEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot create enrollment");
        return null;
    }

    try {
        const supabase = getProgressSupabase();

        // Try to get existing enrollment
        const { data: existing, error: fetchError } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (existing && !fetchError) {
            // Update last accessed timestamp
            await supabase
                .from("user_enrollments")
                .update({ last_accessed_at: new Date().toISOString() })
                .eq("id", existing.id);

            return mapRowToEnrollment(existing);
        }

        // Create new enrollment
        const { data: created, error: createError } = await supabase
            .from("user_enrollments")
            .insert({
                user_id: userId,
                course_slug: courseSlug,
                started_at: new Date().toISOString(),
                last_accessed_at: new Date().toISOString(),
                progress_pct: 0,
                status: 'active',
                enrollment_method: 'auto'
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating enrollment:", createError.message);
            return null;
        }

        return created ? mapRowToEnrollment(created) : null;
    } catch (err) {
        console.error("Unexpected error in getOrCreateEnrollment:", err);
        return null;
    }
};

/**
 * Get user's course progress including lesson completion
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

        const enrollment = mapRowToEnrollment(enrollmentData);

        // Get lesson progress
        const { data: progressData, error: progressError } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("enrollment_id", enrollment.id);

        const lessonProgress = progressError || !progressData
            ? []
            : progressData.map(mapRowToLessonProgress);

        return { enrollment, lessonProgress };
    } catch (err) {
        console.error("Error getting user course progress:", err);
        return { enrollment: null, lessonProgress: [] };
    }
};

/**
 * Update lesson progress for a user
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

        // Calculate and update overall progress
        const completedCount = localLessons.filter(l => l.completed).length;
        const progressPct = Math.round((completedCount / localLessons.length) * 100);

        await updateEnrollmentProgress(userId, courseSlug, progressPct);

        return true;
    } catch (err) {
        console.error("Error syncing local progress to server:", err);
        return false;
    }
};

/**
 * Get all enrollments for a user (for dashboard/profile)
 */
export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    try {
        const supabase = getProgressSupabase();
        const { data, error } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("last_accessed_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map(mapRowToEnrollment);
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

/**
 * Get actual progress stats by counting lesson completions (source of truth)
 * This should be used for display instead of user_enrollments.progress_pct
 */
export const getActualProgressStats = async (
    userId: string,
    courseSlug: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    const defaultResult = { completedCount: 0, totalCount: 0, progressPct: 0 };

    if (!isSupabaseConfigured()) {
        return defaultResult;
    }

    try {
        const supabase = getProgressSupabase();

        // Get enrollment to find enrollment_id
        const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("user_enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (enrollmentError || !enrollmentData) {
            return defaultResult;
        }

        // Get completed lessons count from lesson_progress
        const { count: completedCount, error: progressError } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("enrollment_id", enrollmentData.id)
            .eq("completed", true);

        // Get total lessons count from lessons table
        const { count: totalCount, error: lessonsError } = await supabase
            .from("lessons")
            .select("*", { count: "exact", head: true })
            .eq("course_slug", courseSlug);

        if (progressError || lessonsError) {
            console.error("Error fetching progress stats:", progressError || lessonsError);
            return defaultResult;
        }

        const completed = completedCount ?? 0;
        const total = totalCount ?? 0;
        const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completedCount: completed, totalCount: total, progressPct };
    } catch (err) {
        console.error("Error getting actual progress stats:", err);
        return defaultResult;
    }
};
