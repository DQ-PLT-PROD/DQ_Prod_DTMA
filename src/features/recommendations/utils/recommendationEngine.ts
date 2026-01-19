/**
 * Recommendation Engine (Dev D - Feature D4)
 *
 * Rule-based recommendation system using thin profile signals
 * Implements prioritized composite strategy with transparent logic
 *
 * @see docs/DTMA_Jan29_DevD_Feature_Specs.md
 */

import type { Course } from "../../../types/dtma-lms";
import type { LearnerProfile } from "../../learner/services/learnerProfileService";

export type RecommendationReason = "role" | "goals" | "featured";

export interface CourseRecommendation {
  course: Course;
  reason: RecommendationReason;
  explanation: string;
  score: number; // For sorting within same reason
}

export interface RecommendationResult {
  recommendations: CourseRecommendation[];
  totalCount: number;
  reasonBreakdown: {
    role: number;
    goals: number;
    featured: number;
  };
}

/**
 * Role track to audience level mapping
 * Maps user's role_track to course audience_level
 */
const ROLE_AUDIENCE_MAPPING: Record<string, string[]> = {
  leader: ["Digital Leaders", "Leadership", "Management"],
  digital_worker: ["Digital Workers", "Technical", "Individual Contributors"],
};

/**
 * Generate course recommendations using prioritized composite strategy
 *
 * Priority 1: Role-Based matching (role_track → audience_level)
 * Priority 2: Goal-Based matching (goals → topic_tags)
 * Priority 3: Fallback (is_featured = true)
 *
 * @param courses - Available courses to recommend from
 * @param profile - User's learner profile (null for unauthenticated)
 * @param maxRecommendations - Maximum number of recommendations to return
 * @returns Recommendation result with explanations
 */
export function generateRecommendations(
  courses: Course[],
  profile: LearnerProfile | null,
  maxRecommendations: number = 5
): RecommendationResult {
  const recommendations: CourseRecommendation[] = [];
  const usedCourseIds = new Set<string>();

  const reasonBreakdown = {
    role: 0,
    goals: 0,
    featured: 0,
  };

  // Only process published, non-coming-soon courses
  const availableCourses = courses.filter(
    (course) => course.status !== "draft" && !course.isComingSoon
  );

  // Calculate allocation for balanced recommendations
  const hasRole = profile?.roleTrack;
  const hasGoals = profile?.goals && profile.goals.length > 0;

  let roleLimit = maxRecommendations;
  let goalLimit = maxRecommendations;

  // If both role and goals exist, allocate slots more evenly
  if (hasRole && hasGoals) {
    roleLimit = Math.ceil(maxRecommendations * 0.6); // 60% for role
    goalLimit = Math.ceil(maxRecommendations * 0.4); // 40% for goals
  }

  // Priority 1: Role-Based Recommendations
  if (hasRole) {
    const roleRecommendations = getRoleBasedRecommendations(
      availableCourses,
      profile.roleTrack!,
      roleLimit
    );

    for (const rec of roleRecommendations) {
      if (recommendations.length >= maxRecommendations) break;
      if (!usedCourseIds.has(rec.course.id)) {
        recommendations.push(rec);
        usedCourseIds.add(rec.course.id);
        reasonBreakdown.role++;
      }
    }
  }

  // Priority 2: Goal-Based Recommendations
  if (hasGoals && recommendations.length < maxRecommendations) {
    const goalRecommendations = getGoalBasedRecommendations(
      availableCourses,
      profile.goals!,
      Math.min(goalLimit, maxRecommendations - recommendations.length)
    );

    for (const rec of goalRecommendations) {
      if (recommendations.length >= maxRecommendations) break;
      if (!usedCourseIds.has(rec.course.id)) {
        recommendations.push(rec);
        usedCourseIds.add(rec.course.id);
        reasonBreakdown.goals++;
      }
    }
  }

  // Priority 3: Fallback - Featured Courses
  if (recommendations.length < maxRecommendations) {
    const featuredRecommendations = getFeaturedRecommendations(
      availableCourses,
      maxRecommendations - recommendations.length
    );

    for (const rec of featuredRecommendations) {
      if (recommendations.length >= maxRecommendations) break;
      if (!usedCourseIds.has(rec.course.id)) {
        recommendations.push(rec);
        usedCourseIds.add(rec.course.id);
        reasonBreakdown.featured++;
      }
    }
  }

  return {
    recommendations,
    totalCount: recommendations.length,
    reasonBreakdown,
  };
}

/**
 * Get role-based recommendations
 * Matches user's role_track to course audience_level
 */
function getRoleBasedRecommendations(
  courses: Course[],
  roleTrack: string,
  maxCount: number
): CourseRecommendation[] {
  const targetAudiences = ROLE_AUDIENCE_MAPPING[roleTrack] || [];

  if (targetAudiences.length === 0) {
    return [];
  }

  const matchingCourses = courses.filter((course) => {
    if (!course.audienceLevel) return false;

    // Check for exact match or partial match
    return targetAudiences.some(
      (audience) =>
        course.audienceLevel?.toLowerCase().includes(audience.toLowerCase()) ||
        audience
          .toLowerCase()
          .includes(course.audienceLevel?.toLowerCase() || "")
    );
  });

  // Sort by rating and featured status
  const sortedCourses = matchingCourses.sort((a, b) => {
    // Featured courses first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;

    // Then by rating
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    // Then by review count
    const reviewsA = a.reviewCount || 0;
    const reviewsB = b.reviewCount || 0;
    return reviewsB - reviewsA;
  });

  return sortedCourses.slice(0, maxCount).map((course, index) => ({
    course,
    reason: "role" as RecommendationReason,
    explanation: "Based on your role",
    score: 100 - index, // Higher score for better ranking
  }));
}

/**
 * Get goal-based recommendations
 * Matches user's goals array against course topic_tags
 */
function getGoalBasedRecommendations(
  courses: Course[],
  goals: string[],
  maxCount: number
): CourseRecommendation[] {
  const goalKeywords = goals.map((goal) => goal.toLowerCase());

  const scoredCourses = courses.map((course) => {
    let matchScore = 0;
    const matchedGoals: string[] = [];

    // Check topic tags
    if (course.topicTags && course.topicTags.length > 0) {
      for (const tag of course.topicTags) {
        const tagLower = tag.toLowerCase();
        for (const goal of goalKeywords) {
          if (tagLower.includes(goal) || goal.includes(tagLower)) {
            matchScore += 2; // Higher weight for topic tag matches
            if (!matchedGoals.includes(goal)) {
              matchedGoals.push(goal);
            }
          }
        }
      }
    }

    // Check title and description for goal keywords
    const titleLower = course.title.toLowerCase();
    const descLower = (course.shortDescription || "").toLowerCase();

    for (const goal of goalKeywords) {
      if (titleLower.includes(goal)) {
        matchScore += 1.5;
        if (!matchedGoals.includes(goal)) {
          matchedGoals.push(goal);
        }
      }
      if (descLower.includes(goal)) {
        matchScore += 1;
        if (!matchedGoals.includes(goal)) {
          matchedGoals.push(goal);
        }
      }
    }

    return {
      course,
      matchScore,
      matchedGoals,
    };
  });

  // Filter courses with matches and sort by score
  const matchingCourses = scoredCourses
    .filter((item) => item.matchScore > 0)
    .sort((a, b) => {
      // Sort by match score first
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }

      // Then by featured status
      if (a.course.isFeatured && !b.course.isFeatured) return -1;
      if (!a.course.isFeatured && b.course.isFeatured) return 1;

      // Then by rating
      const ratingA = a.course.rating || 0;
      const ratingB = b.course.rating || 0;
      return ratingB - ratingA;
    });

  return matchingCourses.slice(0, maxCount * 2).map((item, index) => ({
    course: item.course,
    reason: "goals" as RecommendationReason,
    explanation: "Based on your goals",
    score: item.matchScore,
  }));
}

/**
 * Get featured course recommendations (fallback)
 * Returns courses where is_featured = true
 */
function getFeaturedRecommendations(
  courses: Course[],
  maxCount: number
): CourseRecommendation[] {
  const featuredCourses = courses.filter((course) => course.isFeatured);

  // Sort by rating and review count
  const sortedCourses = featuredCourses.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    const reviewsA = a.reviewCount || 0;
    const reviewsB = b.reviewCount || 0;
    return reviewsB - reviewsA;
  });

  return sortedCourses.slice(0, maxCount).map((course, index) => ({
    course,
    reason: "featured" as RecommendationReason,
    explanation: "Featured for you",
    score: 50 - index, // Lower base score than personalized recommendations
  }));
}

/**
 * Get explanation text for recommendation reason
 */
export function getRecommendationExplanation(
  reason: RecommendationReason
): string {
  switch (reason) {
    case "role":
      return "Based on your role";
    case "goals":
      return "Based on your goals";
    case "featured":
      return "Featured for you";
    default:
      return "Recommended for you";
  }
}

/**
 * Get recommendation reason display text
 */
export function getReasonDisplayText(reason: RecommendationReason): string {
  switch (reason) {
    case "role":
      return "Role Match";
    case "goals":
      return "Goal Match";
    case "featured":
      return "Featured";
    default:
      return "Recommended";
  }
}

/**
 * Validate recommendation input
 */
export function validateRecommendationInput(
  courses: Course[],
  maxRecommendations: number
): { isValid: boolean; error?: string } {
  if (!Array.isArray(courses)) {
    return { isValid: false, error: "Courses must be an array" };
  }

  if (maxRecommendations < 1 || maxRecommendations > 20) {
    return {
      isValid: false,
      error: "Max recommendations must be between 1 and 20",
    };
  }

  return { isValid: true };
}

/**
 * Get recommendation analytics data
 */
export function getRecommendationAnalytics(result: RecommendationResult) {
  return {
    totalRecommendations: result.totalCount,
    roleBasedCount: result.reasonBreakdown.role,
    goalBasedCount: result.reasonBreakdown.goals,
    featuredCount: result.reasonBreakdown.featured,
    personalizationRate:
      result.totalCount > 0
        ? (result.reasonBreakdown.role + result.reasonBreakdown.goals) /
          result.totalCount
        : 0,
  };
}
