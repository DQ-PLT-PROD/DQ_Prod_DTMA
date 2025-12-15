import { useCallback, useEffect, useState } from "react";
import {
  getFallbackItemDetails,
  getFallbackItems,
} from "../utils/fallbackData";
import { getLessonsByCourse, getRelatedCourses, toMarketplaceItem, formatDuration, getCourses } from "../lib/api/dtmaCourses";
import { fetchCourseWithContent } from "../services/courseService";
import { categories } from "../data/dtma/categories";
import { Course } from "../types/dtma-lms";

export interface UseProductDetailsArgs {
  itemId?: string;
  marketplaceType: "courses" | "knowledge-hub";
  shouldTakeAction?: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
}

export function useProductDetails({
  itemId,
  marketplaceType,
  shouldTakeAction,
}: UseProductDetailsArgs) {
  const [item, setItem] = useState<ProductItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Map DTMA course to the unified item shape used by details page
  const mapCourseToItem = (course: Course, courseLessons: any[] = []): ProductItem | null => {
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
    // Provider info may come from DB or be undefined - use fallback
    const courseAny = course as any;
    const providerName = courseAny.provider?.name || "DTMA Academy";
    const providerLogo = toAbsolute(courseAny.provider?.logoUrl) || "/images/placeholders/course-fallback.png";

    const category = categories.find((c) => c.id === course.categoryId);
    const lessonList = courseLessons.length ? courseLessons : getLessonsByCourse(course.id);

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

    const posterUrl = course.introVideoPosterUrl || course.heroImageUrl || courseAny.provider?.logoUrl;

    return {
      id: course.slug,
      title: course.title,
      description: course.longDescription || course.shortDescription,
      category: category?.name,
      categorySlug: category?.slug,
      duration: formatDuration(course.estimatedDurationMinutes),
      lessonCount: course.lessonCount,
      learningOutcomes: course.learningOutcomes || [],
      skillsGained: course.skillsGained || [],
      keyHighlights: highlights,
      details: highlights,
      applicationProcess,
      serviceApplication: course.uponCompletion,
      uponCompletion: course.uponCompletion,
      tags: [category?.name, course.levelTag, course.audienceLevel, ...course.topicTags].filter(Boolean),
      provider: courseAny.provider || { name: providerName, logoUrl: providerLogo },
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
    } as any;
  };

  const loadCourse = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const { course, lessons } = await fetchCourseWithContent(itemId);
      if (!course) {
        const fallback = getFallbackItemDetails("courses", itemId);
        if (fallback) {
          setItem(fallback);
          setRelatedItems(getFallbackItems("courses").slice(0, 4));
          setError(null);
        } else {
          setItem(null);
          setError(new Error("Course not found"));
        }
        return;
      }

      const courseLessons = lessons && lessons.length > 0 ? lessons : getLessonsByCourse(course.id);
      const mapped = mapCourseToItem(course, courseLessons);
      if (mapped) {
        setItem(mapped);
      }

      // Get related courses
      let relatedRaw = getRelatedCourses(course.slug, 3);
      if (relatedRaw.length < 3) {
        const allCourses = getCourses();
        const additional = allCourses
          .filter(c => c.slug !== course.slug && !relatedRaw.find(r => r.slug === c.slug))
          .slice(0, 3 - relatedRaw.length);
        relatedRaw = [...relatedRaw, ...additional];
      }

      const related = relatedRaw
        .map((relatedCourse) => toMarketplaceItem(relatedCourse))
        .slice(0, 3);
      setRelatedItems(related);

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

  const loadKnowledgeHubItem = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      // For knowledge-hub, use fallback data for now
      const fallback = getFallbackItemDetails("knowledge-hub", itemId);
      if (fallback) {
        setItem(fallback);
        setRelatedItems(getFallbackItems("knowledge-hub").slice(0, 4));
      } else {
        setItem(null);
        setError(new Error("Item not found"));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (!itemId) return;

    if (marketplaceType === "courses") {
      loadCourse();
    } else if (marketplaceType === "knowledge-hub") {
      loadKnowledgeHubItem();
    }
  }, [itemId, marketplaceType, loadCourse, loadKnowledgeHubItem]);

  const refetch = marketplaceType === "courses" ? loadCourse : loadKnowledgeHubItem;

  return {
    item,
    relatedItems,
    loading,
    error,
    refetch,
  } as const;
}
