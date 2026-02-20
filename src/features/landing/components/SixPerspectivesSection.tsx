import React from "react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { PageContainer } from "@/components/layouts/PageContainer";

const perspectives = [
  {
    number: 1,
    title: "Digital Economy (DE)",
    description:
      "Navigating the opportunities and challenges in the new economy. Understand how digital forces are reshaping markets, value creation, and competitive dynamics.",
  },
  {
    number: 2,
    title: "Digital Cognitive Organization (DCO)",
    description:
      "Where organizations are headed in the age of digital transformation. Explore how cognition, culture, and structure evolve in digitally native enterprises.",
  },
  {
    number: 3,
    title: "Digital Business Platform (DBP)",
    description:
      "What legacy value or orchestration engine powers the future? Decode the platform models and ecosystems that underpin modern digital businesses.",
  },
  {
    number: 4,
    title: "Digital Transformation (DT2.0)",
    description:
      "How to design and deploy next-generation transformation frameworks. Move beyond first-wave digitization toward continuous, systemic transformation.",
  },
  {
    number: 5,
    title: "Digital Worker & Workspace (DW/WS)",
    description:
      "Who are the orchestrators of the new digital workspace? Equip yourself for the hybrid, AI-augmented working environment of today and tomorrow.",
  },
  {
    number: 6,
    title: "Digital Accelerators",
    description:
      "When will we get there? Exploring tools to accelerate transformation. Apply the emerging technologies and methodologies that compress the transformation timeline.",
  },
];

const SixPerspectivesSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            The 6X Perspectives of Digital
          </h2>
          <p className="text-lg text-gray-600">
            Make sense of digital in a structured manner, from 6 critical digital angles defined by Digital Qatalyst through 15+ years of experience orchestrating digital transformation
          </p>
        </FadeInUpOnScroll>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {perspectives.map((item) => (
            <div
              key={item.number}
              className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 h-full relative z-20"
            >
              <div className="flex flex-col flex-1 p-6 space-y-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1839AD]/10 text-[#1839AD] text-xs font-bold self-start flex-shrink-0">
                  {String(item.number).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
};

export default SixPerspectivesSection;
