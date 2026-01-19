/**
 * Recommendation Rail Component (Dev D - Feature D4)
 *
 * Horizontal scrolling rail of recommended courses with explanations
 * Uses EnhancedCourseCard from D2 for consistent CTA states and save functionality
 *
 * @see docs/DTMA_Jan29_DevD_Feature_Specs.md
 */

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Star,
} from "lucide-react";
import { useAuth } from "../../../components/Header";
import { fetchCourses } from "../../courses/services/courseService";
import { getProfile } from "../../learner/services/learnerProfileService";
import { EnhancedCourseCard } from "../../courses/components/EnhancedCourseCard";
import {
  generateRecommendations,
  getRecommendationExplanation,
  getReasonDisplayText,
  type CourseRecommendation,
  type RecommendationResult,
} from "../utils/recommendationEngine";
import type { Course } from "../../../types/dtma-lms";
import type { LearnerProfile } from "../../learner/services/learnerProfileService";

interface RecommendationRailProps {
  className?: string;
  maxRecommendations?: number;
  showTitle?: boolean;
  title?: string;
  onRecommendationClick?: (course: Course, reason: string) => void;
}

export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  className = "",
  maxRecommendations = 5,
  showTitle = true,
  title = "Recommended for You",
  onRecommendationClick,
}) => {
  const { user, databaseUser } = useAuth();
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load recommendations on mount and when user changes
  useEffect(() => {
    loadRecommendations();
  }, [databaseUser?.id, maxRecommendations]);

  // Update scroll button states
  useEffect(() => {
    updateScrollButtons();
  }, [recommendations]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all available courses
      const courses = await fetchCourses();

      // Get user profile if authenticated
      let profile: LearnerProfile | null = null;
      if (databaseUser?.azureUserId) {
        try {
          profile = await getProfile(databaseUser.azureUserId);
        } catch (profileError) {
          console.warn(
            "Could not load user profile, using fallback recommendations:",
            profileError
          );
        }
      }

      // Generate recommendations
      const result: RecommendationResult = generateRecommendations(
        courses,
        profile,
        maxRecommendations
      );

      setRecommendations(result.recommendations);

      // Analytics logging
      console.log("Recommendation Analytics:", {
        userId: databaseUser?.id || "anonymous",
        totalRecommendations: result.totalCount,
        roleBasedCount: result.reasonBreakdown.role,
        goalBasedCount: result.reasonBreakdown.goals,
        featuredCount: result.reasonBreakdown.featured,
        hasProfile: !!profile,
        roleTrack: profile?.roleTrack,
        goalCount: profile?.goals?.length || 0,
      });
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollBy({
      left: -320, // Width of one card plus gap
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollBy({
      left: 320, // Width of one card plus gap
      behavior: "smooth",
    });
  };

  const handleCourseClick = (recommendation: CourseRecommendation) => {
    if (onRecommendationClick) {
      onRecommendationClick(recommendation.course, recommendation.reason);
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "role":
        return <Target size={14} className="text-purple-600" />;
      case "goals":
        return <Sparkles size={14} className="text-blue-600" />;
      case "featured":
        return <Star size={14} className="text-amber-600" />;
      default:
        return <Sparkles size={14} className="text-gray-600" />;
    }
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case "role":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "goals":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "featured":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Don't render if no recommendations and not loading
  if (!loading && recommendations.length === 0 && !error) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {!loading && recommendations.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {recommendations.length} courses
              </span>
            )}
          </div>

          {/* Scroll Controls */}
          {recommendations.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full border transition-colors ${
                  canScrollLeft
                    ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`p-2 rounded-full border transition-colors ${
                  canScrollRight
                    ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex gap-6 overflow-hidden">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="flex-none w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-video bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Recommendations
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadRecommendations}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Rail */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            onScroll={updateScrollButtons}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.course.id} className="flex-none w-80">
                {/* Recommendation Reason Badge */}
                <div className="mb-3 flex items-center gap-2">
                  {getReasonIcon(recommendation.reason)}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getReasonBadgeColor(
                      recommendation.reason
                    )}`}
                  >
                    {recommendation.explanation}
                  </span>
                </div>

                {/* Enhanced Course Card */}
                <div onClick={() => handleCourseClick(recommendation)}>
                  <EnhancedCourseCard
                    course={{
                      id: recommendation.course.id,
                      slug: recommendation.course.slug,
                      title: recommendation.course.title,
                      shortDescription: recommendation.course.shortDescription,
                      categoryName: recommendation.course.categoryId, // Map as needed
                      levelTag: recommendation.course.levelTag,
                      audienceLevel: recommendation.course.audienceLevel,
                      duration: recommendation.course.estimatedDurationMinutes
                        ? `${Math.ceil(
                            recommendation.course.estimatedDurationMinutes / 60
                          )} hr`
                        : undefined,
                      durationMinutes:
                        recommendation.course.estimatedDurationMinutes,
                      lessonCount: recommendation.course.lessonCount,
                      thumbnailUrl: recommendation.course.thumbnailUrl,
                      heroImageUrl: recommendation.course.heroImageUrl,
                      isComingSoon: recommendation.course.isComingSoon,
                    }}
                    showSaveButton={true}
                    className="h-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fade Gradients for Scroll Indication */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          )}
        </div>
      )}

      {/* Empty State for Authenticated Users */}
      {!loading && !error && recommendations.length === 0 && user && (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              No Recommendations Yet
            </h3>
            <p className="text-blue-600 mb-4">
              Complete your profile to get personalized course recommendations
              based on your role and goals.
            </p>
            <button
              onClick={() => {
                // Navigate to profile completion
                window.location.href = "/portal/profile";
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationRail;
