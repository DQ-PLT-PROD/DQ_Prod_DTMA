import {
  Category,
  Course,
  CourseCatalogFilters,
  Lesson,
} from "../../types/dtma-lms";
import { categories } from "../../data/dtma/categories";
import { courses } from "../../data/dtma/courses";
import { lessons } from "../../data/dtma/lessons";

const categoryMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c])
);

const normalize = (value?: string) =>
  (value || "").toLowerCase().trim();

export const formatDuration = (minutes?: number): string => {
  if (!minutes || Number.isNaN(minutes)) return "";
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const matchesSearch = (course: Course, term?: string) => {
  if (!term) return true;
  const t = normalize(term);
  const categoryName = categoryMap[course.categoryId]?.name || "";
  return (
    normalize(course.title).includes(t) ||
    normalize(course.shortDescription).includes(t) ||
    normalize(course.longDescription).includes(t) ||
    normalize(categoryName).includes(t) ||
    normalize(course.provider?.name || "").includes(t) ||
    course.topicTags.some((tag) => normalize(tag).includes(t)) ||
    (course.skillsGained || []).some((skill) => normalize(skill).includes(t)) ||
    (course.learningOutcomes || []).some((outcome) => normalize(outcome).includes(t))
  );
};

const matchesFilters = (course: Course, filters?: CourseCatalogFilters) => {
  if (!filters) return true;

  if (filters.categorySlug) {
    const category = categories.find((c) => c.slug === filters.categorySlug);
    if (!category || course.categoryId !== category.id) return false;
  }

  if (filters.audienceLevel) {
    if (course.audienceLevel !== filters.audienceLevel) return false;
  }

  if (filters.topic) {
    const t = normalize(filters.topic);
    const hasTopic = course.topicTags.some((tag) => normalize(tag) === t);
    if (!hasTopic) return false;
  }

  if (filters.levelTag) {
    if (normalize(course.levelTag) !== normalize(filters.levelTag)) return false;
  }

  if (filters.deliveryMode) {
    if (normalize(course.deliveryMode) !== normalize(filters.deliveryMode)) return false;
  }

  return true;
};

export const getCategories = (): Category[] => categories;

export const getCourseBySlug = (slug?: string): Course | undefined => {
  if (!slug) return undefined;
  return courses.find(
    (course) =>
      course.slug === slug ||
      course.id === slug ||
      normalize(course.slug) === normalize(slug)
  );
};

export const getCourses = (
  filters?: CourseCatalogFilters
): Course[] => {
  return courses
    .filter((course) => matchesFilters(course, filters))
    .filter((course) => matchesSearch(course, filters?.search));
};

export const getCoursesByCategory = (categorySlug: string): Course[] => {
  return getCourses({ categorySlug });
};

export const getFeaturedCourses = (): Course[] =>
  courses.filter((c) => c.isFeatured);

export const getLessonsByCourse = (
  courseIdOrSlug: string
): Lesson[] => {
  const course = getCourseBySlug(courseIdOrSlug);
  if (!course) return [];
  return lessons
    .filter((lesson) => lesson.courseId === course.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);
};

export const getRelatedCourses = (
  courseIdOrSlug: string,
  limit = 3
): Course[] => {
  const course = getCourseBySlug(courseIdOrSlug);
  if (!course) return [];
  return courses
    .filter(
      (c) =>
        c.id !== course.id &&
        (c.categoryId === course.categoryId ||
          c.audienceLevel === course.audienceLevel)
    )
    .slice(0, limit);
};

export const getIntroLessonForCourse = (
  courseIdOrSlug: string
): Lesson | undefined => {
  const course = getCourseBySlug(courseIdOrSlug);
  if (!course) return undefined;
  const courseLessons = getLessonsByCourse(course.id);
  const fromCourseField = course.introLessonId
    ? courseLessons.find((lesson) => lesson.id === course.introLessonId)
    : undefined;
  const fromType = courseLessons.find((lesson) => lesson.type === "intro");
  return fromCourseField || fromType || courseLessons[0];
};

export const getIntroVideoForCourse = (
  courseIdOrSlug: string
): { videoUrl?: string; posterUrl?: string } => {
  const course = getCourseBySlug(courseIdOrSlug);
  if (!course) return { videoUrl: undefined, posterUrl: undefined };
  const introLesson = getIntroLessonForCourse(courseIdOrSlug);
  const videoUrl = course.introVideoUrl || introLesson?.videoUrl;
  const posterUrl =
    course.introVideoPosterUrl || course.heroImageUrl || course.provider?.logoUrl;
  return { videoUrl, posterUrl };
};

export const toMarketplaceItem = (course: Course) => {
  const category = categoryMap[course.categoryId];
  const durationLabel = formatDuration(course.estimatedDurationMinutes);
  const introLesson = getIntroLessonForCourse(course.id);
  const introVideo = getIntroVideoForCourse(course.id);
  return {
    id: course.slug,
    slug: course.slug,
    title: course.title,
    description: course.shortDescription,
    category: category?.name,
    categorySlug: category?.slug,
    deliveryMode: course.deliveryMode || "Online",
    duration: durationLabel,
    durationMinutes: course.estimatedDurationMinutes,
    lessonCount: course.lessonCount,
    levelTag: course.levelTag,
    audienceLevel: course.audienceLevel,
    topicTags: course.topicTags,
    tags: [
      category?.name,
      course.levelTag,
      course.audienceLevel,
      ...course.topicTags.slice(0, 2),
    ].filter(Boolean),
    provider: {
      name: course.provider.name,
      logoUrl: course.provider.logoUrl,
      description: course.provider.description || "",
    },
    heroImageUrl: course.heroImageUrl,
    introLessonId: course.introLessonId || introLesson?.id,
    introVideoUrl: introVideo.videoUrl,
    introVideoPosterUrl: introVideo.posterUrl,
    rating: course.rating ?? 4.6,
    reviewCount: course.reviewCount ?? 24,
    formUrl: course.enrollmentUrl,
    learningOutcomes: course.learningOutcomes,
    startDate: course.startDate,
  };
};
