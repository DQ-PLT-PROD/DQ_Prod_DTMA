/**
 * Unit tests for progressService.
 * Verifies that Stage02A progress flows through backend API clients.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("../../../lib/api/learningApiClient", () => ({
    learningApiClient: {
        getSnapshot: vi.fn(),
        recordCourseCompletion: vi.fn(),
    },
}));

import { enrollmentApiClient } from "../../../lib/api/enrollmentApiClient";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";
import { learningApiClient } from "../../../lib/api/learningApiClient";
import {
    flushProgressQueue,
    getActualProgressStats,
    getOrCreateEnrollment,
    getUserCourseProgress,
    getUserEnrollments,
    syncLocalProgressToServer,
    updateEnrollmentProgress,
    updateLessonProgress,
} from "./progressService";

describe("progressService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
    });

    it("returns existing enrollment from the backend client", async () => {
        vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce({
            id: "enroll-1",
            userId: "db-user",
            courseSlug: "intro-to-testing",
            startedAt: "2024-01-01T00:00:00Z",
            lastAccessedAt: "2024-01-10T00:00:00Z",
            progressPct: 25,
        } as any);

        const result = await getOrCreateEnrollment("ignored-user", "intro-to-testing");

        expect(result?.id).toBe("enroll-1");
        expect(enrollmentApiClient.getEnrollment).toHaveBeenCalledWith("intro-to-testing");
        expect(enrollmentApiClient.enrollInCourse).not.toHaveBeenCalled();
    });

    it("creates an enrollment when none exists", async () => {
        vi.mocked(enrollmentApiClient.getEnrollment).mockResolvedValueOnce(null);
        vi.mocked(enrollmentApiClient.enrollInCourse).mockResolvedValueOnce({
            success: true,
            enrollment: {
                id: "enroll-new",
                userId: "db-user",
                courseSlug: "intro-to-testing",
                startedAt: "2024-01-01T00:00:00Z",
                lastAccessedAt: "2024-01-10T00:00:00Z",
                progressPct: 0,
            },
        } as any);

        const result = await getOrCreateEnrollment("ignored-user", "intro-to-testing");

        expect(result?.id).toBe("enroll-new");
        expect(enrollmentApiClient.enrollInCourse).toHaveBeenCalledWith("intro-to-testing", "auto");
    });

    it("maps enrollment and lesson progress from the learning snapshot", async () => {
        vi.mocked(learningApiClient.getSnapshot).mockResolvedValueOnce({
            enrollment: {
                id: "enroll-1",
                user_id: "db-user",
                course_slug: "intro-to-testing",
                started_at: "2024-01-01T00:00:00Z",
                last_accessed_at: "2024-01-10T00:00:00Z",
                progress_pct: 50,
            },
            progress: [
                {
                    id: "progress-1",
                    enrollment_id: "enroll-1",
                    lesson_id: "lesson-1",
                    completed: true,
                    watch_time_seconds: 120,
                },
            ],
        } as any);

        const result = await getUserCourseProgress("ignored-user", "intro-to-testing");

        expect(result.enrollment?.progressPct).toBe(50);
        expect(result.lessonProgress).toHaveLength(1);
        expect(result.lessonProgress[0].lessonId).toBe("lesson-1");
    });

    it("updates lesson progress through the lesson access API", async () => {
        vi.mocked(lessonAccessApiClient.updateLessonProgress).mockResolvedValueOnce({
            success: true,
        } as any);

        const result = await updateLessonProgress(
            "ignored-user",
            "intro-to-testing",
            "lesson-1",
            true,
            180
        );

        expect(result).toBe(true);
        expect(lessonAccessApiClient.updateLessonProgress).toHaveBeenCalledWith(
            "intro-to-testing",
            "lesson-1",
            true,
            180
        );
    });

    it("queues lesson progress when the backend update fails", async () => {
        vi.mocked(lessonAccessApiClient.updateLessonProgress).mockResolvedValueOnce({
            success: false,
            error: "nope",
        } as any);

        const result = await updateLessonProgress(
            "db-user",
            "intro-to-testing",
            "lesson-1",
            true
        );

        expect(result).toBe(false);
        const rawQueue = window.localStorage.getItem("dtma_progress_queue_v1");
        expect(rawQueue).toContain("lesson_progress");
    });

    it("only records course completion when progress reaches 100%", async () => {
        vi.mocked(learningApiClient.recordCourseCompletion).mockResolvedValue({
            success: true,
        } as any);

        const partial = await updateEnrollmentProgress("db-user", "intro-to-testing", 75);
        const complete = await updateEnrollmentProgress("db-user", "intro-to-testing", 100);

        expect(partial).toBe(true);
        expect(complete).toBe(true);
        expect(learningApiClient.recordCourseCompletion).toHaveBeenCalledTimes(1);
        expect(learningApiClient.recordCourseCompletion).toHaveBeenCalledWith("intro-to-testing");
    });

    it("syncs only completed lessons from local storage", async () => {
        vi.mocked(lessonAccessApiClient.updateLessonProgress).mockResolvedValue({
            success: true,
        } as any);

        const result = await syncLocalProgressToServer("db-user", "intro-to-testing", [
            { id: "lesson-1", completed: true },
            { id: "lesson-2", completed: false },
            { id: "lesson-3", completed: true },
        ]);

        expect(result).toBe(true);
        expect(lessonAccessApiClient.updateLessonProgress).toHaveBeenCalledTimes(2);
    });

    it("returns enrollments from the enrollment API client", async () => {
        vi.mocked(enrollmentApiClient.getUserEnrollments).mockResolvedValueOnce([
            { id: "enroll-1", courseSlug: "course-a" },
            { id: "enroll-2", courseSlug: "course-b" },
        ] as any);

        const result = await getUserEnrollments("ignored-user");

        expect(result).toHaveLength(2);
        expect(enrollmentApiClient.getUserEnrollments).toHaveBeenCalledTimes(1);
    });

    it("calculates actual progress stats from the learning snapshot", async () => {
        vi.mocked(learningApiClient.getSnapshot).mockResolvedValueOnce({
            lessons: [{ id: "l1" }, { id: "l2" }, { id: "l3" }, { id: "l4" }],
            progress: [
                { lesson_id: "l1", completed: true },
                { lesson_id: "l2", completed: true },
            ],
            enrollment: {
                progress_pct: 50,
            },
        } as any);

        const result = await getActualProgressStats("ignored-user", "intro-to-testing");

        expect(result).toEqual({
            completedCount: 2,
            totalCount: 4,
            progressPct: 50,
        });
    });

    it("flushes queued progress through backend clients", async () => {
        window.localStorage.setItem(
            "dtma_progress_queue_v1",
            JSON.stringify([
                {
                    type: "lesson_progress",
                    payload: {
                        userId: "db-user",
                        courseSlug: "intro-to-testing",
                        lessonId: "lesson-1",
                        completed: true,
                    },
                },
                {
                    type: "enrollment_progress",
                    payload: {
                        userId: "db-user",
                        courseSlug: "intro-to-testing",
                        progressPct: 100,
                    },
                },
            ])
        );

        vi.mocked(lessonAccessApiClient.updateLessonProgress).mockResolvedValue({
            success: true,
        } as any);
        vi.mocked(learningApiClient.recordCourseCompletion).mockResolvedValue({
            success: true,
        } as any);

        await flushProgressQueue();

        expect(window.localStorage.getItem("dtma_progress_queue_v1")).toBe("[]");
        expect(lessonAccessApiClient.updateLessonProgress).toHaveBeenCalledTimes(1);
        expect(learningApiClient.recordCourseCompletion).toHaveBeenCalledTimes(1);
    });
});
