import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";
import { CourseTile } from "./CourseTile";

const courses = [
  {
    id: "economy-4-0",
    title: "Understanding Economy 4.0",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Beginner",
    audienceLevel: "DIGITAL LEADERS",
    duration: "55 mins",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Get a clear, practical introduction to Economy 4.0 and why it matters.",
    isHeroTile: true,
  },
  {
    id: "digital-workflows",
    title: "Connecting Economy 4.0 and Digital Cognitive Organizations",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Intermediate",
    audienceLevel: "DIGITAL LEADERS",
    duration: "1h",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Link Economy 4.0 trends to the design of Digital Cognitive Organizations.",
    isHeroTile: true,
  },
  {
    id: "platform-thinking-101",
    title: "Designing Perfect Life Transactions in Economy 4.0",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Intermediate",
    audienceLevel: "DIGITAL LEADERS",
    duration: "1h 5m",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Learn to design Perfect Life Transactions that create value for customers and citizens.",
    isHeroTile: true,
  },
  {
    id: "digital-accelerators-toolkit",
    title: "Using AI for Advantage in Economy 4.0",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL LEADERS",
    duration: "52 mins",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Go beyond AI hype and focus on competitive advantage.",
    isHeroTile: true,
  },
  {
    id: "protecting-trust-security",
    title: "Protecting Trust and Security in Economy 4.0",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL LEADERS",
    duration: "1h 8m",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Balance cybersecurity and innovation in a hyper-connected economy.",
    isHeroTile: true,
  },
  {
    id: "strategic-ai-advantage",
    title: "Applying Strategic AI for Competitive Advantage",
    tag: "Economy 4.0",
    category: "ECONOMY 4.0",
    levelTag: "Advanced",
    audienceLevel: "DIGITAL LEADERS",
    duration: "57 mins",
    lessonCount: 4,
    thumbnailUrl: "/Economy%204.0%20thumnail.png",
    description:
      "Treat AI as a strategic capability, not a one-off project.",
    isHeroTile: true,
  },
];

const FeaturedCoursesSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const navigate = useNavigate();

  const visibleCourses = courses.slice(startIndex, startIndex + 3);
  const maxStartIndex = Math.max(0, courses.length - 3);
  const totalSlides = maxStartIndex + 1;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(courses.length - 3, 0) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + 3 >= courses.length ? 0 : prev + 1
    );
  };

  const handleViewDetails = (id: string, action?: boolean) => {
    const search = action ? "?action=true" : "";
    navigate(`/courses/${id}${search}`);
  };

  return (
    <section className="bg-gray-50 pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600">
            Our flagship courses translate the D6 dimensions into applied
            learning journeys. Each syllabus includes guided practice, prompts,
            and tools that move you from insight to action.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn staggerDelay={0.1} className="mt-12">
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => {
                const tagChips =
                  course.tag
                    ?.split(" - ")
                    .map((chip) => chip.trim())
                    .filter(
                      (chip) =>
                        chip.toLowerCase() !== "leadership" &&
                        chip.toLowerCase() !== "productivity" &&
                        chip.toLowerCase() !== "strategy"
                    ) ?? [];
                return course.isHeroTile ? (
                  <CourseTile
                    key={course.id}
                    title={course.title}
                    description={course.description}
                    category={course.category}
                    levelTag={course.levelTag}
                    audienceLevel={course.audienceLevel}
                    duration={course.duration}
                    lessonCount={course.lessonCount}
                    thumbnailUrl={course.thumbnailUrl}
                    providerName="DTMA"
                    providerLogoUrl="/dtma_logo.png"
                    onCardClick={() => handleViewDetails(course.id)}
                  />
                ) : (
                  <div
                    key={course.title}
                    className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#2E469E]">
                        <Layers size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {course.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tagChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[#1839AD]/10 bg-[#1839AD]/5 px-3 py-1 text-xs font-semibold text-[#1839AD]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleViewDetails(course.id)}
                        className="rounded-xl border border-[#1839AD] px-4 py-2 text-sm font-semibold text-[#1839AD] transition hover:bg-[#1839AD]/5"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewDetails(course.id, true)}
                        className="rounded-xl bg-[#1839AD] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#132b7c]"
                      >
                        Enroll Now
                      </button>
                    </div>
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
                  className={`h-2 w-2 rounded-full transition ${
                    isActive ? "bg-[#2E469E]" : "bg-gray-300"
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
