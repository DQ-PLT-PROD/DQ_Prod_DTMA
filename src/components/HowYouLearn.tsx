import React from "react";

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
    description: "Guided exercises and templates that mirror real work scenarios.",
  },
  {
    title: "Apply",
    description: "Bring a small project or use case from your team.",
  },
  {
    title: "Recognition",
    description: "Earn your Digital Qatalyst Badge to showcase AI-era skills.",
  },
];

export const HowYouLearn: React.FC = () => {
  return (
    <section className="bg-white py-0 sm:py-4">
      <div className="w-full">
        <div className="grid md:grid-cols-2 w-full min-h-[360px] shadow-lg sm:shadow-xl">
          <div
            className="relative px-8 sm:px-12 py-10 sm:py-14 text-white"
            style={{
              background:
                "linear-gradient(145deg, #0e2f7a 0%, #0c2a6a 45%, #0a275f 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 15%, rgba(255,255,255,0.12) 0, transparent 38%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.08) 0, transparent 32%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0, transparent 34%), radial-gradient(circle at 90% 82%, rgba(255,255,255,0.05) 0, transparent 28%)",
              }}
              aria-hidden
            />
            <div className="absolute -left-24 top-6 w-56 h-56 border border-white/15 rounded-full" aria-hidden />
            <div className="absolute -left-10 -bottom-14 w-60 h-60 border border-white/10 rounded-full" aria-hidden />
            <div className="absolute -right-32 -bottom-12 w-64 h-64 border border-white/10 rounded-full" aria-hidden />
            <div className="relative space-y-4 max-w-xl">
              <h2 className="text-3xl font-bold">How You Learn</h2>
              <p className="text-blue-100 text-base leading-relaxed max-w-xl">
                DTMA takes learners from fundamentals to applied mastery through a clear learning path that builds proven, confident capability in the AI era.
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[320px]">
            <img
              src="/Leader%202.jpg"
              alt="Learner engaged with coursework"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="relative px-4 sm:px-8 lg:px-12 py-10 sm:py-12">
          <div className="hidden md:block absolute left-8 right-8 top-10 border-t border-dashed border-gray-200" aria-hidden />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-[#1839AD] text-white flex items-center justify-center text-base font-semibold shadow-md">
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
