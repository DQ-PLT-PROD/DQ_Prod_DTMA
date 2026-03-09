import React from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

const stats = [
  { value: "6", label: "Digital Perspectives" },
  { value: "30+", label: "Digital Transformation Courses" },
  { value: "1", label: "Digital Understanding" },
];

const whyHighlights = [
  {
    title: "Practical, Applicable Skills",
    description:
      "Learn actionable skills and frameworks you can apply directly to your work. Start implementing right away.",
  },
  {
    title: "Industry-Relevant Curriculum",
    description:
      "Stay ahead with a curriculum crafted for real-world success. Guided by DQ's 15+ years of expertise.",
  },
  {
    title: "Practical Toolkits & Frameworks",
    description:
      "Use practical toolkits and frameworks that make decision-making easier. Deliver more effectively.",
  },
  {
    title: "Stay Future-Ready",
    description:
      "Build continuous capability and stay ahead in the AI-driven digital world. Remain competitive.",
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
        {/* Headline and Subheadline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight mb-4">
            Empower Your Digital Journey with DTMA
          </h2>
          <p className="text-lg text-gray-600">
            Transform your capabilities and stay ahead with learning designed
            for today's fast-changing digital environment.
          </p>
        </div>

        {/* Benefits two-column layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6 text-left flex flex-col items-start">
            <img
              src="/images/landing/leaders-collaborating.png"
              alt="Leaders collaborating"
              className="w-full max-w-sm rounded-full"
            />
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight max-w-4xl pr-6">
                Designed for Professionals Navigating Digital Change
              </h3>
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
