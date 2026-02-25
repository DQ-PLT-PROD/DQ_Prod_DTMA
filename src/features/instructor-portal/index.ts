/**
 * Instructor Portal Feature
 * 
 * Exports all instructor portal components, pages, and utilities.
 */

// Context
export { RoleSwitcherProvider, useRoleSwitcher, useRoleSwitcherOptional } from './context/RoleSwitcherContext';
export type { UserRole } from './context/RoleSwitcherContext';

// Layout
export { InstructorLayout } from './layout/InstructorLayout';

// Pages
export { InstructorDashboard } from './pages/InstructorDashboard';
export { CourseManagementPage } from './pages/CourseManagementPage';

// Components
export { CoursesSection } from './components/course-management/CoursesSection';
export { CourseForm } from './components/course-management/CourseForm';


// Lib
export { getSupabaseClient } from './lib/dbClient';

// Constants
export * from './constants/courseConstants';
