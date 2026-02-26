import type { LessonType } from "@/types/dtma-lms";

/**
 * Shared utilities for computing course lesson counts and durations.
 *
 * Business rule: only "standard" lessons count toward both the displayed
 * lesson count and the displayed course duration. Intro, outro, and quiz
 * lesson types are excluded.
 */

interface LessonLike {
    type: string;
    estimated_duration_minutes?: number;
    estimatedDurationMinutes?: number;
}

const STANDARD_TYPE: LessonType = "standard";

/** Count only standard lessons. */
export const countStandardLessons = (lessons: LessonLike[]): number =>
    lessons.filter((l) => l.type === STANDARD_TYPE).length;

/** Sum estimated duration of standard lessons only (in minutes). */
export const sumStandardDuration = (lessons: LessonLike[]): number =>
    lessons
        .filter((l) => l.type === STANDARD_TYPE)
        .reduce(
            (acc, l) =>
                acc +
                (Number(l.estimated_duration_minutes ?? l.estimatedDurationMinutes) || 0),
            0,
        );
