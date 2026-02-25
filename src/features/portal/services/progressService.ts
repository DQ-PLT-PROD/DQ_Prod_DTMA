/**
 * Progress Service for managing course progress and lesson completion.
 *
 * Progress source of truth:
 * - Completion events are persisted server-side via lesson access APIs.
 * - Progress percentages are computed server-side from persisted completion records.
 */
import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";

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

type ProgressQueueItem = {
    userId: string;
    courseSlug: string;
    lessonId: string;
    completed: boolean;
    watchTimeSeconds?: number;
};

const PROGRESS_QUEUE_KEY = "dtma_progress_queue_v2";

const getProgressSupabase = () => getSupabaseForEnrollment();

const mapEnrollmentFromApi = (row: any): Enrollment => ({
    id: row?.id,
    userId: row?.userId ?? row?.user_id ?? "",
    courseSlug: row?.courseSlug ?? row?.course_slug ?? "",
    startedAt: row?.startedAt ?? row?.started_at ?? new Date().toISOString(),
    completedAt: row?.completedAt ?? row?.completed_at ?? undefined,
    lastAccessedAt:
        row?.lastAccessedAt ?? row?.last_accessed_at ?? row?.startedAt ?? row?.started_at ?? new Date().toISOString(),
    progressPct: Number(row?.progressPct ?? row?.progress_pct ?? 0) || 0,
});

const mapLessonProgressRow = (row: any): LessonProgress => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    lessonId: row.lesson_id,
    completed: Boolean(row.completed),
    watchTimeSeconds: Number(row.watch_time_seconds ?? 0) || 0,
    completedAt: row.completed_at || undefined,
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
            const result = await updateLessonProgress(
                item.userId,
                item.courseSlug,
                item.lessonId,
                item.completed,
                item.watchTimeSeconds
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

export const getOrCreateEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    try {
        const existing = await enrollmentApiClient.getEnrollment(courseSlug);
        if (existing) {
            return mapEnrollmentFromApi(existing);
        }

        const result = await enrollmentApiClient.enrollInCourse(courseSlug, "auto");
        if (result.success && result.enrollment) {
            return mapEnrollmentFromApi(result.enrollment);
        }

        return null;
    } catch (err) {
        console.error("Unexpected error in getOrCreateEnrollment:", err);
        return null;
    }
};

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

        const enrollmentApi = await enrollmentApiClient.getEnrollment(courseSlug);
        if (!enrollmentApi?.id) {
            return { enrollment: null, lessonProgress: [] };
        }

        const enrollment = mapEnrollmentFromApi(enrollmentApi);
        const supabase = getProgressSupabase();
        const { data: lessonProgressRows, error: lessonProgressError } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("enrollment_id", enrollment.id);

        if (lessonProgressError || !Array.isArray(lessonProgressRows)) {
            if (lessonProgressError) {
                console.warn("Error fetching lesson progress:", lessonProgressError);
            }
            return { enrollment, lessonProgress: [] };
        }

        return {
            enrollment,
            lessonProgress: lessonProgressRows.map(mapLessonProgressRow),
        };
    } catch (err) {
        console.error("Error getting user course progress:", err);
        return { enrollment: null, lessonProgress: [] };
    }
};

export const updateLessonProgress = async (
    userId: string,
    courseSlug: string,
    lessonId: string,
    completed: boolean,
    watchTimeSeconds?: number
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        enqueueProgress({
            userId,
            courseSlug,
            lessonId,
            completed,
            watchTimeSeconds,
        });
        return false;
    }

    try {
        const result = await lessonAccessApiClient.updateLessonProgress(
            courseSlug,
            lessonId,
            completed,
            watchTimeSeconds || 0
        );

        if (!result.success) {
            enqueueProgress({
                userId,
                courseSlug,
                lessonId,
                completed,
                watchTimeSeconds,
            });
        }

        return result.success;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
        enqueueProgress({
            userId,
            courseSlug,
            lessonId,
            completed,
            watchTimeSeconds,
        });
        return false;
    }
};

/**
 * Deprecated: progress percentage is server-computed from persisted completion records.
 */
export const updateEnrollmentProgress = async (
    userId: string,
    courseSlug: string,
    progressPct: number
): Promise<boolean> => {
    void userId;
    void courseSlug;
    void progressPct;
    return true;
};

/**
 * Deprecated for anti-cheat hardening:
 * we do not trust local completion arrays as authoritative progress.
 */
export const syncLocalProgressToServer = async (
    userId: string,
    courseSlug: string,
    localLessons: { id: string; completed: boolean }[]
): Promise<boolean> => {
    void userId;
    void courseSlug;
    void localLessons;
    return false;
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
    void userId;
    try {
        const enrollments = await enrollmentApiClient.getUserEnrollments();
        return (enrollments || []).map(mapEnrollmentFromApi);
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

export const getActualProgressStats = async (
    userId: string,
    courseSlug: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    void userId;
    const defaultResult = { completedCount: 0, totalCount: 0, progressPct: 0 };

    try {
        const summary = await lessonAccessApiClient.getCourseAccessSummary(courseSlug);
        if (!summary) {
            return defaultResult;
        }

        const completedCount = Number(summary.summary.completedTrackableItems ?? 0) || 0;
        const totalCount = Number(summary.summary.trackableItemCount ?? 0) || 0;
        const progressPct =
            Number(summary.summary.progressPercent ?? 0) ||
            (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

        return { completedCount, totalCount, progressPct };
    } catch (err) {
        console.error("Error getting actual progress stats:", err);
        return defaultResult;
    }
};
