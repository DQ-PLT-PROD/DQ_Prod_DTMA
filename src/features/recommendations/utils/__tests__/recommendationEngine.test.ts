/**
 * Recommendation Engine Tests (Dev D - Feature D4)
 *
 * Tests for rule-based recommendation system
 */

import { describe, it, expect } from "vitest";
import {
  generateRecommendations,
  getRecommendationExplanation,
  getReasonDisplayText,
  validateRecommendationInput,
  getRecommendationAnalytics,
} from "../recommendationEngine";
import type { Course } from "../../../../types/dtma-lms";
import type { LearnerProfile } from "../../../learner/services/learnerProfileService";

// Mock course data
const mockCourses: Course[] = [
  {
    id: "1",
    slug: "leadership-fundamentals",
    title: "Leadership Fundamentals",
    shortDescription: "Essential leadership skills for digital transformation",
    categoryId: "leadership",
    audienceLevel: "Digital Leaders",
    topicTags: ["leadership", "management", "strategy"],
    levelTag: "Beginner",
    estimatedDurationMinutes: 120,
    lessonCount: 8,
    status: "published",
    isFeatured: true,
    isComingSoon: false,
    rating: 4.5,
    reviewCount: 25,
  },
  {
    id: "2",
    slug: "digital-transformation-basics",
    title: "Digital Transformation Basics",
    shortDescription: "Understanding digital transformation principles",
    categoryId: "technology",
    audienceLevel: "Digital Workers",
    topicTags: ["digital-transformation", "technology", "innovation"],
    levelTag: "Beginner",
    estimatedDurationMinutes: 90,
    lessonCount: 6,
    status: "published",
    isFeatured: false,
    isComingSoon: false,
    rating: 4.2,
    reviewCount: 18,
  },
  {
    id: "3",
    slug: "advanced-strategy",
    title: "Advanced Strategic Planning",
    shortDescription: "Strategic planning for senior leaders",
    categoryId: "strategy",
    audienceLevel: "Digital Leaders",
    topicTags: ["strategy", "planning", "leadership"],
    levelTag: "Advanced",
    estimatedDurationMinutes: 180,
    lessonCount: 12,
    status: "published",
    isFeatured: true,
    isComingSoon: false,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: "4",
    slug: "security-fundamentals",
    title: "Cybersecurity Fundamentals",
    shortDescription: "Essential security practices for digital workers",
    categoryId: "security",
    audienceLevel: "Digital Workers",
    topicTags: ["security", "cybersecurity", "risk-management"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 150,
    lessonCount: 10,
    status: "published",
    isFeatured: false,
    isComingSoon: false,
    rating: 4.3,
    reviewCount: 31,
  },
  {
    id: "6",
    slug: "team-management-essentials",
    title: "Team Management Essentials",
    shortDescription: "Essential skills for managing teams effectively",
    categoryId: "management",
    audienceLevel: "Digital Workers", // Won't match leader role
    topicTags: ["team-management", "communication", "leadership"],
    levelTag: "Intermediate",
    estimatedDurationMinutes: 100,
    lessonCount: 7,
    status: "published",
    isFeatured: false,
    isComingSoon: false,
    rating: 4.1,
    reviewCount: 15,
  },
  {
    id: "5",
    slug: "coming-soon-course",
    title: "Future Course",
    shortDescription: "This course is coming soon",
    categoryId: "future",
    audienceLevel: "Digital Leaders",
    topicTags: ["future", "innovation"],
    levelTag: "Beginner",
    estimatedDurationMinutes: 60,
    lessonCount: 4,
    status: "published",
    isFeatured: true,
    isComingSoon: true, // Should be filtered out
    rating: 0,
    reviewCount: 0,
  },
];

// Mock learner profiles
const leaderProfile: LearnerProfile = {
  azureUserId: "leader-123",
  roleTrack: "leader",
  goals: ["leadership", "strategy", "team-management"],
  preferences: [],
  onboardingCompleted: true,
  onboardingCompletedAt: "2024-01-01T00:00:00Z",
};

const workerProfile: LearnerProfile = {
  azureUserId: "worker-456",
  roleTrack: "digital_worker",
  goals: ["security", "technology", "skills-development"],
  preferences: [],
  onboardingCompleted: true,
  onboardingCompletedAt: "2024-01-01T00:00:00Z",
};

const noGoalsProfile: LearnerProfile = {
  azureUserId: "no-goals-789",
  roleTrack: "leader",
  goals: [],
  preferences: [],
  onboardingCompleted: false,
  onboardingCompletedAt: null,
};

describe("recommendationEngine", () => {
  describe("generateRecommendations", () => {
    it("should return role-based recommendations for leader profile", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 5);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.reasonBreakdown.role).toBeGreaterThan(0);

      // Should prioritize courses for Digital Leaders
      const roleRecs = result.recommendations.filter(
        (r) => r.reason === "role"
      );
      expect(roleRecs.length).toBeGreaterThan(0);

      roleRecs.forEach((rec) => {
        expect(rec.course.audienceLevel).toContain("Leaders");
        expect(rec.explanation).toBe("Based on your role");
      });
    });

    it("should return role-based recommendations for digital worker profile", () => {
      const result = generateRecommendations(mockCourses, workerProfile, 5);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.reasonBreakdown.role).toBeGreaterThan(0);

      // Should prioritize courses for Digital Workers
      const roleRecs = result.recommendations.filter(
        (r) => r.reason === "role"
      );
      expect(roleRecs.length).toBeGreaterThan(0);

      roleRecs.forEach((rec) => {
        expect(rec.course.audienceLevel).toContain("Workers");
        expect(rec.explanation).toBe("Based on your role");
      });
    });

    it("should return goal-based recommendations", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 5);

      // Should include goal-based recommendations
      const goalRecs = result.recommendations.filter(
        (r) => r.reason === "goals"
      );
      expect(goalRecs.length).toBeGreaterThan(0);

      goalRecs.forEach((rec) => {
        expect(rec.explanation).toBe("Based on your goals");

        // Should match at least one goal
        const hasMatchingGoal = leaderProfile.goals.some(
          (goal) =>
            rec.course.topicTags?.some(
              (tag) =>
                tag.toLowerCase().includes(goal.toLowerCase()) ||
                goal.toLowerCase().includes(tag.toLowerCase())
            ) ||
            rec.course.title.toLowerCase().includes(goal.toLowerCase()) ||
            rec.course.shortDescription
              .toLowerCase()
              .includes(goal.toLowerCase())
        );
        expect(hasMatchingGoal).toBe(true);
      });
    });

    it("should return featured recommendations as fallback", () => {
      const result = generateRecommendations(mockCourses, null, 5);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.reasonBreakdown.featured).toBeGreaterThan(0);

      // All recommendations should be featured (fallback for unauthenticated)
      result.recommendations.forEach((rec) => {
        expect(rec.reason).toBe("featured");
        expect(rec.explanation).toBe("Featured for you");
        expect(rec.course.isFeatured).toBe(true);
      });
    });

    it("should respect maxRecommendations limit", () => {
      const maxRecs = 2;
      const result = generateRecommendations(
        mockCourses,
        leaderProfile,
        maxRecs
      );

      expect(result.recommendations.length).toBeLessThanOrEqual(maxRecs);
      expect(result.totalCount).toBeLessThanOrEqual(maxRecs);
    });

    it("should filter out coming soon courses", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 10);

      // Should not include coming soon courses
      result.recommendations.forEach((rec) => {
        expect(rec.course.isComingSoon).toBe(false);
      });
    });

    it("should not duplicate courses across recommendation types", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 10);

      const courseIds = result.recommendations.map((r) => r.course.id);
      const uniqueIds = new Set(courseIds);

      expect(courseIds.length).toBe(uniqueIds.size);
    });

    it("should prioritize recommendations correctly (role > goals > featured)", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 10);

      let lastPriority = 4; // Start with max priority + 1
      result.recommendations.forEach((rec, index) => {
        let currentPriority = 0;
        if (rec.reason === "role") currentPriority = 3;
        else if (rec.reason === "goals") currentPriority = 2;
        else if (rec.reason === "featured") currentPriority = 1;

        expect(currentPriority).toBeLessThanOrEqual(lastPriority);
        lastPriority = currentPriority;
      });
    });

    it("should handle profile with no goals", () => {
      const result = generateRecommendations(mockCourses, noGoalsProfile, 5);

      expect(result.recommendations.length).toBeGreaterThan(0);

      // Should have role-based and featured, but no goal-based
      expect(result.reasonBreakdown.goals).toBe(0);
      expect(
        result.reasonBreakdown.role + result.reasonBreakdown.featured
      ).toBeGreaterThan(0);
    });

    it("should handle empty course list", () => {
      const result = generateRecommendations([], leaderProfile, 5);

      expect(result.recommendations.length).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.reasonBreakdown.role).toBe(0);
      expect(result.reasonBreakdown.goals).toBe(0);
      expect(result.reasonBreakdown.featured).toBe(0);
    });
  });

  describe("getRecommendationExplanation", () => {
    it("should return correct explanations for each reason", () => {
      expect(getRecommendationExplanation("role")).toBe("Based on your role");
      expect(getRecommendationExplanation("goals")).toBe("Based on your goals");
      expect(getRecommendationExplanation("featured")).toBe("Featured for you");
    });
  });

  describe("getReasonDisplayText", () => {
    it("should return correct display text for each reason", () => {
      expect(getReasonDisplayText("role")).toBe("Role Match");
      expect(getReasonDisplayText("goals")).toBe("Goal Match");
      expect(getReasonDisplayText("featured")).toBe("Featured");
    });
  });

  describe("validateRecommendationInput", () => {
    it("should validate correct input", () => {
      const result = validateRecommendationInput(mockCourses, 5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-array courses", () => {
      const result = validateRecommendationInput(null as any, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Courses must be an array");
    });

    it("should reject invalid maxRecommendations", () => {
      let result = validateRecommendationInput(mockCourses, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Max recommendations must be between 1 and 20");

      result = validateRecommendationInput(mockCourses, 25);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Max recommendations must be between 1 and 20");
    });
  });

  describe("getRecommendationAnalytics", () => {
    it("should calculate analytics correctly", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 5);
      const analytics = getRecommendationAnalytics(result);

      expect(analytics.totalRecommendations).toBe(result.totalCount);
      expect(analytics.roleBasedCount).toBe(result.reasonBreakdown.role);
      expect(analytics.goalBasedCount).toBe(result.reasonBreakdown.goals);
      expect(analytics.featuredCount).toBe(result.reasonBreakdown.featured);

      expect(analytics.personalizationRate).toBeGreaterThanOrEqual(0);
      expect(analytics.personalizationRate).toBeLessThanOrEqual(1);
    });

    it("should handle zero recommendations", () => {
      const emptyResult = {
        recommendations: [],
        totalCount: 0,
        reasonBreakdown: { role: 0, goals: 0, featured: 0 },
      };

      const analytics = getRecommendationAnalytics(emptyResult);
      expect(analytics.personalizationRate).toBe(0);
    });
  });

  describe("performance requirements", () => {
    it("should generate recommendations quickly", () => {
      const start = performance.now();

      // Generate multiple recommendation sets
      for (let i = 0; i < 10; i++) {
        generateRecommendations(mockCourses, leaderProfile, 5);
      }

      const end = performance.now();
      const duration = end - start;

      // Should be very fast for client-side execution
      expect(duration).toBeLessThan(100); // 100ms for 10 generations
    });
  });

  describe("rule transparency", () => {
    it("should provide clear explanations for all recommendations", () => {
      const result = generateRecommendations(mockCourses, leaderProfile, 10);

      result.recommendations.forEach((rec) => {
        expect(rec.explanation).toBeTruthy();
        expect(typeof rec.explanation).toBe("string");
        expect(rec.explanation.length).toBeGreaterThan(0);

        // Should match expected explanation patterns
        const validExplanations = [
          "Based on your role",
          "Based on your goals",
          "Featured for you",
        ];
        expect(validExplanations).toContain(rec.explanation);
      });
    });

    it("should have deterministic results for same input", () => {
      const result1 = generateRecommendations(mockCourses, leaderProfile, 5);
      const result2 = generateRecommendations(mockCourses, leaderProfile, 5);

      // Should return same recommendations in same order
      expect(result1.recommendations.length).toBe(
        result2.recommendations.length
      );

      for (let i = 0; i < result1.recommendations.length; i++) {
        expect(result1.recommendations[i].course.id).toBe(
          result2.recommendations[i].course.id
        );
        expect(result1.recommendations[i].reason).toBe(
          result2.recommendations[i].reason
        );
      }
    });
  });
});
