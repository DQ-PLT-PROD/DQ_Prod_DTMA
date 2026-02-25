import { describe, expect, it } from "vitest";
import {
    computeCourseContentStats,
    computeTrackableProgress,
    getCountableLessonNumber,
} from "./metrics";

describe("courseProgress metrics", () => {
    const items = [
        { id: "intro-1", type: "intro" },
        { id: "lesson-1", type: "standard" },
        { id: "lesson-2", type: "standard" },
        { id: "quiz-1", type: "quiz" },
        { id: "outro-1", type: "outro" },
    ];

    it("computes canonical lesson and trackable counts", () => {
        const stats = computeCourseContentStats(items);
        expect(stats.totalContentItems).toBe(5);
        expect(stats.lessonCount).toBe(2);
        expect(stats.trackableLessonCount).toBe(3);
    });

    it("computes equal-weight trackable progress including assessment quiz", () => {
        const progress = computeTrackableProgress(
            items,
            ["lesson-1", "quiz-1"],
            true,
            true
        );

        expect(progress.trackableItemCount).toBe(4); // 3 trackable lessons + 1 assessment quiz
        expect(progress.completedTrackableItems).toBe(3); // lesson-1 + quiz-1 + assessment quiz
        expect(progress.progressPercent).toBe(75);
    });

    it("returns 0% when learner has not started", () => {
        const progress = computeTrackableProgress(items, [], true, false);
        expect(progress.completedTrackableItems).toBe(0);
        expect(progress.progressPercent).toBe(0);
    });

    it("returns 100% only when all trackable items are complete", () => {
        const progress = computeTrackableProgress(
            items,
            ["lesson-1", "lesson-2", "quiz-1"],
            true,
            true
        );
        expect(progress.completedTrackableItems).toBe(4);
        expect(progress.trackableItemCount).toBe(4);
        expect(progress.progressPercent).toBe(100);
    });

    it("numbers only standard lessons", () => {
        expect(getCountableLessonNumber(items, 0)).toBeNull(); // intro
        expect(getCountableLessonNumber(items, 1)).toBe(1);
        expect(getCountableLessonNumber(items, 2)).toBe(2);
        expect(getCountableLessonNumber(items, 3)).toBeNull(); // quiz
        expect(getCountableLessonNumber(items, 4)).toBeNull(); // outro
    });
});
