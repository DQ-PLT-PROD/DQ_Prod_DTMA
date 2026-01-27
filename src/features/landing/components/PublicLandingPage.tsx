/**
 * Public Landing Page (Dev D - Feature D1)
 *
 * Implements the discovery entry point for DTMA MVP 1.0
 * - Consumes Course Catalog Service (frozen contract)
 * - Displays featured courses (isFeatured=true, isComingSoon=false)
 * - Provides skeleton loaders (FR3 fallback)
 * - Uses static instructor placeholder ("DTMA Academy")
 * - Unauthenticated access (no MSAL redirect)
 *
 * @see docs/DTMA_DevD_Technical_Audit.md
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { fetchCourses } from "@/services/courseService";
import { AIWidgetStandalone } from "@/lib/ai-widget";
import type { Course } from "@/types/dtma-lms";

interface FeaturedCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  categoryName: string;
  levelTag: string;
  audienceLevel: string;
  duration: string;
  lessonCount: number;
  thumbnailUrl?: string;
  heroImageUrl?: string;
}

/**
 * Skeleton loader for course cards (FR3 requirement)
 */
const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="w-full aspect-video bg-gray-200" />

    {/* Content skeleton */}
    <div className="p-5 space-y-3">
      {/* Category and level */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="h-5 w-full bg-gray-200 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
      </div>

      {/* Meta */}
      <div className="pt-3 border-t border-gray-100">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

/**
 * Featured course card component
 */
const FeaturedCourseCard: React.FC<{
  course: FeaturedCourse;
  onClick: () => void;
}> = ({ course, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden 
        cursor-pointer transition-all duration-300 h-full
        ${isHovered ? "shadow-xl transform scale-105" : "hover:shadow-lg"}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-[#1839AD]/15 mix-blend-multiply pointer-events-none" />
        {course.heroImageUrl || course.thumbnailUrl ? (
          <img
            src={course.heroImageUrl || course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <BookOpen className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Audience Level Badge */}
        {course.audienceLevel && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-purple-100">
              {course.audienceLevel}
            </span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category and Level */}
        <div className="flex items-center justify-between mb-2">
          {course.categoryName && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {course.categoryName}
            </span>
          )}
          {course.levelTag && (
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {course.levelTag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {course.shortDescription}
        </p>

        {/* Instructor (Static Placeholder) */}
        <div className="text-xs text-gray-500 mb-3">
          <span className="font-medium">Instructor:</span> DTMA Academy
        </div>

        {/* Meta Information */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>
              {course.lessonCount}{" "}
              {course.lessonCount === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Public Landing Page Component
 */
export const PublicLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
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
          .filter((course: any) => course.isFeatured && !course.isComingSoon)
          .slice(0, 6)
          .map((course: any) => ({
            id: course.id,
            slug: course.slug,
            title: course.title,
            shortDescription:
              course.description || course.shortDescription || "",
            categoryName: course.categoryName || course.category || "General",
            levelTag: course.levelTag || "Beginner",
            audienceLevel: course.audienceLevel || "Digital Workers",
            duration: formatDuration(
              course.durationMinutes || course.estimatedDurationMinutes || 0
            ),
            lessonCount: course.lessonCount || 0,
            thumbnailUrl: course.thumbnailUrl,
            heroImageUrl: course.heroImageUrl,
          }));

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

  // Helper to format duration
  const formatDuration = (minutes: number): string => {
    if (!minutes) return "Self-paced";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  // Navigate to course details
  const handleCourseClick = (slug: string) => {
    navigate(`/courses/${slug}`);
  };

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
                <CourseCardSkeleton key={i} />
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
                  <FeaturedCourseCard
                    key={course.slug}
                    course={course}
                    onClick={() => handleCourseClick(course.slug)}
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
      <AIWidgetStandalone />
    </>
  );
};

export default PublicLandingPage;
