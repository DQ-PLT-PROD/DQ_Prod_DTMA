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
  isComingSoon?: boolean;
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

export interface Module {
  id: string;
  slug: string;
  courseSlug: string;
  title: string;
  description?: string;
  learningOutcomes?: string[];
  skillsGained?: string[];
  uponCompletion?: string;
  thumbnailUrl?: string;
  orderIndex: number;
  estimatedDurationMinutes?: number;
  status?: "draft" | "published" | "archived";
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  type: LessonType;
  orderIndex: number;
  estimatedDurationMinutes: number;
  videoUrl?: string;
  resourceUrl?: string;
  content?: string;
  isPreview?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'true_false' | 'text';
  options: { id: string; text: string }[];
  correctAnswer: string | string[]; // ID or array of IDs
  explanation?: string;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  courseSlug: string;
  title: string;
  description?: string;
  orderIndex: number;
  // Hierarchy binding
  moduleId?: string;
  lessonId?: string;
  // Quiz settings
  passingScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  isPublished?: boolean;
  shuffleQuestions?: boolean;
  hideAnswers?: boolean;
  questions?: QuizQuestion[];
  // Legacy fields (optional for backward compatibility)
  question?: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
}

export interface CourseCatalogFilters {
  search?: string;
  categories?: string[];
  audienceLevels?: AudienceLevel[];
  topics?: string[];
  levelTags?: string[];
  industries?: string[];
  courseSlugs?: string[];
  featured?: boolean;
  excludeHeavyFields?: boolean;
}
