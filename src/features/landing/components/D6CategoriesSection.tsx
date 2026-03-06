import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { BRAND_PRIMARY } from "@/constants/branding";
import { fetchPublishedCoursesForNav, CourseNavItem } from "@/services/courseService";

import { PageContainer } from "@/components/layouts/PageContainer";

const D6CategoriesSection: React.FC = () => {
  const [courses, setCourses] = useState<CourseNavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedCoursesForNav()
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="d6-categories" className="w-full h-full flex flex-col justify-center py-16">
      <PageContainer>
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Discover Our Courses
          </h2>
          <p className="text-lg text-gray-600">
            Each course helps you step into the AI era. Pick the area that fits your goals and follow the guided learning path built for your role.
          </p>
        </FadeInUpOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 card-container">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg h-full animate-pulse"
                >
                  <div className="h-36 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))
            : courses.map((course) => (
                <div
                  key={course.slug}
                  className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 h-full relative z-20"
                >
                  <div className="relative h-36 bg-gray-100">
                    {course.heroImageUrl && (
                      <>
                        <img
                          src={course.heroImageUrl}
                          alt={course.title}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#030C2B]/20"></div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="mt-3 text-sm text-gray-600">
                      {course.shortDescription}
                    </p>
                    <Link
                      to={`/courses?course=${encodeURIComponent(course.slug)}`}
                      className="mt-6 inline-flex items-center text-sm font-semibold hover:underline"
                      style={{ color: BRAND_PRIMARY }}
                    >
                      Explore Course
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </PageContainer>
    </div>
  );
};

export default D6CategoriesSection;
