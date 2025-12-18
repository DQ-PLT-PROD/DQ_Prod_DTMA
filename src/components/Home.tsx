import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";
import { CourseTile } from "./CourseTile";
import { fetchCourses } from "../services/courseService";

const INTRO_VIDEO_URL =
  "https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/intro/Intro_V2.mp4";
const DEFAULT_THUMBNAIL = "/Economy%204.0%20thumnail.png";

const COMING_SOON_COURSES = [
  {
    id: "coming-soon-1",
    title: "Connecting Economy 4.0 and Digital Cognitive Organizations",
    category: "ECONOMY 4.0",
    levelTag: "Intermediate",
    audienceLevel: "DIGITAL WORKERS",
    duration: "Coming Soon",
    lessonCount: 4,
    description: "Link Economy 4.0 trends to the design of Digital Cognitive Organizations.",
    isComingSoon: true,
  },
  {
    id: "coming-soon-2",
    title: "Designing Perfect Life Transactions in Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Intermediate",
    audienceLevel: "DIGITAL WORKERS",
    duration: "Coming Soon",
    lessonCount: 4,
    description: "Learn to design Perfect Life Transactions that create value for customers and citizens.",
    isComingSoon: true,
  },
  {
    id: "coming-soon-3",
    title: "Using AI for Advantage in Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL WORKERS",
    duration: "Coming Soon",
    lessonCount: 4,
    description: "Go beyond AI hype and focus on competitive advantage.",
    isComingSoon: true,
  },
  {
    id: "coming-soon-4",
    title: "Protecting Trust and Security in Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL WORKERS",
    duration: "Coming Soon",
    lessonCount: 4,
    description: "Balance cybersecurity and innovation in a hyper-connected economy.",
    isComingSoon: true,
  },
  {
    id: "coming-soon-5",
    title: "Applying Strategic AI for Competitive Advantage",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL WORKERS",
    duration: "Coming Soon",
    lessonCount: 4,
    description: "Treat AI as a strategic capability, not a one-off project.",
    isComingSoon: true,
  },
];

const FeaturedCoursesSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const dbCourses = await fetchCourses();

        const mappedCourses = dbCourses.map((course: any, index: number) => ({
          id: course.slug || course.id,
          title: course.title,
          category: course.category?.toUpperCase() || "ECONOMY 4.0",
          levelTag: course.levelTag || "Beginner",
          audienceLevel: course.audienceLevel?.toUpperCase() || "DIGITAL WORKERS",
          duration: course.duration || "55 mins",
          lessonCount: course.lessonCount || 4,
          thumbnailUrl:
            index === 0
              ? DEFAULT_THUMBNAIL
              : course.heroImageUrl || course.thumbnailUrl || DEFAULT_THUMBNAIL,
          videoUrl: course.introVideoUrl || INTRO_VIDEO_URL,
          description: course.description || "",
          isComingSoon: false,
        }));

        const neededPlaceholders = Math.max(0, 6 - mappedCourses.length);
        const allCourses = [...mappedCourses, ...COMING_SOON_COURSES.slice(0, neededPlaceholders)];
        const enforcedComingSoon = allCourses.map((course, index) =>
          index === 0 ? { ...course, isComingSoon: false } : { ...course, isComingSoon: true }
        );
        const limitedCourses = enforcedComingSoon.slice(0, 9); // cap to 3 slides (3 cards per slide)
        setCourses(limitedCourses);
        setStartIndex(0);
      } catch (error) {
        console.error("Error fetching featured courses:", error);
        setCourses(
          COMING_SOON_COURSES.map((course, index) =>
            index === 0 ? { ...course, isComingSoon: false } : course
          ).slice(0, 9)
        );
        setStartIndex(0);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const visibleCourses = courses.slice(startIndex, startIndex + 3);
  const totalSlides = Math.min(3, Math.max(1, Math.ceil(courses.length / 3)));
  const maxStartIndex = Math.max(0, Math.min(courses.length - 3, (totalSlides - 1) * 3));
  const clampedStartIndex = Math.min(startIndex, maxStartIndex);
  if (clampedStartIndex !== startIndex) {
    setStartIndex(clampedStartIndex);
  }

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? maxStartIndex : Math.max(prev - 1, 0)));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
  };

  const handleViewDetails = (id: string, action?: boolean) => {
    const search = action ? "?action=true" : "";
    navigate(`/courses/${id}${search}`);
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">Featured Courses</h2>
            <p className="text-lg text-gray-600">Loading courses...</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">Featured Courses</h2>
          <p className="text-lg text-gray-600">
            Our flagship courses translate the D6 dimensions into applied learning journeys.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn staggerDelay={0.1} className="mt-12">
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => {
                const isComingSoon = course.isComingSoon;
                const isHovered = hoveredId === course.id;

                return (
                  <div
                    key={course.id}
                    onMouseEnter={() => setHoveredId(course.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`transition duration-300 ease-out ${isHovered ? "scale-105 z-10" : "scale-100"}`}
                  >
                    <CourseTile
                      title={course.title}
                      description={course.description}
                      category={course.category}
                      levelTag={course.levelTag}
                      audienceLevel={course.audienceLevel}
                      duration={course.duration}
                      lessonCount={course.lessonCount}
                      thumbnailUrl={course.thumbnailUrl}
                      videoUrl={course.videoUrl}
                      providerName="DTMA"
                      providerLogoUrl="/dtma_logo.png"
                      onCardClick={isComingSoon ? undefined : () => handleViewDetails(course.id)}
                      isHovered={isHovered}
                      isDisabled={isComingSoon}
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Previous courses"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Next courses"
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="flex justify-center items-center gap-3 mt-6">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isActive = idx === Math.min(startIndex, maxStartIndex);
              return (
                <button
                  key={idx}
                  onClick={() => setStartIndex(Math.min(idx, maxStartIndex))}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    isActive ? "w-8 bg-[#1839AD]/30" : "w-2 bg-gray-300"
                  }`}
                ></button>
              );
            })}
          </div>
        </StaggeredFadeIn>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
