import React from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

const steps = [
  {
    title: "Build a Clear Foundation",
    description: "Develop a shared understanding of digital transformation and where AI fits, using structured, focused learning designed to create clarity\u2014not overwhelm.",
  },
  {
    title: "Apply Thinking in Realistic Contexts",
    description: "Work through guided scenarios and exercises that reflect real organizational challenges, helping translate understanding into practical decision-making.",
  },
  {
    title: "Apply Learning to Real Work",
    description: "Use DTMA tools, templates, and playbooks to support real planning, coordination, or delivery efforts within your team or organization.",
  },
  {
    title: "Demonstrate Impact and Direction",
    description: (
      <div className="space-y-3 text-left">
        <p>
          <strong className="text-gray-900 block mb-1">For professionals:</strong> Apply learning to improve real work outcomes.
        </p>
        <p>
          <strong className="text-gray-900 block mb-1">For leaders:</strong> Use structured understanding to shape strategy, guide teams, and make better transformation decisions.
        </p>
        <p className="italic text-gray-500 border-t pt-2 mt-2">
          Evidence of capability includes documented outcomes, applied artifacts, or recognized certification.
        </p>
      </div>
    ),
  },
];

const HowYouLearn: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center py-16">
      <PageContainer>
        <div className="flex flex-col md:flex-row w-full min-h-[170px] sm:min-h-[200px] shadow-lg sm:shadow-xl overflow-hidden bg-white">
          <div
            className="relative px-8 sm:px-12 md:px-14 py-8 sm:py-10 text-white overflow-hidden flex items-center md:w-7/12"
            style={{
              background:
                "linear-gradient(145deg, #0e2f7a 0%, #0c2a6a 45%, #0a275f 100%)",
            }}
          >
            <div
              className="absolute rounded-full border border-white/75 hidden sm:block"
              style={{
                width: "22rem",
                height: "22rem",
                left: "-8rem",
                bottom: "-16rem",
                borderWidth: "1.5px",
              }}
              aria-hidden
            />
            <div
              className="absolute rounded-full border border-white/70 sm:hidden"
              style={{
                width: "16rem",
                height: "16rem",
                left: "-8rem",
                bottom: "-14rem",
                borderWidth: "1.5px",
              }}
              aria-hidden
            />
            <div className="relative space-y-4 max-w-xl pl-24 sm:pl-28">
              <h2 className="text-3xl font-bold">From Understanding to Real-World Execution</h2>
              <p className="text-blue-100 text-base leading-relaxed">
                DTMA is designed as a guided learning journey that helps professionals and leaders move from understanding digital transformation to applying it in real organizational contexts. Each step builds clarity, confidence, and the ability to coordinate meaningful digital initiatives.
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[170px] sm:min-h-[200px] md:w-5/12">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="/images/landing/leader-2.jpg"
              alt="Professional applying digital transformation in a real workspace"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="relative py-10 sm:py-12 how-you-learn-steps">
          <div className="max-w-4xl md:max-w-3xl lg:max-w-6xl mx-auto relative z-10">
            <div className="steps-flow">
              {steps.map((step, index) => (
                <div key={step.title} className="step-item flex flex-col items-center text-center space-y-3 flex-1 min-w-[200px]">
                  <div className="step-circle">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-2 step-text w-full px-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-8">
            <button className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-[#1839AD] rounded-lg transition-all duration-200 hover:bg-[#1530A0] hover:shadow-lg">
              Get Certified
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default HowYouLearn;
