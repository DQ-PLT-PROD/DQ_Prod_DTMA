import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT } from "../services/marketplaceQueries";
import {
  getFallbackItemDetails,
  getFallbackItems,
} from "../utils/fallbackData";
import { getLessonsByCourse, getRelatedCourses, toMarketplaceItem, formatDuration, getIntroVideoForCourse } from "../lib/api/dtmaCourses";
import { fetchFullCourse } from "../services/courseService";
import { categories } from "../data/dtma/categories";
import { Course } from "../types/dtma-lms";

// Normalize eligibility display to the first non-empty segment before a semicolon
const normalizeEligibility = (val: any): string | undefined => {
  if (Array.isArray(val)) {
    const first = val.find((e: any) => typeof e === "string" && e.trim() !== "");
    return first ? String(first).split(";")[0].trim() : undefined;
  }
  if (typeof val === "string") {
    return val.split(";")[0].trim();
  }
  return undefined;
};

// Extract a human-readable document name without extension
const normalizeDocumentName = (raw: string): string => {
  if (!raw) return "";
  // Remove query/hash
  let s = raw.split("#")[0].split("?")[0];
  // Extract basename from URL or path
  const parts = s.split(/[/\\]/);
  s = parts[parts.length - 1] || s;
  // If there's no dot or it's a hidden file like ".env", just return trimmed
  if (!/\./.test(s.replace(/^\.+/, ""))) return s.trim();
  // Strip last extension
  s = s.replace(/\.[^.\/\\]+$/, "");
  return s.trim();
};

export interface UseProductDetailsArgs {
  itemId?: string;
  marketplaceType: "courses" | "financial" | "non-financial" | "knowledge-hub";
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
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState<Error | null>(null);
  const isCourseMarketplace = marketplaceType === "courses";
  // Query product details (non-courses)
  const {
    data: productData,
    error: productError,
    loading: productLoading,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT, {
    variables: { id: itemId || "" },
    skip: !itemId || isCourseMarketplace,
  });

  const mapProductToItem = (product: any): ProductItem | null => {
    if (!product) return null;
    const cf = (product as any).customFields || {};
    // Resolve provider logo strictly from CustomFields.Logo.source
    const logoFromCFArray = Array.isArray(cf.Logo)
      ? (cf.Logo[0] as any)?.source
      : undefined;
    const logoFromCFObject = !Array.isArray(cf.Logo)
      ? (cf.Logo as any)?.source
      : undefined;
    const toAbsolute = (url?: string) => {
      if (!url) return undefined;
      if (/^https?:\/\//i.test(url)) return url;
      const base = (import.meta as any)?.env?.VITE_ASSETS_BASE_URL || "";
      if (base) {
        const trimmedBase = String(base).replace(/\/$/, "");
        return `${trimmedBase}${url}`;
      }
      return url; // fallback: hope it's valid as-is
    };
    const logoFromCustomFields = cf.logoUrl;

    const resolvedLogo =
      toAbsolute(logoFromCustomFields) ||
      toAbsolute(logoFromCFArray) ||
      toAbsolute(logoFromCFObject) ||
      "/mzn_logo.png";

    return {
      id: product.id,
      title: product.name,
      description: product.description,
      category: cf.Industry,
      businessStage: cf.BusinessStage,
      serviceType: cf.CustomerType,
      price: cf.Cost,
      processingTime: cf.ProcessingTime,
      amount: cf.Cost,
      interestRate: cf.InterestRate,
      serviceApplication: cf.ServiceApplication,
      // URL/path to the application form
      formUrl: typeof cf.formUrl === "string" ? cf.formUrl.trim() : undefined,
      // Eligibility mapping for EligibilityTermsTab
      eligibilityCriteria: Array.isArray(cf.Eligibility)
        ? cf.Eligibility.filter((e: any) => typeof e === "string" && e.trim() !== "")
        : undefined,
      eligibility: normalizeEligibility(cf.Eligibility),
      // Highlights/details mapping
      // Prefer KeyHighlights when present; otherwise fall back to Steps or TermsOfService
      details: Array.isArray(cf.KeyHighlights)
        ? cf.KeyHighlights
        : typeof cf.KeyHighlights === "string" && cf.KeyHighlights.trim() !== ""
          ? [cf.KeyHighlights]
          : Array.isArray(cf.Steps)
            ? cf.Steps
            : typeof cf.Steps === "string" && cf.Steps.trim() !== ""
              ? [cf.Steps]
              : typeof cf.TermsOfService === "string" && cf.TermsOfService.trim() !== ""
                ? [cf.TermsOfService]
                : [],
      // Expose learning outcomes specifically for course views
      learningOutcomes: Array.isArray(cf.KeyHighlights)
        ? cf.KeyHighlights
        : typeof cf.KeyHighlights === "string" && cf.KeyHighlights.trim() !== ""
          ? [cf.KeyHighlights]
          : [],
      requiredDocuments: Array.isArray(cf.RequiredDocuments)
        ? cf.RequiredDocuments
          .map((d: any) => {
            if (typeof d === "string") return normalizeDocumentName(d);
            const raw = d?.name || d?.source || "";
            return normalizeDocumentName(raw);
          })
          .filter((s: string) => !!s)
        : [],
      // Normalize application process steps from CustomFields.Steps
      applicationProcess: Array.isArray(cf.Steps)
        ? cf.Steps
          .map((s: any) => {
            if (typeof s === "string") {
              return { title: s, description: "" };
            }
            if (s && typeof s === "object") {
              const title =
                typeof s.title === "string" && s.title.trim() !== ""
                  ? s.title.trim()
                  : typeof s.name === "string" && s.name.trim() !== ""
                    ? s.name.trim()
                    : "";
              const description =
                typeof s.description === "string" ? s.description : "";
              return { title, description };
            }
            return { title: "", description: "" };
          })
          .filter((x: any) => x.title !== "")
        : undefined,
      // Prefer new fields for terms when available
      keyTerms:
        (Array.isArray(cf.KeyTermsOfService)
          ? cf.KeyTermsOfService.join(", ")
          : cf.KeyTermsOfService) ||
        (Array.isArray(cf.TermsOfService)
          ? cf.TermsOfService.join(", ")
          : cf.TermsOfService),
      additionalTerms: Array.isArray(cf.AdditionalTermsOfService)
        ? cf.AdditionalTermsOfService
        : cf.AdditionalTermsOfService
          ? [cf.AdditionalTermsOfService]
          : undefined,
      tags: [cf.Industry, cf.CustomerType, cf.BusinessStage].filter(Boolean),
      provider: {
        // Prefer explicit Partner field from customFields, otherwise fallback to Khalifa Fund
        name:
          (typeof cf.Partner === "string" && cf.Partner.trim() !== ""
            ? cf.Partner.trim()
            : undefined) || "Khalifa Fund",
        logoUrl: resolvedLogo,
      },
      providerLocation: "UAE",
    } as any;
  };

  // Map DTMA mock course to the unified item shape used by details page
  const mapCourseToItem = (course: Course, courseLessons: any[] = []): ProductItem | null => {
    if (!course) return null;

    // Attempt to parse timeline JSON string into steps (robust to messy strings)
    let applicationProcess: { title: string; description: string; week?: number; cost?: string | number }[] | undefined;
    const parseCourseTimeline = (val: any) => {
      if (!val) return undefined;
      let text = val;
      if (typeof text !== "string") {
        try { text = JSON.stringify(text); } catch { return undefined; }
      }
      // Unescape common jumbled patterns and try multiple parsing strategies
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

    const providerName = course.provider?.name || "Khalifa Fund";
    const providerLogo = toAbsolute(course.provider?.logoUrl) || "/mzn_logo.png";

    const toArray = (val: any): string[] => {
      if (Array.isArray(val)) return val.filter((s) => typeof s === "string" && s.trim() !== "").map((s) => s.trim());
      if (typeof val === "string") {
        return val.split(/\r?\n|[,;]+/).map((s) => s.trim()).filter((s) => s);
      }
      return [];
    };

    const category = categories.find((c) => c.id === course.categoryId);
    const lessonList = courseLessons.length ? courseLessons : getLessonsByCourse(course.id);

    if (!applicationProcess) {
      applicationProcess = lessonList.map((lesson) => ({
        week: lesson.orderIndex,
        title: lesson.title,
        description: lesson.content || "",
      }));
    }

    const introVideo = getIntroVideoForCourse(course.id);
    const introLesson =
      course.introLessonId &&
      lessonList.find((lesson) => lesson.id === course.introLessonId);
    const firstIntro = introLesson || lessonList.find((lesson) => lesson.type === "intro");

    const highlights = course.learningOutcomes && course.learningOutcomes.length > 0
      ? course.learningOutcomes
      : course.skillsGained || [];

    return {
      id: course.slug,
      title: course.title,
      description: course.longDescription || course.shortDescription,
      category: category?.name,
      categorySlug: category?.slug,
      deliveryMode: course.deliveryMode || "Online",
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
      provider: course.provider || { name: providerName, logoUrl: providerLogo },
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
      introVideoUrl: course.introVideoUrl || introVideo.videoUrl,
      introVideoPosterUrl: course.introVideoPosterUrl || introVideo.posterUrl,
    } as any;
  };

  const loadCourse = useCallback(async () => {
    if (!itemId) return;
    setCourseLoading(true);
    setCourseError(null);
    try {
      const course = await fetchFullCourse(itemId);
      if (!course) {
        const fallback = getFallbackItemDetails("courses", itemId);
        if (fallback) {
          setItem(fallback);
          setRelatedItems(getFallbackItems("courses").slice(0, 4));
          setCourseError(null);
        } else {
          setItem(null);
          setCourseError(new Error("Course not found"));
        }
        return;
      }

      // For now, we still fetch lessons locally because we haven't migrated lessons to Supabase yet.
      // If the course comes from Supabase, we might not find local lessons if the ID doesn't match a local one.
      // But assuming ID/Slug parity for now or that we are in fallback mode.
      const courseLessons = getLessonsByCourse(course.id);
      const mapped = mapCourseToItem(course, courseLessons);
      if (mapped) {
        setItem(mapped);
      }

      const related = getRelatedCourses(course.slug, 4)
        .map((relatedCourse) => toMarketplaceItem(relatedCourse))
        .filter((relatedCourse) => relatedCourse.id !== course.slug)
        .slice(0, 4);
      setRelatedItems(related);

      if (shouldTakeAction) {
        setTimeout(() => {
          document
            .getElementById("action-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      setCourseError(err as Error);
    } finally {
      setCourseLoading(false);
    }
  }, [itemId, shouldTakeAction]);

  useEffect(() => {
    if (!itemId || isCourseMarketplace) return;
    const product = (productData as any)?.product;

    if (!product) {
      const fallback = getFallbackItemDetails(
        marketplaceType,
        itemId || "fallback-1"
      );
      if (fallback) {
        setItem(fallback);
        setRelatedItems(getFallbackItems(marketplaceType));
      }
      return;
    }

    const mapped = mapProductToItem(product);
    if (!mapped) return;

    const fallbackForItem = getFallbackItemDetails(
      marketplaceType,
      itemId || "fallback-1"
    );
    const merged: any = { ...mapped };
    if (fallbackForItem) {
      for (const key of Object.keys(fallbackForItem)) {
        if (key === 'provider') continue;

        const val = merged[key];
        const shouldUseFallback =
          val === undefined ||
          val === null ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "string" && val.trim() === "");
        if (shouldUseFallback) {
          merged[key] = (fallbackForItem as any)[key];
        }
      }
    }
    merged.provider = (mapped as any).provider;

    merged.eligibility = normalizeEligibility(merged.eligibility) ?? merged.eligibility;

    setItem(merged);

    let limitedRelated: any[] = [];
    const rs = product?.customFields?.RelatedServices;
    const relatedFromGql = Array.isArray(rs)
      ? rs.map((x: any) => ({
        id: x.id,
        title: x.name,
        description: x.description || "",
        provider: {
          name: merged.provider?.name,
          logoUrl: merged.provider?.logoUrl || "/mzn_logo.png",
        },
        tags: [],
      }))
      : [];
    limitedRelated = relatedFromGql.slice(0, 4);

    const fallbackLimited = getFallbackItems(marketplaceType).slice(0, 4);
    const chosen = limitedRelated.length > 0 ? limitedRelated : fallbackLimited;
    const normalized = chosen
      .filter((x: any) => x?.id !== merged.id)
      .slice(0, 4)
      .map((x: any) => ({
        id: x.id,
        title: x.title || x.name || "Related Service",
        description: x.description || "",
        provider: {
          name: x.provider?.name || merged.provider?.name || "Service Provider",
          logoUrl:
            x.provider?.logoUrl || merged.provider?.logoUrl || "/mzn_logo.png",
        },
        tags: Array.isArray(x.tags) ? x.tags : [],
      }));
    setRelatedItems(normalized);

    if (shouldTakeAction) {
      setTimeout(() => {
        document
          .getElementById("action-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [productData, itemId, marketplaceType, shouldTakeAction, isCourseMarketplace]);

  useEffect(() => {
    if (!itemId || !isCourseMarketplace) return;
    loadCourse();
  }, [itemId, isCourseMarketplace, loadCourse]);
  // Expose a unified loading/error/refetch
  const loading = isCourseMarketplace ? courseLoading : productLoading;
  const error = (isCourseMarketplace ? courseError : productError) as any;
  const refetch = isCourseMarketplace ? loadCourse : refetchProduct;

  return {
    item,
    relatedItems,
    loading,
    error,
    refetch,
  } as const;
}
