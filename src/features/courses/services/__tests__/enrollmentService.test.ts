/**
 * Enrollment service tests aligned with backend-first API architecture.
 * Covers:
 * - Unit gating behavior for lesson access.
 * - Integration behavior for enrollment API orchestration.
 * - Smoke happy path (enroll -> access lesson).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/api/enrollmentApiClient", () => ({
  enrollmentApiClient: {
    isUserEnrolled: vi.fn(),
    getEnrollment: vi.fn(),
    enrollInCourse: vi.fn(),
    getUserEnrollments: vi.fn(),
    getAccessContract: vi.fn(),
    cancelEnrollment: vi.fn(),
  },
}));

vi.mock("../../../../lib/api/lessonAccessApiClient", () => ({
  lessonAccessApiClient: {
    canAccessLesson: vi.fn(),
  },
}));

import {
  canAccessLesson,
  enrollInCourse,
  getEnrollment,
  isUserEnrolled,
} from "../../../../lib/enrollment/service";
import { enrollmentApiClient } from "../../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../../lib/api/lessonAccessApiClient";

describe("EnrollmentService", () => {
  const userId = "db-user-uuid";
  const courseSlug = "perfecting-life-transactions";
  const lessonId = "lesson-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Unit - gating", () => {
    it("allows preview lessons for unauthenticated users", async () => {
      const result = await canAccessLesson(null, courseSlug, lessonId, true);
      expect(result).toBe(true);
      expect(lessonAccessApiClient.canAccessLesson).not.toHaveBeenCalled();
    });

    it("denies non-preview lessons for unauthenticated users", async () => {
      const result = await canAccessLesson(null, courseSlug, lessonId, false);
      expect(result).toBe(false);
      expect(lessonAccessApiClient.canAccessLesson).not.toHaveBeenCalled();
    });

    it("delegates full-content access checks to lesson access API for authenticated users", async () => {
      vi.mocked(lessonAccessApiClient.canAccessLesson).mockResolvedValueOnce(
        true
      );

      const result = await canAccessLesson(userId, courseSlug, lessonId, false);

      expect(result).toBe(true);
      expect(lessonAccessApiClient.canAccessLesson).toHaveBeenCalledWith(
        courseSlug,
        lessonId
      );
    });
  });

  describe("Integration - enrollment endpoint orchestration", () => {
    it("returns enrollment status from API client", async () => {
      vi.mocked(enrollmentApiClient.isUserEnrolled).mockResolvedValueOnce(true);

      const result = await isUserEnrolled(userId, courseSlug);

      expect(result).toBe(true);
      expect(enrollmentApiClient.isUserEnrolled).toHaveBeenCalledWith(courseSlug);
    });

    it("creates enrollment through API and returns enrollment payload", async () => {
      const mockEnrollment = {
        id: "enroll-123",
        userId,
        courseSlug,
        enrolledAt: "2026-02-25T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "explicit",
      };

      vi.mocked(enrollmentApiClient.enrollInCourse).mockResolvedValueOnce({
        success: true,
        enrollment: mockEnrollment,
      });

      const result = await enrollInCourse(userId, courseSlug, "explicit");

      expect(result.success).toBe(true);
      expect(result.enrollment).toEqual(mockEnrollment);
      expect(enrollmentApiClient.enrollInCourse).toHaveBeenCalledWith(
        courseSlug,
        "explicit"
      );
    });

    it("returns enrollment details from API client", async () => {
      const mockEnrollment = {
        id: "enroll-123",
        userId,
        courseSlug,
        enrolledAt: "2026-02-25T00:00:00.000Z",
        status: "active",
        enrollmentMethod: "explicit",
      };
      vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce(
        mockEnrollment
      );

      const result = await getEnrollment(userId, courseSlug);

      expect(result).toEqual(mockEnrollment);
      expect(enrollmentApiClient.getEnrollment).toHaveBeenCalledWith(courseSlug);
    });
  });

  describe("Smoke - happy path", () => {
    it("supports enroll then lesson access flow", async () => {
      vi.mocked(enrollmentApiClient.isUserEnrolled)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      vi.mocked(enrollmentApiClient.enrollInCourse).mockResolvedValueOnce({
        success: true,
        enrollment: {
          id: "enroll-abc",
          userId,
          courseSlug,
          enrolledAt: "2026-02-25T00:00:00.000Z",
          status: "active",
          enrollmentMethod: "explicit",
        },
      });
      vi.mocked(lessonAccessApiClient.canAccessLesson).mockResolvedValueOnce(
        true
      );

      const beforeEnroll = await isUserEnrolled(userId, courseSlug);
      const enrollmentResult = await enrollInCourse(userId, courseSlug);
      const afterEnroll = await isUserEnrolled(userId, courseSlug);
      const lessonAccess = await canAccessLesson(
        userId,
        courseSlug,
        lessonId,
        false
      );

      expect(beforeEnroll).toBe(false);
      expect(enrollmentResult.success).toBe(true);
      expect(afterEnroll).toBe(true);
      expect(lessonAccess).toBe(true);
    });
  });
});
