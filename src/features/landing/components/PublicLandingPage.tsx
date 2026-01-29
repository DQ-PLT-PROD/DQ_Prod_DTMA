/**
 * Public Landing Page (Dev D - Feature D1)
 *
 * Implements the discovery entry point for DTMA MVP 1.0
 * - Consumes Course Catalog Service (frozen contract)
 * - Displays featured courses (isFeatured=true)
 * - Provides skeleton loaders (FR3 fallback)
 * - Uses static instructor placeholder ("DTMA Academy")
 * - Unauthenticated access (no MSAL redirect)
 *
 * @see docs/DTMA_DevD_Technical_Audit.md
 */


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { fetchCourses } from "@/services/courseService";
import { CourseCard } from "@/features/courses/components/CourseCard";

/**
 * Main Public Landing Page Component
 */
export const PublicLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured courses on mount
  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all published courses from catalog service
        const allCourses = await fetchCourses();

        // Filter for featured courses (isFeatured=true, isComingSoon=false)
        // Limit to top 6 as per spec
        const featured = allCourses
          .filter((course: any) => course.isFeatured)
          .slice(0, 6);

        setFeaturedCourses(featured);
      } catch (err) {
        console.error("Error loading featured courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCourses();
  }, []);



  // Navigate to full catalog
  const handleBrowseAll = () => {
    navigate("/courses");
  };

  // Navigate to sign in
  const handleGetStarted = () => {
    navigate("/courses");
  };

  return (
    <>
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#030C2B] mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600">
              Discover our flagship courses designed to accelerate your digital
              transformation journey
            </p>
          </div>

          {/* Loading State (FR3 Requirement) */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="w-full aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 w-full bg-gray-200 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-5/6 bg-gray-200 rounded" />
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State (FR3 Requirement) */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Courses
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State (FR3 Requirement) */}
          {!loading && !error && featuredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Featured Courses Available
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for new courses!
              </p>
              <button
                onClick={handleBrowseAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                Browse All Courses
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Course Grid */}
          {!loading && !error && featuredCourses.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                {featuredCourses.map((course) => (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    showSaveButton={false}
                  />
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleBrowseAll}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2 shadow-sm"
                >
                  Browse All Courses
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Get Started
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* AI Widget */}
      {/* <AIWidgetStandalone /> */}
    </>
  );
};

export default PublicLandingPage;
