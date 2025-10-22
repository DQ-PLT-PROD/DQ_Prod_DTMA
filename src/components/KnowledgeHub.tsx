import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";

const insights = [
  {
    title: "Decoding the AI Working Era",
    description:
      "A Digital Perspectives explainer on why the 6XD Framework matters now and how DTMA translates it into action.",
  },
  {
    title: "Leaders on the Frontline of AI Change",
    description:
      "Brief interviews with executives applying DTMA playbooks to align teams and accelerate delivery.",
  },
  {
    title: "From Theory to D6 Application",
    description:
      "A guided walkthrough that maps common transformation challenges to the right D6 category and course.",
  },
];

const KnowledgeHub: React.FC = () => {
  return (
    <section className="bg-gray-900 py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="max-w-3xl space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Stay Ahead with Digital Perspectives
          </h2>
          <p className="text-lg text-gray-300">
            Explore articles, briefs, and explainers from Digital Perspectives -
            DQ's insight stream on the AI working era. New pieces drop regularly and
            connect directly to DTMA courses.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn
          staggerDelay={0.1}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {insights.map((item) => (
            <div
              key={item.title}
              className="flex h-full flex-col rounded-3xl bg-gray-800/70 p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm text-gray-300">
                {item.description}
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center text-sm font-semibold text-blue-200 hover:text-white hover:underline"
              >
                Read
                <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
};

export default KnowledgeHub;
