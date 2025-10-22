import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";

const steps = [
  {
    title: "Orientation",
    description: "Set your goals and pick a D6 category to start.",
  },
  {
    title: "Learn",
    description: "Short, practical lessons with examples and quick checks.",
  },
  {
    title: "Practice",
    description:
      "Guided exercises and templates that mirror real work scenarios.",
  },
  {
    title: "Apply",
    description:
      "Bring a small project or use case from your team; reflect with prompts.",
  },
  {
    title: "Recognition",
    description:
      "Earn your Digital Qatalyst Badge to showcase AI-era skills.",
  },
];

const EnterpriseStages: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How You Learn - From Orientation to Recognition
          </h2>
          <p className="text-lg text-gray-600">
            DTMA guides every learner from foundational understanding to applied
            mastery. Follow a clear learning arc designed to prove capability in
            the AI working era.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn
          staggerDelay={0.1}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-5"
        >
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-3xl border border-gray-200 bg-gray-50 p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </StaggeredFadeIn>

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-semibold text-blue-600">
          <a href="#" className="flex items-center gap-2 hover:underline">
            See How It Works
            <ArrowRight size={16} />
          </a>
          <a href="#" className="flex items-center gap-2 hover:underline">
            Enroll a Team
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseStages;
