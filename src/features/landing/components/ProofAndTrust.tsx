import React from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

const stats = [
  { value: "6",   label: "Digital Perspectives" },
  { value: "30+", label: "Digital Transformation Courses" },
  { value: "1",   label: "Digital Understanding" },
];

const whyHighlights = [
  {
    title: "Gain structured Digital Thinking",
    description:
      "See digital transformation through six connected perspectives that help you think systematically, align teams, and act with confidence.",
  },
  {
    title: "Master digital by applying what matters",
    description:
      "Understand key digital concepts through practical tools, templates, and guided insights designed for real initiatives. Move beyond theory and apply structured thinking directly to your work.",
  },
  {
    title: "Learn at your pace, Wherever you are",
    description:
      "Access bite-sized, flexible lessons designed to fit into demanding schedules. Progress steadily without disrupting your professional responsibilities.",
  },
];

/**
 * Combined Benefits + Metrics section.
 * Top: metrics pill.
 * Bottom: two-column layout — left heading/image, right benefit blocks.
 */
const ProofAndTrust: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-12 sm:py-16">
      <PageContainer>
        {/* Metrics pill */}
        <div className="rounded-3xl border border-gray-200 bg-white px-8 py-10 shadow-sm max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center gap-2 px-4 ${
                  index !== stats.length - 1
                    ? "md:border-r md:border-gray-200"
                    : ""
                }`}
              >
                <div className="text-4xl font-semibold text-[#030C2B] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 leading-snug max-w-[160px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits two-column layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-10 lg:grid-cols-2 items-center mt-12">
          <div className="space-y-6 text-left flex flex-col items-start">
            <img
              src="/images/landing/leaders-collaborating.png"
              alt="Leaders collaborating"
              className="w-full max-w-sm rounded-full"
            />
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight max-w-4xl pr-6">
                Designed for Professionals Navigating Digital Change
              </h2>
              <p className="text-base text-gray-500 pr-6">
                Built from real-world transformation experience.
              </p>
            </div>
          </div>
          <div className="space-y-6 text-left lg:pl-6 pr-6 lg:pr-8">
            <div className="space-y-6">
              {whyHighlights.map((item) => (
                <div key={item.title} className="space-y-1">
                  <p className="text-base font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProofAndTrust;
