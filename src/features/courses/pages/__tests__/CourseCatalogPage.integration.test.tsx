/**
 * Integration Tests for Course Catalog Page (D2)
 * Tests URL synchronization, filtering, and enhanced course cards
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { CourseCatalogPage } from "../CourseCatalogPage";

// Mock MSAL config before other imports
vi.mock("@/lib/auth/msal", () => ({
  msalConfig: {
    auth: {
      clientId: "test-client-id",
      authority: "https://login.microsoftonline.com/test",
      redirectUri: "http://localhost:3000",
    },
  },
  loginRequest: {
    scopes: ["User.Read"],
  },
}));

// Mock services
vi.mock("@/services/courseService", () => ({
  fetchCourses: vi.fn(() =>
    Promise.resolve([
      {
        id: "1",
        slug: "test-course-1",
        title: "Test Course 1",
        description: "Test description 1",
        shortDescription: "Short desc 1",
        categoryName: "Leadership",
        levelTag: "Beginner",
        audienceLevel: "Digital Leaders",
        duration: "2 hours",
        lessonCount: 5,
        isComingSoon: false,
      },
      {
        id: "2",
        slug: "test-course-2",
        title: "Test Course 2",
        description: "Test description 2",
        shortDescription: "Short desc 2",
        categoryName: "Technology",
        levelTag: "Advanced",
        audienceLevel: "Tech Professionals",
        duration: "3 hours",
        lessonCount: 8,
        isComingSoon: true,
      },
    ])
  ),
  fetchPublishedCoursesForNav: vi.fn(() =>
    Promise.resolve([
      { slug: "test-course-1", title: "Test Course 1", shortDescription: "Short desc 1" },
      { slug: "test-course-2", title: "Test Course 2", shortDescription: "Short desc 2" },
    ])
  ),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: null,
    databaseUser: null,
    login: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: any }) => children,
}));

vi.mock("../../../../components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("../../../../components/Footer", () => ({
  Footer: () => <div>Footer</div>,
}));

describe("CourseCatalogPage Integration (D2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render course catalog with enhanced course cards", async () => {
    render(
      <BrowserRouter>
        <CourseCatalogPage />
      </BrowserRouter>
    );

    // Wait for courses to load
    await waitFor(
      () => {
        expect(screen.getByText("Test Course 1")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Test Course 2")).toBeInTheDocument();
  });

  it("should parse filters from URL on mount", async () => {
    const { fetchCourses } = await import("@/services/courseService");

    render(
      <MemoryRouter
        initialEntries={["/courses?course=test-course-1"]}
      >
        <CourseCatalogPage />
      </MemoryRouter>
    );

    // Wait for page to load
    await waitFor(
      () => {
        expect(screen.getByText("Test Course 1")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(vi.mocked(fetchCourses)).toHaveBeenCalledWith(
        expect.objectContaining({
          courseSlugs: ["test-course-1"],
        })
      );
    });
  });

  it("should show empty state when no courses match filters", async () => {
    const { fetchCourses } = await import("@/services/courseService");
    vi.mocked(fetchCourses).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <CourseCatalogPage />
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(/No courses match these filters/)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show reset filters button
    expect(screen.getByText(/Reset filters/)).toBeInTheDocument();
  });
});
