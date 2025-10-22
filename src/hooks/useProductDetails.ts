import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT, GET_COURSE } from "../services/marketplaceQueries";
import {
  getFallbackItemDetails,
  getFallbackItems,
} from "../utils/fallbackData";

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
  // Query product details (non-courses)
  const {
    data: productData,
    error: productError,
    loading: productLoading,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT, {
    variables: { id: itemId || "" },
    skip: !itemId || marketplaceType === "courses",
  });
  // Query course details (courses)
  const {
    data: courseData,
    error: courseError,
    loading: courseLoading,
    refetch: refetchCourse,
  } = useQuery(GET_COURSE, {
    variables: { id: itemId || "" },
    skip: !itemId || marketplaceType !== "courses",
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
  // Map GraphQL Course to the unified item shape used by details page
  const mapCourseToItem = (course: any): ProductItem | null => {
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
    const providerName = course.partner || "Khalifa Fund";
    const providerLogo = toAbsolute(course.logoUrl) || "/mzn_logo.png";
    const toArray = (val: any): string[] => {
      if (Array.isArray(val)) return val.filter((s) => typeof s === "string" && s.trim() !== "").map((s) => s.trim());
      if (typeof val === "string") {
        // Split on newlines or commas/semicolons
        return val
          .split(/\r?\n|[,;]+/)
          .map((s) => s.trim())
          .filter((s) => s);
      }
      return [];
    };
    const learningOutcomes = toArray(course.learningOutcomes);
    const skillsGained = toArray(course.skillsGained);
    const details = toArray(course.keyHighlights);
    // Normalize cost: default to 3200 if < 1 or invalid
    const rawCost = (course as any)?.cost;
    const parsedCost = typeof rawCost === "number" ? rawCost : parseFloat(String(rawCost ?? ""));
    const normalizedCost = !isNaN(parsedCost) && parsedCost >= 1 ? parsedCost : 3200;
    return {
      id: course.id,
      title: course.name,
      description: course.description,
      category: course.serviceCategory || course.topicTitle,
      businessStage: course.businessStage,
      deliveryMode: course.pricingModel, // best available proxy; may be empty
      price: normalizedCost,
      duration: course.duration,
      learningOutcomes,
      skillsGained,
      details,
      keyHighlights: details,
      requiredDocuments: [],
      applicationProcess,
      serviceApplication: course.uponCompletion, // surfaced as course completion info
      uponCompletion: course.uponCompletion,
      keyTerms: undefined,
      additionalTerms: undefined,
      eligibility: undefined,
      tags: [course.serviceCategory, course.pricingModel, course.businessStage].filter(Boolean),
      provider: {
        name: providerName,
        logoUrl: providerLogo,
      },
      providerLocation: "UAE",
      rating: course.rating,
      reviewCount: course.reviewCount,
      startDate: course.startDate,
      formUrl: undefined,
    } as any;
  };

  useEffect(() => {
    if (!itemId) return;
    const product = (productData as any)?.product;
    const course = (courseData as any)?.course;

    // Choose data source based on marketplace type
    const raw = marketplaceType === "courses" ? course : product;

    if (!raw) {
      // fallback path if no item in response
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

    const mapped = marketplaceType === "courses" ? mapCourseToItem(raw) : mapProductToItem(raw);
    if (!mapped) return;

    // merge with fallback to fill gaps
    const fallbackForItem = getFallbackItemDetails(
      marketplaceType,
      itemId || "fallback-1"
    );
    // Start with mapped data, only fill gaps with fallback
    const merged: any = { ...mapped };
    if (fallbackForItem) {
      for (const key of Object.keys(fallbackForItem)) {
        // Never override provider with fallback data
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
    // Ensure provider from mapped data is always used
    merged.provider = (mapped as any).provider;

    // Ensure eligibility is shortened even if it came from fallback
    merged.eligibility = normalizeEligibility(merged.eligibility) ?? merged.eligibility;

    setItem(merged);

    // For products we may have related services from GQL; for courses fallback for now
    let limitedRelated: any[] = [];
    if (marketplaceType !== "courses") {
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
      limitedRelated = relatedFromGql.slice(0, 3);
    }
    const fallbackLimited = getFallbackItems(marketplaceType).slice(0, 3);
    const chosen = limitedRelated.length > 0 ? limitedRelated : fallbackLimited;
    const normalized = chosen
      .filter((x: any) => x?.id !== merged.id) // avoid showing the same item as related
      .slice(0, 3)
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
  }, [productData, courseData, itemId, marketplaceType, shouldTakeAction]);
  // Expose a unified loading/error/refetch
  const loading = marketplaceType === "courses" ? courseLoading : productLoading;
  const error = (marketplaceType === "courses" ? courseError : productError) as any;
  const refetch = marketplaceType === "courses" ? refetchCourse : refetchProduct;

  return {
    item,
    relatedItems,
    loading,
    error,
    refetch,
  } as const;
}
