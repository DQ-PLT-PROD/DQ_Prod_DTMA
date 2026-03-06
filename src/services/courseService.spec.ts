import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchPublishedCoursesForNav } from "./courseService";

describe("fetchPublishedCoursesForNav", () => {
  const orderCoursesMock = vi.fn();
  const orderCoursesSecondMock = vi.fn();
  const orderModulesMock = vi.fn();
  const inModulesMock = vi.fn();
  const eqModulesMock = vi.fn();
  const eqCoursesMock = vi.fn();
  const selectCoursesMock = vi.fn();
  const selectModulesMock = vi.fn();
  const fromMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    orderCoursesSecondMock.mockResolvedValue({
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

    orderModulesMock.mockResolvedValue({
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

    orderCoursesMock.mockReturnValue({
      order: orderCoursesSecondMock,
    });
    eqCoursesMock.mockReturnValue({
      order: orderCoursesMock,
    });
    selectCoursesMock.mockReturnValue({
      eq: eqCoursesMock,
    });

    eqModulesMock.mockReturnValue({
      in: inModulesMock,
    });
    inModulesMock.mockReturnValue({
      order: orderModulesMock,
    });
    selectModulesMock.mockReturnValue({
      eq: eqModulesMock,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "courses") {
        return { select: selectCoursesMock };
      }

      if (table === "modules") {
        return { select: selectModulesMock };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabase).mockReturnValue({
      from: fromMock,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives course navigation thumbnails from the first published module thumbnail", async () => {
    const result = await fetchPublishedCoursesForNav();

    expect(fromMock).toHaveBeenCalledWith("courses");
    expect(selectCoursesMock).toHaveBeenCalledWith(
      "id,slug,title,short_description,long_description,category_id,audience_level,topic_tags,level_tag,is_featured,is_coming_soon,status,rating,review_count,enrollment_url,learning_outcomes,skills_gained,upon_completion,start_date,industry,created_at,course_categories(name)"
    );
    expect(eqCoursesMock).toHaveBeenCalledWith("status", "published");
    expect(orderCoursesMock).toHaveBeenCalledWith("is_coming_soon", { ascending: true });
    expect(orderCoursesSecondMock).toHaveBeenCalledWith("created_at", { ascending: false });

    expect(fromMock).toHaveBeenCalledWith("modules");
    expect(selectModulesMock).toHaveBeenCalledWith(
      "id, slug, course_slug, title, description, thumbnail_url, order_index, estimated_duration_minutes, status"
    );
    expect(eqModulesMock).toHaveBeenCalledWith("status", "published");
    expect(inModulesMock).toHaveBeenCalledWith("course_slug", ["understanding-economy-4"]);
    expect(orderModulesMock).toHaveBeenCalledWith("order_index", { ascending: true });

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
});
