/**
 * Tests for Public Landing Page (Dev D - Feature D1)
 *
 * Validates:
 * - FR1: Course listing from catalog service
 * - FR2: Navigation to course details and catalog
 * - FR3: Loading skeletons and empty states
 * - Featured course filtering (isFeatured=true)
 * - Limit to 6 courses
 * - Passing correct props to EnhancedCourseCard
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PublicLandingPage } from "../components/PublicLandingPage";
import * as courseService from "../../../services/courseService";

// Mock the course service
vi.mock("../../../services/courseService");
const mockFetchCourses = vi.mocked(courseService.fetchCourses);

// Mock the CourseCard to isolate tests and verify props
vi.mock("@/features/courses/components/CourseCard", () => ({
  CourseCard: ({ course }: { course: any }) => (
    <div data-testid="course-card">
      <span data-testid="course-title">{course.title}</span>
      <span data-testid="course-video-url">{course.introVideoUrl || "no-video"}</span>
      <span data-testid="course-duration">{course.duration}</span>
    </div>
  ),
}));

// Mock course data
const mockCourses = [
  {
    id: "1",
    slug: "digital-transformation-101",
    title: "Digital Transformation 101",
    shortDescription: "Learn the fundamentals of digital transformation",
    categoryName: "Leadership",
    levelTag: "Beginner",
    audienceLevel: "Digital Leaders",
    estimatedDurationMinutes: 120,
    lessonCount: 8,
    isFeatured: true,
    isComingSoon: false,
    heroImageUrl: "/images/course1.jpg",
    introVideoUrl: "https://example.com/video1.mp4",
  },
  {
    id: "2",
    slug: "ai-fundamentals",
    title: "AI Fundamentals",
    shortDescription: "Introduction to artificial intelligence",
    categoryName: "Technology",
    levelTag: "Intermediate",
    audienceLevel: "Digital Workers",
    estimatedDurationMinutes: 90,
    lessonCount: 6,
    isFeatured: true,
    isComingSoon: false,
  },
  {
    id: "3",
    slug: "coming-soon-course",
    title: "Coming Soon Course",
    shortDescription: "This course is coming soon",
    categoryName: "General",
    levelTag: "Beginner",
    audienceLevel: "Digital Workers",
    estimatedDurationMinutes: 60,
    lessonCount: 4,
    isFeatured: true,
    isComingSoon: true, // Should be filtered out
  },
  {
    id: "4",
    slug: "not-featured-course",
    title: "Not Featured Course",
    shortDescription: "This course is not featured",
    categoryName: "General",
    levelTag: "Beginner",
    audienceLevel: "Digital Workers",
    estimatedDurationMinutes: 60,
    lessonCount: 4,
    isFeatured: false, // Should be filtered out
    isComingSoon: false,
  },
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <PublicLandingPage />
    </BrowserRouter>
  );
};

describe("PublicLandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("FR1: Course Listing", () => {
    it("should fetch and display published featured courses", async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Digital Transformation 101")).toBeInTheDocument();
        expect(screen.getByText("AI Fundamentals")).toBeInTheDocument();
      });
    });

    it("should filter for featured courses only (isFeatured=true)", async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Digital Transformation 101")).toBeInTheDocument();
        expect(screen.queryByText("Not Featured Course")).not.toBeInTheDocument();
      });
    });

    it("should include coming soon courses", async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Digital Transformation 101")).toBeInTheDocument();
        expect(screen.getByText("Coming Soon Course")).toBeInTheDocument();
      });
    });

    it("should limit display to 6 courses", async () => {
      const manyCourses = Array.from({ length: 10 }, (_, i) => ({
        ...mockCourses[0],
        id: `course-${i}`,
        slug: `course-${i}`,
        title: `Course ${i}`,
        isFeatured: true,
        isComingSoon: false,
      }));

      mockFetchCourses.mockResolvedValue(manyCourses);

      renderComponent();

      await waitFor(() => {
        const courseCards = screen.getAllByTestId("course-card");
        expect(courseCards.length).toBeLessThanOrEqual(6);
      });
    });

    it("should pass introVideoUrl to card component", async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        const videoUrl = screen.getByText("https://example.com/video1.mp4");
        expect(videoUrl).toBeInTheDocument();
      });
    });
  });

  describe("FR2: Navigation", () => {
    it('should display "Browse All Courses" CTA', async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Browse All Courses")).toBeInTheDocument();
      });
    });

    it('should display "Get Started" CTA', async () => {
      mockFetchCourses.mockResolvedValue(mockCourses);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Get Started")).toBeInTheDocument();
      });
    });
  });

  describe("FR3: Fallbacks", () => {
    it("should show loading skeletons while fetching", () => {
      mockFetchCourses.mockImplementation(() => new Promise(() => { })); // Never resolves

      renderComponent();

      // Should show 6 skeleton loaders (looking for container with animate-pulse)
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should show empty state when no courses exist", async () => {
      mockFetchCourses.mockResolvedValue([]);

      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText("No Featured Courses Available")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Check back soon for new courses!")
        ).toBeInTheDocument();
      });
    });

    it("should show error state on fetch failure", async () => {
      mockFetchCourses.mockRejectedValue(new Error("Network error"));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Unable to Load Courses")).toBeInTheDocument();
        expect(screen.getByText(/Failed to load courses/)).toBeInTheDocument();
      });
    });
  });
});
