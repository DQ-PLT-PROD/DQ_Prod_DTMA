import React from 'react';
import { CourseCardSkeleton } from './SkeletonLoader';
import { CourseTile } from './CourseTile';

interface RelatedCourseItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  deliveryMode?: string;
  lessonCount?: number;
  duration?: string;
  tags?: string[];
  topicTags?: string[];
  levelTag?: string;
  audienceLevel?: string;
  heroImageUrl?: string;
  heroImage?: string;
  thumbnailUrl?: string;
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
  bookmarkedCourses: _bookmarkedCourses,
  onToggleBookmark: _onToggleBookmark,
  loading = false
}) => {
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
        {relatedCourses.map(course => {
          const topicTags = Array.isArray(course.topicTags)
            ? course.topicTags
            : Array.isArray(course.tags)
            ? course.tags
            : [];
          const thumbnailUrl =
            course.heroImageUrl ||
            course.heroImage ||
            course.thumbnailUrl ||
            course.provider?.logoUrl;

          return (
            <CourseTile
              key={course.id}
              title={course.title}
              description={course.description}
              providerName={course.provider?.name || "Provider"}
              providerLogoUrl={course.provider?.logoUrl || "/mzn_logo.png"}
              thumbnailUrl={thumbnailUrl}
              category={course.category}
              levelTag={course.levelTag}
              audienceLevel={course.audienceLevel}
              topicTags={topicTags}
              duration={course.duration}
              lessonCount={course.lessonCount}
              primaryCtaLabel="View Details"
              secondaryCtaLabel="View Details"
              showActions={false}
              onCardClick={() => onCourseSelect(course)}
            />
          );
        })}
      </div>
    </div>;
};
