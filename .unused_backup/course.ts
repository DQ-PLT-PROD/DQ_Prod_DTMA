/**
 * Course Types
 *
 * This module defines TypeScript interfaces for course-related data structures.
 */
/**
 * Represents a course provider
 */
export interface ProviderType {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
}
/**
 * Represents a course
 */
export interface CourseType {
  id: string;
  title: string;
  description: string;
  category: string;
  deliveryMode: string;
  duration: string;
  durationType: string;
  businessStage: string;
  provider: ProviderType;
  learningOutcomes: string[];
  startDate: string;
  price?: string;
  location?: string;
  tags?: string[];
  lessonCount?: number;
  levelTag?: string;
  audienceLevel?: string;
}
/**
 * Filter options for the course marketplace
 */
export interface FilterOptions {
  categories: {
    id: string;
    name: string;
  }[];
  deliveryModes: {
    id: string;
    name: string;
  }[];
  businessStages: {
    id: string;
    name: string;
  }[];
  providers: ProviderType[];
}
/**
 * Course filters applied by the user
 */
export interface CourseFilters {
  category: string;
  deliveryMode: string;
  duration: string;
  businessStage: string;
  provider: string;
}
/**
 * Props for the CourseGrid component
 */
export interface CourseGridProps {
  courses: CourseType[];
  onCourseSelect: (course: CourseType) => void;
  bookmarkedCourses: string[];
  onToggleBookmark: (courseId: string) => void;
  onAddToComparison: (course: CourseType) => void;
}
/**
 * Props for the CourseCard component
 */
export interface CourseCardProps {
  course: CourseType;
  onClick: () => void;
  onQuickView: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
}
/**
 * Props for the FilterSidebar component
 */
export interface FilterSidebarProps {
  filters: CourseFilters;
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
  isResponsive?: boolean;
  categories: string[];
  deliveryModes: string[];
  businessStages: string[];
  providers: ProviderType[];
}
<<<<<<< HEAD:src/types/course.ts
=======

/**
 * Represents a lesson in a course
 */
export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  description?: string;
}
>>>>>>> develop:.unused_backup/course.ts
