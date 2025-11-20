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
      "Bring a small project or use case from your team.",
  },
  {
    title: "Recognition",
    description:
      "Earn your Digital Qatalyst Badge to showcase AI-era skills.",
  },
];

const EnterpriseStages: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="w-full space-y-12">
        <FadeInUpOnScroll className="overflow-hidden w-full min-h-[650px]">
          <div className="bg-[#1839AD] text-white grid lg:grid-cols-[3fr,2fr]">
            <div className="relative pl-28 pr-10 sm:pr-16 sm:pl-[11rem] py-10 flex flex-col justify-center space-y-4 overflow-hidden">
              <div className="absolute -left-10 -top-40 w-60 h-60 border-[6px] border-white rounded-full"></div>
              <div className="absolute -left-80 bottom-10 w-72 h-72 border-[6px] border-white rounded-full"></div>
              <div className="relative space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">How You Learn</h2>
                <p className="text-base md:text-lg text-white/90 max-w-md">
                  DTMA guides every learner from foundational understanding to
                  applied mastery. Follow a clear learning arc designed to prove
                  capability in the AI era through confident, guided actions.
                </p>
              </div>
            </div>
            <div className="h-full order-2">
              <img
                src="/Leader 2.jpg"
                alt="Learners collaborating"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 border-t border-gray-100 space-y-10 pt-20">
            <StaggeredFadeIn staggerDelay={0.1}>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-8 md:gap-0 md:flex-row justify-between relative">
                  <div className="hidden md:block absolute top-8 left-12 right-12 border-t border-dashed border-gray-200"></div>
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="relative flex flex-col items-center text-center gap-4 md:flex-1"
                    >
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#1839AD] text-white text-lg font-semibold shadow-lg">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 max-w-xs">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggeredFadeIn>
            <div className="flex justify-center">
              <button
                className="px-10 py-4 text-white font-semibold text-lg rounded-full shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1839AD" }}
              >
                Start Your Learning Journey
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </FadeInUpOnScroll>
      </div>
    </section>
  );
};

export default EnterpriseStages;
