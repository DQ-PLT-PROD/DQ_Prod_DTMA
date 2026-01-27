import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FilterSidebar, FilterConfig, FilterOption as SidebarFilterOption } from "../components/FilterSidebar";
import { CourseGrid } from "../components/CourseGrid";
import { SearchBar } from "../components/SearchBar";
import { FilterIcon, XIcon } from "lucide-react";
import { Breadcrumb } from "../../../components/ui/Breadcrumb";
import { ErrorDisplay, CourseCardSkeleton } from "../../../components/SkeletonLoader";
import { getCourseConfig } from "../../../utils/courseConfig";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { fetchCourses, fetchCategories } from "@/services/courseService";
import { fetchIndustryTree, NestedFilterOption as IndustryNode } from "../services/filterService";
import { PageContainer } from "../../../components/layouts/PageContainer";
import { AIWidgetStandalone } from "@/lib/ai-widget";

// Get config once at module level to avoid recreation on every render
const courseConfig = getCourseConfig();

function toArrayFilter(val: string | string[] | undefined): string[] {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    return [val];
}

interface CourseCatalogPageProps {
    promoCards?: any[];
}

export const CourseCatalogPage: React.FC<CourseCatalogPageProps> = ({
    promoCards = [],
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const config = courseConfig; // Use module-level config
    const heroTitle = "DTMA Courses";
    const heroDescription =
        "Browse practical, bite-sized courses on Economy 4.0, Digital Organizations, Transformation, and Future Design.";
    const allowPromoCards = config.showPromoCards !== false;
    const hasInitialized = useRef(false);

    // State for items and filtering
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    // Filter sidebar visibility
    const [showFilters, setShowFilters] = useState(false);
    const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

    // State for filter options
    const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load filter configurations for courses (runs once on mount)
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const loadFilterOptions = async () => {
            try {
                // Fetch categories from database
                const [categories, industryTree] = await Promise.all([
                    fetchCategories(),
                    fetchIndustryTree(),
                ]);

                const toSidebarOptions = (nodes: IndustryNode[]) =>
                    nodes.map((node) => ({
                        id: node.slug,
                        name: node.name,
                        description: node.description,
                        children: node.children ? toSidebarOptions(node.children) : undefined,
                    }));

                // Use canonical config for filter shape, refresh categories from DB
                const filterOptions: FilterConfig[] = config.filterCategories
                    .map((fc) =>
                        fc.id === "category"
                            ? {
                                ...fc,
                                options: categories.map((category) => ({
                                    id: category.slug,
                                    name: category.name,
                                })),
                            }
                            : fc.id === "industry"
                                ? {
                                    ...fc,
                                    options: toSidebarOptions(industryTree),
                                }
                                : fc
                    );
                setFilterConfig(filterOptions);
            } catch (err) {
                console.error("Error fetching filter options:", err);
                setFilterConfig(config.filterCategories);
            }
        };
        loadFilterOptions();
    }, []); // Only run once on mount

    // Parse URL query params to pre-populate filters (runs when filterConfig or URL changes)
    useEffect(() => {
        if (filterConfig.length === 0) return; // Wait for filter config to load

        const searchParams = new URLSearchParams(location.search);
        const initialFilters: Record<string, string[]> = {};

        filterConfig.forEach((fc) => {
            const paramValue = searchParams.get(fc.id);
            // Support comma-separated values for multi-select
            initialFilters[fc.id] = paramValue
                ? paramValue.split(',').map(v => v.trim()).filter(v => v)
                : [];
        });
        initialFilters["topic"] = searchParams.get("topic")?.split(',').map(v => v.trim()).filter(v => v) || [];

        // Also set search query from URL
        const searchParam = searchParams.get("search") || searchParams.get("q");
        if (searchParam) {
            setSearchQuery(searchParam);
        }

        setFilters(initialFilters);
    }, [filterConfig.length, location.search]); // Re-run when filterConfig loads or URL changes

    // Fetch courses based on filters and search query - SERVER-SIDE FILTERING
    useEffect(() => {
        // Don't fetch until filter config is initialized
        if (filterConfig.length === 0) return;

        const loadItems = async () => {
            setLoading(true);
            setError(null);

            try {
                // Build server-side filter object
                const serverFilters = {
                    search: searchQuery.trim() || undefined,
                    categories: toArrayFilter(filters.category),
                    audienceLevels: toArrayFilter(filters.audienceLevel),
                    levelTags: toArrayFilter(filters.levelTag),
                    industries: toArrayFilter(filters.industry),
                    topics: toArrayFilter(filters.topic),
                };

                // Remove empty arrays to avoid unnecessary filtering
                const cleanFilters = Object.fromEntries(
                    Object.entries(serverFilters).filter(([_, v]) =>
                        v !== undefined && (typeof v === 'string' || (Array.isArray(v) && v.length > 0))
                    )
                );

                // Fetch filtered courses from server
                const courses = await fetchCourses(cleanFilters as any);

                setItems(courses);
                setFilteredItems(courses);
                setLoading(false);
            } catch (err) {
                console.error("Error loading courses:", err);
                setError("Failed to load courses");
                setItems([]);
                setFilteredItems([]);
                setLoading(false);
            }
        };

        loadItems();
    }, [filters, searchQuery, filterConfig.length]); // Use filterConfig.length to only trigger when it's populated

    // Handle filter changes
    const handleFilterChange = useCallback(
        (filterType: string, value: string) => {
            setFilters((prev) => {
                const current = toArrayFilter(prev[filterType]);
                const exists = current.includes(value);
                return {
                    ...prev,
                    [filterType]: exists
                        ? current.filter((v) => v !== value)
                        : [...current, value],
                };
            });
        },
        []
    );

    // Apply filters from clickable tags
    const handleTagFilter = useCallback((filterType: string, value: string) => {
        setFilters((prev) => {
            const current = toArrayFilter(prev[filterType]);
            const exists = current.includes(value);
            return {
                ...prev,
                [filterType]: exists
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });
        setShowFilters(false);
    }, []);

    // Reset all filters
    const resetFilters = useCallback(() => {
        const emptyFilters: Record<string, string[]> = {};
        filterConfig.forEach((config) => {
            emptyFilters[config.id] = [];
        });
        emptyFilters["topic"] = [];
        setFilters(emptyFilters);
        setSearchQuery("");
    }, [filterConfig]);

    // Toggle sidebar visibility
    const toggleFilters = useCallback(() => {
        setShowFilters((prev) => !prev);
    }, []);

    // Toggle bookmark for an item
    const toggleBookmark = useCallback((itemId: string) => {
        setBookmarkedItems((prev) => {
            return prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId];
        });
    }, []);

    // Retry loading items after an error
    const retryFetch = useCallback(() => {
        setError(null);
        setLoading(true);
    }, []);

    const hasAppliedFilters = useMemo(() => {
        return Object.values(filters).some((val) =>
            Array.isArray(val) ? val.length > 0 : val !== ""
        );
    }, [filters]);

    const findOptionName = (
        options: SidebarFilterOption[] | undefined,
        id: string
    ): string | undefined => {
        for (const option of options ?? []) {
            if (option.id === id) return option.name;
            const child = findOptionName(option.children, id);
            if (child) return child;
        }
        return undefined;
    };

    // Build clearable chips for active filters/search
    const activeChips = useMemo(() => {
        const chips: Array<{ key: string; value?: string; label: string }> = [];
        Object.entries(filters).forEach(([key, val]) => {
            const selectedValues = Array.isArray(val) ? val : val ? [val] : [];
            selectedValues.forEach((selected) => {
                const config = filterConfig.find((c) => c.id === key);
                const optionLabel = findOptionName(config?.options, selected) || selected;
                chips.push({ key, value: selected, label: optionLabel });
            });
        });
        if (searchQuery.trim()) {
            chips.push({ key: "search", label: `Search: "${searchQuery}"` });
        }
        return chips;
    }, [filters, filterConfig, searchQuery]);

    const clearChip = useCallback((key: string, value?: string) => {
        if (key === "search") {
            setSearchQuery("");
            return;
        }
        setFilters((prev) => {
            const next = { ...prev };
            const currentVal = next[key];
            if (Array.isArray(currentVal)) {
                next[key] = value ? currentVal.filter((v) => v !== value) : [];
            } else {
                next[key] = [];
            }
            return next;
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8">
                <PageContainer>
                    {/* Breadcrumb */}
                    <Breadcrumb
                        variant="default"
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Course Catalog', current: true },
                        ]}
                        className="mb-4"
                    />

                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{heroTitle}</h1>
                    <p className="text-blue-100 max-w-2xl">{heroDescription}</p>
                </PageContainer>
            </div>

            {/* Main Content */}
            <PageContainer className="flex-grow py-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-grow">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>
                    <button
                        onClick={toggleFilters}
                        className="xl:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <FilterIcon size={18} />
                        <span>Filters</span>
                        {hasAppliedFilters && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Active filter chips */}
                {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {activeChips.map((chip, idx) => (
                            <button
                                key={`${chip.key}-${chip.value || idx}`}
                                onClick={() => clearChip(chip.key, chip.value)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                            >
                                {chip.label}
                                <XIcon size={14} />
                            </button>
                        ))}
                        <button
                            onClick={resetFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Mobile filter overlay */}
                    {showFilters && (
                        <div className="fixed inset-0 z-50 xl:hidden">
                            <div
                                className="absolute inset-0 bg-black/50"
                                onClick={toggleFilters}
                            />
                            <div
                                className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-lg"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Filters"
                            >
                                <div className="h-full overflow-y-auto">
                                    <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">Filters</h2>
                                        <button
                                            onClick={toggleFilters}
                                            className="p-1 rounded-full hover:bg-gray-100"
                                            aria-label="Close filters"
                                        >
                                            <XIcon size={20} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <FilterSidebar
                                            filters={filters}
                                            filterConfig={filterConfig}
                                            onFilterChange={handleFilterChange}
                                            onResetFilters={resetFilters}
                                            isResponsive={true}
                                            singleOpen={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter sidebar - desktop */}
                    <div className="hidden xl:block xl:w-1/4">
                        <div className="bg-white rounded-lg shadow sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                {hasAppliedFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-blue-600 text-sm font-medium"
                                    >
                                        Reset All
                                    </button>
                                )}
                            </div>
                            <div className="p-4 overflow-y-auto scrollbar-hide">
                                <FilterSidebar
                                    filters={filters}
                                    filterConfig={filterConfig}
                                    onFilterChange={handleFilterChange}
                                    onResetFilters={resetFilters}
                                    isResponsive={false}
                                    singleOpen={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="xl:w-3/4">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {[...Array(6)].map((_, idx) => (
                                    <CourseCardSkeleton key={idx} />
                                ))}
                            </div>
                        ) : error ? (
                            <ErrorDisplay
                                message={error || "Failed to load courses"}
                                onRetry={retryFetch}
                            />
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center text-gray-600 py-10 bg-white rounded-lg border border-gray-200">
                                <p className="mb-3">No courses match these filters.</p>
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    Reset filters
                                </button>
                            </div>
                        ) : (
                            <CourseGrid
                                items={filteredItems}
                                bookmarkedItems={bookmarkedItems}
                                onToggleBookmark={toggleBookmark}
                                promoCards={allowPromoCards ? promoCards : []}
                                onTagClick={handleTagFilter}
                            />
                        )}
                    </div>
                </div>
            </PageContainer>
            <Footer />

            {/* AI Widget */}
            <AIWidgetStandalone />
        </div>
    );
};

