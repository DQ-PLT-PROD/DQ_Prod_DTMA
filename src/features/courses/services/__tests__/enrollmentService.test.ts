import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/supabase/serviceClient", () => ({
  getSupabaseForEnrollment: vi.fn(),
}));

vi.mock("../../../../lib/supabase/client", () => ({
  isSupabaseConfigured: vi.fn(),
}));

import { getSupabaseForEnrollment } from "../../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../../lib/supabase/client";
import {
  canAccessLesson,
  enrollInCourse,
  getEnrollment,
  isUserEnrolled,
} from "../../../../lib/enrollment/service";

const createChain = () => {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    single: vi.fn(),
  };

  return chain;
};

describe("EnrollmentService", () => {
  const userId = "db-user-uuid";
  const courseSlug = "perfecting-life-transactions-module";
  const lessonId = "lesson-1";

  let modulesChain: any;
  let enrollmentChain: any;
  let lessonsChain: any;
  let mockSupabase: { from: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    modulesChain = createChain();
    enrollmentChain = createChain();
    lessonsChain = createChain();

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "modules") return modulesChain;
        if (table === "module_enrollments") return enrollmentChain;
        if (table === "lessons") return lessonsChain;
        throw new Error(`Unexpected table: ${table}`);
      }),
    };

    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabaseForEnrollment).mockReturnValue(mockSupabase as any);
  });

  describe("preview and gating", () => {
    it("allows preview lessons for unauthenticated users", async () => {
      const result = await canAccessLesson(null, courseSlug, lessonId, true);
      expect(result).toBe(true);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("denies non-preview lessons for unauthenticated users", async () => {
      modulesChain.single.mockResolvedValueOnce({
        data: { id: "module-1", slug: courseSlug },
        error: null,
      });
      lessonsChain.single.mockResolvedValueOnce({
        data: { id: lessonId, module_id: "module-1", title: "Intro", order_index: 1, is_preview: false },
        error: null,
      });

      const result = await canAccessLesson(null, courseSlug, lessonId, false);

      expect(result).toBe(false);
    });

    it("allows first lesson when the learner has an active module enrollment", async () => {
      modulesChain.single.mockResolvedValue({
        data: { id: "module-1", slug: courseSlug },
        error: null,
      });
      lessonsChain.single.mockResolvedValueOnce({
        data: { id: lessonId, module_id: "module-1", title: "Intro", order_index: 1, is_preview: false },
        error: null,
      });
      enrollmentChain.single.mockResolvedValueOnce({
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

      const result = await canAccessLesson(userId, courseSlug, lessonId, false);

      expect(result).toBe(true);
    });
  });

  describe("module enrollment reads and writes", () => {
    it("returns enrollment status from module_enrollments", async () => {
      modulesChain.single.mockResolvedValueOnce({
        data: { id: "module-1", slug: courseSlug },
        error: null,
      });
      enrollmentChain.single.mockResolvedValueOnce({
        data: {
          id: "enroll-1",
          user_id: userId,
          module_id: "module-1",
          started_at: "2026-03-04T00:00:00.000Z",
          completed_at: null,
          last_accessed_at: "2026-03-04T00:00:00.000Z",
          progress_pct: 25,
          status: "active",
          enrollment_method: "explicit",
        },
        error: null,
      });

      const result = await isUserEnrolled(userId, courseSlug);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("module_enrollments");
    });

    it("creates module enrollment records through upsert", async () => {
      modulesChain.single.mockResolvedValueOnce({
        data: { id: "module-1", slug: courseSlug },
        error: null,
      });
      enrollmentChain.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116", message: "No rows found" },
        })
        .mockResolvedValueOnce({
          data: {
            id: "enroll-123",
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

      const result = await enrollInCourse(userId, courseSlug, "explicit");

      expect(result.success).toBe(true);
      expect(result.enrollment?.courseSlug).toBe(courseSlug);
      expect(result.enrollment?.moduleId).toBe("module-1");
      expect(mockSupabase.from).toHaveBeenCalledWith("module_enrollments");
    });

    it("returns mapped enrollment details using the module slug", async () => {
      modulesChain.single.mockResolvedValueOnce({
        data: { id: "module-1", slug: courseSlug },
        error: null,
      });
      enrollmentChain.single.mockResolvedValueOnce({
        data: {
          id: "enroll-123",
          user_id: userId,
          module_id: "module-1",
          started_at: "2026-03-04T00:00:00.000Z",
          completed_at: null,
          last_accessed_at: "2026-03-04T00:00:00.000Z",
          progress_pct: 75,
          status: "active",
          enrollment_method: "explicit",
        },
        error: null,
      });

      const result = await getEnrollment(userId, courseSlug);

      expect(result).toEqual({
        id: "enroll-123",
        userId,
        moduleId: "module-1",
        courseSlug,
        enrolledAt: "2026-03-04T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "explicit",
        cancelledAt: null,
        progressPct: 75,
        completedAt: null,
        lastAccessedAt: "2026-03-04T00:00:00.000Z",
      });
    });
  });
});
