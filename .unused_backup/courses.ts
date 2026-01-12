/**
 * Course Service
 *
 * This module provides functions for interacting with the course API.
 * It abstracts all API calls related to courses, ensuring consistent
 * error handling and data transformation.
 */
import { getCourses as getDtmaCourses, getCourseBySlug, getRelatedCourses, toMarketplaceItem, getCategories as getDtmaCategories } from "../lib/api/dtmaCourses";
import { CourseType, ProviderType, FilterOptions } from "../types/course";
/**
 * Fetches courses based on filter criteria and search query
 *
 * @param filters - Object containing filter criteria
 * @param searchQuery - Optional search term
 * @returns Promise resolving to an array of courses
 */
export const fetchCourses = async (
  filters: {
    category?: string;
    deliveryMode?: string;
    businessStage?: string;
    provider?: string;
  },
  searchQuery?: string
): Promise<CourseType[]> => {
  const mapped = getDtmaCourses({
    search: searchQuery,
    categorySlug: filters.category || undefined,
    deliveryMode: filters.deliveryMode || undefined,
  }).map((course) => ({
    id: course.slug,
    title: course.title,
    description: course.shortDescription,
    category: course.categoryId,
    deliveryMode: course.deliveryMode,
    duration: course.estimatedDurationMinutes ? `${course.estimatedDurationMinutes} mins` : "",
    durationType: course.levelTag,
    businessStage: course.audienceLevel,
    provider: course.provider as ProviderType,
    learningOutcomes: course.learningOutcomes || [],
    startDate: course.startDate || "",
    price: "Free",
    tags: course.topicTags,
    lessonCount: course.lessonCount,
    levelTag: course.levelTag,
    audienceLevel: course.audienceLevel,
  }));
  return mapped as any;
};
/**
 * Fetches details for a specific course
 *
 * @param courseId - The ID of the course to fetch
 * @returns Promise resolving to a course object
 */
export const fetchCourseDetails = async (
  courseId: string
): Promise<CourseType> => {
  const course = getCourseBySlug(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  return {
    id: course.slug,
    title: course.title,
    description: course.shortDescription,
    category: course.categoryId,
    deliveryMode: course.deliveryMode,
    duration: course.estimatedDurationMinutes ? `${course.estimatedDurationMinutes} mins` : "",
    durationType: course.levelTag,
    businessStage: course.audienceLevel,
    provider: course.provider as ProviderType,
    learningOutcomes: course.learningOutcomes || [],
    startDate: course.startDate || "",
    price: "Free",
    tags: course.topicTags,
  } as any;
};
/**
 * Fetches courses related to a specific course
 *
 * @param courseId - The ID of the reference course
 * @param category - The category of the reference course
 * @param provider - The provider of the reference course
 * @returns Promise resolving to an array of related courses
 */
export const fetchRelatedCourses = async (
  courseId: string,
  _category: string,
  _provider: string
): Promise<CourseType[]> => {
  const related = getRelatedCourses(courseId).map((course) => ({
    id: course.slug,
    title: course.title,
    description: course.shortDescription,
    category: course.categoryId,
    deliveryMode: course.deliveryMode,
    duration: course.estimatedDurationMinutes ? `${course.estimatedDurationMinutes} mins` : "",
    durationType: course.levelTag,
    businessStage: course.audienceLevel,
    provider: course.provider as ProviderType,
    learningOutcomes: course.learningOutcomes || [],
    startDate: course.startDate || "",
    price: "Free",
    tags: course.topicTags,
  }));
  return related as any;
};
/**
 * Fetches all filter options for the course marketplace
 *
 * @returns Promise resolving to an object containing all filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const categories = getDtmaCategories().map((c) => ({
    id: c.slug,
    name: c.name,
  }));
  const deliveryModes = [
    { id: "Online", name: "Online" },
    { id: "Hybrid", name: "Hybrid" },
    { id: "In-person", name: "In-person" },
  ];
  return {
    categories,
    deliveryModes,
    businessStages: [],
    providers: [],
  };
};
