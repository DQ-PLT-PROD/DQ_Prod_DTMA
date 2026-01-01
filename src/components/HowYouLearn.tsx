import React from "react";

const steps = [
  {
    title: "Learn",
    description: "Short, practical lessons with examples and quick checks.",
  },
  {
    title: "Practice",
    description: "Guided exercises and templates that mirror real work scenarios.",
  },
  {
    title: "Apply",
    description: "Bring a small project or use case from your team.",
  },
  {
    title: "Recognition",
    description: "Earn your badge to showcase AI-era skills.",
  },
];

export const HowYouLearn: React.FC = () => {
  return (
    <section className="bg-white py-0 sm:py-4">
      <div className="w-full">
        <div className="grid md:grid-cols-2 w-full min-h-[170px] sm:min-h-[190px] shadow-lg sm:shadow-xl">
          <div
            className="relative px-8 sm:px-14 py-8 sm:py-10 text-white overflow-hidden flex items-center"
            style={{
              background:
                "linear-gradient(145deg, #0e2f7a 0%, #0c2a6a 45%, #0a275f 100%)",
            }}
          >
            <div
              className="absolute rounded-full border border-white/12"
              style={{ width: "30rem", height: "30rem", left: "-18rem", top: "-24rem" }}
              aria-hidden
            />
            <div
              className="absolute rounded-full border border-white/12 hidden sm:block"
              style={{ width: "26rem", height: "26rem", left: "-14.5rem", bottom: "-22rem" }}
              aria-hidden
            />
            <div
              className="absolute rounded-full border border-white/12 sm:hidden"
              style={{ width: "18rem", height: "18rem", left: "-9rem", bottom: "-12.5rem" }}
              aria-hidden
            />
            <div className="relative space-y-4 max-w-xl">
              <h2 className="text-3xl font-bold">How You Learn</h2>
              <p className="text-blue-100 text-base leading-relaxed max-w-xl">
                DTMA takes learners from fundamentals to applied mastery through a clear learning path that builds proven, confident capability in the AI era.
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[170px] sm:min-h-[190px]">
            <img
              src="/Leader%202.jpg"
              alt="Learner engaged with coursework"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="relative px-4 sm:px-8 lg:px-12 py-10 sm:py-12 how-you-learn-steps">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-[#1839AD] text-white flex items-center justify-center text-base font-semibold shadow-md relative z-10">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowYouLearn;
