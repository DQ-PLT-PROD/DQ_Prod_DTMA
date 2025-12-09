import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";

const steps = [
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
    <section className="bg-white pt-32 pb-8">
      <div className="w-full space-y-12">
        <FadeInUpOnScroll className="overflow-visible w-full min-h-[650px]">
          <div className="relative z-10 bg-[#1839AD] text-white grid lg:grid-cols-[3fr,2fr] overflow-hidden">
            <div className="relative z-10 h-full pl-[9.5rem] pr-10 sm:pr-16 sm:pl-[13rem] py-6 md:py-8 flex flex-col justify-center space-y-4 overflow-visible">
              <div
                className="absolute border border-[#FFFFFF] rounded-full pointer-events-none z-20"
                style={{ width: "18rem", height: "18rem", left: "-9rem", top: "-6rem" }}
              ></div>
              <div
                className="absolute hidden md:block border border-[#FFFFFF] rounded-full pointer-events-none z-20"
                style={{ width: "250px", height: "250px", left: "4px", bottom: "-202px" }}
              ></div>
              <div
                className="absolute bg-black/30 pointer-events-none z-0"
                style={{ top: "-12rem", bottom: "-12rem", left: "-12rem", right: 0 }}
              ></div>
              <div className="relative space-y-4 z-30 ml-4">
                <h2 className="text-3xl md:text-4xl font-semibold">How You Learn</h2>
                <p className="text-base md:text-lg text-white/90 max-w-md">
                  DTMA guides learners from basic concepts to advanced skills, building confidence in the AI era.
                </p>
              </div>
            </div>
            <div className="relative z-10 h-full order-2">
              <img
                src="/Leader 2.jpg"
                alt="Learners collaborating"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 space-y-8 pt-12 mt-4 relative z-10">
            <StaggeredFadeIn staggerDelay={0.1}>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-8 md:gap-0 md:flex-row justify-between relative z-20">
                  <div className="hidden md:block absolute top-8 left-12 right-12 border-t border-dashed border-gray-200"></div>
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className="relative flex flex-col items-center text-center gap-4 md:flex-1 z-30"
                    >
                      <div
                        className="relative z-30 flex h-16 w-16 items-center justify-center rounded-full text-white text-lg font-semibold shadow-lg"
                        style={{ backgroundColor: "#1C2F7A" }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 relative z-30">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 max-w-[200px] relative z-30">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggeredFadeIn>
          </div>
        </FadeInUpOnScroll>
      </div>
    </section>
  );
};

export default EnterpriseStages;
