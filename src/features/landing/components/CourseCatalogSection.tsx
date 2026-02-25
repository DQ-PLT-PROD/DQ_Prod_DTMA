import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { CourseCard } from "@/features/courses/components/CourseCard";
import { CourseCardSkeleton } from "@/components/SkeletonLoader";
import { fetchCourses } from "@/services/courseService";
import { COURSE_CATEGORIES } from "@/constants/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";

const POPULAR_ID = "popular";

/**
 * Map a marketplace-format course (from fetchCourses) to CourseCard props.
 *
 * fetchCourses returns toMarketplaceItem() shape, NOT the raw Course type:
 *   description  = shortDescription
 *   categorySlug = categoryId (DB slug)
 *   heroImageUrl = hero image
 *   duration     = pre-formatted string (empty for isComingSoon)
 *   isComingSoon = re-attached by the service
 *
 * We also preserve categorySlug as a non-CourseCard extra field so we can
 * filter by it without keeping a separate raw copy.
 */
const toCourseCardProps = (course: any) => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  shortDescription: course.description || "",
  categoryName: course.categoryName || "",
  // preserved for tab filtering — not passed to CourseCard
  _categorySlug: course.categorySlug || "",
  levelTag: course.levelTag || "",
  audienceLevel: course.audienceLevel || "",
  // duration is pre-formatted by formatDuration(); override to "Coming Soon" when applicable
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
  shortDescription: "We're crafting new courses for this category. Check back soon!",
  categoryName: "",
  _categorySlug: "",
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
  /** All mapped courses — filtered per-category tab. */
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(POPULAR_ID);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        /**
         * Two parallel calls — same data sources the page previously used:
         *   - featured: same query as the old Featured Courses (Home.tsx)
         *   - all:      full catalog for per-category filtering
         * Both are served from the courseService in-memory cache after first load.
         */
        const [featuredRaw, allRaw] = await Promise.all([
          fetchCourses({ featured: true, excludeHeavyFields: true }),
          fetchCourses({ excludeHeavyFields: true }),
        ]);
        setFeaturedCourses(featuredRaw.map(toCourseCardProps));
        setAllCourses(allRaw.map(toCourseCardProps));
      } catch (err) {
        console.error("Error loading courses for catalog:", err);
        setFeaturedCourses([]);
        setAllCourses([]);
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
    const filtered = allCourses.filter((c) => c._categorySlug === selectedTab);
    if (filtered.length > 0) return filtered;
    const catTitle =
      COURSE_CATEGORIES.find((c) => c.slug === selectedTab)?.title || selectedTab;
    return [makeComingSoonPlaceholder(`cs-${selectedTab}`, `${catTitle} — Coming Soon`)];
  })();

  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Explore our course catalog to find the right sense-making course for you
          </h2>
        </div>

        {/* Category selector pills */}
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

          {COURSE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedTab === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedTab(cat.slug)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? "bg-[#1839AD] border-[#1839AD] text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#1839AD] hover:text-[#1839AD]"
                }`}
                aria-pressed={isActive}
              >
                <Icon size={15} className="flex-shrink-0" />
                {cat.title}
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
      </PageContainer>
    </div>
  );
};

export default CourseCatalogSection;
