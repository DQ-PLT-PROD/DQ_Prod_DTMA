import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Course, CourseCatalogFilters, Lesson, Category, Quiz } from "@/types/dtma-lms";

// Types for quiz and resource data

export interface CourseResource {
    id: string;
    courseSlug: string;
    title: string;
    type: 'whitepaper' | 'pdf' | 'template' | 'tool' | 'worksheet' | 'other';
    description?: string;
    resourceUrl: string;
    fileSizeBytes?: number;
    orderIndex: number;
}

// Helper to map Supabase row to Course type
const mapRowToCourse = (row: any): Course & { isComingSoon?: boolean; categoryName?: string } => {
    // Calculate stats from lessons if available
    let calculatedDuration = row.estimated_duration_minutes || 0;
    let calculatedLessonCount = row.lesson_count || 0;

    if (Array.isArray(row.lessons) && row.lessons.length > 0) {
        // Check if we have detailed lesson data (not just count object)
        const hasDetails = 'type' in row.lessons[0] || 'estimated_duration_minutes' in row.lessons[0];

        if (hasDetails) {
            // Duration: Sum of all lessons
            calculatedDuration = row.lessons.reduce((acc: number, lesson: any) =>
                acc + (Number(lesson.estimated_duration_minutes) || 0), 0);

            // Count: All lessons minus intro and outro
            calculatedLessonCount = row.lessons.filter((l: any) =>
                l.type !== 'intro' && l.type !== 'outro').length;
        } else if (row.lessons[0].count) {
            // Handle simple count query
            calculatedLessonCount = row.lessons[0].count;
        }
    }

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        shortDescription: row.short_description || "",
        longDescription: row.long_description || "",
        categoryId: row.category_id || "",
        categoryName: row.course_categories?.name || row.category_id || "",
        audienceLevel: row.audience_level as any,
        topicTags: row.topic_tags || [],
        levelTag: row.level_tag || "",
        estimatedDurationMinutes: calculatedDuration,
        lessonCount: calculatedLessonCount,
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
    };
};

// Helper to format duration
const formatDuration = (minutes: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
};

// Helper to convert Course to marketplace item format
const toMarketplaceItem = (course: Course): any => {
    return {
        id: course.slug,
        slug: course.slug,
        title: course.title,
        description: course.shortDescription,
        category: (course as any).categoryName || course.categoryId,
        categoryName: (course as any).categoryName || course.categoryId, // Added for component compatibility
        categorySlug: course.categoryId,
        industry: course.industry,
        duration: formatDuration(course.estimatedDurationMinutes),
        durationMinutes: course.estimatedDurationMinutes,
        lessonCount: course.lessonCount,
        levelTag: course.levelTag,
        audienceLevel: course.audienceLevel,
        topicTags: course.topicTags,
        tags: [course.levelTag, course.audienceLevel, ...course.topicTags.slice(0, 2)].filter(Boolean),
        // provider removed
        heroImageUrl: course.heroImageUrl,
        introVideoUrl: course.introVideoUrl,
        introVideoPosterUrl: course.introVideoPosterUrl,
        rating: course.rating ?? 4.6,
        reviewCount: course.reviewCount ?? 24,
        formUrl: course.enrollmentUrl,
        learningOutcomes: course.learningOutcomes,
        startDate: course.startDate,
    };
};

// Simple in-memory cache to prevent redundant fetches
const coursesCache: {
    data: any[];
    timestamp: number;
    filters: string;
} = {
    data: [],
    timestamp: 0,
    filters: ""
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const fetchCourses = async (filters?: CourseCatalogFilters): Promise<any[]> => {
    // 1. Check Cache
    const filtersKey = JSON.stringify(filters || {});
    const now = Date.now();
    const isCacheValid = (now - coursesCache.timestamp < CACHE_TTL_MS) && coursesCache.filters === filtersKey;

    if (isCacheValid && coursesCache.data.length > 0) {
        return coursesCache.data;
    }

    // If Supabase is not configured, return empty
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty courses list");
        return [];
    }

    try {
        const supabase = getSupabase();
        let query = supabase
            .from("courses")
            .select("*, course_categories(name), lessons(type, estimated_duration_minutes)")
            .eq("status", "published");

        if (filters) {
            // Select specific columns if heavy fields should be excluded
            if (filters.excludeHeavyFields) {
                const lightweightFields = [
                    "id", "slug", "title", "short_description", "category_id",
                    "audience_level", "topic_tags", "level_tag", "estimated_duration_minutes",
                    "lesson_count", "hero_image_url", "intro_video_url",
                    "intro_video_poster_url", "is_featured", "is_coming_soon", "status",
                    "rating", "review_count", "start_date", "industry", "created_at"
                ].join(",");

                query = supabase
                    .from("courses")
                    // @ts-ignore
                    .select(`${lightweightFields}, course_categories(name), lessons(type, estimated_duration_minutes)`)
                    .eq("status", "published");
            }

            // Featured filter
            if (filters.featured) {
                query = query.eq("is_featured", true);
            }

            // Category filter (multi-select)
            if (filters.categories && filters.categories.length > 0) {
                query = query.in("category_id", filters.categories);
            }

            // Audience level filter (multi-select)
            if (filters.audienceLevels && filters.audienceLevels.length > 0) {
                query = query.in("audience_level", filters.audienceLevels);
            }

            // Level tag filter (multi-select)
            if (filters.levelTags && filters.levelTags.length > 0) {
                query = query.in("level_tag", filters.levelTags);
            }

            // Industry filter (multi-select)
            if (filters.industries && filters.industries.length > 0) {
                query = query.in("industry", filters.industries);
            }

            // Topic filter - uses array contains for topic_tags array field
            if (filters.topics && filters.topics.length > 0) {
                // For topics, we use overlaps to check if any of the selected topics match
                query = query.overlaps("topic_tags", filters.topics);
            }

            // Search filter (text search across title and description)
            if (filters.search && filters.search.trim()) {
                const searchTerm = filters.search.trim();
                query = query.or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
            }
        }

        // Order: available courses first (is_coming_soon = false), then by most recent
        query = query
            .order('is_coming_soon', { ascending: true })
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error("Supabase fetch failed:", error.message);
            return [];
        }

        const result = (data || []).map((row) => {
            const course = mapRowToCourse(row);
            const item = toMarketplaceItem(course);
            return { ...item, isComingSoon: course.isComingSoon };
        });

        // Update Cache
        coursesCache.data = result;
        coursesCache.timestamp = Date.now();
        coursesCache.filters = filtersKey;

        return result;
    } catch (err) {
        console.error("Unexpected error fetching courses:", err);
        return [];
    }
};

export const fetchFullCourse = async (slug: string): Promise<Course | null> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning null");
        return null;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("courses")
            .select("*, lessons(type, estimated_duration_minutes)")
            .eq("slug", slug)
            .single();

        if (error) {
            console.error("Error fetching full course:", error.message);
            return null;
        }

        return data ? mapRowToCourse(data) : null;
    } catch (err) {
        console.error("Unexpected error fetching full course:", err);
        return null;
    }
};

// Helper to map Supabase lesson row to Lesson type
const mapRowToLesson = (row: any): Lesson => {
    return {
        id: row.id,
        courseId: row.course_slug,
        title: row.title,
        type: row.type as 'intro' | 'standard' | 'outro' | 'quiz',
        orderIndex: row.order_index,
        estimatedDurationMinutes: row.estimated_duration_minutes || 0,
        videoUrl: row.video_url || undefined,
        resourceUrl: row.resource_url || undefined,
        content: row.content || undefined,
    };
};

// Helper to map Supabase quiz row to Quiz type
const mapRowToQuiz = (row: any): Quiz => {
    return {
        id: row.id,
        courseSlug: row.course_slug,
        title: row.title,
        description: row.description || undefined,
        orderIndex: row.order_index,
        passingScore: row.passing_score,
        timeLimitMinutes: row.time_limit_minutes,
        maxAttempts: row.max_attempts,
        isPublished: row.is_published,
        shuffleQuestions: row.shuffle_questions,
        // Legacy fields
        question: row.question,
        options: row.options || [],
        correctAnswer: row.correct_answer,
        explanation: row.explanation || undefined,
    };
};

// Helper to map Supabase resource row to CourseResource type
const mapRowToResource = (row: any): CourseResource => {
    return {
        id: row.id,
        courseSlug: row.course_slug,
        title: row.title,
        type: row.type,
        description: row.description || undefined,
        resourceUrl: row.resource_url,
        fileSizeBytes: row.file_size_bytes || undefined,
        orderIndex: row.order_index || 0,
    };
};

/**
 * Fetch all lessons for a course by slug
 */
export const fetchCourseLessons = async (courseSlug: string): Promise<Lesson[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty lessons array");
        return [];
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("lessons")
            .select("*")
            .eq("course_slug", courseSlug)
            .order("order_index", { ascending: true });

        if (error) {
            console.warn("Error fetching lessons:", error.message);
            return [];
        }

        return (data || []).map(mapRowToLesson);
    } catch (err) {
        console.warn("Unexpected error fetching lessons:", err);
        return [];
    }
};

/**
 * Fetch all quizzes for a course by slug
 */
export const fetchCourseQuizzes = async (courseSlug: string): Promise<Quiz[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty quizzes array");
        return [];
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("course_slug", courseSlug)
            .order("order_index", { ascending: true });

        if (error) {
            console.warn("Error fetching quizzes:", error.message);
            return [];
        }

        return (data || []).map(mapRowToQuiz);
    } catch (err) {
        console.warn("Unexpected error fetching quizzes:", err);
        return [];
    }
};

/**
 * Fetch all resources for a course by slug
 */
export const fetchCourseResources = async (courseSlug: string): Promise<CourseResource[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty resources array");
        return [];
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("course_resources")
            .select("*")
            .eq("course_slug", courseSlug)
            .order("order_index", { ascending: true });

        if (error) {
            console.warn("Error fetching resources:", error.message);
            return [];
        }

        return (data || []).map(mapRowToResource);
    } catch (err) {
        console.warn("Unexpected error fetching resources:", err);
        return [];
    }
};

/**
 * Fetch complete course data with lessons, quizzes, and resources
 */
export const fetchCourseWithContent = async (slug: string): Promise<{
    course: Course | null;
    lessons: Lesson[];
    quizzes: Quiz[];
    resources: CourseResource[];
}> => {
    const [course, lessons, quizzes, resources] = await Promise.all([
        fetchFullCourse(slug),
        fetchCourseLessons(slug),
        fetchCourseQuizzes(slug),
        fetchCourseResources(slug),
    ]);

    return { course, lessons, quizzes, resources };
};

/**
 * Fetch related courses from the related_courses table
 * Returns between 1-4 related courses based on explicit database relationships
 */
export const fetchRelatedCourses = async (slug: string, limit: number = 4): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty related courses");
        return [];
    }

    // Enforce limit between 1 and 4
    const safeLimit = Math.max(1, Math.min(4, limit));

    try {
        const supabase = getSupabase();

        // Query the related_courses table to get explicit relationships
        const { data: relatedData, error: relatedError } = await supabase
            .from("related_courses")
            .select("related_course_slug")
            .eq("course_slug", slug)
            .order("display_order", { ascending: true })
            .limit(safeLimit);

        if (relatedError) {
            console.error("Error fetching related course relationships:", relatedError.message);
            return [];
        }

        if (!relatedData || relatedData.length === 0) {
            // Fallback: return empty array if no explicit relationships exist
            console.log("No explicit related courses found for:", slug);
            return [];
        }

        // Extract the related course slugs
        const relatedSlugs = relatedData.map(r => r.related_course_slug);

        // Fetch the full course data for the related courses with category names
        const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("*, course_categories(name)")
            .in("slug", relatedSlugs)
            .eq("status", "published");

        if (coursesError) {
            console.error("Error fetching related courses data:", coursesError.message);
            return [];
        }

        // Maintain the display order from related_courses table
        const coursesMap = new Map((coursesData || []).map(c => [c.slug, c]));
        const orderedCourses = relatedSlugs
            .map(slug => coursesMap.get(slug))
            .filter(Boolean)
            .map(mapRowToCourse);

        return orderedCourses;
    } catch (err) {
        console.error("Unexpected error fetching related courses:", err);
        return [];
    }
};

/**
 * Fetch all categories from database
 */
export const fetchCategories = async (): Promise<Category[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty categories");
        return [];
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("course_categories")
            .select("*")
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching categories:", error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id || row.slug,
            slug: row.slug,
            name: row.name,
            description: row.description || "",
        }));
    } catch (err) {
        console.error("Unexpected error fetching categories:", err);
        return [];
    }
};
