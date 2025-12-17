export type AudienceLevel = "Digital Leaders" | "Digital Workers";

export type LessonType = "intro" | "standard" | "outro" | "quiz";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  categoryId: string;
  audienceLevel: AudienceLevel;
  topicTags: string[];
  levelTag: string;
  estimatedDurationMinutes: number;
  lessonCount: number;
  heroImageUrl?: string;
  thumbnailUrl?: string;
  introLessonId?: string;
  introVideoUrl?: string;
  introVideoPosterUrl?: string;
  isFeatured?: boolean;
  status?: "draft" | "published";
  rating?: number;
  reviewCount?: number;
  enrollmentUrl?: string;
  learningOutcomes?: string[];
  skillsGained?: string[];
  uponCompletion?: string;
  startDate?: string;
  location?: string;
  courseTimeline?: any;
  keyHighlights?: string[] | string;
  industry?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  orderIndex: number;
  estimatedDurationMinutes: number;
  videoUrl?: string;
  resourceUrl?: string;
  content?: string;
}

export interface CourseCatalogFilters {
  search?: string;
  categorySlug?: string;
  audienceLevel?: AudienceLevel;
  topic?: string;
  levelTag?: string;
  industry?: string;
}
