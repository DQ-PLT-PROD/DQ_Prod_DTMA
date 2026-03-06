import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchCourseResources,
  fetchFullCourse,
  fetchPublishedCoursesForNav,
} from "./courseService";

describe("courseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives course navigation thumbnails from the first published module thumbnail", async () => {
    const orderCoursesSecondMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "course-1",
          slug: "understanding-economy-4",
          title: "Understanding Economy 4.0",
          short_description: "Published learner-facing course",
          created_at: "2026-03-04T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const orderCoursesMock = vi.fn().mockReturnValue({ order: orderCoursesSecondMock });
    const eqCoursesMock = vi.fn().mockReturnValue({ order: orderCoursesMock });
    const selectCoursesMock = vi.fn().mockReturnValue({ eq: eqCoursesMock });

    const orderModulesMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "module-1",
          slug: "understanding-economy-4-intro",
          course_slug: "understanding-economy-4",
          order_index: 1,
          thumbnail_url: "https://example.com/module-thumb.jpg",
        },
      ],
      error: null,
    });
    const inModulesMock = vi.fn().mockReturnValue({ order: orderModulesMock });
    const eqModulesMock = vi.fn().mockReturnValue({ in: inModulesMock });
    const selectModulesMock = vi.fn().mockReturnValue({ eq: eqModulesMock });

    const fromMock = vi.fn((table: string) => {
      if (table === "courses") return { select: selectCoursesMock };
      if (table === "modules") return { select: selectModulesMock };
      throw new Error(`Unexpected table: ${table}`);
    });

    vi.mocked(getSupabase).mockReturnValue({ from: fromMock } as any);

    const result = await fetchPublishedCoursesForNav();

    expect(selectCoursesMock).toHaveBeenCalledWith(
      "id,slug,title,short_description,long_description,category_id,audience_level,topic_tags,level_tag,is_featured,is_coming_soon,status,rating,review_count,enrollment_url,learning_outcomes,skills_gained,upon_completion,start_date,industry,created_at,course_categories(name)"
    );
    expect(selectModulesMock).toHaveBeenCalledWith(
      "id, slug, course_slug, title, description, learning_outcomes, skills_gained, upon_completion, thumbnail_url, order_index, estimated_duration_minutes, status"
    );
    expect(eqModulesMock).toHaveBeenCalledWith("status", "published");
    expect(inModulesMock).toHaveBeenCalledWith("course_slug", ["understanding-economy-4"]);
    expect(result).toEqual([
      {
        slug: "understanding-economy-4",
        title: "Understanding Economy 4.0",
        shortDescription: "Published learner-facing course",
        heroImageUrl: "https://example.com/module-thumb.jpg",
        thumbnailUrl: "https://example.com/module-thumb.jpg",
      },
    ]);
  });

  it("prefers module-managed learner content over course defaults on module details", async () => {
    const moduleSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: "module-1",
        slug: "module-slug",
        course_slug: "course-slug",
        title: "Module Title",
        description: "Module description",
        learning_outcomes: ["Module outcome"],
        skills_gained: ["Module skill"],
        upon_completion: "Module completion",
        thumbnail_url: "https://example.com/module.jpg",
        order_index: 1,
        estimated_duration_minutes: 45,
        status: "published",
      },
      error: null,
    });
    const moduleEqMock = vi.fn().mockReturnValue({ single: moduleSingleMock });
    const moduleSelectMock = vi.fn().mockReturnValue({ eq: moduleEqMock });

    const courseSingleMock = vi.fn().mockResolvedValue({
      data: {
        slug: "course-slug",
        title: "Course Title",
        short_description: "Course short description",
        long_description: "Course long description",
        learning_outcomes: ["Course outcome"],
        skills_gained: ["Course skill"],
        upon_completion: "Course completion",
        course_categories: { name: "Strategy" },
      },
      error: null,
    });
    const courseEqMock = vi.fn().mockReturnValue({ single: courseSingleMock });
    const courseSelectMock = vi.fn().mockReturnValue({ eq: courseEqMock });

    const lessonsOrderMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "lesson-1",
          course_slug: "course-slug",
          module_id: "module-1",
          title: "Lesson 1",
          type: "standard",
          order_index: 1,
          estimated_duration_minutes: 20,
          video_url: "https://example.com/lesson.mp4",
          resource_url: null,
          content: "Lesson content",
          is_preview: false,
        },
      ],
      error: null,
    });
    const lessonsEqMock = vi.fn().mockReturnValue({ order: lessonsOrderMock });
    const lessonsSelectMock = vi.fn().mockReturnValue({ eq: lessonsEqMock });

    const fromMock = vi.fn((table: string) => {
      if (table === "modules") return { select: moduleSelectMock };
      if (table === "courses") return { select: courseSelectMock };
      if (table === "lessons") return { select: lessonsSelectMock };
      throw new Error(`Unexpected table: ${table}`);
    });

    vi.mocked(getSupabase).mockReturnValue({ from: fromMock } as any);

    const result = await fetchFullCourse("module-slug");

    expect(moduleEqMock).toHaveBeenCalledWith("slug", "module-slug");
    expect(courseEqMock).toHaveBeenCalledWith("slug", "course-slug");
    expect(lessonsEqMock).toHaveBeenCalledWith("module_id", "module-1");
    expect(result?.learningOutcomes).toEqual(["Module outcome"]);
    expect(result?.skillsGained).toEqual(["Module skill"]);
    expect(result?.uponCompletion).toBe("Module completion");
    expect(result?.shortDescription).toBe("Module description");
  });

  it("loads learner resources by module_id instead of course_slug", async () => {
    const moduleSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: "module-1",
        slug: "module-slug",
        course_slug: "course-slug",
        title: "Module Title",
        status: "published",
      },
      error: null,
    });
    const moduleEqMock = vi.fn().mockReturnValue({ single: moduleSingleMock });
    const moduleSelectMock = vi.fn().mockReturnValue({ eq: moduleEqMock });

    const courseSingleMock = vi.fn().mockResolvedValue({
      data: { slug: "course-slug", title: "Course Title" },
      error: null,
    });
    const courseEqMock = vi.fn().mockReturnValue({ single: courseSingleMock });
    const courseSelectMock = vi.fn().mockReturnValue({ eq: courseEqMock });

    const resourcesOrderMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "resource-1",
          course_slug: "course-slug",
          module_id: "module-1",
          title: "Module PDF",
          type: "pdf",
          description: "Download",
          resource_url: "https://example.com/module.pdf",
          file_size_bytes: 1024,
          order_index: 0,
        },
      ],
      error: null,
    });
    const resourcesEqMock = vi.fn().mockReturnValue({ order: resourcesOrderMock });
    const resourcesSelectMock = vi.fn().mockReturnValue({ eq: resourcesEqMock });

    const fromMock = vi.fn((table: string) => {
      if (table === "modules") return { select: moduleSelectMock };
      if (table === "courses") return { select: courseSelectMock };
      if (table === "course_resources") return { select: resourcesSelectMock };
      throw new Error(`Unexpected table: ${table}`);
    });

    vi.mocked(getSupabase).mockReturnValue({ from: fromMock } as any);

    const result = await fetchCourseResources("module-slug");

    expect(resourcesEqMock).toHaveBeenCalledWith("module_id", "module-1");
    expect(result).toEqual([
      {
        id: "resource-1",
        courseSlug: "course-slug",
        moduleId: "module-1",
        title: "Module PDF",
        type: "pdf",
        description: "Download",
        resourceUrl: "https://example.com/module.pdf",
        fileSizeBytes: 1024,
        orderIndex: 0,
      },
    ]);
  });
});
