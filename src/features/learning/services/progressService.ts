/**
 * Progress Service for managing course enrollment and lesson progress
 * Syncs learning progress between client and Supabase database
 * 
 * NOTE: This service uses tables (user_enrollments, lesson_progress) that are
 * created by migration 027_add_progress_tracking_tables.sql. Until that migration
 * is run and Supabase types are regenerated, TypeScript will show errors for
 * unknown table names. These are safe to ignore.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase/client";

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
 * Helper to get Supabase client for progress tables.
 * Uses 'any' type because user_enrollments and lesson_progress tables
 * are created by migration 027 and may not be in generated types yet.
 */
const getProgressSupabase = (): any => {
    return getSupabase();
};

/**
 * Get or create an enrollment for a user in a course
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
 * Get enrollment by user ID and course slug
 */
export const getEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const supabase = getProgressSupabase();
        const { data, error } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (error || !data) {
            return null;
        }

        return mapRowToEnrollment(data);
    } catch (err) {
        console.error("Error fetching enrollment:", err);
        return null;
    }
};

/**
 * Update lesson progress (upsert)
 */
export const updateLessonProgress = async (
    enrollmentId: string,
    lessonId: string,
    completed: boolean,
    watchTimeSeconds?: number
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot update lesson progress");
        return false;
    }

    try {
        const supabase = getProgressSupabase();

        const updateData: any = {
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            completed,
            updated_at: new Date().toISOString(),
        };

        if (completed) {
            updateData.completed_at = new Date().toISOString();
        }

        if (watchTimeSeconds !== undefined) {
            updateData.watch_time_seconds = watchTimeSeconds;
        }

        const { error } = await supabase
            .from("lesson_progress")
            .upsert(updateData, {
                onConflict: "enrollment_id,lesson_id",
            });

        if (error) {
            console.error("Error updating lesson progress:", error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
        return false;
    }
};

/**
 * Get all lesson progress for an enrollment
 */
export const getLessonProgressByEnrollment = async (
    enrollmentId: string
): Promise<LessonProgress[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    try {
        const supabase = getProgressSupabase();
        const { data, error } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("enrollment_id", enrollmentId);

        if (error) {
            console.error("Error fetching lesson progress:", error.message);
            return [];
        }

        return (data || []).map(mapRowToLessonProgress);
    } catch (err) {
        console.error("Unexpected error fetching lesson progress:", err);
        return [];
    }
};

/**
 * Get user's progress for a specific course (combines enrollment and lessons)
 */
export const getUserCourseProgress = async (
    userId: string,
    courseSlug: string
): Promise<{ enrollment: Enrollment | null; lessons: LessonProgress[] }> => {
    const enrollment = await getEnrollment(userId, courseSlug);

    if (!enrollment) {
        return { enrollment: null, lessons: [] };
    }

    const lessons = await getLessonProgressByEnrollment(enrollment.id);
    return { enrollment, lessons };
};

/**
 * Update enrollment progress percentage
 */
export const updateEnrollmentProgress = async (
    enrollmentId: string,
    progressPct: number,
    completed: boolean = false
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return false;
    }

    try {
        const supabase = getProgressSupabase();

        const updateData: any = {
            progress_pct: Math.min(100, Math.max(0, progressPct)),
            last_accessed_at: new Date().toISOString(),
        };

        if (completed) {
            updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from("user_enrollments")
            .update(updateData)
            .eq("id", enrollmentId);

        if (error) {
            console.error("Error updating enrollment progress:", error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating enrollment:", err);
        return false;
    }
};

/**
 * Sync localStorage progress to server for authenticated user
 * Called when user logs in to merge any anonymous progress
 */
export const syncLocalProgressToServer = async (
    userId: string,
    courseSlug: string,
    localLessons: LocalLesson[]
): Promise<boolean> => {
    if (!isSupabaseConfigured() || !localLessons.length) {
        return false;
    }

    try {
        // Get or create enrollment
        const enrollment = await getOrCreateEnrollment(userId, courseSlug);
        if (!enrollment) {
            return false;
        }

        // Get existing server progress
        const serverProgress = await getLessonProgressByEnrollment(enrollment.id);
        const serverCompletedIds = new Set(
            serverProgress.filter(lp => lp.completed).map(lp => lp.lessonId)
        );

        // Find lessons completed locally but not on server
        const toSync = localLessons.filter(
            l => l.completed && !serverCompletedIds.has(String(l.id))
        );

        // Sync each missing completion
        for (const lesson of toSync) {
            await updateLessonProgress(enrollment.id, String(lesson.id), true);
        }

        // Update overall progress
        const totalLessons = localLessons.length;
        const completedCount = localLessons.filter(l => l.completed).length;
        const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

        await updateEnrollmentProgress(
            enrollment.id,
            progressPct,
            completedCount === totalLessons
        );

        return true;
    } catch (err) {
        console.error("Error syncing local progress to server:", err);
        return false;
    }
};

/**
 * Get all enrollments for a user (for dashboard)
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
            .order("last_accessed_at", { ascending: false });

        if (error) {
            console.error("Error fetching user enrollments:", error.message);
            return [];
        }

        return (data || []).map(mapRowToEnrollment);
    } catch (err) {
        console.error("Unexpected error fetching enrollments:", err);
        return [];
    }
};
