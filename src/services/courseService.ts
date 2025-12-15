import { getSupabase, isSupabaseConfigured } from "../lib/supabase/client";
import { Course, CourseCatalogFilters, Lesson } from "../types/dtma-lms";
import { getCourses as getLocalCourses, getCourseBySlug as getLocalCourseBySlug, toMarketplaceItem, getRelatedCourses } from "../lib/api/dtmaCourses";

// Types for quiz and resource data
export interface Quiz {
    id: string;
    courseSlug: string;
    title: string;
    orderIndex: number;
    question: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation?: string;
}

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
const mapRowToCourse = (row: any): Course => {
    return {
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
        status: row.status as any,
        rating: row.rating || undefined,
        reviewCount: row.review_count || undefined,
        enrollmentUrl: row.enrollment_url || undefined,
        learningOutcomes: row.learning_outcomes || [],
        skillsGained: row.skills_gained || [],
        uponCompletion: row.upon_completion || undefined,
        startDate: row.start_date || undefined,
    };
};

export const fetchCourses = async (filters?: CourseCatalogFilters): Promise<any[]> => {
    // If Supabase is not configured, fallback to local data
    if (!isSupabaseConfigured()) {
        const localCourses = getLocalCourses(filters);
        return localCourses.map(toMarketplaceItem);
    }

    try {
        const supabase = getSupabase();
        let query = supabase
            .from("courses")
            .select("*")
            .eq("status", "published");

        if (filters) {
            if (filters.categorySlug) {
                query = query.eq("category_id", filters.categorySlug);
            }
            if (filters.audienceLevel) {
                query = query.eq("audience_level", filters.audienceLevel);
            }
            if (filters.levelTag) {
                query = query.eq("level_tag", filters.levelTag);
            }
            if (filters.topic) {
                query = query.contains("topic_tags", [filters.topic]);
            }
            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.warn("Supabase fetch failed, falling back to local data:", error.message);
            const localCourses = getLocalCourses(filters);
            return localCourses.map(toMarketplaceItem);
        }

        return (data || []).map((row) => toMarketplaceItem(mapRowToCourse(row)));
    } catch (err) {
        console.warn("Unexpected error fetching courses, falling back to local data:", err);
        const localCourses = getLocalCourses(filters);
        return localCourses.map(toMarketplaceItem);
    }
};

export const fetchCourseBySlug = async (slug: string): Promise<any | null> => {
    if (!isSupabaseConfigured()) {
        const localCourse = getLocalCourseBySlug(slug);
        return localCourse ? toMarketplaceItem(localCourse) : null;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Try local if not found in Supabase (maybe local-only content?)
                const localCourse = getLocalCourseBySlug(slug);
                return localCourse ? toMarketplaceItem(localCourse) : null;
            }
            console.warn("Supabase fetch failed, falling back to local data:", error.message);
            const localCourse = getLocalCourseBySlug(slug);
            return localCourse ? toMarketplaceItem(localCourse) : null;
        }

        return data ? toMarketplaceItem(mapRowToCourse(data)) : null;
    } catch (err) {
        console.warn("Unexpected error fetching course, falling back to local data:", err);
        const localCourse = getLocalCourseBySlug(slug);
        return localCourse ? toMarketplaceItem(localCourse) : null;
    }
};

export const fetchFullCourse = async (slug: string): Promise<Course | null> => {
    if (!isSupabaseConfigured()) {
        return getLocalCourseBySlug(slug) || null;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return getLocalCourseBySlug(slug) || null;
            }
            console.warn("Supabase fetch failed, falling back to local data:", error.message);
            return getLocalCourseBySlug(slug) || null;
        }

        return data ? mapRowToCourse(data) : null;
    } catch (err) {
        console.warn("Unexpected error fetching full course, falling back to local data:", err);
        return getLocalCourseBySlug(slug) || null;
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
        orderIndex: row.order_index,
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
 * Fetch related courses based on category or audience level
 */
export const fetchRelatedCourses = async (slug: string, limit: number = 3): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
        const localCourses = getRelatedCourses(slug, limit);
        return localCourses;
    }

    try {
        const currentCourse = await fetchFullCourse(slug);
        if (!currentCourse) return [];

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .neq('slug', slug)
            .or(`category_id.eq.${currentCourse.categoryId},audience_level.eq.${currentCourse.audienceLevel}`)
            .eq('status', 'published')
            .limit(limit);

        if (error) {
            console.warn("Error fetching related courses:", error.message);
            return getRelatedCourses(slug, limit);
        }

        return (data || []).map(mapRowToCourse);
    } catch (err) {
        console.warn("Unexpected error fetching related courses:", err);
        return getRelatedCourses(slug, limit);
    }
};
