import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/supabase/serviceClient", () => ({
    getSupabaseForEnrollment: vi.fn(),
}));

vi.mock("../../../lib/supabase/client", () => ({
    isSupabaseConfigured: vi.fn(),
}));

vi.mock("../../../lib/api/enrollmentApiClient", () => ({
    enrollmentApiClient: {
        getEnrollment: vi.fn(),
        enrollInCourse: vi.fn(),
        getUserEnrollments: vi.fn(),
    },
}));

vi.mock("../../../lib/api/lessonAccessApiClient", () => ({
    lessonAccessApiClient: {
        updateLessonProgress: vi.fn(),
        getCourseAccessSummary: vi.fn(),
    },
}));

import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";
import {
    getActualProgressStats,
    getOrCreateEnrollment,
    getUserCourseProgress,
    getUserEnrollments,
    syncLocalProgressToServer,
    updateEnrollmentProgress,
    updateLessonProgress,
} from "./progressService";

describe("progressService", () => {
    const userId = "user-123";
    const courseSlug = "perfecting-life-transactions";

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    });

    it("returns existing enrollment when present", async () => {
        vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce({
            id: "enroll-1",
            user_id: userId,
            course_slug: courseSlug,
            started_at: "2026-01-01T00:00:00Z",
            last_accessed_at: "2026-01-02T00:00:00Z",
            progress_pct: 11,
        } as any);

        const result = await getOrCreateEnrollment(userId, courseSlug);

        expect(result).toEqual(
            expect.objectContaining({
                id: "enroll-1",
                userId,
                courseSlug,
                progressPct: 11,
            })
        );
    });

    it("creates enrollment when none exists", async () => {
        vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce(null as any);
        vi.mocked(enrollmentApiClient.enrollInCourse).mockResolvedValueOnce({
            success: true,
            enrollment: {
                id: "enroll-new",
                user_id: userId,
                course_slug: courseSlug,
                started_at: "2026-01-01T00:00:00Z",
                last_accessed_at: "2026-01-01T00:00:00Z",
                progress_pct: 0,
            },
        } as any);

        const result = await getOrCreateEnrollment(userId, courseSlug);

        expect(result?.id).toBe("enroll-new");
        expect(enrollmentApiClient.enrollInCourse).toHaveBeenCalledWith(courseSlug, "auto");
    });

    it("returns enrollment and lesson progress from API + DB", async () => {
        vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce({
            id: "enroll-1",
            user_id: userId,
            course_slug: courseSlug,
            started_at: "2026-01-01T00:00:00Z",
            last_accessed_at: "2026-01-02T00:00:00Z",
            progress_pct: 22,
        } as any);

        const eq = vi.fn().mockResolvedValue({
            data: [
                {
                    id: "lp-1",
                    enrollment_id: "enroll-1",
                    lesson_id: "lesson-1",
                    completed: true,
                    watch_time_seconds: 180,
                },
            ],
            error: null,
        });
        const select = vi.fn().mockReturnValue({ eq });
        const from = vi.fn().mockReturnValue({ select });

        vi.mocked(getSupabaseForEnrollment).mockReturnValue({ from } as any);

        const result = await getUserCourseProgress(userId, courseSlug);

        expect(result.enrollment?.progressPct).toBe(22);
        expect(result.lessonProgress).toHaveLength(1);
        expect(result.lessonProgress[0]).toEqual(
            expect.objectContaining({
                enrollmentId: "enroll-1",
                lessonId: "lesson-1",
                completed: true,
            })
        );
    });

    it("updates lesson progress through lesson access API", async () => {
        vi.mocked(lessonAccessApiClient.updateLessonProgress).mockResolvedValueOnce({
            success: true,
        } as any);

        const result = await updateLessonProgress(userId, courseSlug, "lesson-1", true, 120);

        expect(result).toBe(true);
        expect(lessonAccessApiClient.updateLessonProgress).toHaveBeenCalledWith(
            courseSlug,
            "lesson-1",
            true,
            120
        );
    });

    it("treats enrollment progress updates as server-computed no-op", async () => {
        const result = await updateEnrollmentProgress(userId, courseSlug, 80);
        expect(result).toBe(true);
    });

    it("does not sync local progress directly for anti-cheat hardening", async () => {
        const result = await syncLocalProgressToServer(userId, courseSlug, [
            { id: "lesson-1", completed: true },
        ]);
        expect(result).toBe(false);
    });

    it("maps user enrollments from API", async () => {
        vi.mocked(enrollmentApiClient.getUserEnrollments).mockResolvedValueOnce([
            {
                id: "enroll-1",
                user_id: userId,
                course_slug: courseSlug,
                started_at: "2026-01-01T00:00:00Z",
                last_accessed_at: "2026-01-03T00:00:00Z",
                progress_pct: 33,
            },
        ] as any);

        const result = await getUserEnrollments(userId);
        expect(result).toHaveLength(1);
        expect(result[0].courseSlug).toBe(courseSlug);
        expect(result[0].progressPct).toBe(33);
    });

    it("uses canonical trackable summary for actual progress stats", async () => {
        vi.mocked(lessonAccessApiClient.getCourseAccessSummary).mockResolvedValueOnce({
            success: true,
            summary: {
                completedTrackableItems: 5,
                trackableItemCount: 9,
                progressPercent: 56,
            },
        } as any);

        const result = await getActualProgressStats(userId, courseSlug);

        expect(result).toEqual({
            completedCount: 5,
            totalCount: 9,
            progressPct: 56,
        });
    });
});
