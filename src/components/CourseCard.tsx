import React, { useMemo } from 'react';
import { CourseType } from '../types/course';
import { useNavigate } from 'react-router-dom';
import { CourseTile } from './CourseTile';
interface CourseCardProps {
  course: CourseType;
  onClick: () => void;
  onQuickView: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
}
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onQuickView,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison
}) => {
  const navigate = useNavigate();
  const displayTags = useMemo(() => {
    if (course.tags && course.tags.length) return course.tags;
    return [course.category, course.deliveryMode, course.levelTag, course.audienceLevel]
      .filter(Boolean)
      .slice(0, 4);
  }, [course]);
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/courses/${course.id}`);
  };
  return (
    <CourseTile
      title={course.title}
      description={course.description}
      providerName={course.provider.name}
      providerLogoUrl={course.provider.logoUrl}
      category={course.category}
      levelTag={course.levelTag}
      audienceLevel={course.audienceLevel}
      topicTags={displayTags}
    duration={course.duration}
    lessonCount={course.lessonCount}
    primaryCtaLabel="Enroll Now"
    secondaryCtaLabel="View Details"
    onPrimaryClick={(e) => {
        e.stopPropagation();
        navigate(`/courses/${course.id}?enroll=true`);
      }}
      onSecondaryClick={handleViewDetails}
      onAddToComparison={onAddToComparison}
      onCardClick={onQuickView}
      onToggleBookmark={onToggleBookmark}
      isBookmarked={isBookmarked}
    />
  );
};
