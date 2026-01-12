import React, { useState } from 'react';
import { CourseCardSkeleton } from './SkeletonLoader';
import { useNavigate } from 'react-router-dom';
import { Tag } from './ui/Tag';
import { CourseMeta } from './ui/CourseMeta';
interface RelatedCourseItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  deliveryMode?: string;
  lessonCount?: number;
  duration?: string;
  tags?: string[];
  provider: {
    name: string;
    logoUrl: string;
  };
}

interface RelatedCoursesProps {
  currentCourse: RelatedCourseItem;
  courses: RelatedCourseItem[];
  onCourseSelect: (course: RelatedCourseItem) => void;
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
  const [quickViewCourse, setQuickViewCourse] = useState<RelatedCourseItem | null>(null);
  const navigate = useNavigate();
  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[...Array(3)].map((_, idx) => <CourseCardSkeleton key={idx} />)}
      </div>;
  }
  const relatedCourses = courses.filter(course => course.id !== currentCourse.id);
  if (relatedCourses.length === 0) {
    return null;
  }
  return <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {relatedCourses.map(course => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-transform transition-shadow hover:-translate-y-1 border border-gray-100"
            onClick={() => onCourseSelect(course)}
          >
            <div className="flex items-center mb-3 gap-2">
              <img
                src={course.provider?.logoUrl || "/mzn_logo.png"}
                alt={course.provider?.name || "Provider"}
                className="h-8 w-8 object-contain rounded bg-gray-50 p-1 border border-gray-100"
              />
              <div className="text-sm text-gray-600 truncate">
                {course.provider?.name}
              </div>
              {course.category ? <Tag variant="category">{course.category}</Tag> : null}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {course.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {(course.tags || [])
                  .slice(0, 2)
                  .map((tag, idx) => (
                    <Tag key={idx} variant="topic">
                      {tag}
                    </Tag>
                  ))}
              </div>
              <CourseMeta duration={course.duration} lessonCount={course.lessonCount} />
            </div>
          </div>
        ))}
      </div>
    </div>;
};
