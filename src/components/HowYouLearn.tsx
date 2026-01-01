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
    description: "Earn your Digital Qatalyst Badge to showcase AI-era skills.",
  },
];

export const HowYouLearn: React.FC = () => {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <div
            className="relative px-8 sm:px-10 py-10 sm:py-12 text-white"
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
            <div className="absolute -left-20 top-8 w-48 h-48 border border-white/15 rounded-full" aria-hidden />
            <div className="absolute -right-28 -bottom-10 w-64 h-64 border border-white/10 rounded-full" aria-hidden />
            <div className="relative space-y-4">
              <h2 className="text-3xl font-bold">How You Learn</h2>
              <p className="text-blue-100 text-base leading-relaxed max-w-xl">
                DTMA guides learners from basic concepts to advanced skills, building confidence in the AI era.
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[260px]">
            <img
              src="/Leader%202.jpg"
              alt="Learner engaged with coursework"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-4 right-4 top-10 border-t border-dashed border-gray-200" aria-hidden />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
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
