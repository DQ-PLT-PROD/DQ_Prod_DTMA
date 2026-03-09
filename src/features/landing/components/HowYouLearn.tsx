import React from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

const steps = [
  {
    title: "Learn",
    description: "Short, practical lessons with actionable examples.",
  },
  {
    title: "Practice",
    description: "Hands-on exercises that mirror your daily work challenges.",
  },
  {
    title: "Apply",
    description:
      "Bring a small project from your team to life, using your new skills.",
  },
  {
    title: "Recognition",
    description:
      "Earn a badge to demonstrate your mastery in the AI-driven digital era.",
  },
];

const HowYouLearn: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-2">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Your Path to Digital Mastery with DTMA
          </h2>
          <p className="text-lg text-gray-600">
            Experience a seamless learning journey with practical, on-the-go
            lessons, real-world applications, and certifications to showcase
            your growth.
          </p>
        </div>

        <div className="relative py-10 sm:py-12 how-you-learn-steps">
          <div className="max-w-4xl md:max-w-3xl lg:max-w-4xl mx-auto relative z-10">
            <div className="steps-flow">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="step-item flex flex-col items-center text-center space-y-3 flex-1"
                >
                  <div className="step-circle">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-2 step-text">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default HowYouLearn;
