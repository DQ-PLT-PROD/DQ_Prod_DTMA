import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { Course, Lesson as DbLesson, LessonType } from "../../../types/dtma-lms";
import { CourseResource } from "../../courses/services/courseService";
import type { Enrollment, LessonProgress } from "./progressService";

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

const mapRowToCourse = (row: any): Course => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description || "",
    longDescription: row.long_description || "",
    categoryId: row.category_id || "",
    audienceLevel: row.audience_level as any,
    topicTags: row.topic_tags || [],
    levelTag: row.level_tag || "",
    estimatedDurationMinutes: row.estimated_duration_minutes || 0,
    lessonCount: row.lesson_count || 0,
    heroImageUrl: row.hero_image_url || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    introVideoUrl: row.intro_video_url || undefined,
    introVideoPosterUrl: row.intro_video_poster_url || undefined,
    isFeatured: row.is_featured || false,
    isComingSoon: row.is_coming_soon || false,
    status: row.status as any,
    rating: row.rating || undefined,
    reviewCount: row.review_count || undefined,
    enrollmentUrl: row.enrollment_url || undefined,
    learningOutcomes: row.learning_outcomes || [],
    skillsGained: row.skills_gained || [],
    uponCompletion: row.upon_completion || undefined,
    startDate: row.start_date || undefined,
    industry: row.industry || undefined,
});

const mapRowToLesson = (row: any): DbLesson => ({
    id: row.id,
    courseId: row.course_slug,
    title: row.title,
    type: row.type as LessonType,
    orderIndex: row.order_index,
    estimatedDurationMinutes: row.estimated_duration_minutes || 0,
    videoUrl: row.video_url || undefined,
    resourceUrl: row.resource_url || undefined,
    content: row.content || undefined,
});

const mapRowToResource = (row: any): CourseResource => ({
    id: row.id,
    courseSlug: row.course_slug,
    title: row.title,
    type: row.type,
    description: row.description || undefined,
    resourceUrl: row.resource_url,
    fileSizeBytes: row.file_size_bytes || undefined,
    orderIndex: row.order_index || 0,
});

const mapRowToEnrollment = (row: any): Enrollment => ({
    id: row.id,
    userId: row.user_id,
    courseSlug: row.course_slug,
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    lastAccessedAt: row.last_accessed_at,
    progressPct: parseFloat(row.progress_pct) || 0,
});

const mapRowToLessonProgress = (row: any): LessonProgress => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    watchTimeSeconds: row.watch_time_seconds || 0,
    completedAt: row.completed_at || undefined,
});

const emptySnapshot = (): LearningSnapshot => ({
    course: null,
    lessons: [],
    resources: [],
    enrollment: null,
    lessonProgress: [],
    resumeLessonId: undefined,
});

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

    const fetchSnapshot = async (lookupUserId: string | null) => {
        const supabase = getSupabaseForEnrollment();
        return supabase.rpc("get_learning_snapshot", {
            p_course_slug: courseSlug,
            p_user_id: lookupUserId,
        });
    };

    try {
        const { data, error } = await fetchSnapshot(userId || null);

        if (error) {
            console.warn("Failed to fetch learning snapshot:", error.message);
            if (userId) {
                const { data: fallbackData, error: fallbackError } = await fetchSnapshot(null);
                if (!fallbackError) {
                    const rawFallback = fallbackData as any;
                    const fallbackSnapshot: LearningSnapshot = {
                        course: rawFallback?.course ? mapRowToCourse(rawFallback.course) : null,
                        lessons: Array.isArray(rawFallback?.lessons)
                            ? rawFallback.lessons.map(mapRowToLesson)
                            : [],
                        resources: Array.isArray(rawFallback?.resources)
                            ? rawFallback.resources.map(mapRowToResource)
                            : [],
                        enrollment: null,
                        lessonProgress: [],
                        resumeLessonId: undefined,
                    };

                    snapshotCache.set(cacheKey, { data: fallbackSnapshot, fetchedAt: Date.now() });
                    return fallbackSnapshot;
                }
            }
            return emptySnapshot();
        }

        const raw = data as any;
        const snapshot: LearningSnapshot = {
            course: raw?.course ? mapRowToCourse(raw.course) : null,
            lessons: Array.isArray(raw?.lessons) ? raw.lessons.map(mapRowToLesson) : [],
            resources: Array.isArray(raw?.resources)
                ? raw.resources.map(mapRowToResource)
                : [],
            enrollment: raw?.enrollment ? mapRowToEnrollment(raw.enrollment) : null,
            lessonProgress: Array.isArray(raw?.progress)
                ? raw.progress.map(mapRowToLessonProgress)
                : [],
            resumeLessonId:
                typeof raw?.resumeLessonId === "string" ? raw.resumeLessonId : undefined,
        };

        snapshotCache.set(cacheKey, { data: snapshot, fetchedAt: Date.now() });
        return snapshot;
    } catch (err) {
        console.warn("Unexpected error fetching learning snapshot:", err);
        return emptySnapshot();
    }
};
