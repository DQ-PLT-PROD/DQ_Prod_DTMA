/**
 * URL Sync Manager (Dev D - Feature D2)
 *
 * Manages synchronization between filter state and URL query parameters
 * Enables deep-linking for AI Widget and shareable filtered views
 *
 * @see docs/DTMA_DevD_Technical_Audit.md Section 5
 */

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";

export interface FilterState {
  search?: string;
  categories?: string[];
  audienceLevels?: string[];
  levelTags?: string[];
  industries?: string[];
  topics?: string[];
}

/**
 * Parse URL query parameters into filter state
 */
export function parseFiltersFromUrl(
  searchParams: URLSearchParams
): FilterState {
  const filters: FilterState = {};

  // Parse search query
  const search = searchParams.get("search") || searchParams.get("q");
  if (search) {
    filters.search = search;
  }

  // Parse array filters (support comma-separated values)
  const parseArrayParam = (key: string): string[] | undefined => {
    const value = searchParams.get(key);
    if (!value) return undefined;
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
  };

  filters.categories =
    parseArrayParam("category") || parseArrayParam("categories");
  filters.audienceLevels =
    parseArrayParam("audience") || parseArrayParam("audienceLevel");
  filters.levelTags = parseArrayParam("level") || parseArrayParam("levelTag");
  filters.industries =
    parseArrayParam("industry") || parseArrayParam("industries");
  filters.topics = parseArrayParam("topic") || parseArrayParam("topics");

  return filters;
}

/**
 * Convert filter state to URL query parameters
 */
export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Add search query
  if (filters.search) {
    params.set("search", filters.search);
  }

  // Add array filters (comma-separated)
  const addArrayParam = (key: string, values?: string[]) => {
    if (values && values.length > 0) {
      params.set(key, values.join(","));
    }
  };

  addArrayParam("category", filters.categories);
  addArrayParam("audience", filters.audienceLevels);
  addArrayParam("level", filters.levelTags);
  addArrayParam("industry", filters.industries);
  addArrayParam("topic", filters.topics);

  return params;
}

/**
 * Update URL with current filter state (without page reload)
 */
export function updateUrlWithFilters(
  navigate: ReturnType<typeof useNavigate>,
  location: ReturnType<typeof useLocation>,
  filters: FilterState
) {
  const params = filtersToUrlParams(filters);
  const newSearch = params.toString();
  const currentSearch = location.search.replace("?", "");

  // Only update if search params actually changed
  if (newSearch !== currentSearch) {
    const newUrl = newSearch
      ? `${location.pathname}?${newSearch}`
      : location.pathname;
    navigate(newUrl, { replace: true });
  }
}

/**
 * Custom hook for URL-synced filters
 */
export function useUrlSyncedFilters(initialFilters: FilterState = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse filters from URL on mount
  const getFiltersFromUrl = useCallback((): FilterState => {
    const searchParams = new URLSearchParams(location.search);
    return parseFiltersFromUrl(searchParams);
  }, [location.search]);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback(
    (filters: FilterState) => {
      updateUrlWithFilters(navigate, location, filters);
    },
    [navigate, location]
  );

  return {
    getFiltersFromUrl,
    syncFiltersToUrl,
  };
}

/**
 * Generate a shareable URL for current filters
 */
export function generateShareableUrl(
  baseUrl: string,
  filters: FilterState
): string {
  const params = filtersToUrlParams(filters);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate deep link for AI Widget
 *
 * Examples:
 * - "Show me leadership courses" → /courses?category=leadership
 * - "Digital transformation for leaders" → /courses?category=digital-transformation&audience=Digital+Leaders
 */
export function generateDeepLink(
  intent: string,
  filters: Partial<FilterState>
): string {
  const params = filtersToUrlParams(filters as FilterState);
  const queryString = params.toString();
  return queryString ? `/courses?${queryString}` : "/courses";
}

/**
 * Parse deep link and extract filters
 */
export function parseDeepLink(url: string): FilterState {
  try {
    const urlObj = new URL(url, window.location.origin);
    return parseFiltersFromUrl(urlObj.searchParams);
  } catch (error) {
    console.error("Error parsing deep link:", error);
    return {};
  }
}

/**
 * Check if filters are empty
 */
export function areFiltersEmpty(filters: FilterState): boolean {
  return (
    !filters.search &&
    (!filters.categories || filters.categories.length === 0) &&
    (!filters.audienceLevels || filters.audienceLevels.length === 0) &&
    (!filters.levelTags || filters.levelTags.length === 0) &&
    (!filters.industries || filters.industries.length === 0) &&
    (!filters.topics || filters.topics.length === 0)
  );
}

/**
 * Clear all filters
 */
export function clearAllFilters(): FilterState {
  return {
    search: undefined,
    categories: [],
    audienceLevels: [],
    levelTags: [],
    industries: [],
    topics: [],
  };
}

/**
 * Get active filter count
 */
export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;

  if (filters.search) count++;
  if (filters.categories && filters.categories.length > 0)
    count += filters.categories.length;
  if (filters.audienceLevels && filters.audienceLevels.length > 0)
    count += filters.audienceLevels.length;
  if (filters.levelTags && filters.levelTags.length > 0)
    count += filters.levelTags.length;
  if (filters.industries && filters.industries.length > 0)
    count += filters.industries.length;
  if (filters.topics && filters.topics.length > 0)
    count += filters.topics.length;

  return count;
}
