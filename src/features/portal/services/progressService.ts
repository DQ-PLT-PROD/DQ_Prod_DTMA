/**
 * Progress Service for managing course progress and lesson completion.
 * Stage02A learner-state reads and writes go through authenticated backend APIs.
 */
import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";
import { learningApiClient } from "../../../lib/api/learningApiClient";

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

const mapSnapshotEnrollment = (row: any): Enrollment => ({
    id: row.id,
    userId: row.user_id ?? row.userId,
    courseSlug: row.course_slug ?? row.courseSlug,
    startedAt: row.started_at ?? row.startedAt,
    completedAt: row.completed_at ?? row.completedAt ?? undefined,
    lastAccessedAt: row.last_accessed_at ?? row.lastAccessedAt,
    progressPct: Number(row.progress_pct ?? row.progressPct) || 0,
});

const mapSnapshotLessonProgress = (row: any): LessonProgress => ({
    id: row.id,
    enrollmentId: row.enrollment_id ?? row.enrollmentId,
    lessonId: row.lesson_id ?? row.lessonId,
    completed: Boolean(row.completed),
    watchTimeSeconds: Number(row.watch_time_seconds ?? row.watchTimeSeconds) || 0,
    completedAt: row.completed_at ?? row.completedAt ?? undefined,
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

const performLessonProgressUpdate = async (
    userId: string,
    courseSlug: string,
    lessonId: string,
    completed: boolean,
    watchTimeSeconds?: number,
    queueOnFailure: boolean = true
): Promise<boolean> => {
    try {
        const result = await lessonAccessApiClient.updateLessonProgress(
            courseSlug,
            lessonId,
            completed,
            watchTimeSeconds || 0
        );

        if (!result.success) {
            if (queueOnFailure) {
                enqueueProgress({
                    type: "lesson_progress",
                    payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
                });
            }
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating lesson progress:", err);
        if (queueOnFailure) {
            enqueueProgress({
                type: "lesson_progress",
                payload: { userId, courseSlug, lessonId, completed, watchTimeSeconds },
            });
        }
        return false;
    }
};

const performEnrollmentProgressUpdate = async (
    userId: string,
    courseSlug: string,
    progressPct: number,
    queueOnFailure: boolean = true
): Promise<boolean> => {
    const boundedProgress = Math.min(Math.max(progressPct, 0), 100);

    if (boundedProgress < 100) {
        return true;
    }

    try {
        const result = await learningApiClient.recordCourseCompletion(courseSlug);

        if (!result.success) {
            if (queueOnFailure) {
                enqueueProgress({
                    type: "enrollment_progress",
                    payload: { userId, courseSlug, progressPct: boundedProgress },
                });
            }
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error updating enrollment progress:", err);
        if (queueOnFailure) {
            enqueueProgress({
                type: "enrollment_progress",
                payload: { userId, courseSlug, progressPct: boundedProgress },
            });
        }
        return false;
    }
};

export const flushProgressQueue = async (): Promise<void> => {
    const queue = readProgressQueue();
    if (queue.length === 0) {
        return;
    }

    const remaining: ProgressQueueItem[] = [];
    for (const item of queue) {
        try {
            if (item.type === "lesson_progress") {
                const result = await performLessonProgressUpdate(
                    item.payload.userId,
                    item.payload.courseSlug,
                    item.payload.lessonId,
                    item.payload.completed,
                    item.payload.watchTimeSeconds,
                    false
                );
                if (!result) {
                    remaining.push(item);
                }
                continue;
            }

            if (item.type === "enrollment_progress") {
                const result = await performEnrollmentProgressUpdate(
                    item.payload.userId,
                    item.payload.courseSlug,
                    item.payload.progressPct,
                    false
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

export const getOrCreateEnrollment = async (
    _userId: string,
    courseSlug: string
): Promise<Enrollment | null> => {
    try {
        let enrollment = await enrollmentApiClient.getEnrollment(courseSlug);

        if (enrollment) {
            return enrollment as Enrollment;
        }

        const result = await enrollmentApiClient.enrollInCourse(courseSlug, "auto");

        if (result.success && result.enrollment) {
            return result.enrollment as Enrollment;
        }

        return null;
    } catch (err) {
        console.error("Unexpected error in getOrCreateEnrollment:", err);
        return null;
    }
};

export const getUserCourseProgress = async (
    _userId: string,
    courseSlug: string
): Promise<{
    enrollment: Enrollment | null;
    lessonProgress: LessonProgress[];
}> => {
    try {
        await flushProgressQueue();
        const snapshot = await learningApiClient.getSnapshot(courseSlug);

        if (!snapshot) {
            return { enrollment: null, lessonProgress: [] };
        }

        return {
            enrollment: snapshot.enrollment ? mapSnapshotEnrollment(snapshot.enrollment) : null,
            lessonProgress: Array.isArray(snapshot.progress)
                ? snapshot.progress.map(mapSnapshotLessonProgress)
                : [],
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
): Promise<boolean> =>
    performLessonProgressUpdate(
        userId,
        courseSlug,
        lessonId,
        completed,
        watchTimeSeconds,
        true
    );

export const updateEnrollmentProgress = async (
    userId: string,
    courseSlug: string,
    progressPct: number
): Promise<boolean> =>
    performEnrollmentProgressUpdate(userId, courseSlug, progressPct, true);

export const syncLocalProgressToServer = async (
    userId: string,
    courseSlug: string,
    localLessons: { id: string; completed: boolean }[]
): Promise<boolean> => {
    if (localLessons.length === 0) {
        return false;
    }

    try {
        await flushProgressQueue();
        const updatePromises = localLessons
            .filter((lesson) => lesson.completed)
            .map((lesson) =>
                updateLessonProgress(userId, courseSlug, lesson.id, true)
            );

        await Promise.all(updatePromises);
        return true;
    } catch (err) {
        console.error("Error syncing local progress to server:", err);
        return false;
    }
};

export const getUserEnrollments = async (_userId: string): Promise<Enrollment[]> => {
    try {
        const enrollments = await enrollmentApiClient.getUserEnrollments();
        return enrollments as Enrollment[];
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

export const getActualProgressStats = async (
    _userId: string,
    courseSlug: string
): Promise<{ completedCount: number; totalCount: number; progressPct: number }> => {
    const defaultResult = { completedCount: 0, totalCount: 0, progressPct: 0 };

    try {
        const snapshot = await learningApiClient.getSnapshot(courseSlug);

        if (!snapshot) {
            return defaultResult;
        }

        const totalCount = Array.isArray(snapshot.lessons) ? snapshot.lessons.length : 0;
        const completedCount = Array.isArray(snapshot.progress)
            ? snapshot.progress.filter((row: any) => row.completed).length
            : 0;
        const progressPct = snapshot.enrollment
            ? Number(snapshot.enrollment.progress_pct ?? snapshot.enrollment.progressPct) || 0
            : (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

        return { completedCount, totalCount, progressPct };
    } catch (err) {
        console.error("Error getting actual progress stats:", err);
        return defaultResult;
    }
};
