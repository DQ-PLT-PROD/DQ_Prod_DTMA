import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Component,
} from "react";
/**
 * LEGACY: Standalone course catalog UI (not routed).
 *
 * The active course marketplace is served by MarketplacePage with
 * `marketplaceType="courses"` under `/marketplace/courses`. Keep this
 * component for reference only; do not build new features here.
 *
 * This component serves as the main page for browsing and filtering courses.
 * It includes search functionality, filtering options, and a grid display of courses.
 * Users can bookmark courses, add them to comparison, and navigate to course details.
 *
 * Features:
 * - Search for courses by title, description, or provider
 * - Filter courses by category, delivery mode, duration, business stage, and provider
 * - Bookmark courses for later reference
 * - Add courses to comparison for side-by-side evaluation
 * - Responsive design for mobile and desktop
 */

import { FilterSidebar } from "./FilterSidebar";
import { CourseGrid } from "./CourseGrid";
import { SearchBar } from "./SearchBar";
import {
  FilterIcon,
  XIcon,
  BookmarkIcon,
  Share2Icon,
  HomeIcon,
  ChevronRightIcon,
} from "lucide-react";
import { RelatedCourses } from "./RelatedCourses";
import { CourseCardSkeleton, ErrorDisplay } from "./SkeletonLoader";
import { useNavigate } from "react-router-dom";
import { fetchCourses, fetchFilterOptions } from "../services/courses";
import {
  toggleCourseBookmark,
} from "../services/mutations";
import { CourseType, ProviderType, CourseFilters } from "../types/course";
/**
 * CourseMarketplace Component
 *
 * @returns A complete course marketplace interface with search, filters, and course listings
 */
export const CourseMarketplace: React.FC = () => {
  const navigate = useNavigate();
  // State for courses and filtering
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CourseFilters>({
    category: "",
    deliveryMode: "",
    duration: "",
    businessStage: "",
    provider: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);

  // State for filter options
  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [deliveryModes, setDeliveryModes] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [businessStages, setBusinessStages] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [providers, setProviders] = useState<ProviderType[]>([]);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetches filter options for the sidebar
   */
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await fetchFilterOptions();
        setCategories(options.categories);
        setDeliveryModes(options.deliveryModes);
        setBusinessStages(options.businessStages);
        setProviders(options.providers);
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setError("Failed to load filter options");
      }
    };
    loadFilterOptions();
  }, []);
  /**
   * Fetches courses based on applied filters and search query
   */
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseData = await fetchCourses(filters, searchQuery);
        setCourses(courseData);
        setFilteredCourses(courseData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
        setLoading(false);
      }
    };
    loadCourses();
  }, [searchQuery, filters]);
  /**
   * Handles changes to filter values
   *
   * @param filterType - The type of filter being changed
   * @param value - The new value for the filter
   */
  const handleFilterChange = useCallback(
    (filterType: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        //@ts-ignore
        [filterType]: value === prev[filterType] ? "" : value,
      }));
    },
    []
  );
  /**
   * Resets all applied filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      deliveryMode: "",
      duration: "",
      businessStage: "",
      provider: "",
    });
    setSearchQuery("");
  }, []);
  /**
   * Toggles the visibility of the filter sidebar on mobile
   */
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);
  /**
   * Toggles the bookmark status of a course
   *
   * @param courseId - The ID of the course to bookmark/unbookmark
   */
  const toggleBookmark = useCallback((courseId: string) => {
    // Optimistic UI update
    setBookmarkedCourses((prev) => {
      const isCurrentlyBookmarked = prev.includes(courseId);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      // Call the mutation service (async)
      toggleCourseBookmark(
        courseId,
        "current-user-id",
        isCurrentlyBookmarked
      ).catch((error) => {
        // Rollback on error
        console.error("Error toggling bookmark:", error);
        setBookmarkedCourses(prev);
        // Could show an error toast here
      });
      return newBookmarks;
    });
  }, []);
  /**
   * Adds a course to the comparison list
   *
   * @param course - The course to add to comparison
   */

  /**
   * Removes a course from the comparison list
   *
   * @param courseId - The ID of the course to remove from comparison
   */

  /**
   * Filters courses based on a predefined status
   *
   * @param filterId - The ID of the filter to apply
   */
  const handleFilterByStatus = useCallback(
    (filterId: string | null) => {
      if (filterId === "all") {
        resetFilters();
      } else if (filterId === "online") {
        setFilters((prev) => ({
          ...prev,
          deliveryMode: "Online",
        }));
      } else if (filterId === "inperson") {
        setFilters((prev) => ({
          ...prev,
          deliveryMode: "In-person",
        }));
      } else if (filterId === "bookmarked") {
        // Filter to show only bookmarked courses
        const bookmarked = courses.filter((course) =>
          bookmarkedCourses.includes(course.id)
        );
        setFilteredCourses(bookmarked);
      }
    },
    [courses, bookmarkedCourses, resetFilters]
  );
  /**
   * Retries fetching courses after an error
   */
  const retryFetchCourses = useCallback(() => {
    // Reset error state and trigger a re-fetch by changing dependencies
    setError(null);
    // Force re-fetch by toggling any filter
    setFilters((prev) => ({
      ...prev,
    }));
  }, []);
  // Memoize the filtered categories list for better performance
  const categoryNames = useMemo(
    () => categories.map((c) => c.name),
    [categories]
  );
  const deliveryModeNames = useMemo(
    () => deliveryModes.map((d) => d.name),
    [deliveryModes]
  );
  const businessStageNames = useMemo(
    () => businessStages.map((b) => b.name),
    [businessStages]
  );
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <HomeIcon size={16} className="mr-1" />
              <span>Home</span>
            </a>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRightIcon size={16} className="text-gray-400" />
              <span className="ml-1 text-gray-500 md:ml-2">Courses</span>
            </div>
          </li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Course Marketplace
      </h1>
      <p className="text-gray-600 mb-6">
        Discover and enroll in courses tailored for SMEs to help grow your
        business
      </p>
      <div className="mb-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Mobile filter toggle - improved for better visibility and sticky position */}
        <div className="xl:hidden sticky top-0 z-20 bg-gray-50 py-2 shadow-sm">
          <div className="flex justify-between items-center">
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 w-full justify-center"
              aria-expanded={showFilters}
              aria-controls="filter-sidebar"
            >
              <FilterIcon size={18} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {Object.values(filters).some((f) => f !== "") && (
              <button
                onClick={resetFilters}
                className="ml-2 text-blue-600 text-sm font-medium whitespace-nowrap px-3 py-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        {/* Filter sidebar - mobile/tablet with improved transition */}
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 xl:hidden ${showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          onClick={toggleFilters}
          aria-hidden={!showFilters}
        >
          <div
            id="filter-sidebar"
            className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${showFilters ? "translate-x-0" : "-translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Course filters"
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
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  isResponsive={true}
                  categories={categoryNames}
                  deliveryModes={deliveryModeNames}
                  businessStages={businessStageNames}
                  providers={providers}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Filter sidebar - desktop with sticky positioning */}
        <div className="hidden xl:block xl:w-1/4">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {Object.values(filters).some((f) => f !== "") && (
                <button
                  onClick={resetFilters}
                  className="text-blue-600 text-sm font-medium"
                >
                  Reset All
                </button>
              )}
            </div>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
              isResponsive={false}
              categories={categoryNames}
              deliveryModes={deliveryModeNames}
              businessStages={businessStageNames}
              providers={providers}
            />
          </div>
        </div>
        {/* Main content */}
        <div className="xl:w-3/4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[...Array(6)].map((_, idx) => (
                <CourseCardSkeleton key={idx} />
              ))}
              {/** @ts-ignore */}
            </div>
          ) : error ? (
            <ErrorDisplay message={error} onRetry={retryFetchCourses} />
          ) : (
            <CourseGrid
              courses={filteredCourses}
              onCourseSelect={(course) => navigate(`/courses/${course.id}`)}
              bookmarkedCourses={bookmarkedCourses}
              onToggleBookmark={toggleBookmark}

            />
          )}
        </div>
      </div>

    </div>
  );
};
// Export the component as default for easier importing
export default CourseMarketplace;
