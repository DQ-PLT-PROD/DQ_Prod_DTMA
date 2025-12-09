import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { FadeInUpOnScroll } from "./AnimationUtils";

const stats = [
  { value: "6XD", label: "Framework powering all DTMA courses" },
  { value: "30+", label: "Courses based on real transformation work" },
  { value: "1", label: "Recognition badge validating AI-ready skills" },
];

const stories = [
  {
    title: "From Analyst to AI-Ready Strategist",
    description:
      "Fatima A. used Digital Worker & Workspace lessons to automate reporting - saving 20+ hours each month.",
    image: "/l1 1.png",
  },
  {
    title: "Leading Change in a Hybrid Era",
    description:
      "Omar H. applied DT2.0 and DCO insights to launch his company's first AI-assisted customer journey pilot.",
    image: "/mm.png",
  },
  {
    title: "Designing the Digital Operating Model",
    description:
      "Lina K. built a data-driven operations model after Digital Business Platforms - now scaling to three markets.",
    image: "/ll.png",
  },
];

const typingWords = ["leaders", "workers"];

const whyHighlights = [
  {
    title: "Framework-first Learning",
    description:
      "Every DTMA course is grounded in the 6XD Framework so teams move from theory into applied outcomes.",
  },
  {
    title: "Built by Practitioners",
    description:
      "Digital Qatalyst’s transformation architects translate field playbooks into practical, guided lessons.",
  },
  {
    title: "Designed for Momentum",
    description:
      "Bite-sized sprints, templates, and reflections help leaders orchestrate change while work keeps moving.",
  },
];

const ProofAndTrust: React.FC = () => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const activeStory = stories[activeStoryIndex];

  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    const letterDelay = Math.max(1000 / currentWord.length, 60);
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 4000);
    } else if (isDeleting && displayText === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
      }, 1000);
    } else {
      const nextLength = isDeleting
        ? displayText.length - 1
        : displayText.length + 1;
      const nextText = currentWord.slice(0, Math.max(nextLength, 0));
      timeout = setTimeout(() => setDisplayText(nextText), letterDelay);
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentWordIndex, isDeleting]);

  const handlePrev = () => {
    setActiveStoryIndex((prev) =>
      prev === 0 ? stories.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveStoryIndex((prev) =>
      prev === stories.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          <FadeInUpOnScroll className="space-y-6 text-left flex flex-col items-start">
            <img
              src="/Images.png"
              alt="Leaders collaborating"
              className="w-full max-w-sm rounded-full"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight max-w-4xl pr-6">
              Built for modern{" "}
              <span
                className="typing-word"
                aria-live="polite"
                aria-label={typingWords[currentWordIndex]}
              >
                {displayText}
              </span>{" "}
              rooted in real digital transformation.
            </h2>
          </FadeInUpOnScroll>
          <FadeInUpOnScroll className="space-y-5 text-left lg:pl-6 pr-6 lg:pr-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#1839AD]">
              Why DTMA?
            </p>
            <div className="space-y-4">
              {whyHighlights.map((item) => (
                <div key={item.title}>
                  <p className="text-base font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </FadeInUpOnScroll>
        </div>

        <div className="rounded-3xl bg-[#2E469E] text-white px-6 py-8 shadow-lg max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center gap-1 px-4 ${index !== stats.length - 1 ? "md:border-r md:border-white/20" : ""
                  }`}
              >
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <FadeInUpOnScroll className="space-y-3 text-center">
            <h3 className="text-3xl font-bold text-[#030C2B]">Trusted by Our Customers</h3>
            <p className="text-lg text-gray-600 max-w-xl mx-auto text-center">
              Our learners don't just finish our courses, they translate the insights gained into tangible wins across their teams and organisations.
            </p>
          </FadeInUpOnScroll>

          <FadeInUpOnScroll className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 translate-y-5 scale-95 bg-white rounded-3xl shadow-lg opacity-70"></div>
            <div className="absolute inset-0 translate-y-10 scale-90 bg-white rounded-3xl shadow-md opacity-40"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 flex items-center justify-center p-6 bg-[#1839AD]/10">
                <img
                  src={activeStory.image || "/Testimony.jpg"}
                  alt="Learner testimonial"
                  className="rounded-t-2xl w-48 h-56 sm:w-56 sm:h-64 object-cover object-top"
                />
              </div>
              <div className="md:w-2/3 p-8 flex flex-col justify-center text-left">
                <h4 className="text-2xl font-semibold text-gray-900 mb-3 max-w-xl">
                  {activeStory.title}
                </h4>
                <p className="text-base text-gray-600 max-w-md">{activeStory.description}</p>
              </div>
            </div>

            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Previous story"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Next story"
            >
              <ArrowRight size={20} />
            </button>

            <div className="mt-6 flex justify-center gap-2">
              {stories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${idx === activeStoryIndex
                    ? "w-8 bg-[#1839AD]/40"
                    : "w-2 bg-gray-300"
                    }`}
                  aria-label={`View story ${idx + 1}`}
                />
              ))}
            </div>
          </FadeInUpOnScroll>
        </div>

      </div>
    </section>
  );
};

export default ProofAndTrust;
