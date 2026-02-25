/**
 * Canonical course metrics used across catalog, details, players, and dashboard.
 *
 * Progress rule (Option A, equal weighted):
 * - lessonCount = standard lessons only
 * - trackable items = standard lessons + course assessment quiz
 * - progressPercent = completedTrackableItems / trackableItemCount
 */

export interface ContentLike {
    id: string | number;
    type?: string | null;
    completed?: boolean;
}

export interface CourseContentStats {
    totalContentItems: number;
    lessonCount: number;
    trackableLessonCount: number;
}

export interface TrackableProgressStats extends CourseContentStats {
    completedTrackableLessons: number;
    hasAssessmentQuiz: boolean;
    assessmentCompleted: boolean;
    completedTrackableItems: number;
    trackableItemCount: number;
    progressPercent: number;
}

const normalizeType = (type?: string | null): string =>
    String(type || "").trim().toLowerCase();

export const isIntroType = (type?: string | null): boolean =>
    normalizeType(type) === "intro";

export const isOutroType = (type?: string | null): boolean =>
    normalizeType(type) === "outro";

export const isQuizType = (type?: string | null): boolean =>
    normalizeType(type) === "quiz";

export const isStandardLessonType = (type?: string | null): boolean =>
    normalizeType(type) === "standard";

// Lesson count excludes intro/outro and quizzes.
export const isCountableLessonType = (type?: string | null): boolean =>
    isStandardLessonType(type);

// Trackable lesson items include standard lessons and lesson-typed quizzes.
export const isTrackableLessonType = (type?: string | null): boolean => {
    const normalized = normalizeType(type);
    return normalized === "standard" || normalized === "quiz";
};

export const computeCourseContentStats = (
    items: ReadonlyArray<Pick<ContentLike, "type">> = []
): CourseContentStats => {
    const totalContentItems = items.length;
    const lessonCount = items.filter((item) => isCountableLessonType(item.type)).length;
    const trackableLessonCount = items.filter((item) => isTrackableLessonType(item.type)).length;

    return {
        totalContentItems,
        lessonCount,
        trackableLessonCount,
    };
};

const toCompletedSet = (completedIds: Iterable<string | number>): Set<string> => {
    const completed = new Set<string>();
    for (const id of completedIds) {
        completed.add(String(id));
    }
    return completed;
};

export const computeTrackableProgress = (
    items: ReadonlyArray<ContentLike> = [],
    completedIds: Iterable<string | number> = [],
    hasAssessmentQuiz = false,
    assessmentCompleted = false
): TrackableProgressStats => {
    const completed = toCompletedSet(completedIds);
    const contentStats = computeCourseContentStats(items);

    const completedTrackableLessons = items.filter(
        (item) => isTrackableLessonType(item.type) && completed.has(String(item.id))
    ).length;

    const completedTrackableItems =
        completedTrackableLessons + (hasAssessmentQuiz && assessmentCompleted ? 1 : 0);
    const trackableItemCount = contentStats.trackableLessonCount + (hasAssessmentQuiz ? 1 : 0);
    const progressPercent =
        trackableItemCount > 0
            ? Math.round((completedTrackableItems / trackableItemCount) * 100)
            : 0;

    return {
        ...contentStats,
        completedTrackableLessons,
        hasAssessmentQuiz,
        assessmentCompleted,
        completedTrackableItems,
        trackableItemCount,
        progressPercent,
    };
};

export const getCountableLessonNumber = (
    items: ReadonlyArray<Pick<ContentLike, "type">>,
    itemIndex: number
): number | null => {
    const item = items[itemIndex];
    if (!item || !isCountableLessonType(item.type)) {
        return null;
    }

    let count = 0;
    for (let i = 0; i <= itemIndex; i += 1) {
        if (isCountableLessonType(items[i]?.type)) {
            count += 1;
        }
    }

    return count;
};
