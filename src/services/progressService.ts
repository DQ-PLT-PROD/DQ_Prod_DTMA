/**
 * Progress Service for managing course progress and lesson completion
 * Works alongside enrollmentService.ts for complete learning management
 * 
 * Uses service role for database operations to work with Azure AD authentication
 */
import { getSupabaseForEnrollment } from "../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../lib/supabase/client";

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
 * Helper to get Supabase client for progress tables
 */
const getProgressSupabase = (): any => {
    return getSupabaseForEnrollment();
};
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
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
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
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating enrollment progress:", err);
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
