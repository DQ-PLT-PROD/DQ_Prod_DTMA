import React, { useState } from 'react';
import { CourseCard } from './CourseCard';
import { CourseType } from '../utils/mockData';
import { CourseQuickViewModal } from './CourseQuickViewModal';
import { PromoCard } from './PromoCard';
import { DollarSign, Briefcase, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface CourseGridProps {
  courses: CourseType[];
  onCourseSelect: (course: CourseType) => void;
  bookmarkedCourses: string[];
  onToggleBookmark: (courseId: string) => void;
  onAddToComparison: (course: CourseType) => void;
}
export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  onCourseSelect,
  bookmarkedCourses,
  onToggleBookmark,
  onAddToComparison
}) => {
  const [quickViewCourse, setQuickViewCourse] = useState<CourseType | null>(null);
  const navigate = useNavigate();
  // Promo cards to be inserted after every 6 regular cards
  const promoCards = [{
    id: 'finance-promo',
    title: 'Looking for funding?',
    description: 'Explore financial opportunities and resources to grow your business.',
    icon: <DollarSign size={24} className="text-white" />,
    path: '/finance',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-700'
  }, {
    id: 'advisory-promo',
    title: 'Need expert advice?',
    description: 'Connect with industry experts and get personalized guidance.',
    icon: <Briefcase size={24} className="text-white" />,
    path: '/advisory',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-500'
  }, {
    id: 'community-promo',
    title: 'Join our community',
    description: 'Network with fellow entrepreneurs and share experiences.',
    icon: <Users size={24} className="text-white" />,
    path: '/community',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-teal-400'
  }, {
    id: 'events-promo',
    title: 'Upcoming events',
    description: 'Discover workshops, webinars, and networking opportunities.',
    icon: <Calendar size={24} className="text-white" />,
    path: '/events',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500'
  }];
  if (courses.length === 0) {
    return <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No courses found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search criteria
        </p>
      </div>;
  }
  // Insert promo cards after every 6 regular cards
  const itemsWithPromos = courses.reduce((acc, course, index) => {
    acc.push({
      type: 'course',
      data: course
    });
    // Insert a promo card after every 6 courses
    if ((index + 1) % 6 === 0 && promoCards[Math.floor(index / 6) % promoCards.length]) {
      const promoIndex = Math.floor(index / 6) % promoCards.length;
      acc.push({
        type: 'promo',
        data: promoCards[promoIndex]
      });
    }
    return acc;
  }, [] as Array<{
    type: 'course' | 'promo';
    data: any;
  }>);
  return <div>
      <div className="flex justify-between items-center mb-4">
        {/* Responsive header - concise on mobile */}
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Available Courses ({courses.length})
        </h2>
        <div className="text-sm text-gray-500 hidden sm:block">
          Showing {courses.length} of {courses.length} courses
        </div>
        {/* Mobile-friendly header */}
        <h2 className="text-lg font-medium text-gray-800 sm:hidden">
          {courses.length} Courses Available
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {itemsWithPromos.map((item, idx) => {
        if (item.type === 'course') {
          const course = item.data as CourseType;
          // Add tags to course object for display in CourseCard
          const courseWithTags = {
            ...course,
            tags: [course.category, course.deliveryMode]
          };
          return <CourseCard key={`course-${course.id}`} course={courseWithTags} onClick={() => onCourseSelect(course)} onQuickView={() => setQuickViewCourse(course)} isBookmarked={bookmarkedCourses.includes(course.id)} onToggleBookmark={() => onToggleBookmark(course.id)} onAddToComparison={() => onAddToComparison(course)} />;
        } else if (item.type === 'promo') {
          const promo = item.data;
          return <PromoCard key={`promo-${promo.id}-${idx}`} title={promo.title} description={promo.description} icon={promo.icon} path={promo.path} gradientFrom={promo.gradientFrom} gradientTo={promo.gradientTo} />;
        }
        return null;
      })}
      </div>
      {/* Quick View Modal */}
      {quickViewCourse && <CourseQuickViewModal course={quickViewCourse} onClose={() => setQuickViewCourse(null)} onViewDetails={() => {
      setQuickViewCourse(null);
      navigate(`/courses/${quickViewCourse.id}`);
    }} isBookmarked={bookmarkedCourses.includes(quickViewCourse.id)} onToggleBookmark={() => onToggleBookmark(quickViewCourse.id)} onAddToComparison={() => {
      onAddToComparison(quickViewCourse);
      setQuickViewCourse(null);
    }} />}
    </div>;
};
