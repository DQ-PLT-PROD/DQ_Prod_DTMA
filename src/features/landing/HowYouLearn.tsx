import React from "react";

const steps = [
  {
    title: "Learn",
    description: "Short, practical lessons with examples.",
  },
  {
    title: "Practice",
    description: "Guided exercises that mirror real work.",
  },
  {
    title: "Apply",
    description: "Bring a small project from your team.",
  },
  {
    title: "Recognition",
    description: "Earn your badge to showcase AI-era skills.",
  },
];

const HowYouLearn: React.FC = () => {
  return (
    <section className="bg-[#f7f9fc] pt-0 pb-8 sm:pb-10">
      <div className="w-full">
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
            <div className="relative space-y-4 max-w-md pl-24 sm:pl-28">
              <h2 className="text-3xl font-bold">How You Learn</h2>
              <p className="text-blue-100 text-base leading-relaxed max-w-lg">
                DTMA guides learners from fundamentals to real-world mastery in the AI era.
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[170px] sm:min-h-[200px] md:w-5/12">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src="/images/landing/leader-2.jpg"
              alt="Learner engaged with coursework"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="relative py-10 sm:py-12 how-you-learn-steps">
          <div className="max-w-4xl md:max-w-3xl lg:max-w-4xl mx-auto relative z-10">
            <div className="steps-flow">
              {steps.map((step, index) => (
                <div key={step.title} className="step-item flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="step-circle">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-2 step-text">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowYouLearn;
