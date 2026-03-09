import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { Course, Lesson as DbLesson } from "../../../types/dtma-lms";
import { fetchCourseWithContent, CourseResource } from "../../courses/services/courseService";
import { getUserCourseProgress, type Enrollment, type LessonProgress } from "../../portal/services/progressService";

export interface LearningSnapshot {
    course: Course | null;
    lessons: DbLesson[];
    resources: CourseResource[];
    enrollment: Enrollment | null;
    lessonProgress: LessonProgress[];
    resumeLessonId?: string;
}

interface SnapshotCacheEntry {
    data: LearningSnapshot;
    fetchedAt: number;
}

const CACHE_TTL_MS = 2 * 60 * 1000;
const snapshotCache = new Map<string, SnapshotCacheEntry>();

const buildCacheKey = (courseSlug: string, userId?: string | null) =>
    `${courseSlug}::${userId || "anon"}`;

const emptySnapshot = (): LearningSnapshot => ({
    course: null,
    lessons: [],
    resources: [],
    enrollment: null,
    lessonProgress: [],
    resumeLessonId: undefined,
});

const getResumeLessonId = (
    lessons: DbLesson[],
    lessonProgress: LessonProgress[]
): string | undefined => {
    if (lessons.length === 0) {
        return undefined;
    }

    const completedLessonIds = new Set(
        lessonProgress.filter((item) => item.completed).map((item) => item.lessonId)
    );

    const orderedLessons = [...lessons].sort(
        (left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0)
    );

    return (
        orderedLessons.find((lesson) => !completedLessonIds.has(String(lesson.id)))?.id ||
        orderedLessons[orderedLessons.length - 1]?.id
    )?.toString();
};

export const invalidateLearningSnapshot = (courseSlug: string, userId?: string | null) => {
    snapshotCache.delete(buildCacheKey(courseSlug, userId));
};

export const getLearningSnapshot = async (
    courseSlug: string,
    userId?: string | null,
    options?: { useCache?: boolean; maxAgeMs?: number }
): Promise<LearningSnapshot> => {
    if (!isSupabaseConfigured()) {
        return emptySnapshot();
    }

    const cacheKey = buildCacheKey(courseSlug, userId);
    const maxAgeMs = options?.maxAgeMs ?? CACHE_TTL_MS;
    const useCache = options?.useCache !== false;

    if (useCache) {
        const cached = snapshotCache.get(cacheKey);
        if (cached && Date.now() - cached.fetchedAt < maxAgeMs) {
            return cached.data;
        }
    }

    try {
        const [{ course, lessons, resources }, progress] = await Promise.all([
            fetchCourseWithContent(courseSlug),
            userId ? getUserCourseProgress(userId, courseSlug) : Promise.resolve({ enrollment: null, lessonProgress: [] }),
        ]);

        const snapshot: LearningSnapshot = {
            course,
            lessons,
            resources,
            enrollment: progress.enrollment,
            lessonProgress: progress.lessonProgress,
            resumeLessonId: getResumeLessonId(lessons, progress.lessonProgress),
        };

        snapshotCache.set(cacheKey, { data: snapshot, fetchedAt: Date.now() });
        return snapshot;
    } catch (err) {
        console.warn("Unexpected error fetching learning snapshot:", err);
        return emptySnapshot();
    }
};
