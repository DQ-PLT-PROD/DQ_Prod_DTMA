import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/supabase/serviceClient", () => ({
  getSupabaseForEnrollment: vi.fn(),
}));

vi.mock("../../../lib/supabase/client", () => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("../../../lib/enrollment", () => ({
  enrollInCourse: vi.fn(),
  getEnrollment: vi.fn(),
  getUserEnrollments: vi.fn(),
}));

vi.mock("./achievementService", () => ({
  recordCourseCompletion: vi.fn(),
}));

import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { enrollInCourse, getEnrollment, getUserEnrollments as getModuleEnrollments } from "../../../lib/enrollment";
import { recordCourseCompletion } from "./achievementService";
import {
  getOrCreateEnrollment,
  getUserCourseProgress,
  updateLessonProgress,
  updateEnrollmentProgress,
  getUserEnrollments,
  getActualProgressStats,
} from "./progressService";

const createChain = () => {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    single: vi.fn(),
    upsert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    order: vi.fn(() => chain),
  };

  return chain;
};

describe("progressService", () => {
  const userId = "user-123";
  const courseSlug = "intro-to-testing-module";

  let modulesChain: any;
  let enrollmentsChain: any;
  let progressChain: any;
  let lessonsChain: any;
  let mockSupabase: { from: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    modulesChain = createChain();
    enrollmentsChain = createChain();
    progressChain = createChain();
    lessonsChain = createChain();

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "modules") return modulesChain;
        if (table === "module_enrollments") return enrollmentsChain;
        if (table === "module_lesson_progress") return progressChain;
        if (table === "lessons") return lessonsChain;
        throw new Error(`Unexpected table: ${table}`);
      }),
    };

    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabaseForEnrollment).mockReturnValue(mockSupabase as any);
  });

  it("returns an existing module enrollment from shared enrollment state", async () => {
    vi.mocked(getEnrollment).mockResolvedValueOnce({
      id: "enroll-1",
      userId,
      moduleId: "module-1",
      courseSlug,
      enrolledAt: "2026-03-04T00:00:00.000Z",
      status: "active",
      enrollmentMethod: "explicit",
      progressPct: 50,
      lastAccessedAt: "2026-03-04T00:00:00.000Z",
    });

    const result = await getOrCreateEnrollment(userId, courseSlug);

    expect(result?.id).toBe("enroll-1");
    expect(result?.progressPct).toBe(50);
  });

  it("creates a module enrollment when no active enrollment exists", async () => {
    vi.mocked(getEnrollment).mockResolvedValueOnce(null);
    vi.mocked(enrollInCourse).mockResolvedValueOnce({
      success: true,
      enrollment: {
        id: "enroll-new",
        userId,
        moduleId: "module-1",
        courseSlug,
        enrolledAt: "2026-03-04T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "auto",
        progressPct: 0,
        lastAccessedAt: "2026-03-04T00:00:00.000Z",
      },
    });

    const result = await getOrCreateEnrollment(userId, courseSlug);

    expect(result?.id).toBe("enroll-new");
    expect(vi.mocked(enrollInCourse)).toHaveBeenCalledWith(userId, courseSlug, "auto");
  });

  it("returns module lesson progress for the learner snapshot flow", async () => {
    modulesChain.single.mockResolvedValueOnce({
      data: { id: "module-1", slug: courseSlug },
      error: null,
    });
    enrollmentsChain.single.mockResolvedValueOnce({
      data: {
        id: "enroll-1",
        user_id: userId,
        module_id: "module-1",
        started_at: "2026-03-04T00:00:00.000Z",
        completed_at: null,
        last_accessed_at: "2026-03-04T00:00:00.000Z",
        progress_pct: 33,
        status: "active",
        enrollment_method: "explicit",
      },
      error: null,
    });
    progressChain.eq.mockResolvedValueOnce({
      data: [
        {
          id: "progress-1",
          enrollment_id: "enroll-1",
          lesson_id: "lesson-1",
          completed: true,
          watch_time_seconds: 300,
          completed_at: "2026-03-04T00:00:00.000Z",
        },
      ],
      error: null,
    });

    const result = await getUserCourseProgress(userId, courseSlug);

    expect(result.enrollment?.progressPct).toBe(33);
    expect(result.lessonProgress).toHaveLength(1);
    expect(result.lessonProgress[0].lessonId).toBe("lesson-1");
  });

  it("upserts module lesson progress and syncs the enrollment percentage", async () => {
    vi.mocked(getEnrollment).mockResolvedValueOnce({
      id: "enroll-1",
      userId,
      moduleId: "module-1",
      courseSlug,
      enrolledAt: "2026-03-04T00:00:00.000Z",
      status: "active",
      enrollmentMethod: "explicit",
      progressPct: 0,
      lastAccessedAt: "2026-03-04T00:00:00.000Z",
    });
    lessonsChain.eq.mockResolvedValueOnce({
      data: [{ id: "lesson-1" }, { id: "lesson-2" }],
      error: null,
    });
    progressChain.upsert.mockResolvedValueOnce({ error: null });
    progressChain.in.mockResolvedValueOnce({
      data: [{ lesson_id: "lesson-1" }],
      error: null,
    });
    enrollmentsChain.eq.mockResolvedValueOnce({ error: null });

    const result = await updateLessonProgress(userId, courseSlug, "lesson-1", true, 300);

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith("module_lesson_progress");
    expect(mockSupabase.from).toHaveBeenCalledWith("module_enrollments");
  });

  it("clamps progress to 100 and records completion badges on full completion", async () => {
    vi.mocked(getEnrollment).mockResolvedValueOnce({
      id: "enroll-1",
      userId,
      moduleId: "module-1",
      courseSlug,
      enrolledAt: "2026-03-04T00:00:00.000Z",
      status: "active",
      enrollmentMethod: "explicit",
      progressPct: 90,
      lastAccessedAt: "2026-03-04T00:00:00.000Z",
    });
    enrollmentsChain.eq.mockResolvedValueOnce({ error: null });

    const result = await updateEnrollmentProgress(userId, courseSlug, 150);

    expect(result).toBe(true);
    expect(enrollmentsChain.update).toHaveBeenCalled();
    expect(vi.mocked(recordCourseCompletion)).toHaveBeenCalledWith(userId, courseSlug);
  });

  it("maps active module enrollments from the shared enrollment service", async () => {
    vi.mocked(getModuleEnrollments).mockResolvedValueOnce([
      {
        id: "enroll-2",
        userId,
        moduleId: "module-2",
        courseSlug: "module-b",
        enrolledAt: "2026-03-05T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "explicit",
        progressPct: 75,
        lastAccessedAt: "2026-03-05T00:00:00.000Z",
      },
      {
        id: "enroll-1",
        userId,
        moduleId: "module-1",
        courseSlug: "module-a",
        enrolledAt: "2026-03-04T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "explicit",
        progressPct: 10,
        lastAccessedAt: "2026-03-04T00:00:00.000Z",
      },
    ]);

    const result = await getUserEnrollments(userId);

    expect(result).toHaveLength(2);
    expect(result[0].courseSlug).toBe("module-b");
    expect(result[1].courseSlug).toBe("module-a");
  });

  it("calculates actual progress from completed module lesson rows", async () => {
    modulesChain.single.mockResolvedValueOnce({
      data: { id: "module-1", slug: courseSlug },
      error: null,
    });
    enrollmentsChain.single.mockResolvedValueOnce({
      data: {
        id: "enroll-1",
        user_id: userId,
        module_id: "module-1",
        started_at: "2026-03-04T00:00:00.000Z",
        completed_at: null,
        last_accessed_at: "2026-03-04T00:00:00.000Z",
        progress_pct: 0,
        status: "active",
        enrollment_method: "explicit",
      },
      error: null,
    });
    lessonsChain.eq.mockResolvedValueOnce({
      data: [{ id: "lesson-1" }, { id: "lesson-2" }, { id: "lesson-3" }],
      error: null,
    });
    progressChain.in.mockResolvedValueOnce({
      data: [{ lesson_id: "lesson-1" }, { lesson_id: "lesson-2" }],
      error: null,
    });

    const result = await getActualProgressStats(userId, courseSlug);

    expect(result).toEqual({
      completedCount: 2,
      totalCount: 3,
      progressPct: 67,
    });
  });
});
