import React, { useState } from 'react';
import { CourseType } from './CourseMarketplace';
import { CourseCard } from './CourseCard';
import { CourseQuickViewModal } from './CourseQuickViewModal';
import { CourseCardSkeleton } from './SkeletonLoader';
import { useNavigate } from 'react-router-dom';
interface RelatedCoursesProps {
  currentCourse: CourseType;
  courses: CourseType[];
  onCourseSelect: (course: CourseType) => void;
  bookmarkedCourses: string[];
  onToggleBookmark: (courseId: string) => void;
  loading?: boolean;
}
export const RelatedCourses: React.FC<RelatedCoursesProps> = ({
  currentCourse,
  courses,
  onCourseSelect,
  bookmarkedCourses,
  onToggleBookmark,
  loading = false
}) => {
  const [quickViewCourse, setQuickViewCourse] = useState<CourseType | null>(null);
  const navigate = useNavigate();
  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[...Array(3)].map((_, idx) => <CourseCardSkeleton key={idx} />)}
      </div>;
  }
  // Filter out the current course
  const relatedCourses = courses.filter(course => course.id !== currentCourse.id);
  if (relatedCourses.length === 0) {
    return null;
  }
  return <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {relatedCourses.map(course => {
        // Add tags to course object for display in CourseCard
        const courseWithTags = {
          ...course,
          tags: course.tags || [course.category, course.deliveryMode]
        };
        return <CourseCard key={course.id} course={courseWithTags} onClick={() => onCourseSelect(course)} onQuickView={() => setQuickViewCourse(course)} isBookmarked={bookmarkedCourses.includes(course.id)} onToggleBookmark={() => onToggleBookmark(course.id)} onAddToComparison={() => {}} />;
      })}
      </div>
      {/* Quick View Modal */}
      {quickViewCourse && <CourseQuickViewModal course={quickViewCourse} onClose={() => setQuickViewCourse(null)} onViewDetails={() => {
      setQuickViewCourse(null);
      navigate(`/courses/${quickViewCourse.id}`);
    }} isBookmarked={bookmarkedCourses.includes(quickViewCourse.id)} onToggleBookmark={() => onToggleBookmark(quickViewCourse.id)} onAddToComparison={() => {}} />}
    </div>;
};
