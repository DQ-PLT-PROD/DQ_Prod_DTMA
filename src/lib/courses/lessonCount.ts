export interface LessonTypeShape {
  type?: string | null;
}

const EXCLUDED_LESSON_TYPES = new Set(["intro", "outro"]);

const normalizeLessonType = (type: string | null | undefined): string => {
  return (type || "").trim().toLowerCase();
};

/**
 * Canonical learner-facing lesson rule:
 * count every lesson except explicit intro/outro items.
 */
export const isCountableLessonType = (type: string | null | undefined): boolean => {
  return !EXCLUDED_LESSON_TYPES.has(normalizeLessonType(type));
};

export const countCountableLessons = (lessons: LessonTypeShape[] | null | undefined): number => {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return 0;
  }

  return lessons.filter((lesson) => isCountableLessonType(lesson?.type)).length;
};
