import React, { useState, useEffect } from "react";
import { Star, BookOpenIcon } from "lucide-react";
import { CourseCard } from "@/features/courses/components/CourseCard";
import { CourseCardSkeleton } from "@/components/SkeletonLoader";
import { fetchCourses, fetchPublishedCoursesForNav, CourseNavItem } from "@/services/courseService";
import { PageContainer } from "@/components/layouts/PageContainer";

const POPULAR_ID = "popular";

/**
 * Map a marketplace-format course (from fetchCourses) to CourseCard props.
 */
const toCourseCardProps = (course: any) => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  shortDescription: course.description || "",
  categoryName: course.categoryName || course.containerCourseTitle || "",
  _categorySlug: course.categorySlug || "",
  _courseSlug: course.courseSlug || course.containerCourseSlug || "",
  levelTag: course.levelTag || "",
  audienceLevel: course.audienceLevel || "",
  duration: course.isComingSoon ? "Coming Soon" : course.duration || "55 mins",
  lessonCount: course.lessonCount,
  thumbnailUrl: course.heroImageUrl,
  heroImageUrl: course.heroImageUrl,
  introVideoUrl: course.isComingSoon ? undefined : course.introVideoUrl,
  isComingSoon: course.isComingSoon || false,
});

/** Coming-soon placeholder card — used when a tab has no courses yet. */
const makeComingSoonPlaceholder = (id: string, title: string) => ({
  id,
  slug: id,
  title,
  shortDescription:
    "We're crafting new courses for this category. Check back soon!",
  categoryName: "",
  _categorySlug: "",
  _courseSlug: "",
  levelTag: "",
  audienceLevel: "",
  duration: "Coming Soon",
  lessonCount: 0,
  thumbnailUrl: undefined,
  heroImageUrl: undefined,
  introVideoUrl: undefined,
  isComingSoon: true,
});

/** Three placeholders shown when the Popular / Featured query returns nothing. */
const POPULAR_FALLBACK = [
  makeComingSoonPlaceholder("cs-pop-1", "New Course — Coming Soon"),
  makeComingSoonPlaceholder("cs-pop-2", "New Course — Coming Soon"),
  makeComingSoonPlaceholder("cs-pop-3", "New Course — Coming Soon"),
];

const CourseCatalogSection: React.FC = () => {
  /** Mapped featured courses — source for the Popular tab. */
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  /** All mapped courses — filtered per-course tab. */
  const [allCourses, setAllCourses] = useState<any[]>([]);
  /** Published courses for nav pills (courses = categories). */
  const [navCourses, setNavCourses] = useState<CourseNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(POPULAR_ID);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const [featuredRaw, allRaw, navItems] = await Promise.all([
          fetchCourses({ featured: true, excludeHeavyFields: true }),
          fetchCourses({ excludeHeavyFields: true }),
          fetchPublishedCoursesForNav(),
        ]);
        setFeaturedCourses(featuredRaw.map(toCourseCardProps));
        setAllCourses(allRaw.map(toCourseCardProps));
        setNavCourses(navItems);
      } catch (err) {
        console.error("Error loading courses for catalog:", err);
        setFeaturedCourses([]);
        setAllCourses([]);
        setNavCourses([]);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const displayCourses: any[] = (() => {
    if (selectedTab === POPULAR_ID) {
      return featuredCourses.length > 0 ? featuredCourses : POPULAR_FALLBACK;
    }
    // Filter to show the modules for the selected course container.
    const filtered = allCourses.filter((c) => c._courseSlug === selectedTab);
    if (filtered.length > 0) return filtered;
    const courseTitle =
      navCourses.find((c) => c.slug === selectedTab)?.title || selectedTab;
    return [makeComingSoonPlaceholder(`cs-${selectedTab}`, `${courseTitle} — Coming Soon`)];
  })();

  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Explore Our Courses
          </h2>
          <p className="text-lg text-gray-600">
            Find the right course for you from a curated selection of practical,
            role-based learning paths designed to enhance your skills and drive
            digital success.
          </p>
        </div>

        {/* Course selector pills (courses = categories) */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedTab(POPULAR_ID)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
              selectedTab === POPULAR_ID
                ? "bg-[#1839AD] border-[#1839AD] text-white shadow-md"
                : "bg-white border-gray-200 text-gray-700 hover:border-[#1839AD] hover:text-[#1839AD]"
            }`}
            aria-pressed={selectedTab === POPULAR_ID}
          >
            <Star size={15} className="flex-shrink-0" />
            Popular
          </button>

          {navCourses.map((course) => {
            const isActive = selectedTab === course.slug;
            return (
              <button
                key={course.slug}
                onClick={() => setSelectedTab(course.slug)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? "bg-[#1839AD] border-[#1839AD] text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#1839AD] hover:text-[#1839AD]"
                }`}
                aria-pressed={isActive}
              >
                <BookOpenIcon size={15} className="flex-shrink-0" />
                {course.title}
              </button>
            );
          })}
        </div>

        {/* Course cards */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showSaveButton={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <a
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#0d2b8a] transition-colors font-semibold shadow-sm"
          >
            Browse Full Course Catalog
          </a>
        </div>
      </PageContainer>
    </div>
  );
};

export default CourseCatalogSection;
