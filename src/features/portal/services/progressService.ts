import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseForEnrollment } from "@/lib/supabase/serviceClient";
import { enrollInCourse, getEnrollment as getModuleEnrollment, getUserEnrollments as getModuleEnrollments } from "@/lib/enrollment";
import { recordCourseCompletion } from "./achievementService";

type ModuleRow = {
    id: string;
    slug: string;
};

type EnrollmentRow = {
    id: string;
    user_id: string;
    module_id: string;
    started_at: string;
    completed_at: string | null;
    last_accessed_at: string;
    progress_pct: number | string | null;
    status: "active" | "cancelled" | "expired";
    enrollment_method: "explicit" | "auto" | "admin";
};

type LessonProgressRow = {
    id: string;
    enrollment_id: string;
    lesson_id: string;
    completed: boolean;
    watch_time_seconds: number | null;
    completed_at: string | null;
};

// Types
export interface Enrollment {
    id: string;
    userId: string;
    moduleId?: string;
    courseSlug: string;
    startedAt: string;
    completedAt?: string;
    lastAccessedAt: string;
    progressPct: number;
    status?: "active" | "cancelled" | "expired";
    enrollmentMethod?: "explicit" | "auto" | "admin";
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
const getProgressSupabase = getSupabaseForEnrollment;

const mapEnrollmentRow = (row: EnrollmentRow, moduleSlug: string): Enrollment => ({
    id: row.id,
    userId: row.user_id,
    moduleId: row.module_id,
    courseSlug: moduleSlug,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    lastAccessedAt: row.last_accessed_at,
    progressPct: Number(row.progress_pct ?? 0),
    status: row.status,
    enrollmentMethod: row.enrollment_method,
});

const mapLessonProgressRow = (row: LessonProgressRow): LessonProgress => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    watchTimeSeconds: Number(row.watch_time_seconds ?? 0),
    completedAt: row.completed_at ?? undefined,
});

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

const resolveModuleBySlug = async (moduleSlug: string): Promise<ModuleRow | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getProgressSupabase();
    const { data, error } = await supabase
        .from("modules")
        .select("id, slug")
        .eq("slug", moduleSlug)
        .eq("status", "published")
        .single();

    if (error) {
        if ((error as any).code === "PGRST116") {
            return null;
        }
        console.error("Error resolving module slug:", error);
        return null;
    }

    return ((data as unknown) as ModuleRow | null) ?? null;
};

const getEnrollmentRow = async (
    userId: string,
    moduleId: string
): Promise<EnrollmentRow | null> => {
    const supabase = getProgressSupabase();
    const { data, error } = await (supabase.from("module_enrollments" as any) as any)
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .single();

    if (error) {
        if ((error as any).code === "PGRST116") {
            return null;
        }
        console.error("Error fetching module enrollment row:", error);
        return null;
    }

    return (data as EnrollmentRow | null) ?? null;
};

const getModuleLessonIds = async (moduleId: string): Promise<string[]> => {
    const supabase = getProgressSupabase();
    const { data, error } = await supabase
        .from("lessons")
        .select("id")
        .eq("module_id", moduleId);

    if (error) {
        console.error("Error fetching module lesson ids:", error);
        return [];
    }

    return (data || []).map((row: any) => row.id).filter(Boolean);
};

const recalculateEnrollmentProgress = async (
    enrollmentId: string,
    moduleId: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    const lessonIds = await getModuleLessonIds(moduleId);
    const totalCount = lessonIds.length;

    if (totalCount === 0) {
        return { completedCount: 0, totalCount: 0, progressPct: 0 };
    }

    const supabase = getProgressSupabase();
    const { data, error } = await (supabase.from("module_lesson_progress" as any) as any)
        .select("lesson_id")
        .eq("enrollment_id", enrollmentId)
        .eq("completed", true)
        .in("lesson_id", lessonIds);

    if (error) {
        console.error("Error recalculating module progress:", error);
        return { completedCount: 0, totalCount, progressPct: 0 };
    }

    const completedIds = new Set((data || []).map((row: any) => row.lesson_id));
    const completedCount = lessonIds.filter((lessonId) => completedIds.has(lessonId)).length;
    const progressPct = Math.round((completedCount / totalCount) * 100);

    return { completedCount, totalCount, progressPct };
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

            const result = await updateEnrollmentProgress(
                item.payload.userId,
                item.payload.courseSlug,
                item.payload.progressPct
            );

            if (!result) {
                remaining.push(item);
            }
        } catch (err) {
            console.warn("Failed to flush progress queue item:", err);
            remaining.push(item);
        }
    }

    writeProgressQueue(remaining);
};

/**
 * Get or create an enrollment for a user in a module.
 */
export const getOrCreateEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    try {
        let enrollment = await getModuleEnrollment(userId, courseSlug);
        if (!enrollment) {
            const result = await enrollInCourse(userId, courseSlug, "auto");
            enrollment = result.enrollment ?? null;
        }

        if (!enrollment) {
            return null;
        }

        return {
            id: enrollment.id,
            userId: enrollment.userId,
            moduleId: enrollment.moduleId,
            courseSlug: enrollment.courseSlug,
            startedAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt ?? undefined,
            lastAccessedAt: enrollment.lastAccessedAt || enrollment.enrolledAt,
            progressPct: Number(enrollment.progressPct ?? 0),
            status: enrollment.status,
            enrollmentMethod: enrollment.enrollmentMethod,
        };
    } catch (err) {
        console.error("Unexpected error in getOrCreateEnrollment:", err);
        return null;
    }
};

/**
 * Get user's module progress including lesson completion.
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
        const module = await resolveModuleBySlug(courseSlug);
        if (!module) {
            return { enrollment: null, lessonProgress: [] };
        }

        const enrollmentRow = await getEnrollmentRow(userId, module.id);
        if (!enrollmentRow) {
            return { enrollment: null, lessonProgress: [] };
        }

        const supabase = getProgressSupabase();
        const { data: lessonProgressRows, error } = await (supabase.from("module_lesson_progress" as any) as any)
            .select("*")
            .eq("enrollment_id", enrollmentRow.id);

        if (error) {
            console.error("Error loading lesson progress:", error);
            return {
                enrollment: mapEnrollmentRow(enrollmentRow, module.slug),
                lessonProgress: [],
            };
        }

        return {
            enrollment: mapEnrollmentRow(enrollmentRow, module.slug),
            lessonProgress: ((lessonProgressRows || []) as LessonProgressRow[]).map(mapLessonProgressRow),
        };
    } catch (err) {
        console.error("Error getting user course progress:", err);
        return { enrollment: null, lessonProgress: [] };
    }
};

/**
 * Update lesson progress for a user.
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
        const enrollment = await getOrCreateEnrollment(userId, courseSlug);
        if (!enrollment?.moduleId) {
            return false;
        }

        const supabase = getProgressSupabase();
        const now = new Date().toISOString();
        const { error } = await (supabase.from("module_lesson_progress" as any) as any)
            .upsert({
                enrollment_id: enrollment.id,
                lesson_id: lessonId,
                completed,
                watch_time_seconds: watchTimeSeconds || 0,
                completed_at: completed ? now : null,
                updated_at: now,
            }, {
                onConflict: "enrollment_id,lesson_id",
            });

        if (error) {
            console.error("Error updating lesson progress:", error);
            enqueueProgress({
                type: "lesson_progress",
                payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
            });
            return false;
        }

        const stats = await recalculateEnrollmentProgress(enrollment.id, enrollment.moduleId);
        const { error: enrollmentError } = await (supabase.from("module_enrollments" as any) as any)
            .update({
                progress_pct: stats.progressPct,
                last_accessed_at: now,
                completed_at: stats.progressPct >= 100 ? now : null,
                updated_at: now,
            })
            .eq("id", enrollment.id);

        if (enrollmentError) {
            console.error("Error syncing enrollment progress after lesson update:", enrollmentError);
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
 * Update overall enrollment progress percentage.
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
        const enrollment = await getOrCreateEnrollment(userId, courseSlug);
        if (!enrollment) {
            return false;
        }

        const supabase = getProgressSupabase();
        const now = new Date().toISOString();
        const boundedProgress = Math.min(Math.max(progressPct, 0), 100);
        const { error } = await (supabase.from("module_enrollments" as any) as any)
            .update({
                progress_pct: boundedProgress,
                last_accessed_at: now,
                completed_at: boundedProgress >= 100 ? now : null,
                updated_at: now,
            })
            .eq("id", enrollment.id);

        if (error) {
            console.error("Error updating enrollment progress:", error);
            enqueueProgress({
                type: "enrollment_progress",
                payload: { userId, courseSlug, progressPct },
            });
            return false;
        }

        if (boundedProgress >= 100) {
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
 * Sync local progress (from localStorage) to server.
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
        await Promise.all(
            localLessons
                .filter((lesson) => lesson.completed)
                .map((lesson) => updateLessonProgress(userId, courseSlug, lesson.id, true))
        );
        return true;
    } catch (err) {
        console.error("Error syncing local progress to server:", err);
        return false;
    }
};

/**
 * Get all active module enrollments for a user.
 */
export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
    try {
        const enrollments = await getModuleEnrollments(userId);
        return enrollments.map((enrollment) => ({
            id: enrollment.id,
            userId: enrollment.userId,
            moduleId: enrollment.moduleId,
            courseSlug: enrollment.courseSlug,
            startedAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt ?? undefined,
            lastAccessedAt: enrollment.lastAccessedAt || enrollment.enrolledAt,
            progressPct: Number(enrollment.progressPct ?? 0),
            status: enrollment.status,
            enrollmentMethod: enrollment.enrollmentMethod,
        }));
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

/**
 * Get actual progress stats by counting module lesson completions.
 */
export const getActualProgressStats = async (
    userId: string,
    courseSlug: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    const defaultResult = { completedCount: 0, totalCount: 0, progressPct: 0 };

    try {
        const module = await resolveModuleBySlug(courseSlug);
        if (!module) {
            return defaultResult;
        }

        const enrollment = await getEnrollmentRow(userId, module.id);
        if (!enrollment) {
            return defaultResult;
        }

        return await recalculateEnrollmentProgress(enrollment.id, module.id);
    } catch (err) {
        console.error("Error getting actual progress stats:", err);
        return defaultResult;
    }
};
