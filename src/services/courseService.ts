import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { countCountableLessons } from "@/lib/courses/lessonCount";
import { Category, Course, CourseCatalogFilters, Lesson, Module, Quiz, QuizQuestion } from "@/types/dtma-lms";

export interface CourseResource {
  id: string;
  courseSlug: string;
  title: string;
  type: "whitepaper" | "pdf" | "template" | "tool" | "worksheet" | "other";
  description?: string;
  resourceUrl: string;
  fileSizeBytes?: number;
  orderIndex: number;
}

export interface CourseNavItem {
  slug: string;
  title: string;
  shortDescription: string;
  heroImageUrl?: string;
  thumbnailUrl?: string;
}

export interface LearnerQuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestion["type"];
  options: { id: string; text: string }[];
}

export interface LearnerQuizSession {
  quizId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  hideAnswers: boolean;
  questions: LearnerQuizQuestion[];
}

export interface LearnerQuizAnswerEvaluation {
  questionId: string;
  isCorrect: boolean;
  hideAnswers: boolean;
  explanation?: string;
}

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  long_description?: string | null;
  category_id?: string | null;
  audience_level?: string | null;
  topic_tags?: string[] | null;
  level_tag?: string | null;
  is_featured?: boolean | null;
  is_coming_soon?: boolean | null;
  status?: string | null;
  rating?: number | null;
  review_count?: number | null;
  enrollment_url?: string | null;
  learning_outcomes?: string[] | null;
  skills_gained?: string[] | null;
  upon_completion?: string | null;
  start_date?: string | null;
  industry?: string | null;
  created_at?: string | null;
  course_categories?: { name?: string | null } | null;
};

type ModuleRow = {
  id: string;
  slug: string;
  course_slug: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  order_index?: number | null;
  estimated_duration_minutes?: number | null;
  status?: string | null;
};

type LessonRow = {
  id: string;
  course_slug: string;
  module_id?: string | null;
  title: string;
  type: "intro" | "standard" | "outro" | "quiz";
  order_index: number;
  estimated_duration_minutes?: number | null;
  video_url?: string | null;
  resource_url?: string | null;
  content?: string | null;
  is_preview?: boolean | null;
};

type QuizRow = {
  id: string;
  course_slug: string;
  module_id?: string | null;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  order_index?: number | null;
  passing_score?: number | null;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  is_published?: boolean | null;
  shuffle_questions?: boolean | null;
  hide_answers?: boolean | null;
  question?: string | null;
  options?: any;
  correct_answer?: any;
  explanation?: string | null;
};

type ResourceRow = {
  id: string;
  course_slug: string;
  title: string;
  type: "whitepaper" | "pdf" | "template" | "tool" | "worksheet" | "other";
  description?: string | null;
  resource_url: string;
  file_size_bytes?: number | null;
  order_index?: number | null;
};

const coursesCache: {
  data: any[];
  timestamp: number;
  filters: string;
} = {
  data: [],
  timestamp: 0,
  filters: "",
};

const CACHE_TTL_MS = 5 * 60 * 1000;

const formatDuration = (minutes: number): string => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

const toAudienceLevel = (value?: string | null) =>
  (value as Course["audienceLevel"]) || "Digital Workers";

const mapLessonRow = (row: LessonRow): Lesson => ({
  id: row.id,
  courseId: row.course_slug,
  moduleId: row.module_id || undefined,
  title: row.title,
  type: row.type,
  orderIndex: Number(row.order_index || 0),
  estimatedDurationMinutes: Number(row.estimated_duration_minutes || 0),
  videoUrl: row.video_url || undefined,
  resourceUrl: row.resource_url || undefined,
  content: row.content || undefined,
  isPreview: Boolean(row.is_preview),
});

const mapQuizRow = (row: QuizRow): Quiz => ({
  id: row.id,
  courseSlug: row.course_slug,
  title: row.title,
  description: row.description || undefined,
  orderIndex: Number(row.order_index || 0),
  moduleId: row.module_id || undefined,
  lessonId: row.lesson_id || undefined,
  passingScore: row.passing_score || undefined,
  timeLimitMinutes: row.time_limit_minutes || undefined,
  maxAttempts: row.max_attempts || undefined,
  isPublished: row.is_published || undefined,
  shuffleQuestions: row.shuffle_questions || undefined,
  hideAnswers: row.hide_answers || undefined,
  question: row.question || undefined,
  options: row.options || [],
  correctAnswer: row.correct_answer,
  explanation: row.explanation || undefined,
});

const normalizeQuizQuestionType = (value?: string | null): QuizQuestion["type"] => {
  if (
    value === "single_select" ||
    value === "multi_select" ||
    value === "true_false" ||
    value === "text"
  ) {
    return value;
  }

  return "single_select";
};

const normalizeQuizOptions = (value: any): { id: string; text: string }[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((option, index) => {
    if (typeof option === "string") {
      return { id: String(index), text: option };
    }

    return {
      id: String(option?.id ?? option?.value ?? index),
      text: String(option?.text ?? option?.label ?? `Option ${index + 1}`),
    };
  });
};

const mapResourceRow = (row: ResourceRow): CourseResource => ({
  id: row.id,
  courseSlug: row.course_slug,
  title: row.title,
  type: row.type,
  description: row.description || undefined,
  resourceUrl: row.resource_url,
  fileSizeBytes: row.file_size_bytes || undefined,
  orderIndex: Number(row.order_index || 0),
});

const mapModuleRow = (row: ModuleRow): Module => ({
  id: row.id,
  slug: row.slug,
  courseSlug: row.course_slug,
  title: row.title,
  description: row.description || undefined,
  thumbnailUrl: row.thumbnail_url || undefined,
  orderIndex: Number(row.order_index || 0),
  estimatedDurationMinutes: Number(row.estimated_duration_minutes || 0),
  status: (row.status as Module["status"]) || undefined,
});

const getCourseFieldSelect = (excludeHeavyFields?: boolean) =>
  excludeHeavyFields
    ? [
        "id",
        "slug",
        "title",
        "short_description",
        "long_description",
        "category_id",
        "audience_level",
        "topic_tags",
        "level_tag",
        "is_featured",
        "is_coming_soon",
        "status",
        "rating",
        "review_count",
        "enrollment_url",
        "learning_outcomes",
        "skills_gained",
        "upon_completion",
        "start_date",
        "industry",
        "created_at",
        "course_categories(name)",
      ].join(",")
    : "*, course_categories(name)";

const resolvePublishedCourseRows = async (
  filters?: CourseCatalogFilters
): Promise<CourseRow[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();
  let query: any = supabase
    .from("courses")
    .select(getCourseFieldSelect(filters?.excludeHeavyFields))
    .eq("status", "published");

  if (filters?.featured) {
    query = query.eq("is_featured", true);
  }

  if (filters?.categories?.length) {
    query = query.in("category_id", filters.categories);
  }

  if (filters?.audienceLevels?.length) {
    query = query.in("audience_level", filters.audienceLevels);
  }

  if (filters?.levelTags?.length) {
    query = query.in("level_tag", filters.levelTags);
  }

  if (filters?.industries?.length) {
    query = query.in("industry", filters.industries);
  }

  if (filters?.topics?.length) {
    query = query.overlaps("topic_tags", filters.topics);
  }

  if (filters?.courseSlugs?.length) {
    query = query.in("slug", filters.courseSlugs);
  }

  if (filters?.search?.trim()) {
    const searchTerm = filters.search.trim();
    query = query.or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
  }

  query = query
    .order("is_coming_soon", { ascending: true })
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch course containers:", error.message);
    return [];
  }

  return ((data || []) as CourseRow[]).filter(Boolean);
};

const resolvePublishedModuleRows = async (courseSlugs: string[]): Promise<ModuleRow[]> => {
  if (!isSupabaseConfigured() || courseSlugs.length === 0) {
    return [];
  }

  const supabase = getSupabase();
  const { data, error } = await (supabase.from("modules" as any) as any)
    .select("id, slug, course_slug, title, description, thumbnail_url, order_index, estimated_duration_minutes, status")
    .eq("status", "published")
    .in("course_slug", courseSlugs)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Failed to fetch modules:", error.message);
    return [];
  }

  return ((data || []) as unknown) as ModuleRow[];
};

const resolveLessonsForModules = async (moduleIds: string[]): Promise<Map<string, Lesson[]>> => {
  if (!isSupabaseConfigured() || moduleIds.length === 0) {
    return new Map<string, Lesson[]>();
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, course_slug, module_id, title, type, order_index, estimated_duration_minutes, video_url, resource_url, content, is_preview")
    .in("module_id", moduleIds)
    .order("order_index", { ascending: true });

  if (error) {
    console.warn("Failed to fetch module lessons:", error.message);
    return new Map<string, Lesson[]>();
  }

  const lessonsByModule = new Map<string, Lesson[]>();
  ((data || []) as LessonRow[]).forEach((row) => {
    const moduleId = row.module_id;
    if (!moduleId) return;
    const lesson = mapLessonRow(row);
    const existing = lessonsByModule.get(moduleId) || [];
    existing.push(lesson);
    lessonsByModule.set(moduleId, existing);
  });

  return lessonsByModule;
};

const getFirstPlayableLesson = (lessons: Lesson[]) =>
  [...lessons]
    .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0))
    .find((lesson) => Boolean(lesson.videoUrl));

const toMarketplaceItem = (
  moduleRow: ModuleRow,
  courseRow: CourseRow,
  lessons: Lesson[]
) => {
  const countedLessons = lessons.filter((lesson) => lesson.type !== "intro" && lesson.type !== "outro");
  const estimatedDurationMinutes =
    Number(moduleRow.estimated_duration_minutes || 0) ||
    lessons.reduce((sum, lesson) => sum + Number(lesson.estimatedDurationMinutes || 0), 0);
  const firstPlayableLesson = getFirstPlayableLesson(lessons);

  return {
    id: moduleRow.slug,
    slug: moduleRow.slug,
    title: moduleRow.title,
    description: moduleRow.description || courseRow.short_description || "",
    shortDescription: moduleRow.description || courseRow.short_description || "",
    category: courseRow.title,
    categoryName: courseRow.title,
    categorySlug: courseRow.category_id || "",
    courseSlug: moduleRow.course_slug,
    containerCourseSlug: moduleRow.course_slug,
    containerCourseTitle: courseRow.title,
    industry: courseRow.industry || undefined,
    duration: formatDuration(estimatedDurationMinutes),
    durationMinutes: estimatedDurationMinutes,
    lessonCount: countCountableLessons(countedLessons.length > 0 ? countedLessons : lessons),
    levelTag: courseRow.level_tag || "",
    audienceLevel: toAudienceLevel(courseRow.audience_level),
    topicTags: courseRow.topic_tags || [],
    tags: [courseRow.level_tag, courseRow.audience_level, ...(courseRow.topic_tags || []).slice(0, 2)].filter(Boolean),
    heroImageUrl: moduleRow.thumbnail_url || undefined,
    thumbnailUrl: moduleRow.thumbnail_url || undefined,
    introVideoUrl: firstPlayableLesson?.videoUrl,
    introVideoPosterUrl: moduleRow.thumbnail_url || undefined,
    rating: courseRow.rating ?? 4.6,
    reviewCount: courseRow.review_count ?? 24,
    formUrl: courseRow.enrollment_url || undefined,
    learningOutcomes: courseRow.learning_outcomes || [],
    startDate: courseRow.start_date || undefined,
    isFeatured: Boolean(courseRow.is_featured),
    isComingSoon: Boolean(courseRow.is_coming_soon),
  };
};

const resolveModuleContext = async (moduleSlug: string): Promise<{
  moduleRow: ModuleRow | null;
  courseRow: CourseRow | null;
}> => {
  if (!isSupabaseConfigured()) {
    return { moduleRow: null, courseRow: null };
  }

  const supabase = getSupabase();
  const { data: moduleData, error: moduleError } = await (supabase.from("modules" as any) as any)
    .select("id, slug, course_slug, title, description, thumbnail_url, order_index, estimated_duration_minutes, status")
    .eq("slug", moduleSlug)
    .single();

  if (moduleError || !moduleData) {
    console.error("Failed to resolve module:", moduleError?.message || moduleSlug);
    return { moduleRow: null, courseRow: null };
  }

  const moduleRow = (moduleData as unknown) as ModuleRow;
  const { data: courseData, error: courseError } = await getSupabase()
    .from("courses")
    .select("*, course_categories(name)")
    .eq("slug", moduleRow.course_slug)
    .single();

  if (courseError || !courseData) {
    console.error("Failed to resolve parent course:", courseError?.message || moduleRow.course_slug);
    return { moduleRow, courseRow: null };
  }

  return { moduleRow, courseRow: courseData as CourseRow };
};

const toCourseLikeDetail = (
  moduleRow: ModuleRow,
  courseRow: CourseRow,
  lessons: Lesson[]
): Course & {
  containerCourseSlug: string;
  containerCourseTitle: string;
  moduleId: string;
} => {
  const countedLessons = lessons.filter((lesson) => lesson.type !== "intro" && lesson.type !== "outro");
  const estimatedDurationMinutes =
    Number(moduleRow.estimated_duration_minutes || 0) ||
    lessons.reduce((sum, lesson) => sum + Number(lesson.estimatedDurationMinutes || 0), 0);
  const firstIntroLesson =
    [...lessons]
      .sort((left, right) => Number(left.orderIndex || 0) - Number(right.orderIndex || 0))
      .find((lesson) => lesson.type === "intro") || getFirstPlayableLesson(lessons);

  return {
    id: moduleRow.id,
    slug: moduleRow.slug,
    title: moduleRow.title,
    shortDescription: moduleRow.description || courseRow.short_description || "",
    longDescription: moduleRow.description || courseRow.long_description || courseRow.short_description || "",
    categoryId: courseRow.category_id || "",
    audienceLevel: toAudienceLevel(courseRow.audience_level),
    topicTags: courseRow.topic_tags || [],
    levelTag: courseRow.level_tag || "",
    estimatedDurationMinutes,
    lessonCount: countCountableLessons(countedLessons.length > 0 ? countedLessons : lessons),
    heroImageUrl: moduleRow.thumbnail_url || undefined,
    thumbnailUrl: moduleRow.thumbnail_url || undefined,
    introLessonId: firstIntroLesson?.id,
    introVideoUrl: firstIntroLesson?.videoUrl,
    introVideoPosterUrl: moduleRow.thumbnail_url || undefined,
    isFeatured: Boolean(courseRow.is_featured),
    isComingSoon: Boolean(courseRow.is_coming_soon),
    status: (moduleRow.status as Course["status"]) || (courseRow.status as Course["status"]) || "draft",
    rating: courseRow.rating || undefined,
    reviewCount: courseRow.review_count || undefined,
    enrollmentUrl: courseRow.enrollment_url || undefined,
    learningOutcomes: courseRow.learning_outcomes || [],
    skillsGained: courseRow.skills_gained || [],
    uponCompletion: courseRow.upon_completion || undefined,
    startDate: courseRow.start_date || undefined,
    industry: courseRow.industry || undefined,
    containerCourseSlug: moduleRow.course_slug,
    containerCourseTitle: courseRow.title,
    moduleId: moduleRow.id,
  };
};

export const fetchCourses = async (filters?: CourseCatalogFilters): Promise<any[]> => {
  const filtersKey = JSON.stringify(filters || {});
  const now = Date.now();
  const isCacheValid =
    now - coursesCache.timestamp < CACHE_TTL_MS && coursesCache.filters === filtersKey;

  if (isCacheValid && coursesCache.data.length > 0) {
    return coursesCache.data;
  }

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, returning empty module catalog");
    return [];
  }

  try {
    const courseRows = await resolvePublishedCourseRows(filters);
    const courseRowMap = new Map(courseRows.map((row) => [row.slug, row]));
    const courseOrder = new Map(courseRows.map((row, index) => [row.slug, index]));
    const moduleRows = await resolvePublishedModuleRows(courseRows.map((row) => row.slug));
    const lessonsByModule = await resolveLessonsForModules(moduleRows.map((row) => row.id));

    const items = moduleRows
      .map((moduleRow) => {
        const courseRow = courseRowMap.get(moduleRow.course_slug);
        if (!courseRow) return null;
        return toMarketplaceItem(moduleRow, courseRow, lessonsByModule.get(moduleRow.id) || []);
      })
      .filter(Boolean)
      .sort((left: any, right: any) => {
        const leftCourseOrder = courseOrder.get(left.courseSlug) ?? Number.MAX_SAFE_INTEGER;
        const rightCourseOrder = courseOrder.get(right.courseSlug) ?? Number.MAX_SAFE_INTEGER;
        return leftCourseOrder - rightCourseOrder || left.title.localeCompare(right.title);
      });

    coursesCache.data = items;
    coursesCache.timestamp = Date.now();
    coursesCache.filters = filtersKey;

    return items;
  } catch (error) {
    console.error("Unexpected error fetching learner modules:", error);
    return [];
  }
};

export const fetchFullCourse = async (slug: string): Promise<Course | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { moduleRow, courseRow } = await resolveModuleContext(slug);
    if (!moduleRow || !courseRow) {
      return null;
    }

    const lessons = await fetchCourseLessons(slug);
    return toCourseLikeDetail(moduleRow, courseRow, lessons);
  } catch (error) {
    console.error("Unexpected error fetching module details:", error);
    return null;
  }
};

export const fetchCourseModules = async (moduleSlug: string): Promise<Module[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { moduleRow } = await resolveModuleContext(moduleSlug);
  return moduleRow ? [mapModuleRow(moduleRow)] : [];
};

export const fetchCourseLessons = async (moduleSlug: string): Promise<Lesson[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { moduleRow } = await resolveModuleContext(moduleSlug);
    if (!moduleRow) {
      return [];
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("lessons")
      .select("id, course_slug, module_id, title, type, order_index, estimated_duration_minutes, video_url, resource_url, content, is_preview")
      .eq("module_id", moduleRow.id)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("Error fetching module lessons:", error.message);
      return [];
    }

    return ((data || []) as LessonRow[]).map(mapLessonRow);
  } catch (error) {
    console.warn("Unexpected error fetching module lessons:", error);
    return [];
  }
};

export const fetchCourseQuizzes = async (moduleSlug: string): Promise<Quiz[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { moduleRow } = await resolveModuleContext(moduleSlug);
    if (!moduleRow) {
      return [];
    }

    const { data, error } = await getSupabase()
      .from("quizzes")
      .select("*")
      .eq("module_id", moduleRow.id)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("Error fetching module quizzes:", error.message);
      return [];
    }

    return ((data || []) as QuizRow[]).map(mapQuizRow);
  } catch (error) {
    console.warn("Unexpected error fetching module quizzes:", error);
    return [];
  }
};

export const fetchCourseResources = async (moduleSlug: string): Promise<CourseResource[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { moduleRow } = await resolveModuleContext(moduleSlug);
    if (!moduleRow) {
      return [];
    }

    const { data, error } = await getSupabase()
      .from("course_resources")
      .select("*")
      .eq("course_slug", moduleRow.course_slug)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("Error fetching module resources:", error.message);
      return [];
    }

    return ((data || []) as ResourceRow[]).map(mapResourceRow);
  } catch (error) {
    console.warn("Unexpected error fetching module resources:", error);
    return [];
  }
};

export const fetchLearningModuleContent = async (moduleSlug: string): Promise<{
  course: Course | null;
  modules: Module[];
  lessons: Lesson[];
  resources: CourseResource[];
}> => {
  if (!isSupabaseConfigured()) {
    return {
      course: null,
      modules: [],
      lessons: [],
      resources: [],
    };
  }

  try {
    const { moduleRow, courseRow } = await resolveModuleContext(moduleSlug);
    if (!moduleRow || !courseRow) {
      return {
        course: null,
        modules: [],
        lessons: [],
        resources: [],
      };
    }

    const supabase = getSupabase();
    const [lessonsResponse, resourcesResponse] = await Promise.all([
      supabase
        .from("lessons")
        .select("id, course_slug, module_id, title, type, order_index, estimated_duration_minutes, video_url, resource_url, content, is_preview")
        .eq("module_id", moduleRow.id)
        .order("order_index", { ascending: true }),
      supabase
        .from("course_resources")
        .select("*")
        .eq("course_slug", moduleRow.course_slug)
        .order("order_index", { ascending: true }),
    ]);

    if (lessonsResponse.error) {
      console.warn("Error fetching learning lessons:", lessonsResponse.error.message);
    }

    if (resourcesResponse.error) {
      console.warn("Error fetching learning resources:", resourcesResponse.error.message);
    }

    const lessons = ((lessonsResponse.data || []) as LessonRow[]).map(mapLessonRow);
    const resources = ((resourcesResponse.data || []) as ResourceRow[]).map(mapResourceRow);

    return {
      course: toCourseLikeDetail(moduleRow, courseRow, lessons),
      modules: [mapModuleRow(moduleRow)],
      lessons,
      resources,
    };
  } catch (error) {
    console.error("Unexpected error fetching learning module content:", error);
    return {
      course: null,
      modules: [],
      lessons: [],
      resources: [],
    };
  }
};

export const fetchLearnerQuizSession = async (
  moduleSlug: string
): Promise<LearnerQuizSession | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await (getSupabase() as any).rpc("get_published_module_quiz", {
      p_module_slug: moduleSlug,
    });

    if (error) {
      console.warn("Error fetching learner quiz session:", error.message);
      return null;
    }

    if (!data || !Array.isArray(data.questions)) {
      return null;
    }

    return {
      quizId: String(data.quizId ?? ""),
      title: String(data.title ?? "Module Assessment"),
      description: data.description || undefined,
      passingScore: Number(data.passingScore ?? 80),
      timeLimitMinutes: data.timeLimitMinutes ? Number(data.timeLimitMinutes) : undefined,
      maxAttempts: data.maxAttempts ? Number(data.maxAttempts) : undefined,
      shuffleQuestions: Boolean(data.shuffleQuestions),
      hideAnswers: Boolean(data.hideAnswers),
      questions: data.questions.map((question: any) => ({
        id: String(question.id),
        quizId: String(question.quizId ?? data.quizId ?? ""),
        question: String(question.question ?? ""),
        type: normalizeQuizQuestionType(question.type),
        options: normalizeQuizOptions(question.options),
      })),
    };
  } catch (error) {
    console.warn("Unexpected error fetching learner quiz session:", error);
    return null;
  }
};

export const evaluateLearnerQuizAnswer = async (
  questionId: string,
  selectedAnswerIds: string[]
): Promise<LearnerQuizAnswerEvaluation | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await (getSupabase() as any).rpc("evaluate_published_quiz_answer", {
      p_question_id: questionId,
      p_selected_answer_ids: selectedAnswerIds,
    });

    if (error) {
      console.warn("Error evaluating learner quiz answer:", error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      questionId: String(data.questionId ?? questionId),
      isCorrect: Boolean(data.isCorrect),
      hideAnswers: Boolean(data.hideAnswers),
      explanation: data.explanation || undefined,
    };
  } catch (error) {
    console.warn("Unexpected error evaluating learner quiz answer:", error);
    return null;
  }
};

export const fetchCourseWithContent = async (slug: string): Promise<{
  course: Course | null;
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  resources: CourseResource[];
}> => {
  const [course, modules, lessons, resources] = await Promise.all([
    fetchFullCourse(slug),
    fetchCourseModules(slug),
    fetchCourseLessons(slug),
    fetchCourseResources(slug),
  ]);

  return {
    course,
    modules,
    lessons,
    quizzes: [],
    resources,
  };
};

export const fetchRelatedCourses = async (
  slug: string,
  limit: number = 4
): Promise<Course[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { moduleRow, courseRow } = await resolveModuleContext(slug);
    if (!moduleRow || !courseRow) {
      return [];
    }

    const { data, error } = await (getSupabase().from("modules" as any) as any)
      .select("id, slug, course_slug, title, description, thumbnail_url, order_index, estimated_duration_minutes, status")
      .eq("course_slug", moduleRow.course_slug)
      .eq("status", "published")
      .neq("slug", slug)
      .order("order_index", { ascending: true })
      .limit(Math.max(1, Math.min(8, limit)));

    if (error) {
      console.error("Error fetching related modules:", error.message);
      return [];
    }

    const moduleRows = ((data || []) as unknown) as ModuleRow[];
    const lessonsByModule = await resolveLessonsForModules(moduleRows.map((row) => row.id));

    return moduleRows.map((row) => toCourseLikeDetail(row, courseRow, lessonsByModule.get(row.id) || []));
  } catch (error) {
    console.error("Unexpected error fetching related modules:", error);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await getSupabase()
      .from("course_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }

    return ((data || []) as any[]).map((row) => ({
      id: row.id || row.slug,
      slug: row.slug,
      name: row.name,
      description: row.description || "",
    }));
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return [];
  }
};

export const fetchPublishedCoursesForNav = async (): Promise<CourseNavItem[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const courseRows = await resolvePublishedCourseRows({ excludeHeavyFields: true });
    const moduleRows = await resolvePublishedModuleRows(courseRows.map((row) => row.slug));
    const representativeThumbnailMap = new Map<string, string>();

    [...moduleRows]
      .sort(
        (left, right) =>
          left.course_slug.localeCompare(right.course_slug) ||
          Number(left.order_index || 0) - Number(right.order_index || 0)
      )
      .forEach((row) => {
        if (!row.thumbnail_url || representativeThumbnailMap.has(row.course_slug)) {
          return;
        }

        representativeThumbnailMap.set(row.course_slug, row.thumbnail_url);
      });

    return courseRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      shortDescription: row.short_description || "",
      heroImageUrl: representativeThumbnailMap.get(row.slug),
      thumbnailUrl: representativeThumbnailMap.get(row.slug),
    }));
  } catch (error) {
    console.error("Unexpected error fetching course containers for nav:", error);
    return [];
  }
};
