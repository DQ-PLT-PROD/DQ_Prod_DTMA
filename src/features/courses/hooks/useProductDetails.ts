import { useCallback, useEffect, useState } from "react";
import { fetchCourseWithContent, fetchRelatedCourses, fetchCourseLessons, fetchCategories } from "@/services/courseService";
import { countCountableLessons } from "@/lib/courses/lessonCount";
import { Course, Category } from "@/types/dtma-lms";

export interface UseProductDetailsArgs {
    itemId?: string;
    shouldTakeAction?: boolean;
}

export interface ProductItem {
    id: string;
    title: string;
    description: string;
    [key: string]: any;
}

// Helper to format duration
const formatDuration = (minutes: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
};

export function useProductDetails({
    itemId,
    shouldTakeAction,
}: UseProductDetailsArgs) {
    const [item, setItem] = useState<ProductItem | null>(null);
    const [relatedItems, setRelatedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Load categories on mount
    useEffect(() => {
        fetchCategories().then(setCategories);
    }, []);

    // Map DTMA course to the unified item shape used by details page
    const mapCourseToItem = (course: Course, courseLessons: any[] = [], courseResources: any[] = []): ProductItem | null => {
        if (!course) return null;

        // Attempt to parse timeline JSON string into steps
        let applicationProcess: { title: string; description: string; week?: number; cost?: string | number }[] | undefined;
        const parseCourseTimeline = (val: any) => {
            if (!val) return undefined;
            let text = val;
            if (typeof text !== "string") {
                try { text = JSON.stringify(text); } catch { return undefined; }
            }
            const candidates: any[] = [];
            candidates.push(text);
            candidates.push(text.replace(/\\"/g, '"'));
            const braceStart = text.indexOf('{');
            const braceEnd = text.lastIndexOf('}');
            if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
                candidates.push(text.substring(braceStart, braceEnd + 1));
            }
            for (const c of candidates) {
                try {
                    const obj = JSON.parse(c);
                    if (obj && Array.isArray(obj.weeks)) return obj;
                } catch {
                    continue;
                }
            }
            return undefined;
        };

        const parsedTimeline = parseCourseTimeline(course.courseTimeline);
        if (parsedTimeline && Array.isArray(parsedTimeline.weeks)) {
            applicationProcess = parsedTimeline.weeks
                .map((w: any) => ({
                    week: typeof w?.week === 'number' ? w.week : undefined,
                    title: w?.title || (typeof w?.week === 'number' ? `Week ${w.week}` : ""),
                    description: typeof w?.description === 'string' ? w.description : "",
                    cost: w?.cost,
                }))
                .filter((s: any) => s.title);
        }

        const toAbsolute = (url?: string) => {
            if (!url) return undefined;
            if (/^https?:\/\//i.test(url)) return url;
            const base = (import.meta as any)?.env?.VITE_ASSETS_BASE_URL || "";
            if (base) {
                const trimmedBase = String(base).replace(/\/$/, "");
                return `${trimmedBase}${url}`;
            }
            return url;
        };
        // Provider info removed

        const category = categories.find((c) => c.id === course.categoryId || c.slug === course.categoryId);
        // Use lessons passed in, fallback to empty if not provided
        const lessonList = courseLessons.length ? courseLessons : [];
        const lessonCount = lessonList.length > 0
            ? countCountableLessons(lessonList)
            : course.lessonCount;

        if (!applicationProcess) {
            applicationProcess = lessonList.map((lesson) => ({
                week: lesson.orderIndex,
                title: lesson.title,
                description: lesson.content || "",
            }));
        }

        const introLesson =
            course.introLessonId &&
            lessonList.find((lesson) => lesson.id === course.introLessonId);
        const firstIntro = introLesson || lessonList.find((lesson) => lesson.type === "intro");

        const highlights = course.learningOutcomes && course.learningOutcomes.length > 0
            ? course.learningOutcomes
            : course.skillsGained || [];

        const posterUrl = course.introVideoPosterUrl || course.heroImageUrl;

        return {
            id: course.slug,
            title: course.title,
            description: course.longDescription || course.shortDescription,
            category: category?.name,
            categorySlug: category?.slug,
            duration: formatDuration(course.estimatedDurationMinutes),
            lessonCount,
            learningOutcomes: course.learningOutcomes || [],
            skillsGained: course.skillsGained || [],
            keyHighlights: highlights,
            details: highlights,
            applicationProcess,
            serviceApplication: course.uponCompletion,
            uponCompletion: course.uponCompletion,
            tags: [category?.name, course.levelTag, course.audienceLevel, ...course.topicTags].filter(Boolean),
            // provider: { name: providerName, logoUrl: providerLogo, description: course.providerDescription },
            providerLocation: course.location || "UAE",
            rating: course.rating ?? 4.7,
            reviewCount: course.reviewCount ?? 30,
            startDate: course.startDate,
            formUrl: course.enrollmentUrl,
            price: "Free",
            levelTag: course.levelTag,
            audienceLevel: course.audienceLevel,
            heroImageUrl: course.heroImageUrl,
            introLessonId: course.introLessonId || firstIntro?.id,
            introVideoUrl: course.introVideoUrl || firstIntro?.videoUrl,
            introVideoPosterUrl: posterUrl,
            resources: courseResources,
        } as any;
    };

    const loadCourse = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        setError(null);
        try {
            const { course, lessons, resources } = await fetchCourseWithContent(itemId);
            if (!course) {
                // No fallback - show error state
                setItem(null);
                setRelatedItems([]);
                setError(new Error("Course not found"));
                return;
            }

            // Use lessons from DB, or empty if not available
            const courseLessons = lessons && lessons.length > 0 ? lessons : [];
            const courseResources = resources || [];
            const mapped = mapCourseToItem(course, courseLessons, courseResources);
            if (mapped) {
                setItem(mapped);
            }

            // Get related courses from database (max 4)
            const relatedCourses = await fetchRelatedCourses(course.slug, 4);
            setRelatedItems(relatedCourses.map(c => ({
                id: c.slug,
                slug: c.slug,
                title: c.title,
                description: c.shortDescription,
                category: (c as any).categoryName || c.categoryId,
                duration: formatDuration(c.estimatedDurationMinutes),
                lessonCount: c.lessonCount,
                levelTag: c.levelTag,
                audienceLevel: c.audienceLevel,
                heroImageUrl: c.heroImageUrl,
                introVideoUrl: c.introVideoUrl,
                rating: c.rating ?? 4.6,
                reviewCount: c.reviewCount ?? 24,
                isComingSoon: (c as any).isComingSoon || false,
            })));

            if (shouldTakeAction) {
                setTimeout(() => {
                    document
                        .getElementById("action-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [itemId, shouldTakeAction]);

    useEffect(() => {
        if (!itemId) return;
        loadCourse();
    }, [itemId, loadCourse]);

    return {
        item,
        relatedItems,
        loading,
        error,
        refetch: loadCourse,
    } as const;
}
