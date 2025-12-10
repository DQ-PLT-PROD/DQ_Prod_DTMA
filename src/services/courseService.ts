import { getSupabase, isSupabaseConfigured } from "../lib/supabase/client";
import { Course, CourseCatalogFilters } from "../types/dtma-lms";
import { getCourses as getLocalCourses, getCourseBySlug as getLocalCourseBySlug, toMarketplaceItem } from "../lib/api/dtmaCourses";

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
        introVideoUrl: row.intro_video_url || undefined,
        introVideoPosterUrl: row.intro_video_poster_url || undefined,
        isFeatured: row.is_featured || false,
        status: row.status as any,
        provider: {
            name: row.provider_name || "",
            logoUrl: row.provider_logo_url || "",
            description: row.provider_description || "",
        },
        rating: row.rating || undefined,
        reviewCount: row.review_count || undefined,
        deliveryMode: row.delivery_mode as any,
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
            if (filters.deliveryMode) {
                query = query.eq("delivery_mode", filters.deliveryMode);
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
